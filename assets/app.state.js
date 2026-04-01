window.TIMTIME_STATE = (function(){
  'use strict';
  function bindShared(){ Object.assign(globalThis, window.TIMTIME_SHARED || {}); }
  const LS_KEY = 'zeitnahme2_state_v3';
  const LS_PROJECT_STATE_MIRROR_KEY = 'zeitnahme2_project_state_mirror_v1';
  const APP_DATA_DB_VERSION = 3;
  const APP_DATA_DB_NAME = 'zeitnahme2_app_data_v1';
  const APP_DATA_AVATAR_STORE = 'driverAvatars';
  const APP_DATA_SESSION_LAPS_STORE = 'sessionLaps';
  const APP_DATA_IDLE_LAPS_STORE = 'idleLaps';
  const APP_DATA_STATE_CHUNK_STORE = 'stateChunks';
  const APP_DATA_DISCORD_QUEUE_STORE = 'discordQueue';
  const APP_DATA_FS_HANDLE_STORE = 'fsHandles';
  const PRES_SNAPSHOT_KEY = 'ZN_PRES_SNAPSHOT';
  const LS_STATE_CHUNKS_KEY = 'zeitnahme2_state_chunks_v1';
  const PROJECT_STATE_SUBDIR = 'data';
  const PROJECT_STATE_FILES = {
    settings: 'settings.json',
    ui: 'ui.json',
    transport: 'transport.json',
    masterData: 'masterdata.json',
    raceDay: 'raceday.json',
    season: 'season.json',
    tracks: 'tracks.json',
    session: 'session.json',
    personalRecords: 'personal-records.json',
    modes: 'modes.json',
    media: 'media.json',
    audio: 'audio.json',
    audioAssets: 'audio-assets.json'
  };
  function safeNow(){
    bindShared();
    return (typeof now === 'function') ? now() : Date.now();
  }
  function safeUid(prefix='id'){
    bindShared();
    if(typeof uid === 'function') return uid(prefix);
    return String(prefix || 'id') + '_' + Math.random().toString(16).slice(2,10);
  }
  function safeBleAvailable(){
    return (typeof navigator !== 'undefined') && ('bluetooth' in navigator);
  }
  function makeStorageHealthDefaults(){
    return {
      lastLocalSaveAt: 0,
      lastLocalSaveOk: true,
      lastLocalSaveError: '',
      localSaveCount: 0,
      lastProjectSaveAt: 0,
      lastProjectSaveOk: true,
      lastProjectSaveError: '',
      projectSaveCount: 0
    };
  }
  function ensureStorageHealthObject(targetState){
    bindShared();
    const s = (targetState && typeof targetState === 'object') ? targetState : state;
    if(!s.ui || typeof s.ui !== 'object') s.ui = {};
    const base = makeStorageHealthDefaults();
    const cur = (s.ui.storageHealth && typeof s.ui.storageHealth === 'object') ? s.ui.storageHealth : {};
    s.ui.storageHealth = Object.assign(base, cur);
    if(!Number.isFinite(Number(s.ui.storageHealth.lastLocalSaveAt))) s.ui.storageHealth.lastLocalSaveAt = 0;
    if(typeof s.ui.storageHealth.lastLocalSaveOk !== 'boolean') s.ui.storageHealth.lastLocalSaveOk = true;
    if(typeof s.ui.storageHealth.lastLocalSaveError !== 'string') s.ui.storageHealth.lastLocalSaveError = '';
    if(!Number.isFinite(Number(s.ui.storageHealth.localSaveCount))) s.ui.storageHealth.localSaveCount = 0;
    if(!Number.isFinite(Number(s.ui.storageHealth.lastProjectSaveAt))) s.ui.storageHealth.lastProjectSaveAt = 0;
    if(typeof s.ui.storageHealth.lastProjectSaveOk !== 'boolean') s.ui.storageHealth.lastProjectSaveOk = true;
    if(typeof s.ui.storageHealth.lastProjectSaveError !== 'string') s.ui.storageHealth.lastProjectSaveError = '';
    if(!Number.isFinite(Number(s.ui.storageHealth.projectSaveCount))) s.ui.storageHealth.projectSaveCount = 0;
    return s.ui.storageHealth;
  }
  function getStorageHealthStatus(){
    bindShared();
    const info = ensureStorageHealthObject(state);
    return JSON.parse(JSON.stringify(info));
  }
  function defaultState(){
    bindShared();
    const year = new Date().getFullYear();
    const seasonId = safeUid('season');
    const trackId = safeUid('track');
    const raceDayId = safeUid('raceday');
    return {
      ui:{
        activeTab:'Dashboard',
        selectedRaceId:'',
        selectedRaceDriverId:'',
        dashboardView:'auto',
        dashboardSort:'best',
        dashboardShowLiveFallback:true,
        stammdatenSelectedDriverId:'',
        stammdatenDriverQuery:'',
        stammdatenCarQuery:'',
        teamAssignQuery:'',
        endAssignQuery:'',
        podiumRaceId:'',
        freeDrivingEnabled:false,
        audioSelectedId:'',
        audioFilterCategory:'',
        audioSearch:'',
        storageHealth: makeStorageHealthDefaults()
      },
      settings:{ appName:'Zeitnahme 2.0', language:'de', baudRate:19200, discordWebhook:'', discordAutoSend:false, discordUseThread:false, discordThreadName:'', discordRaceDayWebhook:'', discordSeasonWebhook:'', discordRaceDayUseThread:false, discordSeasonUseThread:false, discordRaceDayThreadName:'{type} • {date}', discordSeasonThreadName:'{type} • {season}', dbPlaceholder:'', useAmpel:true, scaleDenominator:50, ampelWaitMs:1200, ampelStepMs:700, allowIdleReads:false, lapTimeSource:'mrc' },
      media:{ driverAvatars:{} },
      personalRecords:{ bySeason:{}, byRaceDay:{} },
      usb:{ connected:false, available:false, info:'', lastError:'', lastLines:[] },
      ble:{ connected:false, available:safeBleAvailable(), info:'', lastError:'', lastLines:[], notify:false, knownDeviceId:'', knownDeviceName:'', autoReconnect:true },
      season:{ seasons:[{id:seasonId,name:'Saison '+year,status:'active',createdAt:safeNow(),endedAt:null}], activeSeasonId:seasonId },
      tracks:{ tracks:[{id:trackId,name:'Standard Strecke',minLapMs:3000,setup:{mode:'Schnell',tireWear:'Aus',boost:false},recordsBySeason:{[seasonId]:{ms:null,driverName:'',carName:''}}}], activeTrackId:trackId },
      raceDay:{ raceDays:[{id:raceDayId,name:'Renntag '+new Date().toLocaleDateString('de-DE'),seasonId,trackId,createdAt:safeNow(),races:[], trackRecordsByTrackId:{}}], activeRaceDayId:raceDayId },
      masterData:{ drivers:[], cars:[] },
      modes:{
        activeMode:null, // 'single'|'team'|'loop'|'endurance'
        singleSubmode:'Training',
        single:{ finishMode:'time', timeLimitSec:180, lapLimit:20 },
        team:{ finishMode:'time', timeLimitSec:180, lapLimit:20, pointsScheme:'10,8,6,5,4,3,2,1', selectedDriverIds:[], teams:[{id:safeUid('team'), name:'Team 1', driverIds:[]},{id:safeUid('team'), name:'Team 2', driverIds:[]}] },
        loop:{ trainingSec:60, raceSec:120, trainingMin:1, setupMin:3, raceMin:2, podiumMin:1 },
        endurance:{ durationMin:30, lapsLimit:0, minStintLaps:5, maxStintLaps:0, penaltySecondsPerViolation:0, penaltyLapThresholdSeconds:0, penaltyLapsPerThreshold:1, activeByTeamId:{}, stintHistoryByRace:{}, teams:[{id:safeUid('team'), name:'Team 1', driverIds:[]},{id:safeUid('team'), name:'Team 2', driverIds:[]}] }
      },
      session:{
        state:'IDLE', startedAt:null, startedAtMrc:null, pausedAt:null, pausedAtMrc:null, pauseAccumMs:0, pauseAccumMrcMs:0,
        currentRaceId:null,
        isFreeDriving:false,
        lastPassByCarId:{},
        ignoreNextLapByCarId:{},
        idleLastPassByCarId:{},
        idleLaps:[],
        laps:[],
        mrcClock:{ lastDeviceMs:null, lastHostMs:null, syncSeen:false }
      },
      loopRuntime:{ phase:null, phaseEndsAt:null, remainingMs:null, phaseStartedAt:null, phaseElapsedMs:0 },
      audio:{
        enabled:true,
        lapAnnounceMode:'Jede Runde', // Aus|Jede Runde|Nur Bestzeit
        sayName:true, sayLapNo:true, sayLapTime:true,
        decimals:3,
        voiceUri:'',
        rate:1.0, pitch:1.0, volume:1.0,
        targetDb:-16,
        defaultDriverSoundId:'',
        sayOvertakes:true,
        sayLappingWarning:true,
        lappingWarnSec:3,
        sayPositionsAtRest:true,
        positionsSpeechLimit:'all',
        library:[]
      }
    };
  }

  function deepMerge(a,b){
    bindShared();
    if(Array.isArray(a) || Array.isArray(b)) return (b ?? a);
    if(a && b && typeof a==='object' && typeof b==='object'){
      const out = {...a};
      for(const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
      return out;
    }
    return (b ?? a);
  }

  function looksLikeDriverArray(arr){
    if(!Array.isArray(arr) || !arr.length) return false;
    let checked = 0;
    let matches = 0;
    for(const item of arr){
      if(!item || typeof item !== 'object') continue;
      checked += 1;
      const hasId = typeof item.id === 'string' || typeof item.id === 'number';
      const hasName = typeof item.name === 'string';
      const looksRace = ('mode' in item) || ('trackId' in item) || ('startedAt' in item);
      const looksCar = ('chipId' in item) || ('chipCode' in item) || ('driverId' in item && !('color' in item));
      if(hasId && hasName && !looksRace && !looksCar) matches += 1;
      if(checked >= 20) break;
    }
    return checked > 0 && matches >= Math.max(1, Math.floor(checked * 0.6));
  }

  function looksLikeCarArray(arr){
    if(!Array.isArray(arr) || !arr.length) return false;
    let checked = 0;
    let matches = 0;
    for(const item of arr){
      if(!item || typeof item !== 'object') continue;
      checked += 1;
      const hasId = typeof item.id === 'string' || typeof item.id === 'number';
      const hasName = typeof item.name === 'string';
      const hasChip = ('chipId' in item) || ('chipCode' in item);
      if(hasId && hasName && hasChip) matches += 1;
      if(checked >= 20) break;
    }
    return checked > 0 && matches >= Math.max(1, Math.floor(checked * 0.5));
  }

  function findLegacyEntityArray(root, kind){
    const seen = new Set();
    const stack = [root];
    const matcher = kind === 'cars' ? looksLikeCarArray : looksLikeDriverArray;
    let best = [];
    while(stack.length){
      const cur = stack.pop();
      if(!cur || typeof cur !== 'object') continue;
      if(seen.has(cur)) continue;
      seen.add(cur);
      if(Array.isArray(cur)){
        if(matcher(cur) && cur.length > best.length) best = cur;
        for(const item of cur){
          if(item && typeof item === 'object') stack.push(item);
        }
        continue;
      }
      for(const key of Object.keys(cur)){
        const val = cur[key];
        if(val && typeof val === 'object') stack.push(val);
      }
    }
    return best.slice();
  }

  function ensureAutoEntities(s){
    bindShared();
    if(!s.masterData || typeof s.masterData !== 'object') s.masterData = { drivers:[], cars:[] };
    if(!Array.isArray(s.masterData.drivers)) s.masterData.drivers = [];
    if(!Array.isArray(s.masterData.cars)) s.masterData.cars = [];
    const legacyDrivers =
      Array.isArray(s.drivers) ? s.drivers :
      (Array.isArray(s.drivers?.drivers) ? s.drivers.drivers : []);
    const legacyCars =
      Array.isArray(s.cars) ? s.cars :
      (Array.isArray(s.cars?.cars) ? s.cars.cars : []);
    if(!s.masterData.drivers.length && legacyDrivers.length) s.masterData.drivers = legacyDrivers;
    if(!s.masterData.cars.length && legacyCars.length) s.masterData.cars = legacyCars;
    if(!s.drivers || typeof s.drivers !== 'object') s.drivers = { drivers: s.masterData.drivers };
    if(!Array.isArray(s.drivers.drivers)) s.drivers.drivers = s.masterData.drivers;
    if(!s.cars || typeof s.cars !== 'object') s.cars = { cars: s.masterData.cars };
    if(!Array.isArray(s.cars.cars)) s.cars.cars = s.masterData.cars;
    if(typeof s.settings?.allowIdleReads !== 'boolean') s.settings.allowIdleReads = false;
    s.settings.lapTimeSource = 'mrc';
    if(typeof s.ui?.freeDrivingEnabled !== 'boolean') s.ui.freeDrivingEnabled = false;
    if(typeof s.session?.isFreeDriving !== 'boolean') s.session.isFreeDriving = false;
    if(!s.session) s.session = {};
    if(s.session.startedAtMrc==null) s.session.startedAtMrc = null;
    if(s.session.pausedAtMrc==null) s.session.pausedAtMrc = null;
    if(!Number.isFinite(Number(s.session.pauseAccumMrcMs))) s.session.pauseAccumMrcMs = 0;
    if(!s.session.mrcClock || typeof s.session.mrcClock!=='object') s.session.mrcClock = { lastDeviceMs:null, lastHostMs:null, syncSeen:false };
    if(!Number.isFinite(Number(s.session.mrcClock.lastDeviceMs))) s.session.mrcClock.lastDeviceMs = null;
    if(!Number.isFinite(Number(s.session.mrcClock.lastHostMs))) s.session.mrcClock.lastHostMs = null;
    if(typeof s.session.mrcClock.syncSeen !== 'boolean') s.session.mrcClock.syncSeen = false;
    if(typeof s.audio?.sayOvertakes !== 'boolean') s.audio.sayOvertakes = true;
    if(typeof s.audio?.sayLappingWarning !== 'boolean') s.audio.sayLappingWarning = true;
    if(typeof s.audio?.sayPositionsAtRest !== 'boolean') s.audio.sayPositionsAtRest = true;
    if(typeof s.audio?.positionsSpeechLimit !== 'string') s.audio.positionsSpeechLimit = 'all';
    if(!['all','top5','top3'].includes(String(s.audio.positionsSpeechLimit).toLowerCase())) s.audio.positionsSpeechLimit = 'all';
    if(!Number.isFinite(Number(s.audio?.lappingWarnSec))) s.audio.lappingWarnSec = 3;
    // season
    if(!s.season?.seasons?.length){
      const year = new Date().getFullYear();
const id = safeUid('season');
s.season = { seasons:[{id,name:'Saison '+year,status:'active',createdAt:safeNow(),endedAt:null}], activeSeasonId:id };
    }
    if(!s.season.activeSeasonId) s.season.activeSeasonId = s.season.seasons.find(x=>x.status==='active')?.id || s.season.seasons[0].id;

    // tracks
    if(!s.tracks?.tracks?.length){
      const id = safeUid('track');
      const activeSeasonId = s.season?.activeSeasonId || safeUid('season');
      s.tracks = {
        tracks:[{
          id,
          name:'Standard Strecke',
          minLapMs:3000,
          setup:{mode:'Schnell',tireWear:'Aus',boost:false},
          recordsBySeason:{ [activeSeasonId]:{ ms:null, driverName:'', carName:'' } }
        }],
        activeTrackId:id
      };
    }
    if(!s.tracks.activeTrackId) s.tracks.activeTrackId = s.tracks.tracks[0].id;
    s.tracks.tracks.forEach(t=>{
      if(!t.setup) t.setup = {mode:'Schnell', tireWear:'Aus', boost:false};
      if(!Number.isFinite(Number(t.displayLengthMeters))) t.displayLengthMeters = Number(t.displayLength)||0;
      if(!Number.isFinite(Number(t.lengthMeters))) t.lengthMeters = t.displayLengthMeters;
      if(!Number.isFinite(Number(t.trackLengthMeters))) t.trackLengthMeters = t.displayLengthMeters;
    });

    // race day
    if(!s.raceDay?.raceDays?.length){
      const id = safeUid('raceday');
      s.raceDay = {
        raceDays:[{
          id,
          name:'Renntag '+new Date().toLocaleDateString('de-DE'),
          seasonId:s.season.activeSeasonId,
          trackId:s.tracks.activeTrackId,
          createdAt:safeNow(),
          races:[],
          trackRecordsByTrackId:{}
        }],
        activeRaceDayId:id
      };
    }
    if(!s.raceDay.activeRaceDayId) s.raceDay.activeRaceDayId = s.raceDay.raceDays[0].id;

    for(const rd of s.raceDay.raceDays){
      if(!Array.isArray(rd.races)) rd.races = [];
      if(!rd.trackRecordsByTrackId || typeof rd.trackRecordsByTrackId!=='object') rd.trackRecordsByTrackId = {};
    }
  }

  function loadState(){
    bindShared();
    try{
      const raw = localStorage.getItem(LS_KEY);
      if(!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const localProjectMirror = loadLocalProjectStateMirror();
      if(localProjectMirror && typeof localProjectMirror === 'object'){
        const mergeKeys = ['settings','ui','transport','masterData','raceDay','season','tracks','session','personalRecords','modes','audio','media'];
        for(const key of mergeKeys){
          if(parsed[key] == null && localProjectMirror[key] != null){
            parsed[key] = JSON.parse(JSON.stringify(localProjectMirror[key]));
          }
        }
        if((!parsed.masterData || typeof parsed.masterData !== 'object' || ((!Array.isArray(parsed.masterData.drivers) || !parsed.masterData.drivers.length) && (!Array.isArray(parsed.masterData.cars) || !parsed.masterData.cars.length))) && localProjectMirror.masterData){
          parsed.masterData = JSON.parse(JSON.stringify(localProjectMirror.masterData));
        }
        if((!parsed.raceDay || !Array.isArray(parsed.raceDay.raceDays) || !parsed.raceDay.raceDays.length) && localProjectMirror.raceDay){
          parsed.raceDay = JSON.parse(JSON.stringify(localProjectMirror.raceDay));
        }
        if((!parsed.season || !Array.isArray(parsed.season.seasons) || !parsed.season.seasons.length) && localProjectMirror.season){
          parsed.season = JSON.parse(JSON.stringify(localProjectMirror.season));
        }
        if((!parsed.tracks || !Array.isArray(parsed.tracks.tracks) || !parsed.tracks.tracks.length) && localProjectMirror.tracks){
          parsed.tracks = JSON.parse(JSON.stringify(localProjectMirror.tracks));
        }
        if((!parsed.audio || typeof parsed.audio !== 'object') && localProjectMirror.audio){
          parsed.audio = JSON.parse(JSON.stringify(localProjectMirror.audio));
        }
      }
      const localChunkMirror = loadLocalStateChunkMirror();
      if(localChunkMirror && typeof localChunkMirror === 'object'){
        if((!parsed.masterData || typeof parsed.masterData !== 'object' || ((!Array.isArray(parsed.masterData.drivers) || !parsed.masterData.drivers.length) && (!Array.isArray(parsed.masterData.cars) || !parsed.masterData.cars.length))) && !isStateChunkEmpty('masterData', localChunkMirror.masterData)){
          parsed.masterData = JSON.parse(JSON.stringify(localChunkMirror.masterData));
        }
        if((!parsed.raceDay || !Array.isArray(parsed.raceDay.raceDays) || !parsed.raceDay.raceDays.length) && !isStateChunkEmpty('raceDay', localChunkMirror.raceDay)){
          parsed.raceDay = JSON.parse(JSON.stringify(localChunkMirror.raceDay));
        }
        if((!parsed.season || !Array.isArray(parsed.season.seasons) || !parsed.season.seasons.length) && !isStateChunkEmpty('season', localChunkMirror.season)){
          parsed.season = JSON.parse(JSON.stringify(localChunkMirror.season));
        }
        if((!parsed.tracks || !Array.isArray(parsed.tracks.tracks) || !parsed.tracks.tracks.length) && !isStateChunkEmpty('tracks', localChunkMirror.tracks)){
          parsed.tracks = JSON.parse(JSON.stringify(localChunkMirror.tracks));
        }
        if((!parsed.personalRecords || typeof parsed.personalRecords !== 'object') && !isStateChunkEmpty('personalRecords', localChunkMirror.personalRecords)){
          parsed.personalRecords = JSON.parse(JSON.stringify(localChunkMirror.personalRecords));
        }
        if(!isStateChunkEmpty('enduranceStints', localChunkMirror.enduranceStints)){
          parsed.modes = parsed.modes || {};
          parsed.modes.endurance = parsed.modes.endurance || {};
          if(!parsed.modes.endurance.stintHistoryByRace || !Object.keys(parsed.modes.endurance.stintHistoryByRace).length){
            parsed.modes.endurance.stintHistoryByRace = JSON.parse(JSON.stringify(localChunkMirror.enduranceStints));
          }
        }
      }
      const legacyDrivers =
        Array.isArray(parsed?.drivers) ? parsed.drivers :
        (Array.isArray(parsed?.drivers?.drivers) ? parsed.drivers.drivers : []);
      const legacyCars =
        Array.isArray(parsed?.cars) ? parsed.cars :
        (Array.isArray(parsed?.cars?.cars) ? parsed.cars.cars : []);
      const discoveredDrivers = legacyDrivers.length ? legacyDrivers : findLegacyEntityArray(parsed, 'drivers');
      const discoveredCars = legacyCars.length ? legacyCars : findLegacyEntityArray(parsed, 'cars');
      if((discoveredDrivers.length || discoveredCars.length) && (!parsed.masterData || typeof parsed.masterData !== 'object')){
        parsed.masterData = { drivers: discoveredDrivers.slice(), cars: discoveredCars.slice() };
      }else if(parsed.masterData){
        if((!Array.isArray(parsed.masterData.drivers) || !parsed.masterData.drivers.length) && discoveredDrivers.length){
          parsed.masterData.drivers = discoveredDrivers.slice();
        }
        if((!Array.isArray(parsed.masterData.cars) || !parsed.masterData.cars.length) && discoveredCars.length){
          parsed.masterData.cars = discoveredCars.slice();
        }
      }
      const merged = deepMerge(defaultState(), parsed);
      ensureAutoEntities(merged);
      // Migration/Defaults
      if(!merged.audio) merged.audio = defaultState().audio;
      if(typeof merged.audio.decimals!=='number' || !Number.isFinite(merged.audio.decimals)) merged.audio.decimals = 3;
      merged.audio.decimals = Math.max(0, Math.min(3, Math.trunc(merged.audio.decimals)));
      if(typeof merged.audio.restAnnouncementsEnabled!=='boolean') merged.audio.restAnnouncementsEnabled = true;
      if(!Array.isArray(merged.audio.restAnnouncementTimes)) merged.audio.restAnnouncementTimes = [300,180,120,60,30];
      merged.audio.restAnnouncementTimes = merged.audio.restAnnouncementTimes.map(x=>parseInt(x,10)).filter(x=>Number.isFinite(x) && x>0).sort((a,b)=>b-a);
      if(typeof merged.audio.sayTimeExpired!=='boolean') merged.audio.sayTimeExpired = true;
      if(typeof merged.audio.sayFinished!=='boolean') merged.audio.sayFinished = true;
      if(typeof merged.audio.sayRunFinished!=='boolean') merged.audio.sayRunFinished = true;
      if(typeof merged.audio.sayPlacements!=='boolean') merged.audio.sayPlacements = true;
      if(typeof merged.audio.sayTrackRecordSeason!=='boolean') merged.audio.sayTrackRecordSeason = true;
      if(typeof merged.audio.sayTrackRecordDay!=='boolean') merged.audio.sayTrackRecordDay = true;
      if(typeof merged.audio.positionsSpeechLimit!=='string') merged.audio.positionsSpeechLimit = 'all';
      if(!['all','top5','top3'].includes(String(merged.audio.positionsSpeechLimit).toLowerCase())) merged.audio.positionsSpeechLimit = 'all';
      else merged.audio.positionsSpeechLimit = String(merged.audio.positionsSpeechLimit).toLowerCase();
      if(!merged.modes.team) merged.modes.team = { finishMode:'time', timeLimitSec:180, lapLimit:20, selectedDriverIds:[], teams:[] };
      if(!merged.modes.team.finishMode) merged.modes.team.finishMode = 'time';
      if(!Number.isFinite(Number(merged.modes.team.timeLimitSec))) merged.modes.team.timeLimitSec = 180;
      if(!Number.isFinite(Number(merged.modes.team.lapLimit))) merged.modes.team.lapLimit = 20;
      if(!merged.modes.team.pointsScheme) merged.modes.team.pointsScheme = '10,8,6,5,4,3,2,1';
      if(!merged.modes.endurance) merged.modes.endurance = { durationMin:30, lapsLimit:0, minStintLaps:5, maxStintLaps:0, penaltySecondsPerViolation:0, penaltyLapThresholdSeconds:0, penaltyLapsPerThreshold:1, activeByTeamId:{}, stintHistoryByRace:{}, teams:[] };
      if(!Number.isFinite(Number(merged.modes.endurance.maxStintLaps))) merged.modes.endurance.maxStintLaps = 0;
      if(!Number.isFinite(Number(merged.modes.endurance.minStintLaps))) merged.modes.endurance.minStintLaps = 5;
      if(!Number.isFinite(Number(merged.modes.endurance.penaltySecondsPerViolation))) merged.modes.endurance.penaltySecondsPerViolation = 0;
      if(!Number.isFinite(Number(merged.modes.endurance.penaltyLapThresholdSeconds))) merged.modes.endurance.penaltyLapThresholdSeconds = 0;
      if(!Number.isFinite(Number(merged.modes.endurance.penaltyLapsPerThreshold))) merged.modes.endurance.penaltyLapsPerThreshold = 1;
      if(!merged.modes.endurance.activeByTeamId || typeof merged.modes.endurance.activeByTeamId!=='object') merged.modes.endurance.activeByTeamId = {};
      if(!merged.modes.endurance.stintHistoryByRace || typeof merged.modes.endurance.stintHistoryByRace!=='object') merged.modes.endurance.stintHistoryByRace = {};
      if(typeof merged.audio.sayPersonalBestSeason!=='boolean') merged.audio.sayPersonalBestSeason = true;
      if(typeof merged.audio.sayPersonalBestDay!=='boolean') merged.audio.sayPersonalBestDay = true;
      if(!Array.isArray(merged.audio.library)) merged.audio.library = [];
      if(typeof merged.audio.targetDb!=='number' || !Number.isFinite(merged.audio.targetDb)) merged.audio.targetDb = -16;
      if(typeof merged.audio.defaultDriverSoundId!=='string') merged.audio.defaultDriverSoundId = '';
      if(typeof merged.ui.audioSelectedId!=='string') merged.ui.audioSelectedId = '';
      if(typeof merged.ui.audioFilterCategory!=='string') merged.ui.audioFilterCategory = '';
      if(typeof merged.ui.audioSearch!=='string') merged.ui.audioSearch = '';
      if(!merged.ui.storageHealth || typeof merged.ui.storageHealth !== 'object') merged.ui.storageHealth = makeStorageHealthDefaults();
      if(typeof merged.settings?.discordAutoSend!=='boolean') merged.settings.discordAutoSend = false;
      if(typeof merged.settings?.language!=='string') merged.settings.language = 'de';
      if(typeof merged.settings?.projectDataFolderName!=='string') merged.settings.projectDataFolderName = '';
      if(typeof merged.settings?.discordUseThread!=='boolean') merged.settings.discordUseThread = false;
      if(typeof merged.settings?.discordThreadName!=='string') merged.settings.discordThreadName = '';
      if(typeof merged.settings?.discordRaceDayWebhook!=='string') merged.settings.discordRaceDayWebhook = '';
      if(typeof merged.settings?.discordSeasonWebhook!=='string') merged.settings.discordSeasonWebhook = '';
      if(typeof merged.settings?.discordRaceDayUseThread!=='boolean') merged.settings.discordRaceDayUseThread = false;
      if(typeof merged.settings?.discordSeasonUseThread!=='boolean') merged.settings.discordSeasonUseThread = false;
      if(typeof merged.settings?.discordRaceDayThreadName!=='string') merged.settings.discordRaceDayThreadName = '{type} • {date}';
      if(typeof merged.settings?.discordSeasonThreadName!=='string') merged.settings.discordSeasonThreadName = '{type} • {season}';
      if(typeof merged.settings?.obsEnabled!=='boolean') merged.settings.obsEnabled = false;
      if(typeof merged.settings?.obsHost!=='string') merged.settings.obsHost = '127.0.0.1';
      if(!Number.isFinite(Number(merged.settings?.obsPort))) merged.settings.obsPort = 4455;
      if(typeof merged.settings?.obsPassword!=='string') merged.settings.obsPassword = '';
      if(typeof merged.settings?.obsSceneTraining!=='string') merged.settings.obsSceneTraining = '';
      if(typeof merged.settings?.obsSceneQualifying!=='string') merged.settings.obsSceneQualifying = '';
      if(typeof merged.settings?.obsSceneRace!=='string') merged.settings.obsSceneRace = '';
      if(typeof merged.settings?.obsScenePodium!=='string') merged.settings.obsScenePodium = '';
      if(!merged.media) merged.media = { driverAvatars:{} };
      if(!merged.media.driverAvatars) merged.media.driverAvatars = {};
      if(!merged.modes?.team?.teams) merged.modes.team.teams = defaultState().modes.team.teams;
      if(!merged.modes?.endurance?.teams) merged.modes.endurance.teams = defaultState().modes.endurance.teams;
      if(!merged.modes?.single) merged.modes.single = defaultState().modes.single;
      if(!merged.modes.single.finishMode) merged.modes.single.finishMode = defaultState().modes.single.finishMode;
      if(typeof merged.modes.single.timeLimitSec!=='number') merged.modes.single.timeLimitSec = defaultState().modes.single.timeLimitSec;
      if(typeof merged.modes.single.lapLimit!=='number') merged.modes.single.lapLimit = defaultState().modes.single.lapLimit;
      if(typeof merged.ble?.knownDeviceId!=='string') merged.ble.knownDeviceId = '';
      if(typeof merged.ble?.knownDeviceName!=='string') merged.ble.knownDeviceName = '';
      if(typeof merged.ble?.autoReconnect!=='boolean') merged.ble.autoReconnect = true;
      // Nach Reload niemals einen alten Verbindungsstatus weitertragen.
      merged.ble.connected = false;
      merged.ble.notify = false;
      merged.ble.lastError = '';
      if(typeof merged.ble?.info !== 'string') merged.ble.info = '';

      
      // Migration: Dauerschleife Minuten-Settings (falls alte Sekunden vorhanden)
      if(!merged.modes.loop) merged.modes.loop = {};
      const dLoop = defaultState().modes.loop;
      if(typeof merged.modes.loop.trainingMin!=='number'){
        if(typeof merged.modes.loop.trainingSec==='number') merged.modes.loop.trainingMin = Math.max(0, merged.modes.loop.trainingSec/60);
        else merged.modes.loop.trainingMin = dLoop.trainingMin;
      }
      if(typeof merged.modes.loop.setupMin!=='number') merged.modes.loop.setupMin = dLoop.setupMin;
      if(typeof merged.modes.loop.raceMin!=='number'){
        if(typeof merged.modes.loop.raceSec==='number') merged.modes.loop.raceMin = Math.max(0, merged.modes.loop.raceSec/60);
        else merged.modes.loop.raceMin = dLoop.raceMin;
      }
      if(typeof merged.modes.loop.podiumMin!=='number') merged.modes.loop.podiumMin = dLoop.podiumMin;
// Migration: season-basierte Streckenrekorde
      const sid = merged?.season?.activeSeasonId || (merged.season && merged.season.seasons && merged.season.seasons[0]?.id) || null;
      if(merged.tracks && Array.isArray(merged.tracks.tracks)){
        merged.tracks.tracks.forEach(t=>{
          if(!t) return;
          if(!t.recordsBySeason) t.recordsBySeason = {};
          // alte Struktur "record" migrieren
          if(t.record && sid && !t.recordsBySeason[sid]){
            t.recordsBySeason[sid] = { ms: t.record.ms ?? null, driverName: t.record.driverName || '', carName: t.record.carName || '' };
          }
          // record entfernen lassen wir drin für Rückwärts-Kompatibilität, wird aber nicht mehr genutzt
        });
      }
      
      if(!merged.personalRecords || typeof merged.personalRecords!=='object') merged.personalRecords = {bySeason:{}, byRaceDay:{}};
      if(!merged.personalRecords.bySeason) merged.personalRecords.bySeason = {};
      if(!merged.personalRecords.byRaceDay) merged.personalRecords.byRaceDay = {};
      if(!merged.masterData) merged.masterData = {drivers:[], cars:[]};
      if(!Array.isArray(merged.masterData.drivers)) merged.masterData.drivers = [];
      if(!Array.isArray(merged.masterData.cars)) merged.masterData.cars = [];
      if(!merged.masterData.drivers.length && discoveredDrivers.length) merged.masterData.drivers = discoveredDrivers.slice();
      if(!merged.masterData.cars.length && discoveredCars.length) merged.masterData.cars = discoveredCars.slice();
      ensureStorageHealthObject(merged);
      return merged;
    }catch{
      return defaultState();
    }
  }

  let state = loadState();
  ensureAutoEntities(state);
  ensureStorageHealthObject(state);

  function replaceStateInPlace(nextState){
    const target = state && typeof state === 'object' ? state : {};
    for(const key of Object.keys(target)) delete target[key];
    Object.assign(target, nextState && typeof nextState === 'object' ? nextState : {});
    state = target;
    return state;
  }

  function getState(){
    return state;
  }

  let _appDataDbPromise = null;
  let _appDataPersistTimer = null;
  let _appDataPersistInFlight = null;
  let _appDataHydrated = false;
  let _projectStatePersistTimer = null;
  let _projectStatePersistInFlight = null;

  function idbRequestToPromise(req){
    bindShared();
    return new Promise((resolve, reject)=>{
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error || new Error('IndexedDB request failed'));
    });
  }

  function getAppDataDb(){
    bindShared();
    if(_appDataDbPromise) return _appDataDbPromise;
    _appDataDbPromise = new Promise((resolve, reject)=>{
      try{
        const req = indexedDB.open(APP_DATA_DB_NAME, APP_DATA_DB_VERSION);
        req.onupgradeneeded = ()=>{
          const db = req.result;
          if(!db.objectStoreNames.contains(APP_DATA_AVATAR_STORE)) db.createObjectStore(APP_DATA_AVATAR_STORE, { keyPath:'driverId' });
          if(!db.objectStoreNames.contains(APP_DATA_SESSION_LAPS_STORE)) db.createObjectStore(APP_DATA_SESSION_LAPS_STORE, { keyPath:'id' });
          if(!db.objectStoreNames.contains(APP_DATA_IDLE_LAPS_STORE)) db.createObjectStore(APP_DATA_IDLE_LAPS_STORE, { keyPath:'id' });
          if(!db.objectStoreNames.contains(APP_DATA_STATE_CHUNK_STORE)) db.createObjectStore(APP_DATA_STATE_CHUNK_STORE, { keyPath:'chunkKey' });
          if(!db.objectStoreNames.contains(APP_DATA_DISCORD_QUEUE_STORE)) db.createObjectStore(APP_DATA_DISCORD_QUEUE_STORE, { keyPath:'id' });
          if(!db.objectStoreNames.contains(APP_DATA_FS_HANDLE_STORE)) db.createObjectStore(APP_DATA_FS_HANDLE_STORE, { keyPath:'key' });
        };
        req.onsuccess = ()=>resolve(req.result);
        req.onerror = ()=>reject(req.error || new Error('IndexedDB open failed'));
      }catch(err){
        reject(err);
      }
    });
    return _appDataDbPromise;
  }

  function buildExternalAppDataSnapshot(srcState=state){
    bindShared();
    return {
      driverAvatars: { ...((srcState.media && srcState.media.driverAvatars) || {}) },
      laps: Array.isArray(srcState.session?.laps) ? srcState.session.laps.map(l=>({ ...l })) : [],
      idleLaps: Array.isArray(srcState.session?.idleLaps) ? srcState.session.idleLaps.map(l=>({ ...l })) : []
    };
  }

  function buildExternalStateChunkSnapshot(srcState=state){
    bindShared();
    return {
      masterData: JSON.parse(JSON.stringify(srcState.masterData || { drivers:[], cars:[] })),
      raceDay: JSON.parse(JSON.stringify(srcState.raceDay || { raceDays:[], activeRaceDayId:'' })),
      season: JSON.parse(JSON.stringify(srcState.season || { seasons:[], activeSeasonId:'' })),
      tracks: JSON.parse(JSON.stringify(srcState.tracks || { tracks:[], activeTrackId:'' })),
      personalRecords: JSON.parse(JSON.stringify(srcState.personalRecords || { bySeason:{}, byRaceDay:{} })),
      enduranceStints: JSON.parse(JSON.stringify(srcState.modes?.endurance?.stintHistoryByRace || {}))
    };
  }

  function isStateChunkEmpty(chunkKey, value){
    bindShared();
    switch(String(chunkKey || '')){
      case 'masterData':
        return !Array.isArray(value?.drivers) || value.drivers.length===0
          ? (!Array.isArray(value?.cars) || value.cars.length===0)
          : false;
      case 'raceDay':
        return !Array.isArray(value?.raceDays) || value.raceDays.length===0;
      case 'season':
        return !Array.isArray(value?.seasons) || value.seasons.length===0;
      case 'tracks':
        return !Array.isArray(value?.tracks) || value.tracks.length===0;
      case 'personalRecords':
        return !Object.keys(value?.bySeason || {}).length && !Object.keys(value?.byRaceDay || {}).length;
      case 'enduranceStints':
        return !Object.keys(value || {}).length;
      default:
        return value == null;
    }
  }

  function buildSlimPersistedState(){
    bindShared();
    return {
      ...state,
      masterData: {
        drivers: [],
        cars: []
      },
      media: {
        ...(state.media || {}),
        driverAvatars: {}
      },
      personalRecords: {
        bySeason: {},
        byRaceDay: {}
      },
      season: {
        ...(state.season || {}),
        seasons: []
      },
      tracks: {
        ...(state.tracks || {}),
        tracks: []
      },
      raceDay: {
        ...(state.raceDay || {}),
        raceDays: []
      },
      modes: {
        ...(state.modes || {}),
        endurance: {
          ...((state.modes && state.modes.endurance) || {}),
          stintHistoryByRace: {}
        }
      },
      session: {
        ...(state.session || {}),
        laps: [],
        idleLaps: []
      }
    };
  }

  function buildLocalProjectStateMirror(srcState=state){
    bindShared();
    const files = buildProjectStateFilesSnapshot(srcState);
    if(files.session && typeof files.session === 'object'){
      files.session = {
        ...files.session,
        laps: [],
        idleLaps: []
      };
    }
    delete files.audioAssets;
    return files;
  }

  function replaceObjectStoreData(tx, storeName, rows){
    bindShared();
    const store = tx.objectStore(storeName);
    store.clear();
    for(const row of (rows || [])){
      if(row) store.put(row);
    }
  }

  async function persistExternalAppDataSnapshot(snapshot){
    bindShared();
    const db = await getAppDataDb();
    await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_AVATAR_STORE, APP_DATA_SESSION_LAPS_STORE, APP_DATA_IDLE_LAPS_STORE], 'readwrite');
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error('IndexedDB write failed'));
      tx.onabort = ()=>reject(tx.error || new Error('IndexedDB write aborted'));
      replaceObjectStoreData(tx, APP_DATA_AVATAR_STORE, Object.entries(snapshot.driverAvatars || {}).map(([driverId, dataUrl])=>({ driverId, dataUrl })));
      replaceObjectStoreData(tx, APP_DATA_SESSION_LAPS_STORE, snapshot.laps || []);
      replaceObjectStoreData(tx, APP_DATA_IDLE_LAPS_STORE, snapshot.idleLaps || []);
    });
  }

  async function persistExternalStateChunkSnapshot(snapshot){
    bindShared();
    const db = await getAppDataDb();
    await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_STATE_CHUNK_STORE], 'readwrite');
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error('IndexedDB chunk write failed'));
      tx.onabort = ()=>reject(tx.error || new Error('IndexedDB chunk write aborted'));
      replaceObjectStoreData(tx, APP_DATA_STATE_CHUNK_STORE, Object.entries(snapshot || {}).map(([chunkKey, value])=>({ chunkKey, value })));
    });
  }

  async function readAllFromObjectStore(tx, storeName){
    bindShared();
    const store = tx.objectStore(storeName);
    return await idbRequestToPromise(store.getAll());
  }

  async function loadExternalAppDataSnapshot(){
    bindShared();
    const db = await getAppDataDb();
    return await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_AVATAR_STORE, APP_DATA_SESSION_LAPS_STORE, APP_DATA_IDLE_LAPS_STORE], 'readonly');
      const out = { driverAvatars:{}, laps:[], idleLaps:[] };
      Promise.all([
        readAllFromObjectStore(tx, APP_DATA_AVATAR_STORE),
        readAllFromObjectStore(tx, APP_DATA_SESSION_LAPS_STORE),
        readAllFromObjectStore(tx, APP_DATA_IDLE_LAPS_STORE)
      ]).then(([avatars, laps, idleLaps])=>{
        for(const row of avatars || []){
          if(row?.driverId && row?.dataUrl) out.driverAvatars[row.driverId] = row.dataUrl;
        }
        out.laps = Array.isArray(laps) ? laps : [];
        out.idleLaps = Array.isArray(idleLaps) ? idleLaps : [];
      }).catch(reject);
      tx.oncomplete = ()=>resolve(out);
      tx.onerror = ()=>reject(tx.error || new Error('IndexedDB read failed'));
      tx.onabort = ()=>reject(tx.error || new Error('IndexedDB read aborted'));
    });
  }

  async function loadExternalStateChunkSnapshot(){
    bindShared();
    const db = await getAppDataDb();
    return await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_STATE_CHUNK_STORE], 'readonly');
      const out = {
        masterData: { drivers:[], cars:[] },
        raceDay: { raceDays:[], activeRaceDayId:'' },
        season: { seasons:[], activeSeasonId:'' },
        tracks: { tracks:[], activeTrackId:'' },
        personalRecords: { bySeason:{}, byRaceDay:{} },
        enduranceStints: {}
      };
      readAllFromObjectStore(tx, APP_DATA_STATE_CHUNK_STORE).then((rows)=>{
        for(const row of rows || []){
          if(!row?.chunkKey) continue;
          out[row.chunkKey] = row.value;
        }
      }).catch(reject);
      tx.oncomplete = ()=>resolve(out);
      tx.onerror = ()=>reject(tx.error || new Error('IndexedDB chunk read failed'));
      tx.onabort = ()=>reject(tx.error || new Error('IndexedDB chunk read aborted'));
    });
  }

  function scheduleExternalAppDataPersist(){
    bindShared();
    if(_appDataPersistTimer) clearTimeout(_appDataPersistTimer);
    _appDataPersistTimer = setTimeout(()=>{
      _appDataPersistTimer = null;
      const snapshot = buildExternalAppDataSnapshot();
      const chunkSnapshot = buildExternalStateChunkSnapshot();
      const run = async ()=>{
        try{
          await persistExternalAppDataSnapshot(snapshot);
          await persistExternalStateChunkSnapshot(chunkSnapshot);
        }catch(err){
          logLine('AppData Persist Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      };
      _appDataPersistInFlight = run().finally(()=>{
        if(_appDataPersistInFlight && typeof _appDataPersistInFlight.finally === 'function'){
          _appDataPersistInFlight = null;
        }
      });
    }, 350);
  }

  async function flushExternalAppDataPersist(){
    bindShared();
    if(_appDataPersistTimer){
      clearTimeout(_appDataPersistTimer);
      _appDataPersistTimer = null;
      try{
        await persistExternalAppDataSnapshot(buildExternalAppDataSnapshot());
        await persistExternalStateChunkSnapshot(buildExternalStateChunkSnapshot());
      }catch(err){
        logLine('AppData Persist Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }
      return;
    }
    if(_appDataPersistInFlight) await _appDataPersistInFlight;
  }

  async function clearExternalAppDataStores(){
    bindShared();
    try{
      if(_appDataPersistTimer){
        clearTimeout(_appDataPersistTimer);
        _appDataPersistTimer = null;
      }
      _appDataPersistInFlight = null;
      const db = await getAppDataDb();
      await new Promise((resolve, reject)=>{
        const tx = db.transaction([APP_DATA_AVATAR_STORE, APP_DATA_SESSION_LAPS_STORE, APP_DATA_IDLE_LAPS_STORE, APP_DATA_STATE_CHUNK_STORE, APP_DATA_DISCORD_QUEUE_STORE], 'readwrite');
        tx.oncomplete = ()=>resolve();
        tx.onerror = ()=>reject(tx.error || new Error('IndexedDB clear failed'));
        tx.onabort = ()=>reject(tx.error || new Error('IndexedDB clear aborted'));
        tx.objectStore(APP_DATA_AVATAR_STORE).clear();
        tx.objectStore(APP_DATA_SESSION_LAPS_STORE).clear();
        tx.objectStore(APP_DATA_IDLE_LAPS_STORE).clear();
        tx.objectStore(APP_DATA_STATE_CHUNK_STORE).clear();
        tx.objectStore(APP_DATA_DISCORD_QUEUE_STORE).clear();
      });
    }catch(err){
      logLine('AppData Clear Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
    }
  }

  async function hydrateExternalAppData(){
    bindShared();
    const projectState = await loadProjectStateSnapshot();
    if(projectState){
      if(isRestoreStateCandidate(projectState)){
        const mergedProjectState = deepMerge(state, projectState);
        ensureAutoEntities(mergedProjectState);
        replaceStateInPlace(mergedProjectState);
      }
      if(Array.isArray(projectState.audioAssets)){
        await replaceProjectAudioAssets(projectState.audioAssets);
      }
    }
    const legacyDriverAvatars = { ...((state.media && state.media.driverAvatars) || {}) };
    for(const driver of (state.masterData?.drivers || [])){
      const legacyPhoto = String(driver?.photoDataUrl || '').trim();
      if(legacyPhoto && !legacyDriverAvatars[driver.id]) legacyDriverAvatars[driver.id] = legacyPhoto;
      if(legacyPhoto) driver.photoDataUrl = '';
    }
    const legacySnapshot = {
      driverAvatars: legacyDriverAvatars,
      laps: Array.isArray(state.session?.laps) ? state.session.laps.slice() : [],
      idleLaps: Array.isArray(state.session?.idleLaps) ? state.session.idleLaps.slice() : []
    };
    const localChunkMirror = loadLocalStateChunkMirror();
    let legacyChunkSnapshot = buildExternalStateChunkSnapshot();
    if(localChunkMirror && typeof localChunkMirror === 'object'){
      for(const [chunkKey, value] of Object.entries(localChunkMirror)){
        if(isStateChunkEmpty(chunkKey, legacyChunkSnapshot[chunkKey]) && !isStateChunkEmpty(chunkKey, value)){
          legacyChunkSnapshot[chunkKey] = JSON.parse(JSON.stringify(value));
        }
      }
    }
    const hasLegacy = Object.keys(legacySnapshot.driverAvatars).length || legacySnapshot.laps.length || legacySnapshot.idleLaps.length;
    const hasLegacyChunks = Object.entries(legacyChunkSnapshot).some(([chunkKey, value])=>!isStateChunkEmpty(chunkKey, value));
    let externalSnapshot = { driverAvatars:{}, laps:[], idleLaps:[] };
    let externalChunks = {
      masterData: state.masterData || { drivers:[], cars:[] },
      raceDay: state.raceDay || { raceDays:[], activeRaceDayId:'' },
      season: state.season || { seasons:[], activeSeasonId:'' },
      tracks: state.tracks || { tracks:[], activeTrackId:'' },
      personalRecords: state.personalRecords || { bySeason:{}, byRaceDay:{} },
      enduranceStints: state.modes?.endurance?.stintHistoryByRace || {}
    };
    try{
      externalSnapshot = await loadExternalAppDataSnapshot();
      externalChunks = await loadExternalStateChunkSnapshot();
    }catch(err){
      logLine('AppData Laden Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      return;
    }
    const hasExternal = Object.keys(externalSnapshot.driverAvatars).length || externalSnapshot.laps.length || externalSnapshot.idleLaps.length;
    const hasExternalChunks = Object.entries(externalChunks).some(([chunkKey, value])=>!isStateChunkEmpty(chunkKey, value));
    if(!hasExternal && hasLegacy){
      externalSnapshot = legacySnapshot;
      await persistExternalAppDataSnapshot(externalSnapshot);
    }
    if(!hasExternalChunks && hasLegacyChunks){
      externalChunks = legacyChunkSnapshot;
      await persistExternalStateChunkSnapshot(externalChunks);
    }
    state.media = state.media || {};
    state.session = state.session || {};
    state.masterData = !isStateChunkEmpty('masterData', externalChunks.masterData) ? externalChunks.masterData : (state.masterData || { drivers:[], cars:[] });
    state.raceDay = !isStateChunkEmpty('raceDay', externalChunks.raceDay) ? externalChunks.raceDay : (state.raceDay || { raceDays:[], activeRaceDayId:'' });
    state.season = !isStateChunkEmpty('season', externalChunks.season) ? externalChunks.season : (state.season || { seasons:[], activeSeasonId:'' });
    state.tracks = !isStateChunkEmpty('tracks', externalChunks.tracks) ? externalChunks.tracks : (state.tracks || { tracks:[], activeTrackId:'' });
    state.personalRecords = !isStateChunkEmpty('personalRecords', externalChunks.personalRecords) ? externalChunks.personalRecords : (state.personalRecords || { bySeason:{}, byRaceDay:{} });
    state.modes = state.modes || {};
    state.modes.endurance = state.modes.endurance || {};
    state.modes.endurance.stintHistoryByRace = !isStateChunkEmpty('enduranceStints', externalChunks.enduranceStints) ? externalChunks.enduranceStints : (state.modes.endurance.stintHistoryByRace || {});
    state.media.driverAvatars = externalSnapshot.driverAvatars || {};
    state.session.laps = Array.isArray(externalSnapshot.laps) ? externalSnapshot.laps : [];
    state.session.idleLaps = Array.isArray(externalSnapshot.idleLaps) ? externalSnapshot.idleLaps : [];
    ensureAutoEntities(state);
    _appDataHydrated = true;
    saveState();
  }

  function saveState(){
    bindShared();
    const ts = safeNow();
    try{
      ensureAutoEntities(state);
      const storage = ensureStorageHealthObject(state);
      storage.lastLocalSaveAt = ts;
      storage.lastLocalSaveOk = true;
      storage.lastLocalSaveError = '';
      storage.localSaveCount = Math.max(0, Number(storage.localSaveCount || 0)) + 1;
      localStorage.setItem(LS_KEY, JSON.stringify(buildSlimPersistedState()));
      saveLocalStateChunkMirror(buildExternalStateChunkSnapshot());
      saveLocalProjectStateMirror(buildLocalProjectStateMirror());
      scheduleProjectStatePersist(buildFullExportState());
    }catch(err){
      const storage = ensureStorageHealthObject(state);
      storage.lastLocalSaveAt = ts;
      storage.lastLocalSaveOk = false;
      storage.lastLocalSaveError = String(err?.message || err || 'local_save_failed');
      logLine('State Save Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
    }
    if(_appDataHydrated) scheduleExternalAppDataPersist();
  }

  function loadLocalStateChunkMirror(){
    bindShared();
    try{
      const raw = localStorage.getItem(LS_STATE_CHUNKS_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    }catch{
      return null;
    }
  }

  function saveLocalStateChunkMirror(snapshot){
    bindShared();
    try{
      localStorage.setItem(LS_STATE_CHUNKS_KEY, JSON.stringify(snapshot || {}));
    }catch{}
  }

  function loadLocalProjectStateMirror(){
    bindShared();
    try{
      const raw = localStorage.getItem(LS_PROJECT_STATE_MIRROR_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    }catch{
      return null;
    }
  }

  function saveLocalProjectStateMirror(snapshot){
    bindShared();
    try{
      localStorage.setItem(LS_PROJECT_STATE_MIRROR_KEY, JSON.stringify(snapshot || {}));
    }catch{}
  }

  async function loadProjectDirectoryHandle(){
    bindShared();
    if(typeof window.showDirectoryPicker !== 'function') return null;
    try{
      const db = await getAppDataDb();
      return await new Promise((resolve, reject)=>{
        const tx = db.transaction([APP_DATA_FS_HANDLE_STORE], 'readonly');
        const req = tx.objectStore(APP_DATA_FS_HANDLE_STORE).get('projectDataDir');
        req.onsuccess = ()=>resolve(req.result?.handle || null);
        req.onerror = ()=>reject(req.error || new Error('fs_handle_read_failed'));
      });
    }catch{
      return null;
    }
  }

  async function getProjectStateDirectoryHandle(rootHandle, create=false){
    bindShared();
    if(!rootHandle || typeof rootHandle.getDirectoryHandle !== 'function') return null;
    try{
      return await rootHandle.getDirectoryHandle(PROJECT_STATE_SUBDIR, { create: !!create });
    }catch{
      return null;
    }
  }

  async function saveProjectDirectoryHandle(handle){
    bindShared();
    if(typeof window.showDirectoryPicker !== 'function' || !handle) return false;
    const db = await getAppDataDb();
    await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_FS_HANDLE_STORE], 'readwrite');
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error('fs_handle_write_failed'));
      tx.onabort = ()=>reject(tx.error || new Error('fs_handle_write_aborted'));
      tx.objectStore(APP_DATA_FS_HANDLE_STORE).put({ key:'projectDataDir', handle });
    });
    return true;
  }

  async function ensureProjectDirectoryPermission(handle, write=false){
    bindShared();
    if(!handle || typeof handle.queryPermission !== 'function') return false;
    const mode = write ? 'readwrite' : 'read';
    try{
      if((await handle.queryPermission({ mode })) === 'granted') return true;
      return (await handle.requestPermission({ mode })) === 'granted';
    }catch{
      return false;
    }
  }

  async function chooseProjectDataDirectory(){
    bindShared();
    if(typeof window.showDirectoryPicker !== 'function') throw new Error('fs_access_not_supported');
    const handle = await window.showDirectoryPicker({ mode:'readwrite' });
    const granted = await ensureProjectDirectoryPermission(handle, true);
    if(!granted) throw new Error('fs_access_denied');
    const dataDirHandle = await getProjectStateDirectoryHandle(handle, true);
    if(!dataDirHandle) throw new Error('fs_subdir_create_failed');
    await saveProjectDirectoryHandle(handle);
    state.settings = state.settings || {};
    state.settings.projectDataFolderName = `${String(handle.name || '')}\\${PROJECT_STATE_SUBDIR}`;
    saveState();
    return handle;
  }

  function buildProjectStateFilesSnapshot(srcState=state){
    bindShared();
    const external = buildExternalAppDataSnapshot(srcState);
    const chunks = buildExternalStateChunkSnapshot(srcState);
    return {
      settings: JSON.parse(JSON.stringify(srcState.settings || {})),
      ui: JSON.parse(JSON.stringify(srcState.ui || {})),
      transport: JSON.parse(JSON.stringify({
        usb: srcState.usb || {},
        ble: srcState.ble || {}
      })),
      masterData: JSON.parse(JSON.stringify(chunks.masterData || { drivers:[], cars:[] })),
      raceDay: JSON.parse(JSON.stringify(chunks.raceDay || { raceDays:[], activeRaceDayId:'' })),
      season: JSON.parse(JSON.stringify(chunks.season || { seasons:[], activeSeasonId:'' })),
      tracks: JSON.parse(JSON.stringify(chunks.tracks || { tracks:[], activeTrackId:'' })),
      session: JSON.parse(JSON.stringify({
        ...(srcState.session || {}),
        laps: Array.isArray(external.laps) ? external.laps : [],
        idleLaps: Array.isArray(external.idleLaps) ? external.idleLaps : []
      })),
      personalRecords: JSON.parse(JSON.stringify(chunks.personalRecords || { bySeason:{}, byRaceDay:{} })),
      modes: JSON.parse(JSON.stringify({
        ...(srcState.modes || {}),
        endurance: {
          ...((srcState.modes && srcState.modes.endurance) || {}),
          stintHistoryByRace: chunks.enduranceStints || {}
        }
      })),
      audio: JSON.parse(JSON.stringify(srcState.audio || {})),
      media: JSON.parse(JSON.stringify({
        ...(srcState.media || {}),
        driverAvatars: external.driverAvatars || {}
      })),
      audioAssets: []
    };
  }

  function getAudioAssetStoreConfig(){
    bindShared();
    return {
      dbName: (typeof AUDIO_ASSET_DB_NAME === 'string' && AUDIO_ASSET_DB_NAME) ? AUDIO_ASSET_DB_NAME : 'zeitnahme2_audio_assets_v1',
      storeName: (typeof AUDIO_ASSET_STORE === 'string' && AUDIO_ASSET_STORE) ? AUDIO_ASSET_STORE : 'assets'
    };
  }

  async function openProjectAudioAssetDb(){
    bindShared();
    const cfg = getAudioAssetStoreConfig();
    return await new Promise((resolve, reject)=>{
      try{
        const req = indexedDB.open(cfg.dbName, 1);
        req.onupgradeneeded = ()=>{
          const db = req.result;
          if(!db.objectStoreNames.contains(cfg.storeName)) db.createObjectStore(cfg.storeName, { keyPath:'id' });
        };
        req.onsuccess = ()=>resolve(req.result);
        req.onerror = ()=>reject(req.error || new Error('audio_asset_db_open_failed'));
      }catch(err){
        reject(err);
      }
    });
  }

  async function readAllProjectAudioAssets(){
    bindShared();
    try{
      if(!('indexedDB' in window)) return [];
      const cfg = getAudioAssetStoreConfig();
      const db = await openProjectAudioAssetDb();
      return await new Promise((resolve,reject)=>{
        const tx = db.transaction(cfg.storeName, 'readonly');
        const req = tx.objectStore(cfg.storeName).getAll();
        req.onsuccess = ()=>resolve(Array.isArray(req.result) ? req.result : []);
        req.onerror = ()=>reject(req.error || new Error('audio_asset_db_getall_failed'));
      });
    }catch{
      return [];
    }
  }

  async function replaceProjectAudioAssets(records){
    bindShared();
    try{
      if(!('indexedDB' in window)) return false;
      const cfg = getAudioAssetStoreConfig();
      const db = await openProjectAudioAssetDb();
      return await new Promise((resolve,reject)=>{
        const tx = db.transaction(cfg.storeName, 'readwrite');
        const store = tx.objectStore(cfg.storeName);
        store.clear();
        for(const rec of (Array.isArray(records) ? records : [])){
          if(rec && rec.id && rec.dataUrl) store.put(rec);
        }
        tx.oncomplete = ()=>resolve(true);
        tx.onerror = ()=>reject(tx.error || new Error('audio_asset_db_replace_failed'));
      });
    }catch(err){
      try{ logLine('Audio-Datei-Sync Fehler: ' + String(err?.message || err || 'Unbekannter Fehler')); }catch{}
      return false;
    }
  }

  async function loadProjectStateSnapshot(){
    bindShared();
    try{
      const rootHandle = await loadProjectDirectoryHandle();
      if(!rootHandle) return null;
      const granted = await ensureProjectDirectoryPermission(rootHandle, false);
      if(!granted) return null;
      const dataDirHandle = await getProjectStateDirectoryHandle(rootHandle, false);
      if(!dataDirHandle) return null;
      const out = {};
      let foundAny = false;
      for(const [key, fileName] of Object.entries(PROJECT_STATE_FILES)){
        const fileHandle = await dataDirHandle.getFileHandle(fileName, { create:false }).catch(()=>null);
        if(!fileHandle) continue;
        const file = await fileHandle.getFile();
        const raw = await file.text();
        if(!raw.trim()) continue;
        const data = JSON.parse(raw);
        if(data && typeof data === 'object'){
          out[key] = data;
          foundAny = true;
        }
      }
      if(!foundAny) return null;
      if(out.transport && typeof out.transport === 'object'){
        if(out.transport.usb && typeof out.transport.usb === 'object') out.usb = out.transport.usb;
        if(out.transport.ble && typeof out.transport.ble === 'object') out.ble = out.transport.ble;
      }
      const merged = deepMerge(defaultState(), out);
      ensureAutoEntities(merged);
      return merged;
    }catch(err){
      try{ logLine('Projekt-Speicher Laden Fehler: ' + String(err?.message || err || 'Unbekannter Fehler')); }catch{}
      return null;
    }
  }

  async function persistProjectStateSnapshot(snapshot){
    bindShared();
    const rootHandle = await loadProjectDirectoryHandle();
    if(!rootHandle) return false;
    const granted = await ensureProjectDirectoryPermission(rootHandle, true);
    if(!granted) throw new Error('fs_access_denied');
    const dataDirHandle = await getProjectStateDirectoryHandle(rootHandle, true);
    if(!dataDirHandle) throw new Error('fs_subdir_create_failed');
    const files = buildProjectStateFilesSnapshot(snapshot || state);
    files.audioAssets = await readAllProjectAudioAssets();
    for(const [key, fileName] of Object.entries(PROJECT_STATE_FILES)){
      const fileHandle = await dataDirHandle.getFileHandle(fileName, { create:true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(files[key] || {}, null, 2));
      await writable.close();
    }
    return true;
  }

  function scheduleProjectStatePersist(snapshot){
    bindShared();
    if(_projectStatePersistTimer) clearTimeout(_projectStatePersistTimer);
    _projectStatePersistTimer = setTimeout(()=>{
      _projectStatePersistTimer = null;
      _projectStatePersistInFlight = persistProjectStateSnapshot(snapshot).then(()=>{
        const storage = ensureStorageHealthObject(state);
        storage.lastProjectSaveAt = safeNow();
        storage.lastProjectSaveOk = true;
        storage.lastProjectSaveError = '';
        storage.projectSaveCount = Math.max(0, Number(storage.projectSaveCount || 0)) + 1;
      }).catch(err=>{
        const msg = String(err?.message || err || 'Unbekannter Fehler');
        const storage = ensureStorageHealthObject(state);
        storage.lastProjectSaveAt = safeNow();
        storage.lastProjectSaveOk = false;
        storage.lastProjectSaveError = msg;
        try{ logLine('Projekt-Speicher Save Fehler: ' + msg); }catch{}
      }).finally(()=>{
        _projectStatePersistInFlight = null;
      });
    }, 250);
  }

  async function flushProjectStatePersist(snapshot){
    bindShared();
    if(_projectStatePersistTimer){
      clearTimeout(_projectStatePersistTimer);
      _projectStatePersistTimer = null;
    }
    if(_projectStatePersistInFlight){
      try{ await _projectStatePersistInFlight; }catch{}
    }
    try{
      _projectStatePersistInFlight = persistProjectStateSnapshot(snapshot || state);
      await _projectStatePersistInFlight;
      const storage = ensureStorageHealthObject(state);
      storage.lastProjectSaveAt = safeNow();
      storage.lastProjectSaveOk = true;
      storage.lastProjectSaveError = '';
      storage.projectSaveCount = Math.max(0, Number(storage.projectSaveCount || 0)) + 1;
      _projectStatePersistInFlight = null;
      return true;
    }catch(err){
      const msg = String(err?.message || err || 'Unbekannter Fehler');
      const storage = ensureStorageHealthObject(state);
      storage.lastProjectSaveAt = safeNow();
      storage.lastProjectSaveOk = false;
      storage.lastProjectSaveError = msg;
      _projectStatePersistInFlight = null;
      try{ logLine('Projekt-Speicher Save Fehler: ' + msg); }catch{}
      return false;
    }
  }

  async function getProjectDataStatus(){
    bindShared();
    const supported = typeof window.showDirectoryPicker === 'function';
    if(!supported) return { supported:false, configured:false, reachable:false, folderName:'' };
    const rootHandle = await loadProjectDirectoryHandle();
    if(!rootHandle) return { supported:true, configured:false, reachable:false, folderName:'' };
    const readable = await ensureProjectDirectoryPermission(rootHandle, false);
    if(!readable){
      return { supported:true, configured:true, reachable:false, folderName:String(rootHandle.name || '') };
    }
    const dataDirHandle = await getProjectStateDirectoryHandle(rootHandle, false);
    return {
      supported:true,
      configured:true,
      reachable:!!dataDirHandle,
      folderName:dataDirHandle ? `${String(rootHandle.name || '')}\\${PROJECT_STATE_SUBDIR}` : String(rootHandle.name || '')
    };
  }

  
  
  function _deepFindArrays(root, predicate, maxDepth=6){
    bindShared();
    const out = [];
    const seen = new Set();
    const stack = [{v:root, d:0}];
    while(stack.length){
      const {v,d} = stack.pop();
      if(v==null) continue;
      if(d>maxDepth) continue;
      if(typeof v === 'object'){
        if(seen.has(v)) continue;
        seen.add(v);
      }
      if(Array.isArray(v)){
        if(predicate(v)) out.push(v);
        // also scan items a bit
        if(d<maxDepth){
          for(const it of v){
            if(it && typeof it==='object') stack.push({v:it, d:d+1});
          }
        }
        continue;
      }
      if(typeof v === 'object'){
        for(const k of Object.keys(v)){
          try{
            stack.push({v:v[k], d:d+1});
          }catch{}
        }
      }
    }
    return out;
  }

  function _isDriverArray(arr){
    bindShared();
    if(!Array.isArray(arr) || !arr.length) return false;
    // must be mostly drv_* ids (avoid cars and races)
    let drv=0, checked=0;
    for(const it of arr){
      if(!it || typeof it!=='object') continue;
      if(!('id' in it) || !('name' in it)) return false;
      const id = String(it.id||'');
      // exclude races/sessions
      if('mode' in it || 'submode' in it || 'trackId' in it || 'startedAt' in it || 'endedAt' in it) return false;
      checked++;
      if(id.startsWith('drv_')) drv++;
      if(checked>=10) break;
    }
    if(checked==0) return false;
    return (drv/checked) >= 0.6; // majority must be drv_*
  }

  function _isCarArray(arr){
    bindShared();
    if(!Array.isArray(arr) || !arr.length) return false;
    const s = arr[0];
    if(!s || typeof s!=='object') return false;
    if(!('id' in s) || !('name' in s)) return false;
    // must have chip field (prevents matching drivers)
    return (('chipId' in s) || ('chipCode' in s));
  }

  function getDriversArray(){
    bindShared();
    // Primary known locations
    if(Array.isArray(state.drivers)) return state.drivers;
    if(state.drivers && Array.isArray(state.drivers.drivers)) return state.drivers.drivers;

    // Heuristic search (project drift-safe)
    const found = _deepFindArrays(state, _isDriverArray);
    if(found.length){
      // prefer the biggest list
      found.sort((a,b)=>b.length-a.length);
      return found[0];
    }
    return [];
  }

  function getCarsArray(){
    bindShared();
    if(Array.isArray(state.cars)) return state.cars;
    if(state.cars && Array.isArray(state.cars.cars)) return state.cars.cars;

    const found = _deepFindArrays(state, _isCarArray);
    if(found.length){
      found.sort((a,b)=>b.length-a.length);
      return found[0];
    }
    return [];
  }

  function ensureDriversArray(){
    bindShared();
    // If we already have a driver array somewhere (heuristic), use it as primary store too.
    const existing = getDriversArray();
    if(existing && existing.length){
      if(Array.isArray(state.drivers)) return state.drivers;
      if(!state.drivers || typeof state.drivers!=='object') state.drivers = {drivers:existing};
      if(!Array.isArray(state.drivers.drivers)) state.drivers.drivers = existing;
      return state.drivers.drivers;
    }
    if(Array.isArray(state.drivers)) return state.drivers;
    if(!state.drivers || typeof state.drivers!=='object') state.drivers = {drivers:[]};
    if(!Array.isArray(state.drivers.drivers)) state.drivers.drivers = [];
    return state.drivers.drivers;
  }

  function ensureCarsArray(){
    bindShared();
    const existing = getCarsArray();
    if(existing && existing.length){
      if(Array.isArray(state.cars)) return state.cars;
      if(!state.cars || typeof state.cars!=='object') state.cars = {cars:existing};
      if(!Array.isArray(state.cars.cars)) state.cars.cars = existing;
      return state.cars.cars;
    }
    if(Array.isArray(state.cars)) return state.cars;
    if(!state.cars || typeof state.cars!=='object') state.cars = {cars:[]};
    if(!Array.isArray(state.cars.cars)) state.cars.cars = [];
    return state.cars.cars;
  }

function downloadJson(filename, obj){
    bindShared();
    const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 800);
  }

  function exportStammdaten(){
    bindShared();
    const payload = {
      kind:'zeitnahme_stammdaten_v1',
      exportedAt: new Date().toISOString(),
      drivers: (state.masterData?.drivers||[]),
      cars: (state.masterData?.cars||[]),
    };
    const d = new Date();
    const fn = `stammdaten_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
    downloadJson(fn, payload);
    toast('Export', 'Stammdaten exportiert.', 'ok');
    if(!payload.drivers.length && !payload.cars.length){ logLine('WARN: Export Stammdaten ist leer – Daten liegen evtl. in anderer State-Struktur.'); }
    logLine('Export Stammdaten: '+fn);
  }

  function buildFullExportState(){
    bindShared();
    const external = buildExternalAppDataSnapshot();
    const chunkSnapshot = buildExternalStateChunkSnapshot();
    return {
      ...state,
      masterData: chunkSnapshot.masterData,
      media: {
        ...(state.media || {}),
        driverAvatars: external.driverAvatars || {}
      },
      personalRecords: chunkSnapshot.personalRecords,
      season: chunkSnapshot.season,
      tracks: chunkSnapshot.tracks,
      raceDay: chunkSnapshot.raceDay,
      modes: {
        ...(state.modes || {}),
        endurance: {
          ...((state.modes && state.modes.endurance) || {}),
          stintHistoryByRace: chunkSnapshot.enduranceStints || {}
        }
      },
      session: {
        ...(state.session || {}),
        laps: Array.isArray(external.laps) ? external.laps : [],
        idleLaps: Array.isArray(external.idleLaps) ? external.idleLaps : []
      }
    };
  }

  function exportAll(){
    bindShared();
    const payload = {
      kind:'zeitnahme_full_v1',
      exportedAt: new Date().toISOString(),
      state: buildFullExportState()
    };
    const d = new Date();
    const fn = `zeitnahme_backup_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
    downloadJson(fn, payload);
    toast('Backup', 'App-Backup exportiert.', 'ok');
    logLine('Export App-Backup: '+fn);
  }

  function normalizeName(s){ return String(s||'').trim().toLowerCase(); }
    bindShared();
  function normalizeChipCode(s){ return String(s||'').trim().toUpperCase(); }
    bindShared();

  function isRestoreStateCandidate(obj){
    bindShared();
    if(!obj || typeof obj!=='object' || Array.isArray(obj)) return false;
    const keys = ['settings','masterData','session','tracks','raceDay','season','modes','ui','audio'];
    return keys.some(k => Object.prototype.hasOwnProperty.call(obj, k));
  }

  function extractRestorePayload(parsed){
    bindShared();
    if(parsed && parsed.kind==='zeitnahme_full_v1' && parsed.state && typeof parsed.state==='object'){
      return parsed.state;
    }
    if(parsed && parsed.kind==='zeitnahme_stammdaten_v1'){
      throw new Error('restore_received_masterdata_export');
    }
    if(parsed && parsed.kind==='zeitnahme_audio_db_v1'){
      throw new Error('restore_received_audio_export');
    }
    if(isRestoreStateCandidate(parsed)){
      return parsed;
    }
    throw new Error('restore_invalid_file');
  }

  async function importStammdatenFile(file, allowDupNames=false){
    bindShared();
    if(!file) throw new Error('import_missing_file');
    const text = await file.text();
    const obj = JSON.parse(text);
    return importStammdatenFromJson(obj, allowDupNames);
  }

  async function restoreStateFromFile(file){
    bindShared();
    if(!file) throw new Error('restore_missing_file');
    const parsed = JSON.parse(await file.text());
    const restorePayload = extractRestorePayload(parsed);
      replaceStateInPlace(deepMerge(defaultState(), restorePayload));
      ensureAutoEntities(state);
    await clearExternalAppDataStores();
    saveState();
    await flushExternalAppDataPersist();
    renderAll();
    return true;
  }

  function importStammdatenFromJsonLegacy1(obj, allowDupNames=false){
    bindShared();
    if(!obj || (obj.kind!=='zeitnahme_stammdaten_v1' && !(obj.drivers&&obj.cars))){
      toast('Import', 'Ungültige Datei.', 'err');
      return;
    }
    const driversIn = Array.isArray(obj.drivers) ? obj.drivers : [];
    const carsIn = Array.isArray(obj.cars) ? obj.cars : [];

    if(!state.masterData) state.masterData = {drivers:[], cars:[]};
    if(!Array.isArray(state.masterData.drivers)) state.masterData.drivers = [];
    if(!Array.isArray(state.masterData.cars)) state.masterData.cars = [];
    const drivers = state.masterData.drivers;
    const cars = state.masterData.cars;

    const driverIdSet = new Set(drivers.map(d=>d.id));
    const driverNameSet = new Set(drivers.map(d=>normalizeName(d.name)));

    const carIdSet = new Set(cars.map(c=>c.id));
    const carChipSet = new Set(cars.map(c=>String((c.chipCode ?? c.chipId ?? '')).trim()).filter(Boolean));

    let addD=0, skipD=0, addC=0, skipC=0;

    for(const d of driversIn){
      if(!d || !d.id){ skipD++; continue; }
      const nameKey = normalizeName(d.name);
      if(driverIdSet.has(d.id)){ skipD++; continue; }
      if(!allowDupNames && nameKey && driverNameSet.has(nameKey)){ skipD++; continue; }
      drivers.push(d);
      driverIdSet.add(d.id);
      if(nameKey) driverNameSet.add(nameKey);
      addD++;
    }

    for(const c of carsIn){
      if(!c || !c.id){ skipC++; continue; }
      const chip = String((c.chipCode ?? c.chipId ?? '')).trim();
      if(carIdSet.has(c.id)){ skipC++; continue; }
      if(chip && carChipSet.has(chip)){ skipC++; continue; }
      // normalize chip field
      if(c.chipId && !c.chipCode) c.chipCode = c.chipId;
      cars.push(c);
      carIdSet.add(c.id);
      if(chip) carChipSet.add(chip);
      addC++;
    }

    saveState();
    renderAll();
    toast('Import', `Fahrer neu: ${addD}, übersprungen: ${skipD} • Autos neu: ${addC}, übersprungen: ${skipC}`, 'ok');
    logLine(`Import Stammdaten: Fahrer neu=${addD} skip=${skipD}, Autos neu=${addC} skip=${skipC}`);
  }

  function importStammdatenFromJsonLegacy2(obj, allowDupNames=false){
    bindShared();
    if(!obj || (obj.kind!=='zeitnahme_stammdaten_v1' && !(obj.drivers&&obj.cars))){
      throw new Error('import_invalid_masterdata_file');
    }
    const driversIn = Array.isArray(obj.drivers) ? obj.drivers : [];
    const carsIn = Array.isArray(obj.cars) ? obj.cars : [];

    if(!state.masterData) state.masterData = {drivers:[], cars:[]};
    if(!Array.isArray(state.masterData.drivers)) state.masterData.drivers = [];
    if(!Array.isArray(state.masterData.cars)) state.masterData.cars = [];
    const drivers = state.masterData.drivers;
    const cars = state.masterData.cars;

    const driverIdSet = new Set(drivers.map(d=>d.id));
    const driverNameSet = new Set(drivers.map(d=>normalizeName(d.name)));
    const carIdSet = new Set(cars.map(c=>c.id));
    const carChipSet = new Set(cars.map(c=>normalizeChipCode(c.chipCode ?? c.chipId ?? '')).filter(Boolean));

    let addD=0, skipD=0, addC=0, skipC=0;

    for(const d of driversIn){
      if(!d || !d.id){ skipD++; continue; }
      const nameKey = normalizeName(d.name);
      if(driverIdSet.has(d.id)){ skipD++; continue; }
      if(!allowDupNames && nameKey && driverNameSet.has(nameKey)){ skipD++; continue; }
      const importedDriver = JSON.parse(JSON.stringify(d));
      drivers.push(importedDriver);
      driverIdSet.add(importedDriver.id);
      if(nameKey) driverNameSet.add(nameKey);
      addD++;
    }

    for(const c of carsIn){
      if(!c || !c.id){ skipC++; continue; }
      const chip = normalizeChipCode(c.chipCode ?? c.chipId ?? '');
      if(carIdSet.has(c.id)){ skipC++; continue; }
      if(chip && carChipSet.has(chip)){ skipC++; continue; }
      const importedCar = JSON.parse(JSON.stringify(c));
      if(chip) importedCar.chipCode = chip;
      cars.push(importedCar);
      carIdSet.add(importedCar.id);
      if(chip) carChipSet.add(chip);
      addC++;
    }

    saveState();
    renderAll();
    toast('Import', `Fahrer neu: ${addD}, Ã¼bersprungen: ${skipD} â€¢ Autos neu: ${addC}, Ã¼bersprungen: ${skipC}`, 'ok');
    logLine(`Import Stammdaten: Fahrer neu=${addD} skip=${skipD}, Autos neu=${addC} skip=${skipC}`);
    return { addDrivers:addD, skipDrivers:skipD, addCars:addC, skipCars:skipC };
  }

  function importStammdatenFromJson(obj, allowDupNames=false){
    bindShared();
    if(!obj || (obj.kind!=='zeitnahme_stammdaten_v1' && !(obj.drivers&&obj.cars))){
      throw new Error('import_invalid_masterdata_file');
    }
    const driversIn = Array.isArray(obj.drivers) ? obj.drivers : [];
    const carsIn = Array.isArray(obj.cars) ? obj.cars : [];

    if(!state.masterData) state.masterData = {drivers:[], cars:[]};
    if(!Array.isArray(state.masterData.drivers)) state.masterData.drivers = [];
    if(!Array.isArray(state.masterData.cars)) state.masterData.cars = [];
    const drivers = state.masterData.drivers;
    const cars = state.masterData.cars;

    const driverIdSet = new Set(drivers.map(d=>d.id));
    const driverNameSet = new Set(drivers.map(d=>normalizeName(d.name)));
    const carIdSet = new Set(cars.map(c=>c.id));
    const carChipSet = new Set(cars.map(c=>normalizeChipCode(c.chipCode ?? c.chipId ?? '')).filter(Boolean));

    let addD=0, skipD=0, addC=0, skipC=0;

    for(const d of driversIn){
      if(!d || !d.id){ skipD++; continue; }
      const nameKey = normalizeName(d.name);
      if(driverIdSet.has(d.id)){ skipD++; continue; }
      if(!allowDupNames && nameKey && driverNameSet.has(nameKey)){ skipD++; continue; }
      const importedDriver = JSON.parse(JSON.stringify(d));
      drivers.push(importedDriver);
      driverIdSet.add(importedDriver.id);
      if(nameKey) driverNameSet.add(nameKey);
      addD++;
    }

    for(const c of carsIn){
      if(!c || !c.id){ skipC++; continue; }
      const chip = normalizeChipCode(c.chipCode ?? c.chipId ?? '');
      if(carIdSet.has(c.id)){ skipC++; continue; }
      if(chip && carChipSet.has(chip)){ skipC++; continue; }
      const importedCar = JSON.parse(JSON.stringify(c));
      if(chip) importedCar.chipCode = chip;
      cars.push(importedCar);
      carIdSet.add(importedCar.id);
      if(chip) carChipSet.add(chip);
      addC++;
    }

    saveState();
    renderAll();
    toast('Import', `Fahrer neu: ${addD}, uebersprungen: ${skipD} | Autos neu: ${addC}, uebersprungen: ${skipC}`, 'ok');
    logLine(`Import Stammdaten: Fahrer neu=${addD} skip=${skipD}, Autos neu=${addC} skip=${skipC}`);
    return { addDrivers:addD, skipDrivers:skipD, addCars:addC, skipCars:skipC };
  }



  // --------------------- Toast + Log ---------------------
  return { defaultState, deepMerge, ensureAutoEntities, loadState, getState, replaceStateInPlace, idbRequestToPromise, getAppDataDb, buildExternalAppDataSnapshot, buildExternalStateChunkSnapshot, isStateChunkEmpty, buildSlimPersistedState, replaceObjectStoreData, persistExternalAppDataSnapshot, persistExternalStateChunkSnapshot, readAllFromObjectStore, loadExternalAppDataSnapshot, loadExternalStateChunkSnapshot, scheduleExternalAppDataPersist, flushExternalAppDataPersist, clearExternalAppDataStores, hydrateExternalAppData, saveState, chooseProjectDataDirectory, loadProjectStateSnapshot, persistProjectStateSnapshot, flushProjectStatePersist, getProjectDataStatus, getStorageHealthStatus, _deepFindArrays, _isDriverArray, _isCarArray, getDriversArray, getCarsArray, ensureDriversArray, ensureCarsArray, downloadJson, exportStammdaten, buildFullExportState, exportAll, normalizeName, normalizeChipCode, isRestoreStateCandidate, extractRestorePayload, importStammdatenFile, restoreStateFromFile, importStammdatenFromJsonLegacy1, importStammdatenFromJsonLegacy2, importStammdatenFromJson };
})();
