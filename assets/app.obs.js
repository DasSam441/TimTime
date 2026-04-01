window.TIMTIME_OBS = (function(){
  'use strict';

  function bindShared(){ Object.assign(globalThis, window.TIMTIME_SHARED || {}); }

  let _socket = null;
  let _connectPromise = null;
  let _requestId = 1;
  let _pending = new Map();
  let _lastAutoScene = '';
  let _lastAutoKey = '';
  let _lastAutoSceneErrorKey = '';
  let _lastTextPayloadKey = '';
  let _lastConnectError = '';
  let _reconnectTimer = null;
  let _reconnectAttempt = 0;
  let _manualDisconnect = false;
  let _inventoryCache = { ts:0, scenes:new Set(), inputs:new Set() };
  const OBS_RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000, 15000, 30000];
  const OBS_INVENTORY_CACHE_MS = 15000;

  function getInitialStatus(){
    return {
      available: typeof WebSocket !== 'undefined',
      connected: false,
      connecting: false,
      identified: false,
      scene: '',
      lastError: '',
      endpoint: '',
      reconnectAttempt: 0,
      reconnectInMs: 0,
      validation: {
        checkedAt: 0,
        ok: true,
        missingScenes: [],
        missingSources: []
      }
    };
  }

  function ensureUiStatus(){
    bindShared();
    if(!state.ui || typeof state.ui !== 'object') state.ui = {};
    if(!state.ui.obsStatus || typeof state.ui.obsStatus !== 'object'){
      state.ui.obsStatus = getInitialStatus();
    }
    if(!state.ui.obsStatus.validation || typeof state.ui.obsStatus.validation !== 'object'){
      state.ui.obsStatus.validation = getInitialStatus().validation;
    }
    if(!Array.isArray(state.ui.obsStatus.validation.missingScenes)) state.ui.obsStatus.validation.missingScenes = [];
    if(!Array.isArray(state.ui.obsStatus.validation.missingSources)) state.ui.obsStatus.validation.missingSources = [];
    if(!Number.isFinite(Number(state.ui.obsStatus.validation.checkedAt))) state.ui.obsStatus.validation.checkedAt = 0;
    if(typeof state.ui.obsStatus.validation.ok !== 'boolean') state.ui.obsStatus.validation.ok = true;
    if(!Number.isFinite(Number(state.ui.obsStatus.reconnectAttempt))) state.ui.obsStatus.reconnectAttempt = 0;
    if(!Number.isFinite(Number(state.ui.obsStatus.reconnectInMs))) state.ui.obsStatus.reconnectInMs = 0;
    return state.ui.obsStatus;
  }

  function setObsStatus(patch){
    bindShared();
    const current = ensureUiStatus();
    state.ui.obsStatus = { ...current, ...patch };
    return state.ui.obsStatus;
  }

  function getObsStatus(){
    bindShared();
    const st = ensureUiStatus();
    const validation = st.validation || {};
    return {
      ...st,
      validation: {
        checkedAt: Number(validation.checkedAt || 0),
        ok: !!validation.ok,
        missingScenes: Array.isArray(validation.missingScenes) ? validation.missingScenes.slice() : [],
        missingSources: Array.isArray(validation.missingSources) ? validation.missingSources.slice() : []
      }
    };
  }

  function getObsSettings(){
    bindShared();
    const s = state.settings || {};
    return {
      enabled: !!s.obsEnabled,
      host: String(s.obsHost || '127.0.0.1').trim() || '127.0.0.1',
      port: Math.max(1, parseInt(s.obsPort, 10) || 4455),
      password: String(s.obsPassword || ''),
      sceneTraining: String(s.obsSceneTraining || '').trim(),
      sceneQualifying: String(s.obsSceneQualifying || '').trim(),
      sceneRace: String(s.obsSceneRace || '').trim(),
      scenePodium: String(s.obsScenePodium || '').trim(),
      sourceTimer: String(s.obsSourceTimer || '').trim(),
      sourceMode: String(s.obsSourceMode || '').trim(),
      sourceTrack: String(s.obsSourceTrack || '').trim(),
      sourceLeader: String(s.obsSourceLeader || '').trim(),
      sourceLap: String(s.obsSourceLap || '').trim(),
      sourcePlacements: String(s.obsSourcePlacements || '').trim()
    };
  }

  function getObsEndpoint(){
    const cfg = getObsSettings();
    return `ws://${cfg.host}:${cfg.port}`;
  }
  function safeNow(){
    bindShared();
    return (typeof now === 'function') ? now() : Date.now();
  }
  function dedupeNonEmpty(values){
    const out = [];
    const seen = new Set();
    for(const raw of values || []){
      const v = String(raw || '').trim();
      if(!v || seen.has(v)) continue;
      seen.add(v);
      out.push(v);
    }
    return out;
  }
  function getReconnectDelayMs(attempt){
    const idx = Math.max(0, Math.min(OBS_RECONNECT_DELAYS_MS.length - 1, Number(attempt) || 0));
    return OBS_RECONNECT_DELAYS_MS[idx] || 30000;
  }
  function setObsValidationStatus(missingScenes, missingSources){
    setObsStatus({
      validation: {
        checkedAt: safeNow(),
        ok: !(missingScenes.length || missingSources.length),
        missingScenes: missingScenes.slice(),
        missingSources: missingSources.slice()
      }
    });
  }
  function collectConfiguredTargets(){
    const cfg = getObsSettings();
    return {
      scenes: dedupeNonEmpty([cfg.sceneTraining, cfg.sceneQualifying, cfg.sceneRace, cfg.scenePodium]),
      sources: dedupeNonEmpty([cfg.sourceTimer, cfg.sourceMode, cfg.sourceTrack, cfg.sourceLeader, cfg.sourceLap, cfg.sourcePlacements])
    };
  }
  async function fetchObsInventory(force=false){
    const nowTs = safeNow();
    if(!force && _inventoryCache.ts && (nowTs - _inventoryCache.ts) < OBS_INVENTORY_CACHE_MS){
      return _inventoryCache;
    }
    await connectObs(true);
    const [sceneData, inputData] = await Promise.all([
      sendObsRequest('GetSceneList', {}),
      sendObsRequest('GetInputList', {})
    ]);
    _inventoryCache = {
      ts: nowTs,
      scenes: new Set((sceneData?.scenes || []).map(s=>String(s?.sceneName || '').trim()).filter(Boolean)),
      inputs: new Set((inputData?.inputs || []).map(i=>String(i?.inputName || '').trim()).filter(Boolean))
    };
    return _inventoryCache;
  }
  async function validateObsTargets(forceRefresh=false){
    const cfg = getObsSettings();
    if(!cfg.enabled){
      setObsValidationStatus([], []);
      return { ok:true, missingScenes:[], missingSources:[], checkedAt:safeNow() };
    }
    const targets = collectConfiguredTargets();
    if(!targets.scenes.length && !targets.sources.length){
      setObsValidationStatus([], []);
      return { ok:true, missingScenes:[], missingSources:[], checkedAt:safeNow() };
    }
    const inv = await fetchObsInventory(!!forceRefresh);
    const missingScenes = targets.scenes.filter(name=>!inv.scenes.has(name));
    const missingSources = targets.sources.filter(name=>!inv.inputs.has(name));
    setObsValidationStatus(missingScenes, missingSources);
    return {
      ok: !(missingScenes.length || missingSources.length),
      missingScenes,
      missingSources,
      checkedAt: safeNow()
    };
  }
  async function ensureObsSceneExists(sceneName){
    const scene = String(sceneName || '').trim();
    if(!scene) return true;
    const inv = await fetchObsInventory(false);
    if(inv.scenes.has(scene)) return true;
    setObsValidationStatus([scene], []);
    throw new Error('obs_scene_not_found:' + scene);
  }
  async function ensureObsSourceExists(sourceName){
    const source = String(sourceName || '').trim();
    if(!source) return true;
    const inv = await fetchObsInventory(false);
    if(inv.inputs.has(source)) return true;
    setObsValidationStatus([], [source]);
    throw new Error('obs_source_not_found:' + source);
  }
  function scheduleObsReconnect(reason=''){
    bindShared();
    if(_manualDisconnect) return;
    if(_reconnectTimer) return;
    if(_socket && _socket.readyState === WebSocket.OPEN) return;
    const cfg = getObsSettings();
    if(!cfg.enabled) return;
    const delay = getReconnectDelayMs(_reconnectAttempt);
    _reconnectAttempt += 1;
    setObsStatus({
      reconnectAttempt: _reconnectAttempt,
      reconnectInMs: delay,
      lastError: String(reason || _lastConnectError || '')
    });
    _reconnectTimer = setTimeout(async ()=>{
      _reconnectTimer = null;
      setObsStatus({ reconnectInMs: 0 });
      try{
        await connectObs(true);
      }catch(err){
        _lastConnectError = String(err?.message || err || 'obs_reconnect_failed');
        setObsStatus({ lastError: _lastConnectError });
        scheduleObsReconnect(_lastConnectError);
      }
    }, delay);
  }

  async function sha256Base64(text){
    const data = new TextEncoder().encode(String(text || ''));
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);
    let binary = '';
    for(const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
  }

  async function buildAuthenticationString(password, salt, challenge){
    const secret = await sha256Base64(String(password || '') + String(salt || ''));
    return await sha256Base64(secret + String(challenge || ''));
  }

  function cleanupSocket(closeSocket=false){
    if(_reconnectTimer){
      clearTimeout(_reconnectTimer);
      _reconnectTimer = null;
    }
    if(closeSocket && _socket){
      try{ _socket.onopen = null; _socket.onmessage = null; _socket.onerror = null; _socket.onclose = null; }catch{}
      try{ _socket.close(); }catch{}
    }
    _socket = null;
    for(const [, pending] of _pending){
      try{ pending.reject(new Error('obs_disconnected')); }catch{}
    }
    _pending.clear();
    _inventoryCache = { ts:0, scenes:new Set(), inputs:new Set() };
  }

  function handleRequestResponse(msg){
    const id = String(msg?.d?.requestId || '');
    if(!id || !_pending.has(id)) return;
    const pending = _pending.get(id);
    _pending.delete(id);
    const result = !!msg?.d?.requestStatus?.result;
    if(result){
      pending.resolve(msg?.d?.responseData || {});
      return;
    }
    const comment = String(msg?.d?.requestStatus?.comment || msg?.d?.requestType || 'OBS request failed');
    pending.reject(new Error(comment));
  }

  async function handleHello(ws, msg, resolve, reject){
    const authInfo = msg?.d?.authentication;
    const cfg = getObsSettings();
    const identify = {
      op: 1,
      d: {
        rpcVersion: Number(msg?.d?.rpcVersion || 1),
        eventSubscriptions: 0
      }
    };
    try{
      if(authInfo?.challenge && authInfo?.salt){
        identify.d.authentication = await buildAuthenticationString(cfg.password, authInfo.salt, authInfo.challenge);
      }
      ws.send(JSON.stringify(identify));
    }catch(err){
      reject(err);
    }
  }

  async function connectObs(force=false){
    bindShared();
    const cfg = getObsSettings();
    const endpoint = getObsEndpoint();
    if(!cfg.enabled && !force) return false;
    if(typeof WebSocket === 'undefined'){
      setObsStatus({ available:false, connected:false, connecting:false, lastError:'WebSocket nicht verfuegbar', endpoint });
      return false;
    }
    if(_socket && _socket.readyState === WebSocket.OPEN) return true;
    if(_connectPromise) return _connectPromise;

    _manualDisconnect = false;
    cleanupSocket(false);
    setObsStatus({ available:true, connecting:true, connected:false, identified:false, lastError:'', endpoint, reconnectInMs:0 });

    _connectPromise = new Promise((resolve, reject)=>{
      let settled = false;
      const ws = new WebSocket(endpoint);
      _socket = ws;

      const fail = (err)=>{
        if(settled) return;
        settled = true;
        _lastConnectError = String(err?.message || err || 'obs_connect_failed');
        setObsStatus({ connecting:false, connected:false, identified:false, lastError:_lastConnectError, endpoint });
        cleanupSocket(false);
        reject(err instanceof Error ? err : new Error(_lastConnectError));
      };
      const ok = ()=>{
        if(settled) return;
        settled = true;
        _reconnectAttempt = 0;
        _lastAutoSceneErrorKey = '';
        setObsStatus({ connecting:false, connected:true, identified:true, lastError:'', endpoint, reconnectAttempt:0, reconnectInMs:0 });
        saveState();
        resolve(true);
      };

      ws.onopen = ()=>{};
      ws.onerror = ()=> fail(new Error('obs_connection_error'));
      ws.onclose = ()=>{
        if(!settled){
          fail(new Error('obs_connection_closed'));
          return;
        }
        setObsStatus({ connecting:false, connected:false, identified:false, scene:'' });
        cleanupSocket(false);
        scheduleObsReconnect('obs_connection_closed');
      };
      ws.onmessage = async (event)=>{
        try{
          const msg = JSON.parse(String(event.data || '{}'));
          if(msg?.op === 0){
            await handleHello(ws, msg, ok, fail);
            return;
          }
          if(msg?.op === 2){
            ok();
            return;
          }
          if(msg?.op === 7){
            handleRequestResponse(msg);
          }
        }catch(err){
          fail(err);
        }
      };
    }).finally(()=>{
      _connectPromise = null;
    });

    return _connectPromise;
  }

  async function disconnectObs(){
    bindShared();
    _manualDisconnect = true;
    _reconnectAttempt = 0;
    cleanupSocket(true);
    setObsStatus({ connecting:false, connected:false, identified:false, scene:'', reconnectAttempt:0, reconnectInMs:0 });
    saveState();
    return true;
  }

  async function sendObsRequest(requestType, requestData, retryCount=0){
    bindShared();
    try{
      if(!_socket || _socket.readyState !== WebSocket.OPEN){
        const connected = await connectObs(true).catch(()=>false);
        if(!connected || !_socket || _socket.readyState !== WebSocket.OPEN) throw new Error('obs_not_connected');
      }
      const requestId = 'obs_' + (_requestId++);
      return await new Promise((resolve, reject)=>{
        _pending.set(requestId, { resolve, reject });
        try{
          _socket.send(JSON.stringify({
            op: 6,
            d: {
              requestType: String(requestType || ''),
              requestId,
              requestData: requestData || {}
            }
          }));
        }catch(err){
          _pending.delete(requestId);
          reject(err);
        }
      });
    }catch(err){
      if(Number(retryCount || 0) >= 1) throw err;
      cleanupSocket(false);
      const connected = await connectObs(true).catch(()=>false);
      if(!connected) throw err;
      return await sendObsRequest(requestType, requestData, Number(retryCount || 0) + 1);
    }
  }

  async function setObsScene(sceneName){
    bindShared();
    const scene = String(sceneName || '').trim();
    if(!scene) return false;
    await ensureObsSceneExists(scene);
    await sendObsRequest('SetCurrentProgramScene', { sceneName: scene });
    setObsStatus({ scene });
    return true;
  }

  async function setObsTextSource(sourceName, textValue){
    const inputName = String(sourceName || '').trim();
    if(!inputName) return false;
    await ensureObsSourceExists(inputName);
    await sendObsRequest('SetInputSettings', {
      inputName,
      inputSettings: {
        text: String(textValue ?? '')
      },
      overlay: true
    });
    return true;
  }

  function getCurrentRace(){
    bindShared();
    if(typeof getRaceById === 'function' && state.session?.currentRaceId){
      return getRaceById(state.session.currentRaceId);
    }
    const rd = typeof getActiveRaceDay === 'function' ? getActiveRaceDay() : null;
    if(!rd) return null;
    return (rd.races || []).find(r => r.id === state.session?.currentRaceId) || null;
  }

  function inferObsSceneName(){
    bindShared();
    const cfg = getObsSettings();
    if(!cfg.enabled) return '';
    if(state.ui?.podiumRaceId && cfg.scenePodium) return cfg.scenePodium;
    const race = getCurrentRace();
    const phase = String(state.loopRuntime?.phase || '').toLowerCase();
    const submode = String(race?.submode || state.modes?.singleSubmode || '').toLowerCase();
    if(submode === 'qualifying' || submode === 'quali') return cfg.sceneQualifying || cfg.sceneTraining;
    if(submode === 'training') return cfg.sceneTraining;
    if(String(state.session?.state || '') === 'RUNNING' || String(state.session?.state || '') === 'PAUSED' || (typeof isAmpelRunning === 'function' && isAmpelRunning())){
      if(phase === 'training' || phase === 'setup') return cfg.sceneTraining;
      return cfg.sceneRace;
    }
    if(phase === 'podium' && cfg.scenePodium) return cfg.scenePodium;
    return '';
  }

  function inferObsSceneKey(){
    bindShared();
    return [
      String(state.session?.state || ''),
      String(state.session?.currentRaceId || ''),
      String(state.ui?.podiumRaceId || ''),
      String(state.loopRuntime?.phase || ''),
      String(state.modes?.singleSubmode || '')
    ].join('|');
  }

  async function syncObsAutoScene(force=false){
    bindShared();
    const cfg = getObsSettings();
    if(!cfg.enabled) return false;
    const desiredScene = inferObsSceneName();
    const desiredKey = inferObsSceneKey();
    if(!desiredScene) return false;
    const errorKey = desiredScene + '|' + desiredKey;
    if(!force && desiredScene === _lastAutoScene && desiredKey === _lastAutoKey) return false;
    if(!force && _lastAutoSceneErrorKey === errorKey) return false;
    try{
      await connectObs(true);
      await setObsScene(desiredScene);
      _lastAutoScene = desiredScene;
      _lastAutoKey = desiredKey;
      _lastAutoSceneErrorKey = '';
      return true;
    }catch(err){
      _lastConnectError = String(err?.message || err || 'obs_auto_scene_failed');
      setObsStatus({ lastError:_lastConnectError, connected:false, connecting:false, identified:false });
      _lastAutoSceneErrorKey = errorKey;
      return false;
    }
  }

  async function testObsScene(kind='race'){
    const cfg = getObsSettings();
    const map = {
      training: cfg.sceneTraining,
      qualifying: cfg.sceneQualifying || cfg.sceneTraining,
      race: cfg.sceneRace,
      podium: cfg.scenePodium
    };
    const scene = String(map[String(kind || 'race')] || '').trim();
    if(!scene) throw new Error('obs_scene_missing');
    await connectObs(true);
    await setObsScene(scene);
    _lastAutoScene = scene;
    return true;
  }

  function buildObsTextPayload(){
    bindShared();
    const cfg = getObsSettings();
    const snapshot = (typeof buildPresenterSnapshot === 'function') ? buildPresenterSnapshot() : {};
    const rows = Array.isArray(snapshot?.rows) ? snapshot.rows : [];
    const leader = rows[0] || null;
    const lapText = leader && Number.isFinite(Number(leader.laps)) ? String(leader.laps) : '0';
    const placementsText = rows
      .map((row, idx)=>`${idx + 1}. ${String(row?.name || '').trim()}`.trim())
      .filter(Boolean)
      .join('\n');
    return {
      [cfg.sourceTimer]: String(snapshot?.timerText || '').trim(),
      [cfg.sourceMode]: String(snapshot?.modeLabel || '').trim(),
      [cfg.sourceTrack]: String(snapshot?.trackName || '').trim(),
      [cfg.sourceLeader]: leader ? String(leader.name || '').trim() : '',
      [cfg.sourceLap]: lapText,
      [cfg.sourcePlacements]: placementsText
    };
  }

  async function syncObsTextSources(force=false){
    bindShared();
    const cfg = getObsSettings();
    if(!cfg.enabled) return false;
    const payload = buildObsTextPayload();
    const entries = Object.entries(payload).filter(([name])=>String(name || '').trim());
    if(!entries.length) return false;
    const payloadKey = JSON.stringify(entries);
    if(!force && payloadKey === _lastTextPayloadKey) return false;
    await connectObs(true);
    let validation = null;
    try{
      validation = await validateObsTargets(false);
    }catch{}
    const missingSourceSet = new Set(Array.isArray(validation?.missingSources) ? validation.missingSources : []);
    const validEntries = entries.filter(([sourceName])=>!missingSourceSet.has(String(sourceName || '').trim()));
    if(!validEntries.length && missingSourceSet.size){
      _lastTextPayloadKey = payloadKey;
      throw new Error('obs_sources_missing:' + Array.from(missingSourceSet).join(', '));
    }
    for(const [sourceName, value] of validEntries){
      await setObsTextSource(sourceName, value);
    }
    _lastTextPayloadKey = payloadKey;
    return validEntries.length > 0;
  }

  async function obsAutoConnectOnLoad(){
    const cfg = getObsSettings();
    if(!cfg.enabled) return false;
    try{
      await connectObs(true);
      try{ await validateObsTargets(true); }catch{}
      return true;
    }catch{
      return false;
    }
  }

  return {
    getObsStatus,
    connectObs,
    disconnectObs,
    sendObsRequest,
    setObsScene,
    testObsScene,
    setObsTextSource,
    validateObsTargets,
    syncObsTextSources,
    syncObsAutoScene,
    obsAutoConnectOnLoad
  };
})();
