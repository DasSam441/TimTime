window.TIMTIME_SESSION = (function(){
  'use strict';
  function bindShared(){
    Object.assign(globalThis, window.TIMTIME_SHARED || {});
  }
  const sleepLocal = (ms)=>new Promise(resolve=>setTimeout(resolve, Math.max(0, Number(ms)||0)));
  function hostElapsed(startedAt, pausedAt, pauseAccumMs, sessionState){
    if(startedAt==null) return 0;
    const endHost = (sessionState === 'PAUSED' && pausedAt!=null) ? Number(pausedAt) : Date.now();
    return Math.max(0, endHost - Number(startedAt) - Number(pauseAccumMs || 0));
  }
  function isSessionIdle(sessionState){
    return String(sessionState || 'IDLE') === 'IDLE';
  }
  function isFreeDrivingRace(race){
    bindShared();
    return !!(race && (race.submode==='Freies Fahren' || race.mode==='free'));
  }

  function isFreeDrivingMode(){
    bindShared();
    return !!state.session?.isFreeDriving;
  }

  function raceShouldShowPodium(race){
    bindShared();
    if(!race) return false;
    if(race.mode==='loop') return true;
    if(isFreeDrivingRace(race)) return false;
    return true;
  }

  function ensureCarByChip(chip){
    bindShared();
    chip = String(chip||'').trim().toUpperCase();
    if(!chip) return null;
    let car = state.masterData.cars.find(c => (c.chipCode||'').toUpperCase()===chip);
    if(car) return car;
    car = { id: uid('car'), name:`Unbekannt (${chip})`, chipCode:chip, driverId:'' };
    state.masterData.cars.push(car);
    saveState();
    logLine(`Neues Fahrzeug erkannt: ${chip} -> Stammdaten: Unbekannt`);
    toast('Fahrzeug', 'Neues Fahrzeug erkannt (unbekannt).', 'ok');
    return car;
  }

  function getDriverNameForCar(car){
    bindShared();
    if(!car) return '';
    const d = car.driverId ? getDriver(car.driverId) : null;
    return d?.name || '';
  }

  // --------------------- Race storage ---------------------
  function syncEnduranceSettingsFromPage(){
    bindShared();
    try{
      const durNode = document.getElementById('endDur');
      const minNode = document.getElementById('endMinStintLaps');
      const maxNode = document.getElementById('endMaxStintLaps');
      const penaltyNode = document.getElementById('endPenaltySeconds');
      const thresholdNode = document.getElementById('endPenaltyLapThresholdSeconds');
      const lapsNode = document.getElementById('endPenaltyLapsPerThreshold');
      if(durNode){
        const v = Math.max(1, parseInt(durNode.value||0,10) || 0);
        if(Number.isFinite(v) && v > 0) state.modes.endurance.durationMin = v;
      }
      if(minNode){
        state.modes.endurance.minStintLaps = Math.max(0, parseInt(minNode.value||0,10) || 0);
      }
      if(maxNode){
        state.modes.endurance.maxStintLaps = Math.max(0, parseInt(maxNode.value||0,10) || 0);
      }
      if(penaltyNode){
        state.modes.endurance.penaltySecondsPerViolation = Math.max(0, parseInt(penaltyNode.value||0,10) || 0);
      }
      if(thresholdNode){
        state.modes.endurance.penaltyLapThresholdSeconds = Math.max(0, parseInt(thresholdNode.value||0,10) || 0);
      }
      if(lapsNode){
        state.modes.endurance.penaltyLapsPerThreshold = Math.max(0, parseInt(lapsNode.value||0,10) || 0);
      }
    }catch{}
  }

  function getNormalizedEnduranceDurationMin(){
    bindShared();
    syncEnduranceSettingsFromPage();
    return Math.max(1, parseInt(state.modes.endurance?.durationMin||30,10) || 30);
  }

  function startNewRace(){
    bindShared();
    const rd = getActiveRaceDay();
    if(!rd) return null;
    const id = uid('race');
    const freeDriving = !!state.session?.isFreeDriving;
    const raceMode = freeDriving ? 'single' : state.modes.activeMode;
    const name = `${getModeLabel()} - ${new Date().toLocaleTimeString('de-DE',{hour12:false})}`;
    const race = {
      id, name,
      mode: raceMode,
      submode: freeDriving ? 'Freies Fahren' : (state.modes.activeMode==='single' ? state.modes.singleSubmode : ''),
      seasonId: rd.seasonId || state.season.activeSeasonId || '',
      trackId: state.tracks.activeTrackId,
      startedAt: now(),
      startedAtMrc: null,
      endedAt: null
    };
    if(raceMode==='endurance'){
      race.enduranceDurationMin = getNormalizedEnduranceDurationMin();
      race.enduranceMinStintLaps = Math.max(0, parseInt(state.modes.endurance?.minStintLaps||0,10) || 0);
      race.enduranceMaxStintLaps = Math.max(0, parseInt(state.modes.endurance?.maxStintLaps||0,10) || 0);
      race.endurancePenaltySecondsPerViolation = Math.max(0, parseInt(state.modes.endurance?.penaltySecondsPerViolation||0,10) || 0);
      race.endurancePenaltyLapThresholdSeconds = Math.max(0, parseInt(state.modes.endurance?.penaltyLapThresholdSeconds||0,10) || 0);
      race.endurancePenaltyLapsPerThreshold = Math.max(0, parseInt(state.modes.endurance?.penaltyLapsPerThreshold||0,10) || 0);
    }
    rd.races.push(race);
    state.session.currentRaceId = id;
    saveState();
    return race;
  }
  function endCurrentRace(){
    bindShared();
    const rd = getActiveRaceDay();
    if(!rd || !state.session.currentRaceId) return;
    const currentRaceId = state.session.currentRaceId;
    const race = rd.races.find(r=>r.id===currentRaceId);
    if(race && race.mode==='endurance'){
      finalizeAllEnduranceStintsForRace(currentRaceId, now());
    }
    if(race && !race.endedAt){
      race.endedAt = now();
      if(raceShouldShowPodium(race)){
        state.ui.podiumRaceId = race.id;
        state.ui.activeTab = 'Dashboard';
        toast('Rennen beendet', 'Sieger & Ergebnisliste angezeigt.', 'ok');
      }else{
        state.ui.podiumRaceId = '';
        toast('Session beendet', 'Freies Fahren beendet.', 'ok');
      }
    }
    saveState();
    if(race && race.endedAt){ Promise.resolve().then(()=>maybeAutoSendDiscordForRace(race.id)); }
  }

  
  function endCurrentRaceQuiet(){
    bindShared();
    const rd = getActiveRaceDay();
    if(!rd || !state.session.currentRaceId) return;
    const currentRaceId = state.session.currentRaceId;
    const race = rd.races.find(r=>r.id===currentRaceId);
    if(race && race.mode==='endurance'){
      finalizeAllEnduranceStintsForRace(currentRaceId, now());
    }
    if(race && !race.endedAt){
      race.endedAt = now();
    }
    saveState();
  }

// --------------------- Loop automation ---------------------
  function loopInit(){
    bindShared();
    state.loopRuntime.phase = 'training';
    state.loopRuntime.remainingMs = Math.max(0, (Math.max(0, Number(state.modes.loop.trainingMin||0)) * 60_000));
    state.loopRuntime.phaseEndsAt = getTimelineNowMs() + state.loopRuntime.remainingMs;
    state.loopRuntime.phaseStartedAt = getTimelineNowMs();
    state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0,state.loopRuntime.remainingMs||0)/1000);
    try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
  }
  function loopAdvancePhase(){
    bindShared();
    const phase = state.loopRuntime.phase;

    // helper to start a countdown phase
    function setPhase(p, ms){
      state.loopRuntime.phase = p;
      state.loopRuntime.remainingMs = Math.max(0, ms|0);
      state.loopRuntime.phaseStartedAt = getTimelineNowMs();
    state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0,state.loopRuntime.remainingMs||0)/1000);
    try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
      state.loopRuntime.phaseEndsAt = getTimelineNowMs() + state.loopRuntime.remainingMs;
      saveState();
      renderSessionControl();
      renderAll();
    }

    if(phase === 'training'){
      // 1 min setup phase before race
      const lm = readLoopMinsFromUI();
      state.modes.loop.trainingMin = lm.trainingMin;
      state.modes.loop.setupMin = lm.setupMin;
      state.modes.loop.raceMin = lm.raceMin;
      state.modes.loop.podiumMin = lm.podiumMin;
      saveState();
      setPhase('setup', Math.max(0, Number(lm.setupMin||0) * 60_000));
      state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0, state.loopRuntime.remainingMs||0)/1000);
      // reset rest-time announcement keys for setup
      try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
      logLine(`Loop Phase -> AUFSTELLEN (${(state.modes.loop.setupMin||0)}min)`);
      toast('Dauerschleife','Aufstellphase: bitte Startpositionen einnehmen.','warn');
      if(state.audio?.enabled){
        queueSpeak('Bitte Startpositionen einnehmen');
      }
      return;
    }

    if(phase === 'setup'){
      // Switch into AMPEL phase immediately so we don't spam this block each tick.
      state.loopRuntime.phase = 'ampel';
      state.loopRuntime.phaseTotalSec = null;
      state.loopRuntime.phaseEndsAt = null;
      state.loopRuntime.remainingMs = null;
      state.loopRuntime.phaseStartedAt = getTimelineNowMs();
    state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0,state.loopRuntime.remainingMs||0)/1000);
    try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
      saveState();
      renderAll();

      logLine('Loop Phase -> AMPEL');
      toast('Dauerschleife','Ampel...','ok');

      // Run start light sequence and start the race segment exactly at GREEN.
      runAmpelSequence((greenMrcMs)=>loopStartRaceSegment(greenMrcMs));
      return;
    }

    if(phase === 'podium'){
      // After 1 minute podium, go back to training and start a fresh training segment
      state.ui.podiumRaceId = '';
      endCurrentRaceQuiet();
      resetFinishRuntime();
      state.session.lastPassByCarId = {};
    state.session.lastPassSeenByCarId = {};
      startNewRace(); // new segment for training
      setPhase('training', Math.max(0, (Math.max(0, Number(state.modes.loop.trainingMin||0)) * 60_000)));
      logLine('Loop Phase -> TRAINING (neuer Zyklus)');
      toast('Dauerschleife','Zurueck zu Training','ok');
      if(state.audio?.enabled){ try{ queueSpeak('Training startet'); }catch{} }
      return;
    }

    // Fallback: if something else, restart training
    setPhase('training', Math.max(0, (Math.max(0, Number(state.modes.loop.trainingMin||0)) * 60_000)));
    logLine('Loop Phase -> TRAINING (fallback)');
    toast('Dauerschleife','Wechsel: Training','ok');
  }
  function loopOnPause(){
    bindShared();
    if(!state.loopRuntime.phaseEndsAt) return;
    state.loopRuntime.remainingMs = Math.max(0, state.loopRuntime.phaseEndsAt - getTimelineNowMs());
    state.loopRuntime.phaseEndsAt = null;
    // keep elapsed for race timing
    if(state.loopRuntime.phaseStartedAt){
      state.loopRuntime.phaseElapsedMs = Math.max(0, getTimelineNowMs() - state.loopRuntime.phaseStartedAt);
    }
    saveState();
  }
  function loopOnResume(){
    bindShared();
    if(state.loopRuntime.remainingMs==null) return;
    state.loopRuntime.phaseEndsAt = getTimelineNowMs() + state.loopRuntime.remainingMs;
    if(state.loopRuntime.phaseElapsedMs!=null){
      state.loopRuntime.phaseStartedAt = getTimelineNowMs() - Math.max(0, state.loopRuntime.phaseElapsedMs);
    }
    saveState();
  }

  function loopStartRaceSegment(startMrcMs=null){
    bindShared();
    // End any previous segment without podium
    endCurrentRaceQuiet();

    // Start a fresh race segment
    resetFinishRuntime();
    state.session.lastPassByCarId = {};
    state.session.lastPassSeenByCarId = {};
    state.session.raceStartArmedByCarId = {};
    state.session.mrcCounterByChip = {};
    const startedRace = startNewRace();
    state.loopRuntime.phase = 'race';
    state.loopRuntime.phaseStartedAt = Number.isFinite(Number(startMrcMs)) ? Math.max(0, Number(startMrcMs)) : getTimelineNowMs();
    if(startedRace){
      startedRace.startedAtMrc = state.loopRuntime.phaseStartedAt;
    }
    state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0,state.loopRuntime.remainingMs||0)/1000);
    try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
    state.loopRuntime.remainingMs = Math.max(0, (Math.max(0.01, Number(state.modes.loop.raceMin||0)) * 60_000));
    state.loopRuntime.phaseEndsAt = getTimelineNowMs() + state.loopRuntime.remainingMs;

    logLine('Loop Phase -> RENNEN (Start bei Gruen)');
    toast('Dauerschleife','Rennen gestartet','ok');
    saveState();
    renderAll();
  }


  function loopTick(){
    bindShared();
    if(state.session.state !== 'RUNNING') return;
    if(state.modes.activeMode !== 'loop') return;

    const phase = state.loopRuntime.phase;

    // During race, if time is up, start finish window (everyone finishes lap, overtime based on first finisher)
    if(phase === 'ampel'){ return; }

    if(phase === 'race'){
      const limitMs = Math.max(0.01, Number(state.modes.loop.raceMin||0))*60_000;
      const elapsed = Math.max(0, getTimelineNowMs() - (state.loopRuntime.phaseStartedAt || state.session.startedAtMrc || getTimelineNowMs()));
      if(!state.session.finish?.pending && elapsed >= limitMs){
        beginFinishWindow('time');
        logLine('Loop: Rennzeit abgelaufen -> Zielphase');
        toast('Dauerschleife','Rennzeit abgelaufen: Zielphase','warn');
      }
      return;
    }

    // For other phases: timer based switching
    if(state.loopRuntime.phaseEndsAt==null) return;
    if(getTimelineNowMs() >= state.loopRuntime.phaseEndsAt) loopAdvancePhase();
  }

  
  
  
function singleTick(){
    bindShared();
  if(state.session.state !== 'RUNNING') return;

  // if we're in finish window, just monitor completion/deadline
  if(state.session.finish?.pending){
    finishTick();
    return;
  }

  if(state.modes.activeMode !== 'single' && !isFreeDrivingMode()) return;
  if(isFreeDrivingMode()) return;
  const fm = state.modes.single?.finishMode || 'none';
  if(fm === 'none') return;

  const rid = state.session.currentRaceId;
  if(!rid) return;

  if(fm === 'time'){
    const limitMs = Math.max(1, (state.modes.single.timeLimitSec||180)) * 1000;
    if(sessionElapsedMs() >= limitMs){
      // Start finish window: everyone finishes their current lap, then we stop.
      beginFinishWindow('time');
    }
    return;
  }

  if(fm === 'laps'){
    const limit = Math.max(1, state.modes.single.lapLimit||20);

    // Count laps per car and detect the first finisher
    const laps = state.session.laps.filter(l=>l.raceId===rid);
    const byCar = {};
    for(const l of laps){ byCar[l.carId] = (byCar[l.carId]||0) + 1; }

    let firstCarId = null;
    for(const [carId, cnt] of Object.entries(byCar)){
      if(cnt >= limit){
        firstCarId = carId;
        break;
      }
    }
    if(firstCarId){
      // We don't know exact finish timestamp of that car here; use now() and treat as first finisher.
      const ts = now();
      beginFinishWindow('laps', { firstFinishTs: ts });
      // Mark the first finisher immediately so overtime countdown starts
      markCarFinished(firstCarId, ts);
    }
  }
}



// --------------------- Startampel ---------------------
  let ampelRunning = false;
  function isAmpelRunning(){
    return !!ampelRunning;
  }

  function showAmpelOverlay(show){
    bindShared();
    if(!state.ui) state.ui={activeTab:'Dashboard'};
    state.ui.ampel = state.ui.ampel || {visible:false, step:0, go:false, text:'-'};
    state.ui.ampel.visible = !!show;
    saveState();
    try{ renderSessionControl(); }catch{}

    const ov = document.getElementById('ampelOverlay');
    if(!ov) return;
    ov.classList.toggle('hidden', !show);
  }

  function setLampState(step, isGo){
    if(!state.ui) state.ui={activeTab:'Dashboard'};
    state.ui.ampel = state.ui.ampel || {visible:false, step:0, go:false, text:'-'};
    state.ui.ampel.step = Number(step)||0;
    state.ui.ampel.go = !!isGo;
    // no saveState here (too spammy)

    const sets = [
      ['lamp1','lamp2','lamp3','lamp4','lamp5'],
      ['lampO1','lampO2','lampO3','lampO4','lampO5'],
    ];
    for(const ids of sets){
      ids.forEach((id,i)=>{
        const el = document.getElementById(id);
        if(!el) return;
        el.classList.remove('on','go');
        if(isGo){
          if(i===4) el.classList.add('go');
        } else {
          if(i < step) el.classList.add('on');
        }
      });
    }
  }


  function setAmpelText(t){
    if(!state.ui) state.ui={activeTab:'Dashboard'};
    state.ui.ampel = state.ui.ampel || {visible:false, step:0, go:false, text:'-'};
    state.ui.ampel.text = String(t||'-');
    // no saveState here (too spammy)

    const els = [document.getElementById('ampelText'), document.getElementById('ampelTextO')];
    for(const el of els){
      if(el) el.textContent = t;
    }
  }


  async function runAmpelSequence(onGreen){
    if(ampelRunning) return false;
    ampelRunning = true;
    showAmpelOverlay(true);
    let startAccepted = true;
    try{
      const mrcPatterns = ['1000000','1100000','1110000','1111000','1111100'];
      // reset
      setLampState(0,false);
      setAmpelText('-');
      try{ await mrcCountdownSet('0000000'); }catch{}

      const steps = [5,4,3,2,1];
      const stepMs = Math.max(250, parseInt(state.settings.ampelStepMs,10) || 700);
      for(let i=0;i<steps.length;i++){
        const n = steps[i];
        setLampState(i+1,false);
        setAmpelText(String(n));
        try{ await mrcCountdownSet(mrcPatterns[i] || '0000000'); }catch{}
        await queueSpeak(String(n));
        await (typeof sleep === 'function' ? sleep(stepMs) : sleepLocal(stepMs));
      }

      // wait phase (sync with display)
      setAmpelText('warten...');
      const waitMs = Math.max(0, parseInt(state.settings.ampelWaitMs,10) || 1200);
      await (typeof sleep === 'function' ? sleep(waitMs) : sleepLocal(waitMs));

      // START / GREEN
      try{ await requestMrcSync('green'); }catch{}
      try{ await mrcCountdownSet('0000010'); }catch{}
      setLampState(5,true);
      setAmpelText('START');
      try{
        if(typeof onGreen==='function'){
          const onGreenResult = onGreen(getCurrentMrcClock());
          if(onGreenResult === false) startAccepted = false;
        }
      }catch(e){
        startAccepted = false;
        logLine('Ampel onGreen Fehler: '+String(e?.message||e));
      }
      await queueSpeak('Start');

      await sleep(250);
      // clear back to idle display (keep last state visible a bit)
      setAmpelText('-');
      setLampState(0,false);
      try{ await mrcCountdownSet('0000000'); }catch{}
      return startAccepted;
    } finally {
      showAmpelOverlay(false);
      ampelRunning = false;
      try{ renderSessionControl(); }catch{}
    }
  }

// --------------------- Session controls ---------------------
  const PASS_DEBOUNCE_MS = 700;

  
  async function sessionStart(){
    const freeDrivingToggle = !!state.ui.freeDrivingEnabled;
    saveState();

    if(state.session.state!=='IDLE') return false;

    if(!freeDrivingToggle && !state.modes.activeMode){
      toast('Session', 'Kein Rennmodus aktiv gesetzt.', 'warn');
      return false;
    }

    if(!freeDrivingToggle){
      state.ui.freeDrivingEnabled = false;
      state.session.isFreeDriving = false;
    }

    if(freeDrivingToggle){
      try{
        const curMrc = getCurrentMrcClock();
        if(!Number.isFinite(Number(curMrc)) || Number(curMrc) <= 0){
          await requestMrcSync('session-start');
        }
      }catch{}
      const started = sessionStartImmediate(getCurrentMrcClock());
      if(started===false){
        state.ui.freeDrivingEnabled = false;
        saveState();
        renderSessionControl();
        try{ sendPresenterSnapshot(true); }catch{}
      }
      return started;
    }

    // In Dauerschleife the start light is handled before the RACE phase, not at session start.
    if(state.modes.activeMode==='loop'){
      try{
        const curMrc = getCurrentMrcClock();
        if(!Number.isFinite(Number(curMrc)) || Number(curMrc) <= 0){
          await requestMrcSync('loop-session-start');
        }
      }catch{}
      const startMrc = getCurrentMrcClock();
      if(!Number.isFinite(Number(startMrc)) || Number(startMrc) <= 0){
        toast('Session', 'MRC-Zeit nicht bereit. Bitte Reader verbinden/synchronisieren.', 'err');
        logLine('Session Start blockiert: keine gueltige MRC-Zeitbasis');
        return false;
      }
      return sessionStartImmediate(startMrc);
    }

    const useAmpel = !!state.settings.useAmpel;

    if(useAmpel){
      return await runAmpelSequence((greenMrcMs)=>sessionStartImmediate(greenMrcMs));
    }

    try{
      const curMrc = getCurrentMrcClock();
      if(!Number.isFinite(Number(curMrc)) || Number(curMrc) <= 0){
        await requestMrcSync('session-start');
      }
    }catch{}
    return sessionStartImmediate(getCurrentMrcClock());
  }

  function sessionStartImmediate(startMrcMs=null){
    bindShared();

    const normalizedStartMrc = Number.isFinite(Number(startMrcMs)) ? Math.max(0, Number(startMrcMs)) : getCurrentMrcClock();
    if(!Number.isFinite(Number(normalizedStartMrc)) || Number(normalizedStartMrc) <= 0){
      toast('Session', 'MRC-Zeit nicht bereit. Bitte Reader verbinden/synchronisieren.', 'err');
      logLine('Session Start blockiert: keine gueltige MRC-Zeitbasis');
      return false;
    }

    try{
      const endDurPage = document.getElementById('endDur');
      const endMinPage = document.getElementById('endMinStintLaps');
      const endMaxPage = document.getElementById('endMaxStintLaps');
      if(state.modes.activeMode==='endurance'){
        syncEnduranceSettingsFromPage();
        state.modes.endurance.durationMin = getNormalizedEnduranceDurationMin();
        if(endDurPage) endDurPage.value = String(state.modes.endurance.durationMin);
        if(endMinPage) endMinPage.value = String(state.modes.endurance.minStintLaps);
        if(endMaxPage) endMaxPage.value = String(state.modes.endurance.maxStintLaps);
        const endPenaltyPage = document.getElementById('endPenaltySeconds');
        const endPenaltyThresholdPage = document.getElementById('endPenaltyLapThresholdSeconds');
        const endPenaltyLapsPage = document.getElementById('endPenaltyLapsPerThreshold');
        if(endPenaltyPage) endPenaltyPage.value = String(state.modes.endurance.penaltySecondsPerViolation||0);
        if(endPenaltyThresholdPage) endPenaltyThresholdPage.value = String(state.modes.endurance.penaltyLapThresholdSeconds||0);
        if(endPenaltyLapsPage) endPenaltyLapsPage.value = String(state.modes.endurance.penaltyLapsPerThreshold||0);
        logLine(`Langstrecke Startparameter: ${state.modes.endurance.durationMin} Min, Mindeststint ${state.modes.endurance.minStintLaps}, Max-Stint ${state.modes.endurance.maxStintLaps||0}, Strafe ${state.modes.endurance.penaltySecondsPerViolation||0}s, Rundenabzug ab ${state.modes.endurance.penaltyLapThresholdSeconds||0}s: ${state.modes.endurance.penaltyLapsPerThreshold||0}`);
      }
    }catch{}

    state.session.isFreeDriving = !!state.ui.freeDrivingEnabled;
    state.session.state='RUNNING';
    state.session.startedAt = now();
    state.session.startedAtMrc = Number(normalizedStartMrc);
    state.session.pausedAt = null;
    state.session.pausedAtMrc = null;
    state.session.pauseAccumMs = 0;
    state.session.pauseAccumMrcMs = 0;
    state.session.lastPassByCarId = {};
    state.session.lastPassSeenByCarId = {};
    state.session.raceStartArmedByCarId = {};
    state.session.mrcCounterByChip = {};
    if(typeof clearEnduranceActiveInfos === 'function'){
      clearEnduranceActiveInfos();
    } else {
      state.modes.endurance = state.modes.endurance || {};
      state.modes.endurance.activeByTeamId = {};
    }
    resetFinishRuntime();
    resetRaceAnnounceRuntime();
    state.ui.podiumRaceId = '';
    const startedRace = startNewRace();
    if(startedRace && state.session.startedAtMrc!=null){
      startedRace.startedAtMrc = state.session.startedAtMrc;
    }
    logLine(`MRC Startzeit gesetzt: ${Math.round(state.session.startedAtMrc)} ms seit Reader-Boot`);
    if(state.modes.activeMode==='endurance' && state.session.currentRaceId){
      if(typeof clearEnduranceStintsForRace === 'function'){
        clearEnduranceStintsForRace(state.session.currentRaceId);
      }
    }

    if(state.modes.activeMode==='loop' && !state.session.isFreeDriving){
      loopInit();
      logLine('Loop Phase -> TRAINING');
      if(state.audio?.enabled){ try{ queueSpeak('Training startet'); }catch{} }
      toast('Dauerschleife','Training gestartet','ok');
    } else {
      state.loopRuntime.phase=null; state.loopRuntime.phaseEndsAt=null; state.loopRuntime.remainingMs=null;
      if(state.session.isFreeDriving){
        if(state.audio?.enabled){ try{ queueSpeak('Freies Fahren startet'); }catch{} }
        toast('Session','Freies Fahren gestartet','ok');
      }
    }

    logLine(`Session START -> ${getModeLabel()}`);
    saveState();
    renderSessionControl();
    try{ renderDashboard(); }catch{}
    try{ sendPresenterSnapshot(true); }catch{}
    return true;
  
  }


  function sessionStop(){
    bindShared();
    if(state.session.state==='IDLE') return;

    state.session.state='IDLE';
    state.session.startedAt=null;
    state.session.startedAtMrc=null;
    state.session.pausedAt=null;
    state.session.pausedAtMrc=null;
    state.session.pauseAccumMs=0;
    state.session.pauseAccumMrcMs=0;
    state.session.lastPassByCarId = {};
    state.session.lastPassSeenByCarId = {};
    state.session.raceStartArmedByCarId = {};
    if(typeof clearEnduranceActiveInfos === 'function'){
      clearEnduranceActiveInfos();
    } else {
      state.modes.endurance = state.modes.endurance || {};
      state.modes.endurance.activeByTeamId = {};
    }
    resetFinishRuntime();
    endCurrentRace();
    state.session.currentRaceId=null;
    state.session.isFreeDriving = false;
    state.ui.freeDrivingEnabled = false;

    state.loopRuntime.phase=null; state.loopRuntime.phaseEndsAt=null; state.loopRuntime.remainingMs=null;

    logLine('Session STOP');
    saveState();
    renderAll();
    try{ sendPresenterSnapshot(true); }catch{}
  }

  function sessionPause(){
    bindShared();
    if(state.session.state!=='RUNNING') return;
    state.session.state='PAUSED';
    state.session.pausedAt = now();
    const mrcNow = getCurrentMrcClock();
    state.session.pausedAtMrc = Number.isFinite(Number(mrcNow)) ? Number(mrcNow) : null;
    if(state.modes.activeMode==='loop') loopOnPause();
    logLine('Session PAUSE');
    saveState();
    renderSessionControl();
  }

  function sessionResume(){
    bindShared();
    if(state.session.state!=='PAUSED') return;
    const delta = now() - (state.session.pausedAt || now());
    state.session.pauseAccumMs += Math.max(0, delta);
    const mrcNow = getCurrentMrcClock();
    if(state.session.pausedAtMrc!=null && Number.isFinite(Number(mrcNow))){
      state.session.pauseAccumMrcMs += Math.max(0, Number(mrcNow) - Number(state.session.pausedAtMrc));
    }
    state.session.pausedAt = null;
    state.session.pausedAtMrc = null;
    state.session.state='RUNNING';
    if(state.modes.activeMode==='loop') loopOnResume();
    logLine('Session WEITER');
    saveState();
    renderSessionControl();
  }

  function sessionElapsedMs(){
    const mrcNow = getCurrentMrcClock();
    if(state.session.startedAtMrc==null || !Number.isFinite(Number(mrcNow))) return 0;
    const endMrc = (state.session.state==='PAUSED' && state.session.pausedAtMrc!=null) ? Number(state.session.pausedAtMrc) : Number(mrcNow);
    return Math.max(0, endMrc - Number(state.session.startedAtMrc) - Number(state.session.pauseAccumMrcMs||0));
  }

// --------------------- Finish window (end-of-race logic) ---------------------
function resetFinishRuntime(){
    bindShared();
  state.session.finish = { pending:false, type:'', pendingSince:0, firstFinishTs:0, deadlineTs:0, finishedCarIds:{}, activeCarIds:[] };
}
function beginFinishWindow(type, opts={}){
    bindShared();
  const f = state.session.finish || (state.session.finish={});
  if(f.pending) return;
  const track = getActiveTrack();
  const minLap = track?.minLapMs ?? 0;
  f.pending = true;
  f.type = type; // 'time'|'laps'
  f.pendingSince = getTimelineNowMs();
  f.firstFinishTs = opts.firstFinishTs || 0;
  f.deadlineTs = opts.deadlineTs || 0;
  f.finishedCarIds = {};
  // active cars are those that have at least one pass marker (lastPassByCarId entry)
  f.activeCarIds = Object.keys(state.session.lastPassByCarId || {});
  // if we already know the first finisher (laps mode), set deadline now
  if(f.firstFinishTs && !f.deadlineTs && minLap){
    f.deadlineTs = f.firstFinishTs + (minLap * 3);
  }
  // If there are no active cars, just end immediately.
  if(!f.activeCarIds.length){
    finishRaceNow('Keine aktiven Fahrer');
    return;
  }
  toast('Rennen', 'Zielphase: Alle Fahrer noch eine Runde beenden...','warn');
  logLine('Zielphase gestartet (Finish Window)');
  saveState();
}
function markCarFinished(carId, ts){
    bindShared();
  const f = state.session.finish;
  if(!f?.pending) return;
  if(f.finishedCarIds[carId]) return;
  const finishedTs = ts || getTimelineNowMs();
  f.finishedCarIds[carId] = finishedTs;

  const track = getActiveTrack();
  const minLap = track?.minLapMs ?? 0;

  if(!f.firstFinishTs){
    f.firstFinishTs = finishedTs;
  }
  if(!f.deadlineTs && minLap){
    f.deadlineTs = f.firstFinishTs + (minLap * 3);
  }

  ensureRaceAnnounceRuntime();
  if(state.audio?.enabled && state.audio?.sayFinished){
    const raceId = state.session.currentRaceId || '';
    const key = raceId + ':' + String(carId);
    if(!state.session.announce.finishSaidByKey[key]){
      const name = getFinishNameForCarId(carId);
      if(name) queueSpeak(name + ' im Ziel');
      state.session.announce.finishSaidByKey[key] = true;
    }
  }

  const done = Object.keys(f.finishedCarIds).length;
  const total = f.activeCarIds.length;
  logLine(`Ziel: ${done}/${total} fertig`);
  try{ sendPresenterSnapshot(true); }catch{}
  saveState();
}



function teamTick(){
  if(state.session.state !== 'RUNNING') return;

  if(state.session.finish?.pending){
    finishTick();
    return;
  }

  if(state.modes.activeMode !== 'team') return;
  const fm = state.modes.team?.finishMode || 'none';
  if(fm === 'none') return;

  const rid = state.session.currentRaceId;
  if(!rid) return;

  if(fm === 'time'){
    const limitMs = Math.max(1, (state.modes.team.timeLimitSec||180)) * 1000;
    if(sessionElapsedMs() >= limitMs){
      beginFinishWindow('time');
    }
    return;
  }

  if(fm === 'laps'){
    const limit = Math.max(1, state.modes.team.lapLimit||20);
    const teams = state.modes.team?.teams || [];
    const laps = getRelevantRaceLaps(rid, state.session.laps||[]);
    let firstTeamId = null;
    for(const t of teams){
      const cnt = laps.filter(l=>{
        const did = String(l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim();
        return (t.driverIds||[]).includes(did);
      }).length;
      if(cnt >= limit){
        firstTeamId = t.id;
        break;
      }
    }
    if(firstTeamId){
      const ts = now();
      beginFinishWindow('laps', { firstFinishTs: ts });
    }
  }
}


function enduranceTick(){
  if(state.session.state !== 'RUNNING') return;

  if(state.session.finish?.pending){
    finishTick();
    return;
  }

  if(state.modes.activeMode !== 'endurance') return;
  const rid = state.session.currentRaceId;
  if(!rid) return;
  const race = getActiveRaceDay()?.races?.find(r=>r.id===rid) || null;
  const durationMin = Math.max(1, Number(race?.enduranceDurationMin || state.modes.endurance?.durationMin || 30));
  const limitMs = durationMin * 60_000;
  if(sessionElapsedMs() >= limitMs){
    beginFinishWindow('time');
  }
}

function finishTick(){
    bindShared();
  const f = state.session.finish;
  if(!f?.pending) return;
  const total = f.activeCarIds.length;
  const done = Object.keys(f.finishedCarIds).length;

  // End when all finished OR deadline exceeded (overtime)
  if(done >= total){
    finishRaceNow('Alle Fahrer im Ziel');
    return;
  }
  if(f.deadlineTs && getTimelineNowMs() >= f.deadlineTs){
    // Let any already queued pass finish processing first, otherwise the
    // last lap that physically crossed during overtime can be dropped from
    // the final result if the timer tick wins the race against the pass queue.
    if(passQueueBusy || passQueue.length){
      return;
    }
    finishRaceNow('Ueberzeit erreicht');
    return;
  }
}
function finishRaceNow(reason){
  logLine(`Rennen beendet: ${reason}`);
  toast('Rennen beendet', reason, 'ok');
  ensureRaceAnnounceRuntime();

  // In Dauerschleife we do NOT stop the whole session. We show podium for 60s and continue.
  if(state.modes.activeMode === 'loop'){
    resetFinishRuntime();
    endCurrentRace(); // sets podiumRaceId
    if(state.audio?.enabled && state.audio?.sayRunFinished && !state.session.announce.runFinishedSaid){
      queueSpeak('Der Lauf ist beendet');
      state.session.announce.runFinishedSaid = true;
    }
    speakPlacementsForRace(state.ui.podiumRaceId || '');
    state.session.currentRaceId = null;

    state.loopRuntime.phase = 'podium';
    state.loopRuntime.phaseStartedAt = getTimelineNowMs();
    state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0,state.loopRuntime.remainingMs||0)/1000);
    try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
    const lm = readLoopMinsFromUI();
    state.modes.loop.podiumMin = lm.podiumMin; saveState();
    state.loopRuntime.remainingMs = Math.max(0, Number(lm.podiumMin||0) * 60_000);
    state.loopRuntime.phaseEndsAt = getTimelineNowMs() + state.loopRuntime.remainingMs;

    logLine('Loop Phase -> PODIUM (60s)');
    toast('Dauerschleife','Podium: 60 Sekunden','ok');
    saveState();
    renderAll();
    try{ sendPresenterSnapshot(true); }catch{}
    return;
  }

  // normal modes
  const finishedRaceId = state.session.currentRaceId || '';
  if(state.audio?.enabled && state.audio?.sayRunFinished && !state.session.announce.runFinishedSaid){
    queueSpeak('Der Lauf ist beendet');
    state.session.announce.runFinishedSaid = true;
  }
  speakPlacementsForRace(finishedRaceId);
  resetFinishRuntime();
  sessionStop();
}



  function currentPhase(){
    bindShared();
    if(state.modes.activeMode==='loop' && state.loopRuntime.phase) return state.loopRuntime.phase;
    return getLapKind();
  }

  function handleIdlePass(car, ts, track){
    bindShared();
    if(state.session.state!=='IDLE') return;
    if(state.settings?.allowIdleReads===false) return;

    state.session.idleLastPassByCarId = state.session.idleLastPassByCarId || {};
    state.session.idleLaps = state.session.idleLaps || [];

    const lastTs = state.session.idleLastPassByCarId[car.id];
    if(lastTs && (ts - lastTs) < PASS_DEBOUNCE_MS) return;
    state.session.idleLastPassByCarId[car.id] = ts;

    if(!lastTs){
    logLine(`Pass (ohne Session): ${car.name} -> Startmarker`);
      renderDashboard();
      return;
    }

    const rawLapMs = ts - lastTs;
    const lapTiming = resolveLapMsForCar(car.id, rawLapMs);
    const lapMs = lapTiming.lapMs;
    if(!Number.isFinite(Number(lapMs)) || lapMs<=0){
      logLine(`Read ohne Session ignoriert: ${car.name} - keine gueltige MRC-Rundenzeit`);
      return;
    }
    const minLap = track?.minLapMs ?? 0;
    if(minLap && lapMs < minLap){
      logLine(`Read ignoriert (ohne Session, zu schnell): ${car.name} ${msToTime(lapMs, 3)} < min ${msToTime(minLap, 3)}`);
      return;
    }

    const lapEntry = {
      id: uid('idlelap'),
      ts,
      trackId: (track?.id || ''),
      raceId: '',
      phase: 'IDLE',
      kind: 'Idle',
      modeLabel: 'Ohne Session',
      carId: car.id,
      driverId: car.driverId || '',
      lapMs,
      lapTimeSource: lapTiming.source,
      mrcLapMs: lapTiming.mrcMs,
      htmlLapMs: lapTiming.htmlMs
    };
    state.session.idleLaps.push(lapEntry);
    if(state.session.idleLaps.length > 500) state.session.idleLaps = state.session.idleLaps.slice(-500);
    saveState();

    const dn = getDriverNameForCar(car);
    logLine(`Read ohne Session: ${dn?dn+': ':''}${car.name} -> ${msToTime(lapMs, 3)} - MRC`);
    renderDashboard();
    renderSessionControl();
    try{ sendPresenterSnapshot(true); }catch{}
  }

  function handlePass(chip, ts){
    bindShared();
    const track = getActiveTrack();
    const car = ensureCarByChip(chip);
    if(!car) return;
    if(state.session.state!=='RUNNING'){
      if(state.session.state==='IDLE') handleIdlePass(car, ts, track);
      return;
    }

    // Langstrecke: nur ein aktiver Fahrer pro Team, automatischer Wechsel mit Mindeststint
    if(state.modes.activeMode==='endurance'){
      const did = String(car.driverId||'').trim();
      const rid = state.session.currentRaceId || '';
      const team = did ? getTeamForDriverInMode('endurance', did) : null;
      if(team && rid){
        const active = getEnduranceActiveInfo(team.id);
        if(!active){
          setEnduranceActiveInfo(team.id, { driverId: did, carId: car.id, activatedTs: ts, pendingStartMarker: false, stintLaps: 0 });
          saveState();
        }else if(active.driverId !== did || active.carId !== car.id){
          const minStint = Math.max(0, parseInt(state.modes.endurance?.minStintLaps||0,10) || 0);
          const stintLaps = Math.max(0, parseInt(active.stintLaps||0,10) || 0);
          if(stintLaps < minStint){
            logLine(`Langstrecke Wechsel ignoriert: ${team.name||'Team'} Mindeststint ${stintLaps}/${minStint}`);
            return;
          }
          const previousCarId = String(active.carId||'').trim();
          state.session.lastPassByCarId = state.session.lastPassByCarId || {};
          state.session.lastPassSeenByCarId = state.session.lastPassSeenByCarId || {};
          const transferredAnchorTs = previousCarId ? state.session.lastPassByCarId[previousCarId] : null;
          finalizeEnduranceStint(team.id, rid, ts);
          const nextInfo = { driverId: did, carId: car.id, activatedTs: ts, pendingStartMarker: !transferredAnchorTs, stintLaps: 0 };
          setEnduranceActiveInfo(team.id, nextInfo);
          if(transferredAnchorTs){
            state.session.lastPassByCarId[car.id] = transferredAnchorTs;
            delete state.session.lastPassSeenByCarId[car.id];
          logLine(`Langstrecke Wechsel: ${team.name||'Team'} -> ${getDriver(did)?.name||car.name} (letzte Runde bleibt erhalten)`);
          }else{
            delete state.session.lastPassByCarId[car.id];
            delete state.session.lastPassSeenByCarId[car.id];
          logLine(`Langstrecke Wechsel: ${team.name||'Team'} -> ${getDriver(did)?.name||car.name}`);
          }
          saveState();
        }
      }
    }

    state.session.lastPassSeenByCarId = state.session.lastPassSeenByCarId || {};
    const lastSeenTs = state.session.lastPassSeenByCarId[car.id];
    let anchorTs = state.session.lastPassByCarId[car.id];
    if(lastSeenTs && (ts - lastSeenTs) < PASS_DEBOUNCE_MS) return;
    state.session.lastPassSeenByCarId[car.id] = ts;

    const raceId = state.session.currentRaceId || '';
    const phase = currentPhase();
    const raceStartTs = getRaceStartTs(raceId);
    const shouldArmRaceOnFirstCrossing = !!(
      raceId &&
      phase==='race' &&
      !isFreeDrivingMode() &&
      state.session.state==='RUNNING' &&
      Number.isFinite(raceStartTs) && raceStartTs>0 &&
      ts >= raceStartTs
    );

    state.session.raceStartArmedByCarId = state.session.raceStartArmedByCarId || {};

    const minLap = track?.minLapMs ?? 0;
    if(!anchorTs){
      if(shouldArmRaceOnFirstCrossing){
        state.session.lastPassByCarId[car.id] = ts;
        state.session.raceStartArmedByCarId[car.id] = true;
        const dn = getDriverNameForCar(car);
        if(state.modes.activeMode==='endurance'){
          const did = String(car.driverId||'').trim();
          const team = did ? getTeamForDriverInMode('endurance', did) : null;
          const ai = team ? getEnduranceActiveInfo(team.id) : null;
          if(ai && ai.driverId===did && ai.carId===car.id && ai.pendingStartMarker){
            ai.pendingStartMarker = false;
            if(!Number.isFinite(Number(ai.stintLaps))) ai.stintLaps = 0;
            setEnduranceActiveInfo(team.id, ai);
            saveState();
          }
        }
        logLine(`Pass: ${dn?dn+': ':''}${car.name} -> Startmarker gesetzt`);
        try{
          if(state.audio?.enabled){
            const nameToSay = getSpeakNameForCar(car);
            if(nameToSay) queueSpeak(nameToSay);
          }
        }catch{}
        return;
      }

      const sessionStartTs = Number.isFinite(raceStartTs) && raceStartTs>0 ? raceStartTs : Number(state.session.startedAtMrc || 0);
      const canCountFromSessionStart = sessionStartTs > 0 && (!minLap || (ts - sessionStartTs) >= minLap);
      if(canCountFromSessionStart){
        anchorTs = sessionStartTs;
      } else {
        state.session.lastPassByCarId[car.id] = ts;
        const dn = getDriverNameForCar(car);
        if(state.modes.activeMode==='endurance'){
          const did = String(car.driverId||'').trim();
          const team = did ? getTeamForDriverInMode('endurance', did) : null;
          const ai = team ? getEnduranceActiveInfo(team.id) : null;
          if(ai && ai.driverId===did && ai.carId===car.id && ai.pendingStartMarker){
            ai.pendingStartMarker = false;
            if(!Number.isFinite(Number(ai.stintLaps))) ai.stintLaps = 0;
            setEnduranceActiveInfo(team.id, ai);
            saveState();
          }
        }

      logLine(`Pass: ${car.name} (${chip}) -> Startmarker`);
        try{
          if(state.audio?.enabled){
            const nameToSay = getSpeakNameForCar(car);
            if(nameToSay) queueSpeak(nameToSay);
          }
        }catch{}
        return;
      }
    }

    const rawLapMs = ts - anchorTs;
    const lapTiming = resolveLapMsForCar(car.id, rawLapMs);
    const armedFirstLap = !!state.session.raceStartArmedByCarId?.[car.id];
    let lapMs = lapTiming.lapMs;
    let lapTimingSource = lapTiming.source;
    let lapTimingMrcMs = lapTiming.mrcMs;
    let lapTimingHtmlMs = lapTiming.htmlMs;
    if((!Number.isFinite(Number(lapMs)) || lapMs<=0) && armedFirstLap && Number.isFinite(Number(rawLapMs)) && Number(rawLapMs) > 0){
      lapMs = Number(rawLapMs);
      lapTimingSource = 'raw';
      lapTimingMrcMs = null;
      lapTimingHtmlMs = Number(rawLapMs);
    }
    if(!Number.isFinite(Number(lapMs)) || lapMs<=0){
      logLine(`Lap ignoriert: ${car.name} - keine gueltige MRC-Rundenzeit`);
      return;
    }
    if(minLap && lapMs < minLap){
      logLine(`Lap ignoriert (zu schnell): ${car.name} ${msToTime(lapMs, 3)} < min ${msToTime(minLap, 3)} [MRC]`);
      return;
    }

    if(state.session.ignoreNextLapByCarId && state.session.ignoreNextLapByCarId[car.id]){
      state.session.lastPassByCarId[car.id] = ts;
      delete state.session.ignoreNextLapByCarId[car.id];
      logLine(`Lap ignoriert (Auto neu zugewiesen): ${car.name} ${msToTime(lapMs, 3)}`);
      saveState();
      return;
    }

    
// finish window: ignore any further laps after a car is finished
const f = state.session.finish;
if(f?.pending && f.finishedCarIds && f.finishedCarIds[car.id]){
  logLine(`Lap ignoriert (Ziel erreicht): ${car.name}`);
  return;
}
    state.session.lastPassByCarId[car.id] = ts;
    if(state.session.raceStartArmedByCarId && state.session.raceStartArmedByCarId[car.id]){
      delete state.session.raceStartArmedByCarId[car.id];
    }
const lapPhase = currentPhase();
    const lapEntry = {
      id: uid('lap'),
      ts,
      trackId: (getActiveTrack()?.id || ''),
      raceId: state.session.currentRaceId,
      phase: lapPhase,
      kind: getLapKind(),
      modeLabel: getModeLabel(),
      carId: car.id,
      driverId: car.driverId || '',
      lapMs,
      lapTimeSource: lapTimingSource,
      mrcLapMs: lapTimingMrcMs,
      htmlLapMs: lapTimingHtmlMs
    };
    state.session.laps.push(lapEntry);
    if(state.modes.activeMode==='endurance'){
      const did = String(car.driverId||'').trim();
      const team = did ? getTeamForDriverInMode('endurance', did) : null;
      const ai = team ? getEnduranceActiveInfo(team.id) : null;
      if(ai && ai.driverId===did && ai.carId===car.id){
        ai.stintLaps = Math.max(0, parseInt(ai.stintLaps||0,10) || 0) + 1;
        const maxStint = Math.max(0, parseInt(state.modes.endurance?.maxStintLaps||0,10) || 0);
        if(maxStint>0){
          if(ai.stintLaps === maxStint){
        logLine(`Langstrecke Wechsel faellig: ${team.name||'Team'} ${getDriver(did)?.name||car.name} hat ${ai.stintLaps}/${maxStint} Runden erreicht`);
            try{ if(state.audio?.enabled){ queueSpeak(`${getDriver(did)?.name||car.name} Wechsel`); } }catch{}
          }else if(ai.stintLaps > maxStint){
        logLine(`Langstrecke Max-Stint ueberschritten: ${team.name||'Team'} ${getDriver(did)?.name||car.name} ${ai.stintLaps}/${maxStint}`);
          }
        }
        setEnduranceActiveInfo(team.id, ai);
      }
    }
    saveState();

    // personal bests (Saison + Renntag)
    try{ updatePersonalBestsOnLap(track.id, ts, car, lapMs); }catch(e){}

    // track record (Saison + Renntag)
    if(!state.session.trackRecordSaid) state.session.trackRecordSaid = { season:{}, day:{} };

    if(track){
      const displayName = getDriverNameForCar(car) || 'Unbekannt';
      const speakName = getSpeakNameForCar(car) || displayName;

      // Saison-Rekord
      const recSeason = getTrackRecord(track, state.season.activeSeasonId);
      if(recSeason.ms==null || lapMs < recSeason.ms){
        recSeason.ms = lapMs;
        recSeason.driverId = car.driverId || null;
        recSeason.driverName = displayName;
        recSeason.speakName = speakName;
        recSeason.carId = car.id || null;
        recSeason.carName = car.name;
        saveState();

        if(state.audio?.enabled && state.audio?.sayTrackRecordSeason){
          const key = track.id + ':' + String(lapMs);
          if(!state.session.trackRecordSaid.season[key]){
            speakTrackRecord('Streckenrekord', speakName, lapMs);
            state.session.trackRecordSaid.season[key] = true;
          }
        }
      }

      // Renntag-Rekord
      const rd = getActiveRaceDay();
      if(rd && rd.trackId === track.id){
        const recDay = getRaceDayTrackRecord(rd, track.id);
        if(recDay.ms==null || lapMs < recDay.ms){
          recDay.ms = lapMs;
          recDay.driverId = car.driverId || null;
          recDay.driverName = displayName;
          recDay.speakName = speakName;
          recDay.carId = car.id || null;
          recDay.carName = car.name;
          saveState();

          if(state.audio?.enabled && state.audio?.sayTrackRecordDay){
            const key = rd.id + ':' + track.id + ':' + String(lapMs);
            if(!state.session.trackRecordSaid.day[key]){
              speakTrackRecord('Renntag Streckenrekord', speakName, lapMs);
              state.session.trackRecordSaid.day[key] = true;
            }
          }
        }
      }
    }
const dn = getDriverNameForCar(car);
    logLine(`Lap: ${dn?dn+': ':''}${car.name} -> ${msToTime(lapMs, 3)} (${lapPhase} - MRC)`);
    renderDashboard();
    renderSessionControl();
    try{ sendPresenterSnapshot(true); }catch{}
    
// finish window: once pending, the next valid lap for each active car counts as "finished"
if(state.session.finish?.pending){
  // Only count finishes for cars that were active when finish window started
  const f2 = state.session.finish;
  if(f2.activeCarIds && f2.activeCarIds.includes(car.id)){
    markCarFinished(car.id, ts);
  }
}
    maybeSpeakLap(car, lapMs, phase);
    maybeAnnounceOvertakeAndLapping(car);
  }


  return {
    hostElapsed,
    isSessionIdle,
    isFreeDrivingRace,
    isFreeDrivingMode,
    raceShouldShowPodium,
    ensureCarByChip,
    getDriverNameForCar,
    syncEnduranceSettingsFromPage,
    getNormalizedEnduranceDurationMin,
    startNewRace,
    endCurrentRace,
    endCurrentRaceQuiet,
    loopInit,
    loopAdvancePhase,
    loopOnPause,
    loopOnResume,
    loopStartRaceSegment,
    loopTick,
    singleTick,
    teamTick,
    enduranceTick,
    isAmpelRunning,
    showAmpelOverlay,
    runAmpelSequence,
    sessionStart,
    sessionStartImmediate,
    sessionElapsedMs,
    sessionStop,
    sessionPause,
    sessionResume,
    resetFinishRuntime,
    beginFinishWindow,
    markCarFinished,
    finishTick,
    currentPhase,
    handleIdlePass,
    handlePass
  };
})();
