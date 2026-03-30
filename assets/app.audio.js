window.TIMTIME_AUDIO = (function(){
  'use strict';

  function bindShared(){
    Object.assign(globalThis, window.TIMTIME_SHARED || {});
  }

  function normalizeVoiceRate(value){
    const n = Number(value);
    if(!Number.isFinite(n)) return 1;
    return Math.max(0.5, Math.min(2, n));
  }

  function normalizeVoicePitch(value){
    const n = Number(value);
    if(!Number.isFinite(n)) return 1;
    return Math.max(0, Math.min(2, n));
  }

  function normalizeVoiceVolume(value){
    const n = Number(value);
    if(!Number.isFinite(n)) return 1;
    return Math.max(0, Math.min(1, n));
  }

  let _audioAssetDbPromise = null;
  let _audioPreviewCtx = null;
  let _audioPreviewSource = null;
  let _audioPreviewGain = null;

  function getAudioContext(){
    bindShared();
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return null;
    if(!_audioPreviewCtx) _audioPreviewCtx = new Ctx();
    return _audioPreviewCtx;
  }

  function openAudioAssetDb(){
    bindShared();
    if(_audioAssetDbPromise) return _audioAssetDbPromise;
    _audioAssetDbPromise = new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)) return reject(new Error('indexeddb_not_supported'));
      const req = indexedDB.open(AUDIO_ASSET_DB_NAME, 1);
      req.onupgradeneeded = ()=>{
        const db = req.result;
        if(!db.objectStoreNames.contains(AUDIO_ASSET_STORE)) db.createObjectStore(AUDIO_ASSET_STORE, { keyPath:'id' });
      };
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error || new Error('indexeddb_open_failed'));
    });
    return _audioAssetDbPromise;
  }

  async function audioAssetPut(rec){
    bindShared();
    const db = await openAudioAssetDb();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(AUDIO_ASSET_STORE, 'readwrite');
      tx.objectStore(AUDIO_ASSET_STORE).put(rec);
      tx.oncomplete = ()=>resolve(true);
      tx.onerror = ()=>reject(tx.error || new Error('indexeddb_put_failed'));
    });
  }

  async function audioAssetGet(id){
    bindShared();
    const db = await openAudioAssetDb();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(AUDIO_ASSET_STORE, 'readonly');
      const req = tx.objectStore(AUDIO_ASSET_STORE).get(id);
      req.onsuccess = ()=>resolve(req.result || null);
      req.onerror = ()=>reject(req.error || new Error('indexeddb_get_failed'));
    });
  }

  async function audioAssetDelete(id){
    bindShared();
    const db = await openAudioAssetDb();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(AUDIO_ASSET_STORE, 'readwrite');
      tx.objectStore(AUDIO_ASSET_STORE).delete(id);
      tx.oncomplete = ()=>resolve(true);
      tx.onerror = ()=>reject(tx.error || new Error('indexeddb_delete_failed'));
    });
  }

  async function audioAssetGetAll(){
    bindShared();
    const db = await openAudioAssetDb();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(AUDIO_ASSET_STORE, 'readonly');
      const req = tx.objectStore(AUDIO_ASSET_STORE).getAll();
      req.onsuccess = ()=>resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = ()=>reject(req.error || new Error('indexeddb_getall_failed'));
    });
  }

  async function audioAssetClearAll(){
    bindShared();
    const db = await openAudioAssetDb();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(AUDIO_ASSET_STORE, 'readwrite');
      tx.objectStore(AUDIO_ASSET_STORE).clear();
      tx.oncomplete = ()=>resolve(true);
      tx.onerror = ()=>reject(tx.error || new Error('indexeddb_clear_failed'));
    });
  }

  async function clearAudioDbAndAssignments(){
    bindShared();
    try{ stopAudioPreview(); }catch{}
    try{ await audioAssetClearAll(); }catch(err){ logLine('audio clear error: ' + (err?.message || err)); }
    if(state.audio){
      state.audio.library = [];
      state.audio.defaultDriverSoundId = '';
    }
    for(const d of getDriversArray()) d.lapSoundAssetId = '';
    if(state.ui) state.ui.audioSelectedId = '';
    saveState();
    await ensureBuiltInDefaultDriverSound();
  }

  async function exportAudioDb(){
    bindShared();
    const records = await audioAssetGetAll();
    const payload = {
      kind:'zeitnahme_audio_db_v1',
      exportedAt:new Date().toISOString(),
      targetDb:Number(state.audio?.targetDb || -16),
      defaultDriverSoundId:String(state.audio?.defaultDriverSoundId || ''),
      library: JSON.parse(JSON.stringify(getAudioLibrary())),
      driverAssignments: getDriversArray().map(d=>({ id:d.id, name:d.name, lapSoundAssetId:String(d?.lapSoundAssetId || '') })),
      records
    };
    downloadJson('zeitnahme2_audio_db_' + new Date().toISOString().slice(0,10) + '.json', payload);
  }

  async function importAudioDbFile(file){
    bindShared();
    const text = await file.text();
    const data = JSON.parse(text);
    if(!data || data.kind!=='zeitnahme_audio_db_v1') throw new Error('audio_db_invalid_file');
    const library = Array.isArray(data.library) ? data.library : [];
    const records = Array.isArray(data.records) ? data.records : [];
    await audioAssetClearAll();
    for(const rec of records){
      if(rec && rec.id && rec.dataUrl) await audioAssetPut(rec);
    }
    state.audio.library = library;
    if(Number.isFinite(Number(data.targetDb))) state.audio.targetDb = clamp(Number(data.targetDb), -30, -6);
    if(typeof data.defaultDriverSoundId==='string') state.audio.defaultDriverSoundId = data.defaultDriverSoundId;
    if(Array.isArray(data.driverAssignments)){
      const byId = new Map(data.driverAssignments.map(x=>[String(x.id||''), String(x.lapSoundAssetId||'')]));
      for(const d of getDriversArray()){
        if(byId.has(String(d.id||''))) d.lapSoundAssetId = byId.get(String(d.id||''));
      }
    }
    ensureAudioSelection();
    saveState();
    await ensureBuiltInDefaultDriverSound();
  }

  function getAudioLibrary(){
    bindShared();
    if(!Array.isArray(state.audio.library)) state.audio.library = [];
    return state.audio.library;
  }

  function renderAudioAssetOptionTags(selectedId='', emptyLabel=''){
    bindShared();
    const sel = String(selectedId || '');
    const list = getAudioLibrary().slice().sort((a,b)=> String(a?.name||'').localeCompare(String(b?.name||''), 'de', { sensitivity:'base' }));
    const opts = [`<option value="">${esc(emptyLabel || t('common.select', null, 'Please select'))}</option>`];
    for(const item of list){
      if(!item || !item.id) continue;
      const id = String(item.id);
      const name = item.name || id;
      const cat = item.category ? ` (${item.category})` : '';
      opts.push(`<option value="${esc(id)}" ${sel===id?'selected':''}>${esc(name + cat)}</option>`);
    }
    return opts.join('');
  }

  function getAudioAssetMeta(id){
    bindShared();
    return getAudioLibrary().find(x=>x.id===id) || null;
  }

  function ensureAudioSelection(){
    bindShared();
    const list = getAudioLibrary();
    if(state.ui.audioSelectedId && list.some(x=>x.id===state.ui.audioSelectedId)) return;
    state.ui.audioSelectedId = list[0]?.id || '';
  }

  function formatDb(v){
    if(v==null || !Number.isFinite(v)) return '—';
    return (Math.round(v*10)/10).toFixed(1) + ' dB';
  }

  function formatSec(v){
    if(v==null || !Number.isFinite(v)) return '—';
    return (Math.round(v*100)/100).toFixed(2) + ' s';
  }

  function fileToDataUrl(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onerror = ()=>reject(new Error('file_read_failed'));
      r.onload = ()=>resolve(String(r.result||''));
      r.readAsDataURL(file);
    });
  }

  async function dataUrlToAudioBuffer(dataUrl){
    const ctx = getAudioContext();
    if(!ctx) throw new Error('audio_context_not_supported');
    const res = await fetch(dataUrl);
    const arr = await res.arrayBuffer();
    return await ctx.decodeAudioData(arr.slice(0));
  }

  function analyzeAudioBuffer(buf){
    const channels = buf.numberOfChannels || 1;
    const len = buf.length || 0;
    let peak = 0;
    let sumSq = 0;
    const points = 64;
    const step = Math.max(1, Math.floor(len / points));
    const waveform = [];
    for(let i=0;i<len;i++){
      let sample = 0;
      for(let c=0;c<channels;c++) sample += Math.abs(buf.getChannelData(c)[i] || 0);
      sample /= channels;
      if(sample>peak) peak = sample;
      sumSq += sample*sample;
    }
    for(let p=0;p<points;p++){
      const start = p*step;
      const end = Math.min(len, start+step);
      let localPeak = 0;
      for(let i=start;i<end;i++){
        let sample = 0;
        for(let c=0;c<channels;c++) sample += Math.abs(buf.getChannelData(c)[i] || 0);
        sample /= channels;
        if(sample>localPeak) localPeak = sample;
      }
      waveform.push(Math.max(0.02, Math.min(1, localPeak || 0)));
    }
    const rms = len ? Math.sqrt(sumSq / len) : 0;
    const rmsDb = rms>0 ? 20*Math.log10(rms) : -100;
    const peakDb = peak>0 ? 20*Math.log10(peak) : -100;
    return { durationSec:buf.duration || 0, sampleRate:buf.sampleRate || 0, channels, peak, peakDb, rms, rmsDb, waveform };
  }

  function calcRecommendedGainDb(meta, targetDb=null){
    bindShared();
    const tDb = Number.isFinite(targetDb) ? targetDb : Number(state.audio.targetDb || -16);
    const rmsDb = Number(meta?.rmsDb);
    const peakDb = Number(meta?.peakDb);
    if(!Number.isFinite(rmsDb)) return 0;
    let gainDb = tDb - rmsDb;
    if(Number.isFinite(peakDb) && peakDb + gainDb > -1) gainDb = -1 - peakDb;
    return Math.max(-24, Math.min(24, gainDb));
  }

  function gainDbToLinear(db){
    return Math.pow(10, (Number(db)||0)/20);
  }

  function stopAudioPreview(){
    try{ if(_audioPreviewSource) _audioPreviewSource.stop(); }catch{}
    try{ if(_audioPreviewSource) _audioPreviewSource.disconnect(); }catch{}
    try{ if(_audioPreviewGain) _audioPreviewGain.disconnect(); }catch{}
    _audioPreviewSource = null;
    _audioPreviewGain = null;
  }

  async function previewAudioAsset(meta){
    if(!meta) return;
    const rec = await audioAssetGet(meta.id);
    if(!rec?.dataUrl) throw new Error('audio_asset_missing');
    const ctx = getAudioContext();
    if(!ctx) throw new Error('audio_context_not_supported');
    if(ctx.state === 'suspended') await ctx.resume();
    stopAudioPreview();
    const buf = await dataUrlToAudioBuffer(rec.dataUrl);
    const trimStart = Math.max(0, Number(meta.trimStartMs||0))/1000;
    const trimEnd = Math.max(0, Number(meta.trimEndMs||0))/1000;
    const safeEnd = Math.max(trimStart, (buf.duration||0) - trimEnd);
    const dur = Math.max(0.05, safeEnd - trimStart);
    const gainDb = Number(meta.gainDb || 0);
    const fadeIn = Math.max(0, Number(meta.fadeInMs||0))/1000;
    const fadeOut = Math.max(0, Number(meta.fadeOutMs||0))/1000;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    const baseGain = gainDbToLinear(gainDb);
    const startAt = ctx.currentTime + 0.02;
    gain.gain.setValueAtTime(0, startAt);
    if(fadeIn>0) gain.gain.linearRampToValueAtTime(baseGain, startAt + fadeIn);
    else gain.gain.setValueAtTime(baseGain, startAt + 0.01);
    const fadeOutStart = Math.max(startAt + 0.02, startAt + dur - fadeOut);
    if(fadeOut>0){
      gain.gain.setValueAtTime(baseGain, fadeOutStart);
      gain.gain.linearRampToValueAtTime(0.0001, startAt + dur);
    }
    src.connect(gain);
    gain.connect(ctx.destination);
    src.onended = ()=>{ if(_audioPreviewSource===src){ _audioPreviewSource = null; _audioPreviewGain = null; } };
    src.start(startAt, trimStart, dur);
    _audioPreviewSource = src;
    _audioPreviewGain = gain;
  }

  async function createOrReplaceAudioAsset(file, existingId=''){
    bindShared();
    const dataUrl = await fileToDataUrl(file);
    const buf = await dataUrlToAudioBuffer(dataUrl);
    const analyzed = analyzeAudioBuffer(buf);
    const id = existingId || uid('audio');
    await audioAssetPut({ id, name:file.name, type:file.type || 'audio/*', size:file.size || 0, updatedAt:now(), dataUrl });
    const old = getAudioAssetMeta(id) || {};
    const meta = {
      id,
      name: old.name || file.name.replace(/\.[^.]+$/,''),
      category: old.category || t('audio.default_category', null, 'Announcement'),
      mime: file.type || 'audio/*',
      sizeBytes: file.size || 0,
      durationSec: analyzed.durationSec,
      sampleRate: analyzed.sampleRate,
      channels: analyzed.channels,
      peak: analyzed.peak,
      peakDb: analyzed.peakDb,
      rms: analyzed.rms,
      rmsDb: analyzed.rmsDb,
      waveform: analyzed.waveform,
      targetDb: Number.isFinite(old.targetDb) ? old.targetDb : Number(state.audio.targetDb || -16),
      gainDb: Number.isFinite(old.gainDb) ? old.gainDb : calcRecommendedGainDb({...old, ...analyzed}, Number(state.audio.targetDb || -16)),
      trimStartMs: Number(old.trimStartMs||0),
      trimEndMs: Number(old.trimEndMs||0),
      fadeInMs: Number(old.fadeInMs||0),
      fadeOutMs: Number(old.fadeOutMs||0),
      updatedAt: now()
    };
    const list = getAudioLibrary();
    const idx = list.findIndex(x=>x.id===id);
    if(idx>=0) list[idx] = meta; else list.unshift(meta);
    state.ui.audioSelectedId = id;
    saveState();
    return meta;
  }

  async function reanalyzeAudioAsset(id){
    bindShared();
    const meta = getAudioAssetMeta(id);
    if(!meta) throw new Error('audio_meta_missing');
    const rec = await audioAssetGet(id);
    if(!rec?.dataUrl) throw new Error('audio_asset_missing');
    const buf = await dataUrlToAudioBuffer(rec.dataUrl);
    const analyzed = analyzeAudioBuffer(buf);
    Object.assign(meta, analyzed, { updatedAt:now() });
    if(!Number.isFinite(Number(meta.gainDb))) meta.gainDb = calcRecommendedGainDb(meta, Number(meta.targetDb||state.audio.targetDb||-16));
    saveState();
    return meta;
  }

  async function removeAudioAsset(id){
    bindShared();
    state.audio.library = getAudioLibrary().filter(x=>x.id!==id);
    if(state.ui.audioSelectedId===id) state.ui.audioSelectedId = state.audio.library[0]?.id || '';
    saveState();
    await audioAssetDelete(id);
  }

  function getFilteredAudioLibrary(){
    bindShared();
    const q = String(state.ui.audioSearch || '').trim().toLowerCase();
    const cat = String(state.ui.audioFilterCategory || '').trim();
    return getAudioLibrary().filter(item=>{
      if(cat && item.category !== cat) return false;
      if(q){
        const hay = [item.name, item.category, item.mime].join(' ').toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderWaveformBars(points){
    bindShared();
    const arr = Array.isArray(points) ? points : [];
    if(!arr.length) return `<div class="muted small">${esc(t('audio.no_analysis', null, 'No analysis yet.'))}</div>`;
    return `<div class="audio-wave">${arr.map(v=>`<span style="height:${Math.max(6, Math.round(v*52))}px"></span>`).join('')}</div>`;
  }

  function renderAudio(){
    bindShared();
    const el = document.getElementById('pageAudio');
    if(!el) return;
    ensureAudioSelection();
    const voices = ('speechSynthesis' in window) ? speechSynthesis.getVoices() : [];
    const voiceOptions = voices.map(v=>`<option value="${esc(v.voiceURI)}" ${state.audio.voiceUri===v.voiceURI?'selected':''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('');
    const library = getFilteredAudioLibrary();
    const selected = getAudioAssetMeta(state.ui.audioSelectedId);
    const categories = Array.from(new Set(getAudioLibrary().map(x=>String(x.category||'').trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b, getUiLocale()));

    el.innerHTML = `
      <div class="grid2" style="align-items:start;">
        <div class="card">
          <div class="card-h"><h2>${esc(t('audio.title', null, 'Audio'))}</h2></div>
          <div class="card-b">
            <div class="muted">${esc(t('audio.intro', null, 'Here you define what gets announced for a measured lap.'))}</div>
            <div class="hr"></div>

            <div class="field">
              <label>${esc(t('audio.enabled', null, 'Audio enabled'))}</label>
              <select id="audEnabled">
                <option value="true" ${state.audio.enabled?'selected':''}>${esc(t('common.yes', null, 'Yes'))}</option>
                <option value="false" ${!state.audio.enabled?'selected':''}>${esc(t('common.no', null, 'No'))}</option>
              </select>
            </div>

            <div class="field">
              <label>${esc(t('audio.lap_announce_mode', null, 'Lap announcement'))}</label>
              <select id="lapMode">
                <option value="off" ${normalizeLapAnnounceMode(state.audio.lapAnnounceMode)==='off'?'selected':''}>${esc(t('audio.lap_mode.off', null, 'Off'))}</option>
                <option value="every" ${normalizeLapAnnounceMode(state.audio.lapAnnounceMode)==='every'?'selected':''}>${esc(t('audio.lap_mode.every_lap', null, 'Every lap'))}</option>
                <option value="best" ${normalizeLapAnnounceMode(state.audio.lapAnnounceMode)==='best'?'selected':''}>${esc(t('audio.lap_mode.best_only', null, 'Best lap only'))}</option>
              </select>
            </div>

            <div class="field">
              <label>${esc(t('audio.components', null, 'Components'))}</label>
              <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayName" ${state.audio.sayName?'checked':''}/> ${esc(t('audio.component_name', null, 'Name (driver or car)'))}</label>
              <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayLapNo" ${state.audio.sayLapNo?'checked':''}/> ${esc(t('audio.component_lap_number', null, 'Lap number'))}</label>
              <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayLapTime" ${state.audio.sayLapTime?'checked':''}/> ${esc(t('audio.component_lap_time', null, 'Lap time'))}</label>
            </div>

            <div class="field">
              <label>${esc(t('audio.decimals', null, 'Lap time decimals'))}</label>
              <select id="decimals">
                ${[0,1,2,3].map(n=>`<option value="${n}" ${state.audio.decimals===n?'selected':''}>${n}</option>`).join('')}
              </select>
            </div>

            <div class="hr"></div>

            <div class="field">
              <label>${esc(t('audio.voice', null, 'Voice'))}</label>
              <select id="voiceSel">
                <option value="">${esc(t('audio.voice_auto', null, '(Auto)'))}</option>
                ${voiceOptions}
              </select>
            </div>

            <div class="row">
              <button class="btn btn-primary" id="audSave">${esc(t('common.save', null, 'Save'))}</button>
              <button class="btn" id="audTest">${esc(t('audio.test', null, 'Test'))}</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h2>${esc(t('audio.fine_tuning', null, 'Audio fine tuning'))}</h2></div>
          <div class="card-b">
            <div class="field">
              <label>${esc(t('audio.rate', null, 'Rate (speech speed)'))}</label>
              <input class="input" id="rate" type="range" min="0.5" max="2" step="0.01" value="${esc(state.audio.rate)}"/>
            </div>
            <div class="field">
              <label>${esc(t('audio.pitch', null, 'Pitch'))}</label>
              <input class="input" id="pitch" type="range" min="0" max="2" step="0.01" value="${esc(state.audio.pitch)}"/>
            </div>
            <div class="field">
              <label>${esc(t('audio.volume', null, 'Volume'))}</label>
              <input class="input" id="volume" type="range" min="0" max="1" step="0.01" value="${esc(state.audio.volume)}"/>
            </div>
            <div class="row">
              <button class="btn btn-primary" id="audSave2">${esc(t('common.save', null, 'Save'))}</button>
            </div>
            <div class="muted">${esc(t('audio.browser_tts_hint', null, 'Browser TTS depends on system/browser audio.'))}</div>

            <div class="hr"></div>

            <div class="card" style="background:rgba(15,23,42,.35); margin-top:12px;">
              <div class="card-h"><h2>${esc(t('audio.race_announcements', null, 'Race announcements'))}</h2></div>
              <div class="card-b">
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="restAnnouncementsEnabled" ${state.audio.restAnnouncementsEnabled?'checked':''}/> ${esc(t('audio.rest_enabled', null, 'Remaining-time announcements enabled'))}</label>

                <div class="field">
                  <label>${esc(t('audio.rest_points', null, 'Remaining-time points (seconds, comma-separated)'))}</label>
                  <input class="input mono" id="restAnnouncementTimes" value="${esc((state.audio.restAnnouncementTimes||[]).join(','))}" placeholder="300,180,120,60,30"/>
                </div>

                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayTimeExpired" ${state.audio.sayTimeExpired?'checked':''}/> ${esc(t('audio.say_time_expired', null, 'Announce “time expired”'))}</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayFinished" ${state.audio.sayFinished?'checked':''}/> ${esc(t('audio.say_finished', null, 'Announce name at finish'))}</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayRunFinished" ${state.audio.sayRunFinished?'checked':''}/> ${esc(t('audio.say_run_finished', null, 'Announce “run finished”'))}</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayPlacements" ${state.audio.sayPlacements?'checked':''}/> ${esc(t('audio.say_placements', null, 'Announce placements'))}</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayOvertakes" ${state.audio.sayOvertakes?'checked':''}/> ${esc(t('audio.say_overtakes', null, 'Announce position changes'))}</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayLappingWarning" ${state.audio.sayLappingWarning?'checked':''}/> ${esc(t('audio.say_lapping_warning', null, 'Announce lapping warning'))}</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayPositionsAtRest" ${state.audio.sayPositionsAtRest?'checked':''}/> ${esc(t('audio.say_positions_at_rest', null, 'Announce current standings at remaining-time calls'))}</label>
                <div class="field"><label>${esc(t('audio.lapping_warn_sec', null, 'Lapping lead time (seconds)'))}</label><input class="input mono" id="lappingWarnSec" type="number" min="1" max="30" step="1" value="${esc(Number(state.audio.lappingWarnSec||3))}"/></div>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayTrackRecordSeason" ${state.audio.sayTrackRecordSeason?'checked':''}/> ${esc(t('audio.say_track_record_season', null, 'Announce season track record'))}</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayTrackRecordDay" ${state.audio.sayTrackRecordDay?'checked':''}/> ${esc(t('audio.say_track_record_day', null, 'Announce race-day track record'))}</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayPersonalBestSeason" ${state.audio.sayPersonalBestSeason?'checked':''}/> ${esc(t('audio.say_pb_season', null, 'Announce personal best (season)'))}</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayPersonalBestDay" ${state.audio.sayPersonalBestDay?'checked':''}/> ${esc(t('audio.say_pb_day', null, 'Announce personal best (race day)'))}</label>

                <div class="muted" style="margin-top:8px;">${esc(t('audio.rest_example', null, 'Example: 300,180,120,60,30 -> “5 minutes left”, “30 seconds left”.'))}</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px;">
        <div class="card-h"><h2>${esc(t('audio.db_title', null, 'Audio database'))}</h2></div>
        <div class="card-b">
          <div class="row wrap" style="justify-content:space-between; gap:12px; align-items:flex-end; margin-bottom:12px;">
            <div class="row wrap" style="gap:12px; align-items:flex-end;">
              <div class="field" style="margin:0; min-width:220px;">
                <label>${esc(t('common.search', null, 'Search'))}</label>
                <input class="input" id="audioSearch" value="${esc(state.ui.audioSearch||'')}" placeholder="${esc(t('audio.search_placeholder', null, 'Name or category'))}"/>
              </div>
              <div class="field" style="margin:0; min-width:180px;">
                <label>${esc(t('common.category', null, 'Category'))}</label>
                <select id="audioCategoryFilter">
                  <option value="">${esc(t('common.all', null, 'All'))}</option>
                  ${categories.map(cat=>`<option value="${esc(cat)}" ${state.ui.audioFilterCategory===cat?'selected':''}>${esc(cat)}</option>`).join('')}
                </select>
              </div>
              <div class="field" style="margin:0; width:160px;">
                <label>${esc(t('audio.target_loudness', null, 'Target loudness'))}</label>
                <input class="input mono" id="audioGlobalTargetDb" type="number" step="0.5" min="-30" max="-6" value="${esc(state.audio.targetDb)}"/>
              </div>
            </div>
            <div class="row wrap" style="gap:10px;">
              <input type="file" id="audioFileAdd" accept="audio/*" multiple style="display:none" />
              <input type="file" id="audioImportFile" accept="application/json" style="display:none" />
              <button class="btn btn-primary" id="audioAddBtn" type="button">${esc(t('audio.add_sounds', null, 'Add sounds'))}</button>
              <button class="btn" id="audioExportBtn" type="button">${esc(t('audio.export_db', null, 'Export audio DB'))}</button>
              <button class="btn" id="audioImportBtn" type="button">${esc(t('audio.import_db', null, 'Import audio DB'))}</button>
              <button class="btn" id="audioAlignAll" type="button">${esc(t('audio.align_all', null, 'Align all'))}</button>
              <button class="btn" id="audioStopPreview" type="button">${esc(t('common.stop', null, 'Stop'))}</button>
            </div>
          </div>

          <div class="audio-db-grid">
            <div class="audio-list-panel">
              <div class="muted small" style="margin-bottom:8px;">${t('audio.filtered_count', { count: library.length }, `${library.length} sound(s) in filter`)}</div>
              <div class="audio-list">
                ${library.length ? library.map(item=>`
                  <button class="audio-item ${selected?.id===item.id?'active':''}" type="button" data-audio-select="${item.id}">
                    <div class="audio-item-top">
                      <strong>${esc(item.name || t('audio.unnamed', null, 'Unnamed'))}</strong>
                      <span class="badge">${esc(item.category || '—')}</span>
                    </div>
                    <div class="audio-item-sub mono">${formatSec(item.durationSec)} · RMS ${formatDb(item.rmsDb)} · Gain ${formatDb(item.gainDb)}</div>
                  </button>`).join('') : `<div class="muted">${esc(t('audio.no_sounds', null, 'No sounds stored yet.'))}</div>`}
              </div>
            </div>

            <div class="audio-editor-panel">
              ${selected ? `
                <div class="grid2" style="align-items:start;">
                  <div>
                    <div class="field">
                      <label>${esc(t('common.name', null, 'Name'))}</label>
                      <input class="input" id="audioName" value="${esc(selected.name||'')}"/>
                    </div>
                    <div class="field">
                      <label>${esc(t('common.category', null, 'Category'))}</label>
                      <input class="input" id="audioCategory" list="audioCategoryList" value="${esc(selected.category||'')}" placeholder="${esc(t('audio.category_placeholder', null, 'Start, finish, announcement, error ...'))}"/>
                      <datalist id="audioCategoryList">${categories.map(cat=>`<option value="${esc(cat)}"></option>`).join('')}</datalist>
                    </div>
                    <div class="audio-meta-grid">
                      <div class="miniStat"><span>${esc(t('audio.duration', null, 'Duration'))}</span><strong>${formatSec(selected.durationSec)}</strong></div>
                      <div class="miniStat"><span>${esc(t('audio.peak', null, 'Peak'))}</span><strong>${formatDb(selected.peakDb)}</strong></div>
                      <div class="miniStat"><span>${esc(t('audio.rms', null, 'RMS'))}</span><strong>${formatDb(selected.rmsDb)}</strong></div>
                      <div class="miniStat"><span>${esc(t('audio.file', null, 'File'))}</span><strong>${esc(selected.mime||'audio/*')}</strong></div>
                    </div>
                    <div class="field">
                      <label>${esc(t('audio.waveform', null, 'Waveform'))}</label>
                      ${renderWaveformBars(selected.waveform)}
                    </div>
                    <div class="row wrap" style="gap:10px; margin-top:12px;">
                      <input type="file" id="audioReplaceFile" accept="audio/*" style="display:none" />
                      <button class="btn" id="audioReplaceBtn" type="button">${esc(t('audio.replace_file', null, 'Replace file'))}</button>
                      <button class="btn btn-primary" id="audioPreviewBtn" type="button">${esc(t('audio.preview', null, 'Preview'))}</button>
                      <button class="btn" id="audioAnalyzeBtn" type="button">${esc(t('audio.reanalyze', null, 'Reanalyze'))}</button>
                      <button class="btn btn-danger" id="audioDeleteBtn" type="button">${esc(t('common.delete', null, 'Delete'))}</button>
                    </div>
                  </div>

                  <div>
                    <div class="field">
                      <label>${esc(t('audio.gain', null, 'Gain / volume'))} (${formatDb(selected.gainDb)})</label>
                      <input class="input" id="audioGainDb" type="range" min="-24" max="24" step="0.1" value="${esc(Number(selected.gainDb||0))}" />
                    </div>
                    <div class="field">
                      <label>${esc(t('audio.target_per_sound', null, 'Target loudness per sound'))}</label>
                      <input class="input mono" id="audioTargetDb" type="number" step="0.5" min="-30" max="-6" value="${esc(Number.isFinite(selected.targetDb)?selected.targetDb:state.audio.targetDb)}" />
                    </div>
                    <div class="row wrap" style="gap:10px; margin-bottom:10px;">
                      <button class="btn" id="audioAutoGainBtn" type="button">${esc(t('audio.align_to_target', null, 'Align to target'))}</button>
                      <button class="btn" id="audioNormalizeBtn" type="button">${esc(t('audio.normalize', null, 'Normalize'))}</button>
                    </div>
                    <div class="field">
                      <label>${esc(t('audio.trim_start_ms', null, 'Start cut (ms)'))}</label>
                      <input class="input mono" id="audioTrimStartMs" type="number" min="0" step="10" value="${esc(Number(selected.trimStartMs||0))}" />
                    </div>
                    <div class="field">
                      <label>${esc(t('audio.trim_end_ms', null, 'End cut (ms)'))}</label>
                      <input class="input mono" id="audioTrimEndMs" type="number" min="0" step="10" value="${esc(Number(selected.trimEndMs||0))}" />
                    </div>
                    <div class="field">
                      <label>${esc(t('audio.fade_in_ms', null, 'Fade in (ms)'))}</label>
                      <input class="input mono" id="audioFadeInMs" type="number" min="0" step="10" value="${esc(Number(selected.fadeInMs||0))}" />
                    </div>
                    <div class="field">
                      <label>${esc(t('audio.fade_out_ms', null, 'Fade out (ms)'))}</label>
                      <input class="input mono" id="audioFadeOutMs" type="number" min="0" step="10" value="${esc(Number(selected.fadeOutMs||0))}" />
                    </div>
                    <div class="row wrap" style="gap:10px; margin-top:12px;">
                      <button class="btn btn-primary" id="audioSaveMetaBtn" type="button">${esc(t('audio.save_sound', null, 'Save sound'))}</button>
                    </div>
                  </div>
                </div>
              ` : `<div class="muted">${esc(t('audio.select_sound_hint', null, 'Select a sound on the left or upload a new one.'))}</div>`}
            </div>
          </div>
          <div class="muted small" style="margin-top:12px;">${esc(t('audio.db_hint', null, 'Audio files are stored locally in IndexedDB so they persist without bloating LocalStorage. A built-in fallback sound is also created automatically on first start.'))}</div>
        </div>
      </div>
    `;

    const saveAudio = async ()=>{
      state.audio.enabled = (el.querySelector('#audEnabled').value==='true');
      state.audio.lapAnnounceMode = normalizeLapAnnounceMode(el.querySelector('#lapMode').value);
      state.audio.sayName = el.querySelector('#sayName').checked;
      state.audio.sayLapNo = el.querySelector('#sayLapNo').checked;
      state.audio.sayLapTime = el.querySelector('#sayLapTime').checked;
      const dec = parseInt(el.querySelector('#decimals').value,10);
      state.audio.decimals = Number.isFinite(dec) ? Math.max(0, Math.min(3, dec)) : 3;
      state.audio.voiceUri = el.querySelector('#voiceSel').value;
      state.audio.rate = parseFloat(el.querySelector('#rate').value);
      state.audio.pitch = parseFloat(el.querySelector('#pitch').value);
      state.audio.volume = parseFloat(el.querySelector('#volume').value);
      state.audio.targetDb = clamp(parseFloat(el.querySelector('#audioGlobalTargetDb').value), -30, -6);
      state.audio.defaultDriverSoundId = el.querySelector('#audioDefaultDriverSoundId')?.value || '';

      state.audio.restAnnouncementsEnabled = !!el.querySelector('#restAnnouncementsEnabled').checked;
      state.audio.restAnnouncementTimes = String(el.querySelector('#restAnnouncementTimes').value || '')
        .split(',')
        .map(x=>parseInt(String(x).trim(),10))
        .filter(x=>Number.isFinite(x) && x>0)
        .sort((a,b)=>b-a);
      if(!state.audio.restAnnouncementTimes.length) state.audio.restAnnouncementTimes = [300,180,120,60,30];
      state.audio.sayTimeExpired = !!el.querySelector('#sayTimeExpired').checked;
      state.audio.sayFinished = !!el.querySelector('#sayFinished').checked;
      state.audio.sayRunFinished = !!el.querySelector('#sayRunFinished').checked;
      state.audio.sayPlacements = !!el.querySelector('#sayPlacements').checked;
      state.audio.sayOvertakes = !!el.querySelector('#sayOvertakes').checked;
      state.audio.sayLappingWarning = !!el.querySelector('#sayLappingWarning').checked;
      state.audio.sayPositionsAtRest = !!el.querySelector('#sayPositionsAtRest').checked;
      state.audio.lappingWarnSec = Math.max(1, Math.min(30, parseInt(el.querySelector('#lappingWarnSec').value,10) || 3));
      state.audio.sayTrackRecordSeason = !!el.querySelector('#sayTrackRecordSeason').checked;
      state.audio.sayTrackRecordDay = !!el.querySelector('#sayTrackRecordDay').checked;
      state.audio.sayPersonalBestSeason = !!el.querySelector('#sayPersonalBestSeason').checked;
      state.audio.sayPersonalBestDay = !!el.querySelector('#sayPersonalBestDay').checked;
      saveState();
      try{ if(typeof flushProjectStatePersist === 'function') await flushProjectStatePersist(); }catch{}
      toast(t('audio.title', null, 'Audio'), t('common.saved', null, 'Saved.'), 'ok');
    };

    const persistSelectedMeta = async ()=>{
      const meta = getAudioAssetMeta(state.ui.audioSelectedId);
      if(!meta) return null;
      meta.name = String(el.querySelector('#audioName')?.value || meta.name || '').trim() || t('audio.default_sound_name', null, 'Sound');
      meta.category = String(el.querySelector('#audioCategory')?.value || meta.category || '').trim() || t('audio.default_category', null, 'Announcement');
      meta.gainDb = clamp(parseFloat(el.querySelector('#audioGainDb')?.value), -24, 24);
      meta.targetDb = clamp(parseFloat(el.querySelector('#audioTargetDb')?.value), -30, -6);
      meta.trimStartMs = Math.max(0, parseInt(el.querySelector('#audioTrimStartMs')?.value||0,10) || 0);
      meta.trimEndMs = Math.max(0, parseInt(el.querySelector('#audioTrimEndMs')?.value||0,10) || 0);
      meta.fadeInMs = Math.max(0, parseInt(el.querySelector('#audioFadeInMs')?.value||0,10) || 0);
      meta.fadeOutMs = Math.max(0, parseInt(el.querySelector('#audioFadeOutMs')?.value||0,10) || 0);
      meta.updatedAt = now();
      saveState();
      try{ if(typeof flushProjectStatePersist === 'function') await flushProjectStatePersist(); }catch{}
      return meta;
    };

    el.querySelector('#audSave').onclick = ()=>{ void saveAudio(); };
    el.querySelector('#audSave2').onclick = ()=>{ void saveAudio(); };
    el.querySelector('#audTest').onclick = async ()=>{
      await saveAudio();
      speak(t('audio.test_phrase', null, 'Test. Audio output works.'));
      toast(t('audio.title', null, 'Audio'), t('audio.test_started', null, 'Test announcement started.'), 'ok');
    };

    const searchEl = el.querySelector('#audioSearch');
    if(searchEl) searchEl.onchange = ()=>{ state.ui.audioSearch = searchEl.value || ''; renderAudio(); };
    const filterEl = el.querySelector('#audioCategoryFilter');
    if(filterEl) filterEl.onchange = ()=>{ state.ui.audioFilterCategory = filterEl.value || ''; renderAudio(); };
    const globalTargetEl = el.querySelector('#audioGlobalTargetDb');
    if(globalTargetEl) globalTargetEl.onchange = async ()=>{
      state.audio.targetDb = clamp(parseFloat(globalTargetEl.value), -30, -6);
      saveState();
      try{ if(typeof flushProjectStatePersist === 'function') await flushProjectStatePersist(); }catch{}
    };
    const defaultDriverSoundEl = el.querySelector('#audioDefaultDriverSoundId');
    if(defaultDriverSoundEl) defaultDriverSoundEl.onchange = async ()=>{
      state.audio.defaultDriverSoundId = defaultDriverSoundEl.value || '';
      saveState();
      try{ if(typeof flushProjectStatePersist === 'function') await flushProjectStatePersist(); }catch{}
    };

    const addInput = el.querySelector('#audioFileAdd');
    el.querySelector('#audioAddBtn').onclick = ()=> addInput?.click();
    if(addInput) addInput.onchange = async ()=>{
      const files = Array.from(addInput.files || []);
      if(!files.length) return;
      try{
        for(const file of files) await createOrReplaceAudioAsset(file);
        toast(t('audio.db_title', null, 'Audio database'), t('audio.imported_count', { count: files.length }, `${files.length} sound(s) imported.`), 'ok');
        renderAudio();
      }catch(err){
        toast(t('audio.db_title', null, 'Audio database'), t('audio.import_failed', null, 'Import failed.'), 'err');
        logLine('audio import error: ' + (err?.message || err));
      }finally{
        addInput.value='';
      }
    };

    el.querySelectorAll('[data-audio-select]').forEach(btn=> btn.onclick = ()=>{ state.ui.audioSelectedId = btn.getAttribute('data-audio-select') || ''; saveState(); renderAudio(); });
    el.querySelector('#audioStopPreview')?.addEventListener('click', ()=> stopAudioPreview());
    el.querySelector('#audioAlignAll')?.addEventListener('click', async ()=>{
      for(const meta of getAudioLibrary()){
        const target = Number.isFinite(meta.targetDb) ? meta.targetDb : Number(state.audio.targetDb || -16);
        meta.gainDb = calcRecommendedGainDb(meta, target);
        meta.updatedAt = now();
      }
      saveState();
      try{ if(typeof flushProjectStatePersist === 'function') await flushProjectStatePersist(); }catch{}
      toast(t('audio.db_title', null, 'Audio database'), t('audio.aligned_all', null, 'All sounds aligned.'), 'ok');
      renderAudio();
    });

    if(selected){
      el.querySelector('#audioSaveMetaBtn')?.addEventListener('click', async ()=>{ await persistSelectedMeta(); toast(t('audio.db_title', null, 'Audio database'), t('audio.sound_saved', null, 'Sound saved.'), 'ok'); renderAudio(); });
      el.querySelector('#audioPreviewBtn')?.addEventListener('click', async ()=>{
        try{
          const meta = await persistSelectedMeta();
          await previewAudioAsset(meta);
        }catch(err){
          toast(t('audio.db_title', null, 'Audio database'), t('audio.preview_failed', null, 'Preview failed.'), 'err');
          logLine('audio preview error: ' + (err?.message || err));
        }
      });
      el.querySelector('#audioAnalyzeBtn')?.addEventListener('click', async ()=>{
        try{
          await persistSelectedMeta();
          await reanalyzeAudioAsset(selected.id);
          toast(t('audio.db_title', null, 'Audio database'), t('audio.analysis_updated', null, 'Analysis updated.'), 'ok');
          renderAudio();
        }catch(err){
          toast(t('audio.db_title', null, 'Audio database'), t('audio.analysis_failed', null, 'Analysis failed.'), 'err');
          logLine('audio analyze error: ' + (err?.message || err));
        }
      });
      el.querySelector('#audioDeleteBtn')?.addEventListener('click', async ()=>{
        try{
          stopAudioPreview();
          await removeAudioAsset(selected.id);
          toast(t('audio.db_title', null, 'Audio database'), t('audio.deleted', null, 'Sound deleted.'), 'ok');
          renderAudio();
        }catch(err){
          toast(t('audio.db_title', null, 'Audio database'), t('common.delete_failed', null, 'Delete failed.'), 'err');
          logLine('audio delete error: ' + (err?.message || err));
        }
      });
      const replaceInput = el.querySelector('#audioReplaceFile');
      el.querySelector('#audioReplaceBtn')?.addEventListener('click', ()=> replaceInput?.click());
      if(replaceInput) replaceInput.onchange = async ()=>{
        const file = replaceInput.files?.[0];
        if(!file) return;
        try{
          await persistSelectedMeta();
          await createOrReplaceAudioAsset(file, selected.id);
          toast(t('audio.db_title', null, 'Audio database'), t('audio.file_replaced', null, 'File replaced.'), 'ok');
          renderAudio();
        }catch(err){
          toast(t('audio.db_title', null, 'Audio database'), t('audio.replace_failed', null, 'Replace failed.'), 'err');
          logLine('audio replace error: ' + (err?.message || err));
        }finally{
          replaceInput.value='';
        }
      };
      el.querySelector('#audioAutoGainBtn')?.addEventListener('click', async ()=>{
        const meta = await persistSelectedMeta();
        if(!meta) return;
        meta.gainDb = calcRecommendedGainDb(meta, Number(meta.targetDb || state.audio.targetDb || -16));
        saveState();
        try{ if(typeof flushProjectStatePersist === 'function') await flushProjectStatePersist(); }catch{}
        renderAudio();
      });
      el.querySelector('#audioNormalizeBtn')?.addEventListener('click', async ()=>{
        const meta = await persistSelectedMeta();
        if(!meta) return;
        const peakDb = Number(meta.peakDb);
        meta.gainDb = Number.isFinite(peakDb) ? Math.max(-24, Math.min(24, -1 - peakDb)) : 0;
        saveState();
        try{ if(typeof flushProjectStatePersist === 'function') await flushProjectStatePersist(); }catch{}
        renderAudio();
      });
    }
  }
  // --------------------- Audio (TTS) ---------------------
  function getVoices(){ return ('speechSynthesis' in window) ? speechSynthesis.getVoices() : []; }
  function getSelectedVoice(){
    bindShared();
    const uri = state.audio.voiceUri;
    const voices = getVoices();
    if(uri) return voices.find(v=>v.voiceURI===uri) || null;
    return voices.find(v=>/^de(-|$)/i.test(v.lang)) || voices[0] || null;
  }

  function speak(text){
    bindShared();
    try{
      if(!state.audio.enabled) return;
      if(!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = getSelectedVoice();
      if(v) u.voice = v;
      u.rate = clamp(state.audio.rate, 0.5, 2.0);
      u.pitch = clamp(state.audio.pitch, 0, 2);
      u.volume = clamp(state.audio.volume, 0, 1);
      speechSynthesis.speak(u);
    }catch(e){
      logLine('Audio Fehler: ' + String(e?.message||e));
    }
  }

  function countLapsForCarInRace(carId, raceId, phase){
    bindShared();
    let n=0;
    for(const l of state.session.laps){
      if(l.carId===carId && l.raceId===raceId){
        if(!phase || l.phase===phase) n++;
      }
    }
    return n;
  }

  let _rootFallbackAudio = null;
  function normalizeLapAnnounceMode(value){
    const raw = String(value || '').trim().toLowerCase();
    if(raw === 'aus' || raw === 'off' || raw === '0') return 'off';
    if(raw === 'nur bestzeit' || raw === 'best lap only' || raw === 'best') return 'best';
    if(raw === 'jede runde' || raw === 'every lap' || raw === 'every') return 'every';
    return 'every';
  }

  async function playSimpleLapBeep(){
    bindShared();
    try{
      const ctx = getAudioContext();
      if(!ctx) return false;
      if(ctx.state === 'suspended') await ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + 0.01;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.13);
      return true;
    }catch{
      return false;
    }
  }

  async function ensureBuiltInDefaultDriverSound(){
    bindShared();
    try{
      let rec = null;
      try{ rec = await audioAssetGet(BUILTIN_DEFAULT_SOUND_ID); }catch{}
      let meta = getAudioAssetMeta(BUILTIN_DEFAULT_SOUND_ID);
      if(!rec || !rec.dataUrl || !meta){
        const buf = await dataUrlToAudioBuffer(BUILTIN_DEFAULT_SOUND_DATA_URL);
        const analyzed = analyzeAudioBuffer(buf);
        await audioAssetPut({
          id: BUILTIN_DEFAULT_SOUND_ID,
          name: 'defaultsound.mp3',
          type: 'audio/mpeg',
          size: 0,
          updatedAt: now(),
          dataUrl: BUILTIN_DEFAULT_SOUND_DATA_URL
        });
        meta = {
          id: BUILTIN_DEFAULT_SOUND_ID,
          name: BUILTIN_DEFAULT_SOUND_NAME,
          category: 'System',
          mime: 'audio/mpeg',
          sizeBytes: 0,
          durationSec: analyzed.durationSec,
          sampleRate: analyzed.sampleRate,
          channels: analyzed.channels,
          peak: analyzed.peak,
          peakDb: analyzed.peakDb,
          rms: analyzed.rms,
          rmsDb: analyzed.rmsDb,
          waveform: analyzed.waveform,
          targetDb: Number(state.audio?.targetDb || -16),
          gainDb: calcRecommendedGainDb(analyzed, Number(state.audio?.targetDb || -16)),
          trimStartMs: 0,
          trimEndMs: 0,
          fadeInMs: 0,
          fadeOutMs: 0,
          builtIn: true,
          updatedAt: now()
        };
        const list = getAudioLibrary();
        const idx = list.findIndex(x=>x.id===BUILTIN_DEFAULT_SOUND_ID);
        if(idx>=0) list[idx] = meta; else list.unshift(meta);
      }
      if(!String(state.audio?.defaultDriverSoundId || '').trim()) state.audio.defaultDriverSoundId = BUILTIN_DEFAULT_SOUND_ID;
      if(!String(state.ui?.audioSelectedId || '').trim()) state.ui.audioSelectedId = BUILTIN_DEFAULT_SOUND_ID;
      saveState();
      return meta;
    }catch(err){
      logLine('builtin default sound error: ' + String(err?.message || err));
      return null;
    }
  }

  async function playDefaultDriverSound(){
    bindShared();
    const id = String(state.audio?.defaultDriverSoundId || '').trim() || BUILTIN_DEFAULT_SOUND_ID;
    let meta = getAudioAssetMeta(id);
    if(!meta && id===BUILTIN_DEFAULT_SOUND_ID) meta = await ensureBuiltInDefaultDriverSound();
    if(!meta) return false;
    try{
      await previewAudioAsset(meta);
      return true;
    }catch(err){
      logLine('default sound error: ' + String(err?.message || err));
      return false;
    }
  }

  async function resolveRootFallbackSoundUrl(forceRefresh=false){
    bindShared();
    return '';
  }

  async function playRootFallbackSound(){
    bindShared();
    return await playDefaultDriverSound();
  }

  async function playDriverLapSound(car){
    bindShared();
    const driverId = String(car?.driverId || '').trim();
    if(driverId){
      const soundId = getDriverLapSoundId(driverId);
      if(soundId){
        const meta = getAudioAssetMeta(soundId);
        if(meta){
          try{
            await previewAudioAsset(meta);
            return true;
          }catch(err){
            logLine('driver sound error: ' + String(err?.message || err));
          }
        }
      }
    }
    return await playRootFallbackSound();
  }

  function maybeSpeakLap(car, lapMs, phase){
    bindShared();
    if(!state.audio?.enabled) return;
    const mode = normalizeLapAnnounceMode(state.audio.lapAnnounceMode);

    if(mode==='best'){
      return;
    }

    if(mode==='off'){
      return;
    }

    const driverName = getSpeakNameForCar(car) || getDriverNameForCar(car);
    const lapNo = countLapsForCarInRace(car.id, state.session.currentRaceId, phase);

    const parts=[];
    if(state.audio.sayName) parts.push(driverName || car.name);
    if(state.audio.sayLapNo) parts.push(t('audio.lap_prefix', null, 'Runde') + ' ' + lapNo);
    if(state.audio.sayLapTime) parts.push(msToSpeechTime(lapMs, state.audio.decimals));
    if(!parts.length){
      const fallback = msToSpeechTime(lapMs, state.audio.decimals);
      if(fallback) queueSpeak(fallback); else playRootFallbackSound();
      return;
    }
    queueSpeak(parts.join(', '));
  }

  
  // --------------------- Speech queue (no overlap) ---------------------
  let speechQueue = Promise.resolve();

  function speakPromise(text){
    bindShared();
    return new Promise((resolve)=>{
      try{
        if(!state.audio.enabled) return resolve();
        if(!('speechSynthesis' in window)) return resolve();

        // Safety: speech events sometimes never fire (permissions/voices loading).
        // Never block the start sequence because of TTS.
        let done = false;
        const finish = ()=>{
          if(done) return;
          done = true;
          try{ clearTimeout(t); }catch{}
          resolve();
        };
        const t = setTimeout(finish, 4500);

        const u = new SpeechSynthesisUtterance(text);
        const v = getSelectedVoice();
        if(v) u.voice = v;
        u.rate = clamp(state.audio.rate, 0.5, 2.0);
        u.pitch = clamp(state.audio.pitch, 0, 2);
        u.volume = clamp(state.audio.volume, 0, 1);
        u.onend = finish;
        u.onerror = finish;
        try{ speechSynthesis.cancel(); }catch{}
        speechSynthesis.speak(u);
      }catch{
        resolve();
      }
    });
  }

  function queueSpeak(text){
    bindShared();
    speechQueue = Promise.resolve(speechQueue)
      .catch(()=>{})
      .then(()=>speakPromise(text));
    return speechQueue;
  }

  



  function ensurePersonalStores(){
    bindShared();
    if(!state.personalRecords) state.personalRecords = {bySeason:{}, byRaceDay:{}};
    if(!state.personalRecords.bySeason) state.personalRecords.bySeason = {};
    if(!state.personalRecords.byRaceDay) state.personalRecords.byRaceDay = {};
  }

  function getPBSeason(seasonId, trackId, driverId){
    bindShared();
    ensurePersonalStores();
    return state.personalRecords.bySeason?.[seasonId]?.[trackId]?.[driverId] || null;
  }
  function getPBDay(raceDayId, trackId, driverId){
    bindShared();
    ensurePersonalStores();
    return state.personalRecords.byRaceDay?.[raceDayId]?.[trackId]?.[driverId] || null;
  }

  function setPBSeason(seasonId, trackId, driverId, rec){
    bindShared();
    ensurePersonalStores();
    if(!state.personalRecords.bySeason[seasonId]) state.personalRecords.bySeason[seasonId] = {};
    if(!state.personalRecords.bySeason[seasonId][trackId]) state.personalRecords.bySeason[seasonId][trackId] = {};
    state.personalRecords.bySeason[seasonId][trackId][driverId] = rec;
  }
  function setPBDay(raceDayId, trackId, driverId, rec){
    bindShared();
    ensurePersonalStores();
    if(!state.personalRecords.byRaceDay[raceDayId]) state.personalRecords.byRaceDay[raceDayId] = {};
    if(!state.personalRecords.byRaceDay[raceDayId][trackId]) state.personalRecords.byRaceDay[raceDayId][trackId] = {};
    state.personalRecords.byRaceDay[raceDayId][trackId][driverId] = rec;
  }

  function speakPersonalBest(prefix, car, lapMs){
    bindShared();
    if(!state.audio?.enabled) return;
    const mode = normalizeLapAnnounceMode(state.audio?.lapAnnounceMode);
    if(mode==='best'){
      const name = getSpeakNameForCar(car) || getDriverNameForCar(car) || car?.name || t('dashboard.unknown', null, 'Unknown');
      const parts = [];
      if(name) parts.push(name);
      parts.push(prefix);
      if(Number.isFinite(lapMs)) parts.push(msToSpeechTime(lapMs, state.audio?.decimals ?? 3));
      queueSpeak(parts.join(', '));
      return;
    }
    queueSpeak(prefix);
  }

  function updatePersonalBestsOnLap(trackId, lapTs, car, lapMs){
    bindShared();
    if(!trackId || !car || !car.driverId || lapMs==null) return;
    const driverId = String(car.driverId);
    const driverName = (car?.driverId ? getDriverSpeakName(car.driverId) : '') || (car?.driverId ? getDriverSpeakName(car.driverId) : '') || getDriverNameForCar(car) || t('dashboard.unknown', null, 'Unknown');

    // Season PB
    const seasonId = state.season?.activeSeasonId || '';
    if(seasonId){
      const cur = getPBSeason(seasonId, trackId, driverId);
      if(!cur || cur.bestMs==null || lapMs < cur.bestMs){
        setPBSeason(seasonId, trackId, driverId, {bestMs:lapMs, ts:lapTs, carName:car.name||'', driverName});
        saveState();
        if(state.audio?.enabled && state.audio?.sayPersonalBestSeason){
          speakPersonalBest(t('audio.pb_season_call', null, 'Persoenliche Bestzeit'), car, lapMs);
        }
      }
    }

    // RaceDay PB (only if active renntag matches track)
    const rd = getActiveRaceDay();
    if(rd && rd.trackId===trackId){
      const cur = getPBDay(rd.id, trackId, driverId);
      if(!cur || cur.bestMs==null || lapMs < cur.bestMs){
        setPBDay(rd.id, trackId, driverId, {bestMs:lapMs, ts:lapTs, carName:car.name||'', driverName});
        saveState();
        if(state.audio?.enabled && state.audio?.sayPersonalBestDay){
          speakPersonalBest(t('audio.pb_day_call', null, 'Persoenliche Tagesbestzeit'), car, lapMs);
        }
      }
    }
  }

function speakTrackRecord(prefix, name, ms){
    bindShared();
    if(!state.audio?.enabled) return;
    // Only say the record type; name/time is already announced via the normal lap callout.
    queueSpeak(prefix);
  }



  return {
    normalizeVoiceRate,
    normalizeVoicePitch,
    normalizeVoiceVolume,
    getAudioContext,
    openAudioAssetDb,
    audioAssetPut,
    audioAssetGet,
    audioAssetDelete,
    audioAssetGetAll,
    audioAssetClearAll,
    clearAudioDbAndAssignments,
    exportAudioDb,
    importAudioDbFile,
    getAudioLibrary,
    renderAudioAssetOptionTags,
    getAudioAssetMeta,
    ensureAudioSelection,
    formatDb,
    formatSec,
    fileToDataUrl,
    dataUrlToAudioBuffer,
    analyzeAudioBuffer,
    calcRecommendedGainDb,
    gainDbToLinear,
    stopAudioPreview,
    previewAudioAsset,
    createOrReplaceAudioAsset,
    reanalyzeAudioAsset,
    removeAudioAsset,
    renderAudio,
    renderWaveformBars,
    getFilteredAudioLibrary,
    getVoices,
    getSelectedVoice,
    speak,
    countLapsForCarInRace,
    playSimpleLapBeep,
    ensureBuiltInDefaultDriverSound,
    playDefaultDriverSound,
    resolveRootFallbackSoundUrl,
    playRootFallbackSound,
    playDriverLapSound,
    maybeSpeakLap,
    speakPromise,
    queueSpeak,
    ensurePersonalStores,
    getPBSeason,
    getPBDay,
    setPBSeason,
    setPBDay,
    speakPersonalBest,
    updatePersonalBestsOnLap,
    speakTrackRecord,
    normalizeLapAnnounceMode
  };
})();
