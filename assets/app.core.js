window.TIMTIME_CORE = (function(){
  'use strict';

  function bindShared(){
    Object.assign(globalThis, window.TIMTIME_SHARED || {});
  }

  function getStateRef(){
    bindShared();
    return globalThis.state || window.TIMTIME_SHARED?.state || null;
  }

  function getUiLanguage(){
    const s = getStateRef();
    return s?.settings?.language === 'en' ? 'en' : 'de';
  }

  function t(key, vars=null, fallback=''){
    const I18N = window.TIMTIME_I18N || {};
    let out = I18N[getUiLanguage()]?.[key];
    if(out == null) out = I18N.de?.[key];
    if(out == null) out = fallback || key;
    out = String(out);
    if(vars && typeof vars === 'object'){
      for(const [name, value] of Object.entries(vars)){
        out = out.replaceAll(`{${name}}`, String(value ?? ''));
      }
    }
    return typeof demojibake === 'function' ? demojibake(out) : out;
  }

  function getTrackByIdLocal(trackId){
    const s = getStateRef();
    return s?.tracks?.tracks?.find(track => track.id===trackId) || null;
  }

  function getScaleDenominator(){
    const state = getStateRef();
    const n = Number(state.settings?.scaleDenominator || 50);
    return Number.isFinite(n) && n > 0 ? n : 50;
  }

  function lapMsToAverageKmh(lapMs, track){
    const lenM = getTrackLengthMeters(track);
    if(!lapMs || lapMs <= 0 || !lenM || lenM <= 0) return null;
    const scale = getScaleDenominator();
    const realMeters = lenM * scale;
    const seconds = lapMs / 1000;
    const mps = realMeters / seconds;
    return mps * 3.6;
  }

  function formatKmh(v){
    if(v==null || !Number.isFinite(v)) return '—';
    return String(v.toFixed(1)).replace('.', ',') + ' km/h';
  }

function getTrackLengthMeters(track){
    if(!track) return 0;
    const candidates = [
      track.displayLengthMeters,
      track.lengthMeters,
      track.trackLengthMeters,
      track.displayLength,
      track.length
    ];
    for(const raw of candidates){
      const v = Number(String(raw ?? '').replace(',', '.').trim());
      if(Number.isFinite(v) && v > 0) return v;
    }
    return 0;
  }

  function isAbsurdLapForTrack(lap, track){
    if(!lap || lap.lapMs==null) return true;
    const minLap = Number(track?.minLapMs || 0);
    return !!(minLap > 0 && Number(lap.lapMs) > (minLap * 3));
  }


  function getTrackPlainName(track){
    return String(track?.name || '—').trim() || '—';
  }

  function getTrackDetailsText(track){
    if(!track) return '—';
    const mode = String(track.setup?.mode || '—').trim();
    const tire = String(track.setup?.tireWear || '—').trim();
    const boost = track.setup?.boost ? 'Ja' : 'Nein';
    return `Modus: ${mode} • Reifenverschleiß: ${tire} • Boost: ${boost}`;
  }

function formatTrackDisplayName(track){
    if(!track) return '—';
    const base = String(track.name || 'Strecke').trim();
    const mode = String(track.setup?.mode || '—').trim();
    const tire = String(track.setup?.tireWear || '—').trim();
    const boost = track.setup?.boost ? 'Ja' : 'Aus';
    const lengthM = getTrackLengthMeters(track);
    const extra = [`M:${mode}`, `R:${tire}`, `B:${boost}`];
    if(lengthM > 0) extra.push(`L:${lengthM}m`);
    return `${base} ${extra.join(', ')}`.trim();
  }

  function getActiveSeason(){
    const state = getStateRef();
    return state?.season?.seasons?.find(s=>s.id===state?.season?.activeSeasonId) || null;
  }
  function getActiveTrack(){ const state = getStateRef(); return state?.tracks?.tracks?.find(t=>t.id===state?.tracks?.activeTrackId) || null; }
  function getTrackRecord(track, seasonId){
    if(!track) return {ms:null,driverName:'',carName:''};
    const state = getStateRef();
    const sid = seasonId || state.season.activeSeasonId;
    if(!track.recordsBySeason) track.recordsBySeason = {};
    if(!track.recordsBySeason[sid]) track.recordsBySeason[sid] = {ms:null,driverName:'',carName:''};
    const rec = track.recordsBySeason[sid];
    let resolvedCarName = String(rec?.carName || '');
    if(rec?.carId){
      resolvedCarName = getCar(rec.carId)?.name || resolvedCarName;
    }else if(rec?.driverId){
      const cars = getCarsByDriver(rec.driverId);
      if(cars.length === 1) resolvedCarName = cars[0]?.name || resolvedCarName;
    }
    let resolvedDriverName = String(rec?.driverName || '');
    if(rec?.driverId){
      resolvedDriverName = getDriver(rec.driverId)?.name || resolvedDriverName;
    }
    return {
      ...rec,
      driverName: resolvedDriverName,
      carName: resolvedCarName
    };
  }

  function getRaceDayTrackRecord(raceDay, trackId){
    if(!raceDay) return null;
    if(!raceDay.trackRecordsByTrackId || typeof raceDay.trackRecordsByTrackId!=='object'){
      raceDay.trackRecordsByTrackId = {};
    }
    if(!raceDay.trackRecordsByTrackId[trackId]){
      raceDay.trackRecordsByTrackId[trackId] = { ms:null, driverName:'', carName:'' };
    }
    const rec = raceDay.trackRecordsByTrackId[trackId];
    let resolvedCarName = String(rec?.carName || '');
    if(rec?.carId){
      resolvedCarName = getCar(rec.carId)?.name || resolvedCarName;
    }else if(rec?.driverId){
      const cars = getCarsByDriver(rec.driverId);
      if(cars.length === 1) resolvedCarName = cars[0]?.name || resolvedCarName;
    }
    let resolvedDriverName = String(rec?.driverName || '');
    if(rec?.driverId){
      resolvedDriverName = getDriver(rec.driverId)?.name || resolvedDriverName;
    }
    return {
      ...rec,
      driverName: resolvedDriverName,
      carName: resolvedCarName
    };
  }



  function getActiveRaceDay(){ const state = getStateRef(); return state?.raceDay?.raceDays?.find(r=>r.id===state?.raceDay?.activeRaceDayId) || null; }
  
  function getDriverSpeakName(driverId){
    const d = getDriver(driverId);
    if(!d) return '';
    return String(d.phoneticName || d.ttsName || d.name || '').trim();
  }

  function getDriver(id){
    const state = getStateRef();
    return state?.masterData?.drivers?.find(d=>d.id===id) || null;
  }
  function getCar(id){ const state = getStateRef(); return state?.masterData?.cars?.find(c=>c.id===id) || null; }
  function getCarsForDriver(driverId){ const state = getStateRef(); return (state?.masterData?.cars||[]).filter(c=>c.driverId===driverId); }

  // alias for older code paths
  function getCarsByDriver(driverId){ return getCarsForDriver(driverId); }

  function getModeLabel(){
    const state = getStateRef();
    if(state.session?.isFreeDriving || state.ui?.freeDrivingEnabled) return t('mode.free_driving');
    if(!state.modes.activeMode) return t('mode.none');
    if(state.modes.activeMode==='single') return t('mode.single', { submode:t('submode.' + String(state.modes.singleSubmode||'').toLowerCase(), null, state.modes.singleSubmode) });
    if(state.modes.activeMode==='team') return t('mode.team');
    if(state.modes.activeMode==='loop'){
      const ph = state.loopRuntime?.phase || 'training';
      const label = t('submode.' + String(ph||'').toLowerCase(), null, ph);
      return t('mode.loop', { phase:label });
    }
    if(state.modes.activeMode==='endurance') return t('mode.endurance');
    return t('mode.none');
  }

  function getLapKind(){
    const state = getStateRef();
    if(isFreeDrivingMode()) return 'training';
    if(!state.modes.activeMode) return 'training';
    if(state.modes.activeMode==='single'){
      if(state.modes.singleSubmode==='Training') return 'training';
      if(state.modes.singleSubmode==='Qualifying') return 'qualifying';
      return 'race';
    }
    return 'race';
  }



  function sanitizeDiscordFilename(name){
    return String(name||'summary.png').replace(/[^A-Za-z0-9._-]+/g,'_');
  }

  function safeHexToRgb(hex, fallback){
    const fb = fallback || [110,140,255];
    const s = String(hex||'').trim();
    const m = s.match(/^#?([0-9a-fA-F]{6})$/);
    if(!m) return fb;
    const h = m[1];
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }


  function getChartSeriesColor(series, idx=0){
    const own = String(series?.color||'').trim();
    if(/^#?[0-9a-fA-F]{6}$/.test(own)) return own.startsWith('#') ? own : ('#'+own);
    const palette = [
      '#5e97ff', '#62d296', '#ff835c', '#d66cff', '#f2c14e', '#4dd0e1',
      '#ff5fa2', '#8bc34a', '#ffb74d', '#7986cb', '#26c6da', '#ec407a',
      '#9ccc65', '#ffa726', '#7e57c2', '#26a69a'
    ];
    const n = palette.length || 1;
    const i = Number.isFinite(Number(idx)) ? Math.abs(Number(idx)) % n : 0;
    return palette[i];
  }


  function buildDistinctSeriesColorMap(seriesList){
    const palette = [
      '#5e97ff', '#62d296', '#ff835c', '#d66cff', '#f2c14e', '#4dd0e1',
      '#ff5fa2', '#8bc34a', '#ffb74d', '#7986cb', '#26c6da', '#ec407a',
      '#9ccc65', '#ffa726', '#7e57c2', '#26a69a', '#ef5350', '#29b6f6',
      '#ab47bc', '#66bb6a', '#ffee58', '#ff7043', '#8d6e63', '#42a5f5'
    ];
    const normalizedCounts = new Map();
    const normalized = (seriesList || []).map((series, idx)=>{
      const own = getChartSeriesColor(series, idx);
      const key = String(own || '').toLowerCase();
      normalizedCounts.set(key, (normalizedCounts.get(key) || 0) + 1);
      return own;
    });
    const used = new Set();
    const out = new Map();
    (seriesList || []).forEach((series, idx)=>{
      const key = String(series?.driverId || series?.id || series?.name || idx);
      let color = normalized[idx];
      const normalizedKey = String(color || '').toLowerCase();
      if((normalizedCounts.get(normalizedKey) || 0) > 1){
        color = palette[idx % palette.length];
      }
      let tries = 0;
      while(used.has(String(color || '').toLowerCase()) && tries < palette.length){
        color = palette[(idx + tries) % palette.length];
        tries++;
      }
      used.add(String(color || '').toLowerCase());
      out.set(key, color);
    });
    return out;
  }


  function sleep(ms){
    return new Promise(resolve=>setTimeout(resolve, Math.max(0, Number(ms)||0)));
  }



  return {
    getScaleDenominator,
    lapMsToAverageKmh,
    formatKmh,
    getTrackLengthMeters,
    isAbsurdLapForTrack,
    getTrackPlainName,
    getTrackDetailsText,
    formatTrackDisplayName,
    getActiveSeason,
    getActiveTrack,
    getTrackRecord,
    getRaceDayTrackRecord,
    getActiveRaceDay,
    getDriverSpeakName,
    getDriver,
    getCar,
    getCarsForDriver,
    getCarsByDriver,
    getModeLabel,
    getLapKind,
    sanitizeDiscordFilename,
    safeHexToRgb,
    getChartSeriesColor,
    buildDistinctSeriesColorMap,
    sleep
  };
})();
