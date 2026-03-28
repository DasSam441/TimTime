window.TIMTIME_OBS = (function(){
  'use strict';

  function bindShared(){ Object.assign(globalThis, window.TIMTIME_SHARED || {}); }

  let _socket = null;
  let _connectPromise = null;
  let _requestId = 1;
  let _pending = new Map();
  let _lastAutoScene = '';
  let _lastAutoKey = '';
  let _lastConnectError = '';
  let _reconnectTimer = null;

  function getInitialStatus(){
    return {
      available: typeof WebSocket !== 'undefined',
      connected: false,
      connecting: false,
      identified: false,
      scene: '',
      lastError: '',
      endpoint: ''
    };
  }

  function ensureUiStatus(){
    bindShared();
    if(!state.ui || typeof state.ui !== 'object') state.ui = {};
    if(!state.ui.obsStatus || typeof state.ui.obsStatus !== 'object'){
      state.ui.obsStatus = getInitialStatus();
    }
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
    return { ...ensureUiStatus() };
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
      scenePodium: String(s.obsScenePodium || '').trim()
    };
  }

  function getObsEndpoint(){
    const cfg = getObsSettings();
    return `ws://${cfg.host}:${cfg.port}`;
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

    cleanupSocket(false);
    setObsStatus({ available:true, connecting:true, connected:false, identified:false, lastError:'', endpoint });

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
        setObsStatus({ connecting:false, connected:true, identified:true, lastError:'', endpoint });
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
    cleanupSocket(true);
    setObsStatus({ connecting:false, connected:false, identified:false, scene:'' });
    saveState();
    return true;
  }

  async function sendObsRequest(requestType, requestData){
    bindShared();
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
  }

  async function setObsScene(sceneName){
    bindShared();
    const scene = String(sceneName || '').trim();
    if(!scene) return false;
    await sendObsRequest('SetCurrentProgramScene', { sceneName: scene });
    setObsStatus({ scene });
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
    if(!force && desiredScene === _lastAutoScene && desiredKey === _lastAutoKey) return false;
    try{
      await connectObs(true);
      await setObsScene(desiredScene);
      _lastAutoScene = desiredScene;
      _lastAutoKey = desiredKey;
      return true;
    }catch(err){
      _lastConnectError = String(err?.message || err || 'obs_auto_scene_failed');
      setObsStatus({ lastError:_lastConnectError, connected:false, connecting:false, identified:false });
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

  async function obsAutoConnectOnLoad(){
    const cfg = getObsSettings();
    if(!cfg.enabled) return false;
    try{
      await connectObs(true);
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
    syncObsAutoScene,
    obsAutoConnectOnLoad
  };
})();
