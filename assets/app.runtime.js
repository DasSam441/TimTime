window.TIMTIME_RUNTIME = (function(){
  'use strict';

  function bindShared(){
    Object.assign(globalThis, window.TIMTIME_SHARED || {});
  }

  bindShared();

  function getRaceRelevantLaps(raceId){
    const all = state.session.laps.filter(l=>l && l.raceId===raceId && l.lapMs!=null);
    if(!all.length) return all;
    const raceOnly = all.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
    return raceOnly.length ? raceOnly : all;
  }

  function getCurrentMrcClock(){
    const clock = state.session?.mrcClock || {};
    if(!Number.isFinite(Number(clock.lastDeviceMs)) || !Number.isFinite(Number(clock.lastHostMs))) return null;
    return Math.max(0, Number(clock.lastDeviceMs) + (now() - Number(clock.lastHostMs)));
  }

  function updateMrcClock(deviceMs, source){
    const n = Number(deviceMs);
    if(!Number.isFinite(n) || n < 0) return null;
    state.session.mrcClock = state.session.mrcClock || { lastDeviceMs:null, lastHostMs:null, syncSeen:false };
    state.session.mrcClock.lastDeviceMs = n;
    state.session.mrcClock.lastHostMs = now();
    if(source==='sync') state.session.mrcClock.syncSeen = true;
    return n;
  }


  function getTimelineNowMs(){
    const mrcNow = getCurrentMrcClock();
    return Number.isFinite(Number(mrcNow)) ? Math.max(0, Number(mrcNow)) : 0;
  }

  function getRaceStartTs(raceId){
    const rd = getActiveRaceDay();
    const race = rd?.races?.find(r=>r.id===raceId) || null;
    return race?.startedAtMrc || state.session.startedAtMrc || 0;
  }

  function getDriverRaceTotalFromStartMs(raceId, driverId, lapsForRace=null){
    const laps = (lapsForRace || getRaceRelevantLaps(raceId)).filter(l=>{
      if(!l) return false;
      const car = l.carId ? getCar(l.carId) : null;
      const did = (l.driverId || car?.driverId || '').trim();
      return did===driverId;
    }).sort((a,b)=>a.ts-b.ts);

    if(!laps.length) return null;

    const raceStart = getRaceStartTs(raceId);
    const firstTs = laps[0].ts || raceStart || 0;
    const startOffset = Math.max(0, firstTs - raceStart);
    const lapSum = laps.reduce((s,l)=>s + (l.lapMs||0), 0);
    return startOffset + lapSum;
  }

  function getTeamRaceTotalFromStartMs(raceId, teamId, mode, lapsForRace=null){
    const teams = (mode==='team') ? (state.modes.team?.teams||[]) : (state.modes.endurance?.teams||[]);
    const team = teams.find(t=>t.id===teamId);
    if(!team) return null;

    const driverIds = (team.driverIds||[]).map(x=>String(x||'').trim()).filter(Boolean);
    const carIds = new Set();
    driverIds.forEach(did=>{
      getCarsByDriver(did).forEach(c=>carIds.add(c.id));
    });

    const laps = (lapsForRace || getRaceRelevantLaps(raceId)).filter(l=>{
      if(!l) return false;
      if(l.carId && carIds.has(l.carId)) return true;
      return l.driverId && driverIds.includes(String(l.driverId));
    }).sort((a,b)=>a.ts-b.ts);

    if(!laps.length) return null;

    const raceStart = getRaceStartTs(raceId);
    const firstTs = laps[0].ts || raceStart || 0;
    const startOffset = Math.max(0, firstTs - raceStart);
    const lapSum = laps.reduce((s,l)=>s + (l.lapMs||0), 0);
    return startOffset + lapSum;
  }

  function msToSpeechTime(ms, decimals){
    // Speak like: 7.123s -> "7 komma 1 2 3" (no "Sekunden" word)
    // If minutes exist: "1 Minute 5 komma 0 4 2"
    ms = Math.max(0, ms|0);
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);

    const dp = Math.max(0, Math.min(3, decimals|0));
    let fracSpoken = '';
    if(dp > 0){
      const fracUnit = 10 ** (3-dp); // dp=3 ->1, dp=2->10, dp=1->100
      const frac = Math.floor((ms % 1000) / fracUnit);
      const s = String(frac).padStart(dp,'0');
      fracSpoken = s.split('').join(' ');
    }

    // Main number part
    let base = '';
    if(mins > 0){
      base = mins + ' ' + (mins===1 ? 'Minute' : 'Minuten') + ' ' + secs;
    } else {
      base = String(secs);
    }

    if(dp > 0){
      return base + ' komma ' + fracSpoken;
    }
    return base;
  }

  function toast(title, msg, kind='info'){
    const host = document.getElementById('toastHost');
    const el = document.createElement('div');
    el.className = 'toast';
    const ico = document.createElement('div');
    ico.className = 'ico';
    ico.textContent = kind==='ok'?'✅':(kind==='warn'?'⚠️':(kind==='err'?'🧯':'ℹ️'));
    const body = document.createElement('div');
    body.innerHTML = `<p class="t-title"></p><p class="t-msg"></p>`;
    body.querySelector('.t-title').textContent = typeof demojibake === 'function' ? demojibake(title) : title;
    body.querySelector('.t-msg').textContent = typeof demojibake === 'function' ? demojibake(msg) : msg;
    el.appendChild(ico); el.appendChild(body);
    host.appendChild(el);
    setTimeout(() => {
      el.style.opacity='0'; el.style.transform='translateY(6px)';
      el.style.transition='opacity .18s ease, transform .18s ease';
      setTimeout(()=>el.remove(), 220);
    }, 2600);
  }


  // Presenter (2. Monitor) – read-only Dashboard window (no server needed)
  let presenterWin = null;
  let presenterBc = null;
  try{ presenterBc = new BroadcastChannel('zeitnahme_presenter'); }catch{}

  
  function readLoopMinsFromUI(){
    const q = (sel)=>document.querySelector(sel);
    const num = (el, defV)=>{ const n=parseFloat(el?.value); return Number.isFinite(n)?n:defV; };
    return {
      trainingMin: Math.max(0, num(q('#loopTrainMin'), state.modes.loop.trainingMin||0)),
      setupMin: Math.max(0, num(q('#loopSetupMin'), state.modes.loop.setupMin||0)),
      raceMin: Math.max(0.01, num(q('#loopRaceMin'), state.modes.loop.raceMin||0.01)),
      podiumMin: Math.max(0, num(q('#loopPodiumMin'), state.modes.loop.podiumMin||0)),
    };
  }

  function getAverageLastNLapsMs(laps, driverId, n=10){
    try{
      const didNeedle = String(driverId||'').trim();
      if(!didNeedle) return null;
      const arr = (laps||[])
        .filter(l => l && l.lapMs!=null)
        .filter(l => String(driverKeyForLapGlobal(l) || '').trim()===didNeedle)
        .sort((a,b)=>((a.ts||0)-(b.ts||0)) || ((a.idx||0)-(b.idx||0)));
      if(!arr.length) return null;
      const tail = arr.slice(-Math.max(1, n|0));
      const sum = tail.reduce((acc,l)=>acc + Number(l.lapMs||0), 0);
      return tail.length ? (sum / tail.length) : null;
    }catch{
      return null;
    }
  }

  function buildFinalRaceRowsFromStandings(raceId, laps, track){
    const race = getRaceById(raceId);
    const standings = computeDriverStandingsGlobal(laps || []);
    const rows = standings.map((x, idx)=>{
      const drv = getDriver(x.id) || null;
      const bg = drv?.color || '';
      const tc = bg ? ((drv?.colorAutoText!==false) ? pickTextColorForBg(bg) : ((drv?.textColor)||pickTextColorForBg(bg))) : '';
      const totalMs = raceId ? (getDriverRaceTotalFromStartMs(raceId, x.id, laps) ?? x.totalMs ?? null) : (x.totalMs ?? null);
      return {
        driverId:x.id,
        pos: idx+1,
        name: x.name || ('Fahrer '+(idx+1)),
        laps: x.lapsCount || x.laps || 0,
        totalMs,
        bestMs: x.bestMs ?? null,
        lastMs: x.lastMs ?? null,
        avgLast10Ms: getAverageLastNLapsMs(laps, x.id, 10),
        avgLast10Text: (()=>{ const v=getAverageLastNLapsMs(laps, x.id, 10); return (v!=null && Number.isFinite(v)) ? msToTime(v, 3) : '—'; })(),
        avgSpeedText: formatKmh(lapMsToAverageKmh(x.bestMs, track)),
        finished: !!x.finished,
        bg,
        tc
      };
    });
    sortDriverStandingRows(rows, race, { live:false });
    rows.forEach((r,i)=>r.pos=i+1);
    return rows;
  }

  function buildPresenterSnapshot(){
    const track = getActiveTrack();
    const rd = getActiveRaceDay();
    const liveRaceId = state.session.currentRaceId || '';
    const podiumRaceId = state.ui?.podiumRaceId || '';
    const displayRaceId = liveRaceId || podiumRaceId || '';
    const activeRaceIdForState = liveRaceId || '';
    const displayRace = (displayRaceId && rd) ? (rd.races||[]).find(r=>r.id===displayRaceId) : null;
    const postRaceResultMode = !liveRaceId && !!podiumRaceId && !!displayRace && raceShouldShowPodium(displayRace);
    const modeLabel = getModeLabel();

    let timerText = '';
    try{
      const rawTimer = (typeof computeTimerDisplay === 'function')
        ? computeTimerDisplay()
        : (document.getElementById('scTimer')?.textContent || '');
      if(rawTimer && typeof rawTimer === 'object'){
        timerText = String(rawTimer.text || rawTimer.value || rawTimer.label || '');
      }else{
        timerText = String(rawTimer || '');
      }
    }catch{
      try{ timerText = String(document.getElementById('scTimer')?.textContent || ''); }catch{}
    }

    const recSeason = (track && state.season?.activeSeasonId) ? getTrackRecord(track, state.season.activeSeasonId) : null;
    const recDay = (rd && track) ? getRaceDayTrackRecord(rd, track.id) : null;

    const raceLapsAll = state.session.laps || [];
    const idleMode = (!displayRaceId && state.session.state==='IDLE');
    const lapsAll = idleMode ? (state.session.idleLaps || []) : raceLapsAll;
    const race = displayRace || null;
    const raceMode = race?.mode || null;
    const loopPhase = (state.loopRuntime?.phase || state.loop?.phase || state.session.loopPhase || '').toString().toUpperCase();
    const inRace = !!activeRaceIdForState && !isFreeDrivingRace(race) && (race?.submode!=='Training') && (raceMode!=='loop' || loopPhase==='RACE');

    const relevantLapsRaw = displayRaceId
      ? (postRaceResultMode
          ? (lapsAll||[]).filter(l=>l && l.raceId===displayRaceId)
          : getRelevantRaceLaps(displayRaceId, lapsAll))
      : lapsAll;
    // Live-Rundenzahl darf nie durch Darstellungsfilter verfälscht werden.
    // Deshalb für Dashboard/Presenter immer alle rennrelevanten Laps verwenden.
    const relevantLaps = (relevantLapsRaw||[]);

    let rows = [];
    try{
      if(inRace && race && (race.mode==='team' || race.mode==='endurance')){
        const st = computeTeamStandingsGlobal(relevantLaps, race.mode, (state.session.finish?.pending?state.session.finish:null));
        rows = st.map((x,idx)=>({
          pos: idx+1,
          name: x.name,
          laps: x.lapCount,
          totalMs: x.totalMs,
          bestMs: x.bestMs ?? null,
          lastMs: x.lastMs ?? null,
          avgSpeedText: formatKmh(lapMsToAverageKmh(x.bestMs, track)),
          finished: !!x.finished,
          bg: '', tc: ''
        }));
      }else{
        if(postRaceResultMode && displayRaceId){
          rows = buildFinalRaceRowsFromStandings(displayRaceId, relevantLaps, track);
        }else{
          const by = new Map();
          for(const l of relevantLaps){
            const did = l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '');
            if(!did || l.lapMs==null) continue;
            const cur = by.get(did) || {driverId:did, laps:0, totalMs:0, bestMs:null, lastMs:null, name:(getDriver(did)?.name||''), carsById:new Map()};
            cur.laps += 1;
            cur.totalMs += l.lapMs;
            cur.lastMs = l.lapMs;
            if(cur.bestMs==null || l.lapMs < cur.bestMs) cur.bestMs = l.lapMs;
            const carId = l.carId || '';
            const carName = carId ? (getCar(carId)?.name || '—') : '—';
            const carCur = cur.carsById.get(carId || '__unknown__') || {carId:carId || '', carName, bestMs:null};
            if(carCur.bestMs==null || l.lapMs < carCur.bestMs) carCur.bestMs = l.lapMs;
            cur.carsById.set(carId || '__unknown__', carCur);
            by.set(did, cur);
          }
          rows = Array.from(by.values()).map(r=>({
            driverId:r.driverId, pos:0, name:r.name || ('Fahrer '+r.driverId), laps:r.laps, totalMs:r.totalMs, bestMs:r.bestMs, lastMs:r.lastMs,
            avgLast10Ms: getAverageLastNLapsMs(relevantLaps, r.driverId, 10),
            avgLast10Text: (()=>{ const v=getAverageLastNLapsMs(relevantLaps, r.driverId, 10); return (v!=null && Number.isFinite(v)) ? msToTime(v, 3) : '—'; })(),
            avgSpeedText: formatKmh(lapMsToAverageKmh(r.bestMs, track)),
            finished:isDriverFinished(r.driverId),
            carBestRows: Array.from(r.carsById.values()).sort((a,b)=>((a.bestMs??9e15)-(b.bestMs??9e15)) || String(a.carName||'').localeCompare(String(b.carName||''),'de')),
            bg:(getDriver(r.driverId)?.color)||'',
            tc:((getDriver(r.driverId)?.colorAutoText!==false) ? pickTextColorForBg((getDriver(r.driverId)?.color)||'') : ((getDriver(r.driverId)?.textColor)||''))
          }));
          if(displayRaceId){
            rows.forEach(r=>{
              const rt = getDriverRaceTotalFromStartMs(displayRaceId, r.driverId, relevantLaps);
              if(rt!=null) r.totalMs = rt;
            });
          }
          if(inRace){
            const liveRaceRows = !!(displayRaceId && displayRaceId===state.session.currentRaceId && state.session.state==='RUNNING' && !(state.session.finish&&state.session.finish.pending));
            sortDriverStandingRows(rows, race, { live: liveRaceRows });
          }else{
            rows.sort((a,b)=> ((a.bestMs??9e15)-(b.bestMs??9e15)) || (String(a.name).localeCompare(String(b.name),'de')));
          }
          rows.forEach((r,i)=>r.pos=i+1);
        }
      }
    }catch{}

    let top3 = [];
    let showPodium = false;
    let raceEndHighlights = null;
    try{
      if(podiumRaceId && rd){
        const podiumRace = (rd.races||[]).find(r=>r.id===podiumRaceId) || null;
        if(podiumRace && podiumRace.endedAt && raceShouldShowPodium(podiumRace)){
          const podiumLaps = getRelevantRaceLaps(podiumRace.id, raceLapsAll);
          if(podiumRace.mode==='team' || podiumRace.mode==='endurance'){
            const st = computeTeamStandingsGlobal(podiumLaps, podiumRace.mode, null).slice(0,3);
            top3 = st.map(x=>({name:x.name, laps:x.lapCount, totalMs:x.totalMs, bestMs:x.bestMs ?? null, bg:'', tc:''}));
          }else{
            const fullStandings = computeDriverStandingsGlobal(podiumLaps);
            const st = fullStandings.slice(0,3);
            top3 = st.map(x=>({
              id:x.id,
              name:x.name, laps:(x.lapsCount||x.laps||0), totalMs:x.totalMs, bestMs:x.bestMs ?? null,
              avatarUrl:getDriverAvatarDataUrl(x.id),
              initials:initials(x.name),
              bg:(getDriver(x.id)?.color)||'',
              tc:((getDriver(x.id)?.colorAutoText!==false) ? pickTextColorForBg((getDriver(x.id)?.color)||'') : ((getDriver(x.id)?.textColor)||''))
            }));
            raceEndHighlights = computeRaceEndHighlights(podiumRace, podiumLaps, fullStandings);
          }
          showPodium = top3.length>0 && !isFreeDrivingRace(podiumRace);
        }
      } else if(raceMode==='loop'){
        showPodium = (loopPhase === 'PODIUM') && top3.length>0;
      }
    }catch{}

    let lastLapTime = '—', lastLapName='—';
    try{
      const last = lapsAll.slice(-1)[0];
      if(last && last.lapMs!=null){
        lastLapTime = msToTime(last.lapMs, 3);
        const car = last.carId ? getCar(last.carId) : null;
        const did = car?.driverId || last.driverId || '';
        lastLapName = did ? (getDriver(did)?.name||'—') : ((car?.name)||'—');
      }
    }catch{}

    const enduranceRows = (((raceMode==='endurance') || state.modes.activeMode==='endurance' || Object.keys(state.modes.endurance?.activeByTeamId||{}).length>0) ? getEnduranceStatusRows() : []);
    let averageSpeedText = '—';
    try{
      const lead = (rows||[])[0] || null;
      averageSpeedText = lead ? formatKmh(lapMsToAverageKmh(lead.bestMs, track)) : '—';
    }catch{}

    const recordSeasonText = (recSeason && recSeason.ms!=null) ? `${msToTime(recSeason.ms,3)} • ${(recSeason.driverId ? (getDriver(recSeason.driverId)?.name||recSeason.driverName) : recSeason.driverName)||'Unbekannt'}` : '—';
    const recordDayText = (recDay && recDay.ms!=null) ? `${msToTime(recDay.ms,3)} • ${(recDay.driverId ? (getDriver(recDay.driverId)?.name||recDay.driverName) : recDay.driverName)||'Unbekannt'}` : '—';

    return {
      modeLabel,
      inRace,
      showPodium,
      timerText,
      trackName: getTrackPlainName(track),
      trackDetails: getTrackDetailsText(track),
      trackLengthMeters: getTrackLengthMeters(track),
      scaleDenominator: getScaleDenominator(),
      recordSeason: recordSeasonText,
      recordDay: recordDayText,
      averageSpeedText,
      enduranceRows,
      rows,
      top3,
      raceEndHighlights,
      isFreeDriving: !!(race ? isFreeDrivingRace(race) : state.session?.isFreeDriving),
      lastLapTime,
      lastLapName,
      ampel: (state.ui && state.ui.ampel) ? state.ui.ampel : null
    };
  }


  window.addEventListener('message', (e)=>{
    try{
      if(e?.data?.type !== 'presenter-ready') return;
      sendPresenterSnapshot(true);
    }catch{}
  });


  function logLine(msg){
    const ts = new Date().toLocaleTimeString('de-DE',{hour12:false});
    const safeMsg = typeof demojibake === 'function' ? demojibake(msg) : String(msg ?? '');
    const line = `[${ts}] ${safeMsg}`;

    // Newest first (top)
    state.usb.lastLines.unshift(line);
    if(state.usb.lastLines.length>800) state.usb.lastLines = state.usb.lastLines.slice(0,800);

    const el = document.getElementById('runLog');
    if(el){
      el.textContent = state.usb.lastLines.slice(0,500).join('\n');
      el.scrollTop = 0;
    }
    saveState();
  }

  
  function deleteLapById(lapId){
    if(!lapId) return;
    const idx = state.session.laps.findIndex(l=>l && l.id===lapId);
    if(idx<0) return;

    const removed = state.session.laps.splice(idx,1)[0];

    // If lap entries have trackId (newer builds), we can recompute track record for that track/season.
    try{
      const trackId = removed?.trackId || '';
      const seasonId = state.season?.activeSeasonId || '';
      if(trackId && seasonId){
        recomputeTrackRecord(trackId, seasonId);
      }
    }catch{}

    saveState();
    toast('Runde gelöscht', 'Eintrag entfernt.', 'ok');
    logLine('Lap gelöscht: ' + String(lapId));
    renderAll();
  }

  function recomputeTrackRecord(trackId, seasonId){
    const track = state.tracks.tracks.find(t=>t.id===trackId);
    if(!track) return;
    const seasonNeedle = String(seasonId || '').trim();
    const raceSeasonById = new Map();
    const laps = state.session.laps.filter(l=>{
      if(!l || l.trackId!==trackId || l.lapMs==null) return false;
      if(!seasonNeedle) return true;
      const raceId = String(l.raceId || '').trim();
      if(!raceId) return false;
      if(!raceSeasonById.has(raceId)){
        let foundSeasonId = '';
        for(const raceDay of (state.raceDay?.raceDays || [])){
          const race = (raceDay.races || []).find(r=>r.id===raceId);
          if(race){
            foundSeasonId = String(race.seasonId || raceDay.seasonId || '').trim();
            break;
          }
        }
        raceSeasonById.set(raceId, foundSeasonId);
      }
      return raceSeasonById.get(raceId) === seasonNeedle;
    });
    if(!track.recordsBySeason) track.recordsBySeason = {};
    let best = null;
    let bestLap = null;
    for(const l of laps){
      if(best==null || l.lapMs < best){
        best = l.lapMs;
        bestLap = l;
      }
    }
    if(!track.recordsBySeason[seasonId]) track.recordsBySeason[seasonId] = { ms:null, driverName:'', carName:'' };
    if(bestLap){
      const car = bestLap.carId ? getCar(bestLap.carId) : null;
      const dn = bestLap.driverId ? (getDriver(bestLap.driverId)?.name || '') : (car?.driverId ? (getDriver(car.driverId)?.name||'') : '');
      track.recordsBySeason[seasonId] = { ms: bestLap.lapMs, driverId: bestLap.driverId || car?.driverId || null, driverName: dn||'', carId: bestLap.carId || car?.id || null, carName: car?.name||'' };
    } else {
      track.recordsBySeason[seasonId] = { ms:null, driverName:'', carName:'', driverId:null, carId:null };
    }
  }

  return {
    getRaceRelevantLaps,
    getCurrentMrcClock,
    updateMrcClock,
    getTimelineNowMs,
    getRaceStartTs,
    getDriverRaceTotalFromStartMs,
    getTeamRaceTotalFromStartMs,
    msToSpeechTime,
    toast,
    readLoopMinsFromUI,
    getAverageLastNLapsMs,
    buildFinalRaceRowsFromStandings,
    buildPresenterSnapshot,
    logLine,
    deleteLapById,
    recomputeTrackRecord
  };
})();
