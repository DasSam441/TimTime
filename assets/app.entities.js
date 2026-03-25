window.TIMTIME_ENTITIES = (function(){
  'use strict';

  function bindShared(){
    Object.assign(globalThis, window.TIMTIME_SHARED || {});
  }

  bindShared();

  function getDriverAvatarDataUrl(driverId){
    const mediaUrl = (state.media && state.media.driverAvatars && state.media.driverAvatars[driverId]) || '';
    if(mediaUrl) return mediaUrl;
    const drv = getDriver(driverId);
    return String(drv?.photoDataUrl || drv?.avatarUrl || '').trim();
  }

  function getDriverLapSoundId(driverId){
    const d = getDriver(driverId);
    const own = String(d?.lapSoundAssetId || '').trim();
    if(own) return own;
    return String(state.audio?.defaultDriverSoundId || '').trim();
  }

  function getDriverLapSoundMeta(driverId){
    const id = getDriverLapSoundId(driverId);
    return id ? getAudioAssetMeta(id) : null;
  }

  // Finish window helpers (for 🏁 markers)
  let _finishCacheTs = 0;
  let _finishCacheDriverIds = new Set();

  function refreshFinishCache(){
    _finishCacheTs = now();
    const finish = (state.session.finish && state.session.finish.pending) ? state.session.finish : null;
    const set = new Set();
    if(finish && finish.finishedCarIds){
      for(const carId of Object.keys(finish.finishedCarIds)){
        const c = getCar(carId);
        const did = (c?.driverId||'').trim();
        if(did) set.add(did);
      }
    }
    _finishCacheDriverIds = set;
  }

  function isDriverFinished(driverId){
    if(!driverId) return false;
    if(!_finishCacheTs || (now() - _finishCacheTs) > 250){
      refreshFinishCache();
    }
    return _finishCacheDriverIds.has(driverId);
  }

  function resetRaceAnnounceRuntime(){
    state.session.announce = {
      restSaidKeys:{},
      timeExpiredSaid:false,
      runFinishedSaid:false,
      finishSaidByKey:{},
      placementsSaidForRaceId:'',
      lastOrderByRaceId:{},
      lappingSaidKeys:{}
    };
  }

  function ensureRaceAnnounceRuntime(){
    if(!state.session.announce) resetRaceAnnounceRuntime();
  }

  function speakRaceRemaining(totalSec){
    if(!state.audio?.enabled || !state.audio?.restAnnouncementsEnabled) return;
    totalSec = Math.max(0, Math.trunc(totalSec||0));
    if(totalSec<=0) return;

    const mins = Math.floor(totalSec/60);
    const secs = totalSec % 60;

    let text = 'Noch ';
    if(mins===1 && secs===0){
      text += 'eine Minute';
    } else {
      if(mins>0) text += mins + ' Minute' + (mins===1 ? '' : 'n');
      if(secs>0){
        if(mins>0) text += ' ';
        text += secs;
      }
    }
    if(state.audio?.sayPositionsAtRest && state.modes.activeMode==='single' && state.session.state==='RUNNING' && !isFreeDrivingMode()){
      const pos = buildCurrentRacePositionsSpeech(3);
      if(pos) text += ', ' + pos;
    }
    queueSpeak(text);
  }

  function getCurrentSingleRaceStandings(){
    const raceId = state.session.currentRaceId || '';
    if(!raceId) return [];
    const rd = getActiveRaceDay();
    const race = rd?.races?.find(r=>r.id===raceId) || null;
    if(!race || !['single','loop'].includes(String(race.mode||''))) return [];
    const laps = getRelevantRaceLaps(raceId, state.session.laps);
    return computeDriverStandingsGlobal(laps);
  }

  function buildCurrentRacePositionsSpeech(limit=3){
    const rows = getCurrentSingleRaceStandings().slice(0, limit);
    if(!rows.length) return '';
    const parts = rows.map((r, idx)=>{
      const ord = idx===0 ? 'Platz eins' : idx===1 ? 'Platz zwei' : idx===2 ? 'Platz drei' : ('Platz ' + (idx+1));
      const nm = getDriverSpeakName(r.id) || r.name || ('Fahrer ' + (idx+1));
      return ord + ' ' + nm;
    });
    return parts.join(', ');
  }

  function maybeAnnounceOvertakeAndLapping(lastCar){
    try{
      if(!state.audio?.enabled) return;
      if(state.session.state!=='RUNNING') return;
      if(isFreeDrivingMode()) return;
      const raceId = state.session.currentRaceId || '';
      if(!raceId) return;
      const race = getRaceById(raceId);
      if(!race || !['single','loop'].includes(String(race.mode||''))) return;
      if(race.mode==='loop' && currentPhase()!=='race') return;
      ensureRaceAnnounceRuntime();
      const rows = getCurrentSingleRaceStandings();
      if(!rows.length) return;
      const order = rows.map(r=>String(r.id));
      const prev = state.session.announce.lastOrderByRaceId?.[raceId] || [];
      if(state.audio.sayOvertakes && prev.length){
        const driverId = String(lastCar?.driverId || '');
        if(driverId){
          const newIdx = order.indexOf(driverId);
          const prevIdx = prev.indexOf(driverId);
          if(newIdx>=0 && prevIdx>=0 && newIdx < prevIdx){
            const overtakenId = prev[newIdx];
            if(overtakenId && overtakenId !== driverId){
              const a = (lastCar ? getSpeakNameForCar(lastCar) : '') || rows[newIdx]?.name || 'Fahrer';
              const b = getDriverSpeakName(overtakenId) || getDriver(overtakenId)?.name || rows.find(x=>String(x.id)===String(overtakenId))?.name || 'Fahrer';
              queueSpeak(a + ' hat ' + b + ' überholt');
            }
          }
        }
      }
      state.session.announce.lastOrderByRaceId[raceId] = order;

      if(state.audio.sayLappingWarning){
        const warnMs = Math.max(1, Number(state.audio.lappingWarnSec||3)) * 1000;
        const leaders = rows.slice(0, 3).filter(r=>r && Number.isFinite(r.lastTs));
        for(const leader of leaders){
          for(const r of rows){
            if(!r || String(r.id)===String(leader.id)) continue;
            if((leader.laps||0) === ((r.laps||0) + 1) && Number.isFinite(r.lastTs) && leader.lastTs >= r.lastTs){
              const delta = leader.lastTs - r.lastTs;
              if(delta <= warnMs){
                const key = raceId + ':' + String(leader.id) + ':' + String(r.id) + ':' + String(leader.laps||0);
                if(!state.session.announce.lappingSaidKeys[key]){
                  const name = getDriverSpeakName(r.id) || r.name || 'Fahrer';
                  const leaderName = getDriverSpeakName(leader.id) || leader.name || 'Fahrer';
                  queueSpeak('Achtung, ' + name + ' wird von ' + leaderName + ' überrundet');
                  state.session.announce.lappingSaidKeys[key] = true;
                }
              }
            }
          }
        }
      }
    }catch{}
  }

  
  function getSpeakNameForCar(car){
    if(!car) return '';
    const did = car.driverId;
    const phon = did ? getDriverSpeakName(did) : '';
    return (phon || getDriverNameForCar(car) || car.name || '').trim();
  }

function getFinishNameForCarId(carId){
    const car = getCar(carId);
    if(!car) return '';
    return getSpeakNameForCar(car);
  }

  function getPlacementsForRace(raceId){
    if(!raceId) return [];
    const rd = getActiveRaceDay();
    const race = rd?.races?.find(r=>r.id===raceId) || null;
    if(!race) return [];
    const laps = getRelevantRaceLaps(raceId, state.session.laps);
    if(race.mode==='team' || race.mode==='endurance'){
      return computeTeamStandingsGlobal(laps, race.mode, null).map((t,idx)=>({ pos:idx+1, name:t.name||('Team '+(idx+1)), speakName:t.name||('Team '+(idx+1)) }));
    }
    return computeDriverStandingsGlobal(laps).map((s,idx)=>({ pos:idx+1, name:s.name||('Fahrer '+(idx+1)), speakName: (getDriverSpeakName(s.id) || s.name || ('Fahrer '+(idx+1))) }));
  }

  function speakPlacementsForRace(raceId){
    if(!state.audio?.enabled || !state.audio?.sayPlacements) return;
    ensureRaceAnnounceRuntime();
    if(state.session.announce.placementsSaidForRaceId===raceId) return;

    const placements = getPlacementsForRace(raceId).slice(0,5);
    if(!placements.length) return;

    const parts = placements.map(p=>{
      const ord = p.pos===1 ? 'Platz eins' : p.pos===2 ? 'Platz zwei' : p.pos===3 ? 'Platz drei' : ('Platz ' + p.pos);
      return ord + ' ' + (p.speakName||p.name);
    });

    queueSpeak(parts.join(', '));
    state.session.announce.placementsSaidForRaceId = raceId;
    saveState();
  }

  function loadImageFromUrl(url){
    return new Promise((resolve)=>{
      try{
        const src = String(url||'').trim();
        if(!src){ resolve(null); return; }
        const img = new Image();
        img.onload = ()=>resolve(img);
        img.onerror = ()=>resolve(null);
        img.src = src;
      }catch(_e){
        resolve(null);
      }
    });
  }

  async function fileToSquareAvatarDataUrl(file, size=512){
    // Read file → center-crop square → resize → encode
    const dataUrl = await new Promise((res, rej)=>{
      const r = new FileReader();
      r.onerror = ()=>rej(new Error('read_failed'));
      r.onload = ()=>res(String(r.result||''));
      r.readAsDataURL(file);
    });
    const img = await new Promise((res, rej)=>{
      const i = new Image();
      i.onload = ()=>res(i);
      i.onerror = ()=>rej(new Error('img_failed'));
      i.src = dataUrl;
    });

    const s = Math.min(img.naturalWidth||img.width, img.naturalHeight||img.height);
    const sx = Math.floor(((img.naturalWidth||img.width) - s) / 2);
    const sy = Math.floor(((img.naturalHeight||img.height) - s) / 2);

    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0,0,size,size);
    ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);

    // Prefer webp, fallback png
    let out = '';
    try{
      out = canvas.toDataURL('image/webp', 0.85);
      if(!out || !out.startsWith('data:image/webp')) throw new Error('no_webp');
    }catch(e){
      out = canvas.toDataURL('image/png');
    }
    return out;
  }

  async function setDriverAvatar(driverId, file){
    if(!driverId) return;
    if(!file) return;
    const okTypes = ['image/jpeg','image/png','image/webp','image/heic','image/heif'];
    if(file.type && !okTypes.includes(file.type)){
      toast('⚠️ Bitte JPG/PNG/WebP auswählen.');
      return;
    }
    try{
      const dataUrl = await fileToSquareAvatarDataUrl(file, 512);
      state.media.driverAvatars[driverId] = dataUrl;
      saveState();
      toast('✅ Fahrerbild gespeichert');
      renderStammdaten();
      renderDashboard();
    }catch(e){
      toast('⚠️ Bild konnte nicht gelesen werden (evtl. HEIC). Tipp: über ChatGPT als JPG/WebP speichern.');
    }
  }

  function removeDriverAvatar(driverId){
    if(state.media && state.media.driverAvatars){
      delete state.media.driverAvatars[driverId];
      saveState();
      toast('🗑️ Fahrerbild entfernt');
      renderStammdaten();
      renderDashboard();
    }

  }

    function initials(name){
    const parts = String(name||'').trim().split(/\s+/).filter(Boolean);
    if(!parts.length) return '?';
    const a = parts[0][0]||'?';
    const b = (parts.length>1 ? parts[parts.length-1][0] : '') || '';
    return (a+b).toUpperCase();
  }

  function renderDriverChip(driver, ctx='pool', teamId=''){
    const avatar = getDriverAvatarDataUrl(driver.id);
    const ini = initials(driver.name);
    const removeBtn = (ctx==='team') ? `<button class="chip-x" type="button" title="Aus Team entfernen" data-remove-from-team="${esc(driver.id)}">✕</button>` : '';
    return `
      <div class="driver-chip" draggable="true" data-driver-id="${esc(driver.id)}">
        <div class="avatar-sm">${avatar?'<img src="'+avatar+'" alt=""/>' : '<span>'+esc(ini)+'</span>'}</div>
        <div class="chip-name">${esc(driver.name||'Unbenannt')}</div>
        ${removeBtn}
      </div>
    `;
  }

  
  function getTeamForDriverInMode(mode, driverId){
    const teams = getTeamsForMode(mode) || [];
    return teams.find(t => (t.driverIds||[]).includes(driverId)) || null;
  }

  function getEnduranceActiveInfo(teamId){
    return (state.modes.endurance?.activeByTeamId||{})[teamId] || null;
  }

  function setEnduranceActiveInfo(teamId, info){
    if(!state.modes.endurance.activeByTeamId || typeof state.modes.endurance.activeByTeamId!=='object'){
      state.modes.endurance.activeByTeamId = {};
    }
    state.modes.endurance.activeByTeamId[teamId] = info;
  }

  function clearEnduranceActiveInfos(){
    if(!state.modes.endurance) return;
    state.modes.endurance.activeByTeamId = {};
  }

  function ensureEnduranceStintStore(){
    if(!state.modes.endurance || typeof state.modes.endurance!=='object') state.modes.endurance = defaultState().modes.endurance;
    if(!state.modes.endurance.stintHistoryByRace || typeof state.modes.endurance.stintHistoryByRace!=='object') state.modes.endurance.stintHistoryByRace = {};
    return state.modes.endurance.stintHistoryByRace;
  }

  function getEnduranceStintsForRaceTeam(raceId, teamId){
    if(!raceId || !teamId) return [];
    const store = ensureEnduranceStintStore();
    const byRace = store[raceId] || {};
    const arr = byRace[teamId];
    return Array.isArray(arr) ? arr : [];
  }

  function setEnduranceStintsForRaceTeam(raceId, teamId, stints){
    if(!raceId || !teamId) return;
    const store = ensureEnduranceStintStore();
    if(!store[raceId] || typeof store[raceId] !== 'object') store[raceId] = {};
    store[raceId][teamId] = Array.isArray(stints) ? stints : [];
  }

  function clearEnduranceStintsForRace(raceId){
    if(!raceId) return;
    const store = ensureEnduranceStintStore();
    delete store[raceId];
  }

  function finalizeEnduranceStint(teamId, raceId, endTs){
    if(!teamId || !raceId) return null;
    const ai = getEnduranceActiveInfo(teamId);
    if(!ai) return null;
    const arr = getEnduranceStintsForRaceTeam(raceId, teamId).slice();
    const stint = {
      driverId: String(ai.driverId||'').trim(),
      carId: String(ai.carId||'').trim(),
      startTs: Number(ai.activatedTs||0) || 0,
      endTs: Number(endTs||now()) || now(),
      lapCount: Math.max(0, parseInt(ai.stintLaps||0,10) || 0)
    };
    arr.push(stint);
    setEnduranceStintsForRaceTeam(raceId, teamId, arr);
    return stint;
  }

  function finalizeAllEnduranceStintsForRace(raceId, endTs){
    if(!raceId) return;
    const teams = state.modes.endurance?.teams || [];
    teams.forEach(t=>{
      const ai = getEnduranceActiveInfo(t.id);
      if(ai) finalizeEnduranceStint(t.id, raceId, endTs);
    });
  }

  function getEnduranceRuleStateForTeam(teamId, raceId){
    const race = raceId ? getRaceById(raceId) : null;
    const minStint = Math.max(0, parseInt((race?.enduranceMinStintLaps ?? state.modes.endurance?.minStintLaps ?? 0),10) || 0);
    const maxStint = Math.max(0, parseInt((race?.enduranceMaxStintLaps ?? state.modes.endurance?.maxStintLaps ?? 0),10) || 0);
    const penaltySecondsPerViolation = Math.max(0, parseInt((race?.endurancePenaltySecondsPerViolation ?? state.modes.endurance?.penaltySecondsPerViolation ?? 0),10) || 0);
    const penaltyLapThresholdSeconds = Math.max(0, parseInt((race?.endurancePenaltyLapThresholdSeconds ?? state.modes.endurance?.penaltyLapThresholdSeconds ?? 0),10) || 0);
    const penaltyLapsPerThreshold = Math.max(0, parseInt((race?.endurancePenaltyLapsPerThreshold ?? state.modes.endurance?.penaltyLapsPerThreshold ?? 1),10) || 0);
    let stints = getEnduranceStintsForRaceTeam(raceId, teamId).slice();
    const ai = getEnduranceActiveInfo(teamId);
    if(ai && raceId && raceId === (state.session.currentRaceId||'')){
      stints.push({
        driverId: String(ai.driverId||'').trim(),
        carId: String(ai.carId||'').trim(),
        startTs: Number(ai.activatedTs||0) || 0,
        endTs: null,
        lapCount: Math.max(0, parseInt(ai.stintLaps||0,10) || 0),
        live: true
      });
    }
    const tooShort = minStint>0 ? stints.filter(st => Number(st.lapCount||0) < minStint) : [];
    const tooLong = maxStint>0 ? stints.filter(st => Number(st.lapCount||0) > maxStint) : [];
    const violations = [...tooShort, ...tooLong];
    const penaltySecondsTotal = violations.length * penaltySecondsPerViolation;
    const projectedDeductedLaps = (penaltyLapThresholdSeconds>0 && penaltyLapsPerThreshold>0)
      ? (Math.floor(penaltySecondsTotal / penaltyLapThresholdSeconds) * penaltyLapsPerThreshold)
      : 0;
    const deductedLaps = race?.endedAt ? projectedDeductedLaps : 0;
    let statusText = 'OK';
    if(false && tooShort.length && tooLong.length) statusText = `AW • Stint außerhalb ${minStint}-${maxStint} Runden`;
    else if(false && tooShort.length) statusText = 'AW • Stint < ' + minStint + ' Runden';
    else if(false && tooLong.length) statusText = 'AW • Stint > ' + maxStint + ' Runden';
    if(violations.length){
      const reasons = [];
      if(tooShort.length) reasons.push((tooShort.length===1 ? 'Stint' : (tooShort.length+'x Stint')) + ' < ' + minStint + ' Runden');
      if(tooLong.length) reasons.push((tooLong.length===1 ? 'Stint' : (tooLong.length+'x Stint')) + ' > ' + maxStint + ' Runden');
      const penalties = [];
      if(penaltySecondsTotal>0) penalties.push('+' + penaltySecondsTotal + 's');
      if(projectedDeductedLaps>0) penalties.push((race?.endedAt ? '-' : 'nach Rennen -') + projectedDeductedLaps + ' Runde' + (projectedDeductedLaps===1 ? '' : 'n'));
      statusText = 'Regelverstoss - ' + reasons.join(' - ') + (penalties.length ? ' - ' + penalties.join(' - ') : '');
    }
    return {
      minStint,
      maxStint,
      penaltySecondsPerViolation,
      penaltySecondsTotal,
      penaltyLapThresholdSeconds,
      penaltyLapsPerThreshold,
      projectedDeductedLaps,
      deductedLaps,
      stints,
      tooShort,
      tooLong,
      violations,
      compliant: violations.length===0,
      invalidStintCount: violations.length,
      statusText
    };
  }

  function countEnduranceStintLapsForDriver(teamId, driverId, raceId){
    const ai = getEnduranceActiveInfo(teamId);
    if(ai && String(ai.driverId||'').trim()===String(driverId||'').trim() && raceId === (state.session.currentRaceId||'')){
      return Math.max(0, parseInt(ai.stintLaps||0,10) || 0);
    }
    const stints = getEnduranceStintsForRaceTeam(raceId, teamId);
    for(let i=stints.length-1;i>=0;i--){
      if(String(stints[i].driverId||'').trim()===String(driverId||'').trim()) return Math.max(0, parseInt(stints[i].lapCount||0,10) || 0);
    }
    return 0;
  }

function getTeamsForMode(mode){
    if(mode==='endurance') return state.modes.endurance.teams;
    return state.modes.team.teams;
  }

  function setTeamsForMode(mode, teams){
    if(mode==='endurance') state.modes.endurance.teams = teams;
    else state.modes.team.teams = teams;
  }

  function unassignDriverFromTeams(mode, driverId){
    if(!driverId) return;
    const teams = getTeamsForMode(mode).map(t=>({ ...t, driverIds:(t.driverIds||[]).filter(id=>id!==driverId) }));
    setTeamsForMode(mode, teams);
    saveState();
    toast('✅ Fahrer entfernt');
  }

  function assignDriverToTeam(mode, driverId, teamId){
    if(!driverId || !teamId) return;
    let teams = getTeamsForMode(mode).map(t=>({ ...t, driverIds:(t.driverIds||[]).filter(id=>id!==driverId) }));
    const t = teams.find(x=>x.id===teamId);
    if(!t){ toast('⚠️ Team nicht gefunden'); return; }
    if(!(t.driverIds||[]).includes(driverId)) t.driverIds = [...(t.driverIds||[]), driverId];
    setTeamsForMode(mode, teams);
    saveState();
    const tn = (t.name||'Team');
    toast(`✅ Fahrer zu ${tn}`);
  }

  return {
    getDriverAvatarDataUrl,
    getDriverLapSoundId,
    getDriverLapSoundMeta,
    refreshFinishCache,
    isDriverFinished,
    resetRaceAnnounceRuntime,
    ensureRaceAnnounceRuntime,
    speakRaceRemaining,
    getCurrentSingleRaceStandings,
    buildCurrentRacePositionsSpeech,
    maybeAnnounceOvertakeAndLapping,
    getSpeakNameForCar,
    getFinishNameForCarId,
    getPlacementsForRace,
    speakPlacementsForRace,
    loadImageFromUrl,
    removeDriverAvatar,
    initials,
    renderDriverChip,
    getTeamForDriverInMode,
    getEnduranceActiveInfo,
    setEnduranceActiveInfo,
    clearEnduranceActiveInfos,
    ensureEnduranceStintStore,
    getEnduranceStintsForRaceTeam,
    setEnduranceStintsForRaceTeam,
    clearEnduranceStintsForRace,
    finalizeEnduranceStint,
    finalizeAllEnduranceStintsForRace,
    getEnduranceRuleStateForTeam,
    countEnduranceStintLapsForDriver,
    getTeamsForMode,
    setTeamsForMode,
    unassignDriverFromTeams,
    assignDriverToTeam
  };
})();
