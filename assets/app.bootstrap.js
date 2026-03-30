(async () => {
  'use strict';

  const BUILD = window.TIMTIME_CONSTANTS?.BUILD || 'v17.5';

  // --------------------- Storage ---------------------
  const LS_KEY = 'zeitnahme2_state_v3';
  const LS_UI  = 'zeitnahme2_ui_v3';
  const AUDIO_ASSET_DB_NAME = 'zeitnahme2_audio_assets_v1';
  const AUDIO_ASSET_STORE = 'assets';
  const APP_DATA_DB_VERSION = 2;
  const APP_DATA_DB_NAME = 'zeitnahme2_app_data_v1';
  const APP_DATA_AVATAR_STORE = 'driverAvatars';
  const APP_DATA_SESSION_LAPS_STORE = 'sessionLaps';
  const APP_DATA_IDLE_LAPS_STORE = 'idleLaps';
  const APP_DATA_STATE_CHUNK_STORE = 'stateChunks';
  const APP_DATA_DISCORD_QUEUE_STORE = 'discordQueue';
  const PRES_SNAPSHOT_KEY = 'ZN_PRES_SNAPSHOT';
  const DefaultsApi = window.TIMTIME_DEFAULTS || {};
  const BUILTIN_DEFAULT_SOUND_ID = DefaultsApi.BUILTIN_DEFAULT_SOUND_ID || 'audio_builtin_defaultsound_v1';
  const BUILTIN_DEFAULT_SOUND_NAME = DefaultsApi.BUILTIN_DEFAULT_SOUND_NAME || 'Standard Bing';
  const BUILTIN_DEFAULT_SOUND_DATA_URL = DefaultsApi.BUILTIN_DEFAULT_SOUND_DATA_URL || '';

  const TABS = window.TIMTIME_CONSTANTS?.TABS || [];
  const I18N = window.TIMTIME_I18N || {};
  const UtilsApi = window.TIMTIME_UTILS || {};
  window.TIMTIME_SHARED = Object.assign(window.TIMTIME_SHARED || {}, {
    LS_KEY,
    AUDIO_ASSET_DB_NAME,
    AUDIO_ASSET_STORE,
    APP_DATA_DB_VERSION,
    APP_DATA_DB_NAME,
    APP_DATA_AVATAR_STORE,
    APP_DATA_SESSION_LAPS_STORE,
    APP_DATA_IDLE_LAPS_STORE,
    APP_DATA_STATE_CHUNK_STORE,
    APP_DATA_DISCORD_QUEUE_STORE,
    PRES_SNAPSHOT_KEY,
    BUILTIN_DEFAULT_SOUND_ID,
    BUILTIN_DEFAULT_SOUND_NAME,
    BUILTIN_DEFAULT_SOUND_DATA_URL
  });
  const now = UtilsApi.now || (()=>Date.now());
  const uid = UtilsApi.uid || (p => p + '_' + Math.random().toString(16).slice(2,10));
  const clamp = UtilsApi.clamp || ((n,a,b)=>{ n=Number(n); return Math.max(a, Math.min(b,n)); });
  const clampInt = UtilsApi.clampInt || ((v,minV,maxV)=>{
    const n = parseInt(v,10);
    if(!Number.isFinite(n)) return minV;
    return Math.max(minV, Math.min(maxV, n));
  });
  const demojibake = UtilsApi.demojibake || (v => String(v ?? ''));
  const esc = UtilsApi.esc || (s => String(s??'').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c])));
  const msToTime = UtilsApi.msToTime || ((ms)=>String(ms ?? ''));
  const DashboardApi = window.TIMTIME_DASHBOARD || {};
  const PresenterApi = window.TIMTIME_PRESENTER || {};
  const DiscordApi = window.TIMTIME_DISCORD || {};
  const StateApi = window.TIMTIME_STATE || {};
  const ResultsApi = window.TIMTIME_RESULTS || {};
  const PagesApi = window.TIMTIME_PAGES || {};
  const AudioApi = window.TIMTIME_AUDIO || {};
  const DomApi = window.TIMTIME_DOM || {};
  const SessionApi = window.TIMTIME_SESSION || {};
  const ReaderApi = window.TIMTIME_READER || {};
  const ChampionshipApi = window.TIMTIME_CHAMPIONSHIP || {};
  const TransportApi = window.TIMTIME_TRANSPORT || {};
  const ObsApi = window.TIMTIME_OBS || {};
  const ShellApi = window.TIMTIME_SHELL || {};
  const CoreApi = window.TIMTIME_CORE || {};
  const EntitiesApi = window.TIMTIME_ENTITIES || {};
  const RuntimeApi = window.TIMTIME_RUNTIME || {};
  const LocaleApi = window.TIMTIME_LOCALE || {};
  const renderSessionControl = DashboardApi.renderSessionControl || (()=>{});
  const renderDashboard = DashboardApi.renderDashboard || (()=>{});
  const openPresenterWindow = PresenterApi.openPresenterWindow || (()=>{});
  const sendPresenterSnapshot = PresenterApi.sendPresenterSnapshot || (()=>{});
  const defaultState = StateApi.defaultState || (()=>({}));
  const deepMerge = StateApi.deepMerge || ((a,b)=>b ?? a);
  const ensureAutoEntities = StateApi.ensureAutoEntities || (()=>{});
  const loadState = StateApi.loadState || (()=>({}));
  const getState = StateApi.getState || (()=>loadState());
  const replaceStateInPlace = StateApi.replaceStateInPlace || ((next)=>next);
  const hydrateExternalAppData = StateApi.hydrateExternalAppData || (async()=>{});
  const saveState = StateApi.saveState || (()=>{});
  const flushExternalAppDataPersist = StateApi.flushExternalAppDataPersist || (async()=>{});
  const clearExternalAppDataStores = StateApi.clearExternalAppDataStores || (async()=>{});
  const buildFullExportState = StateApi.buildFullExportState || (()=>({}));
  const exportAll = StateApi.exportAll || (()=>{});
  const exportStammdaten = StateApi.exportStammdaten || (()=>{});
  const importStammdatenFromJson = StateApi.importStammdatenFromJson || (()=>{});
  const restoreStateFromFile = StateApi.restoreStateFromFile || (async()=>false);
  const importStammdatenFile = StateApi.importStammdatenFile || (async()=>false);
  const buildSeasonWebhookMessage = DiscordApi.buildSeasonWebhookMessage || (()=>{ throw new Error('Discord module unavailable'); });
  const sendRaceDayWebhook = DiscordApi.sendRaceDayWebhook || (async()=>{ throw new Error('Discord module unavailable'); });
  const sendSeasonWebhook = DiscordApi.sendSeasonWebhook || (async()=>{ throw new Error('Discord module unavailable'); });
  const copyTextToClipboard = DiscordApi.copyTextToClipboard || (async()=>{ throw new Error('Clipboard helper unavailable'); });
  const setDiscordPreviewText = DiscordApi.setDiscordPreviewText || (()=>{});
  const setDiscordPreviewImage = DiscordApi.setDiscordPreviewImage || (()=>{});
  const formatDiscordPayloadPreview = DiscordApi.formatDiscordPayloadPreview || (()=>'');
  const createDiscordHttpError = DiscordApi.createDiscordHttpError || ((status, detail='')=>new Error(String(status||detail||'Discord error')));
  const markDiscordNetworkError = DiscordApi.markDiscordNetworkError || (err=>err);
  const shouldQueueDiscordError = DiscordApi.shouldQueueDiscordError || (()=>true);
  const getDiscordImmediateRetryDelayMs = DiscordApi.getDiscordImmediateRetryDelayMs || (()=>6000);
  const getDiscordQueueRetryDelayMs = DiscordApi.getDiscordQueueRetryDelayMs || (()=>30000);
  const createQueuedDiscordError = DiscordApi.createQueuedDiscordError || ((job, cause)=>Object.assign(new Error('discord_queued'), { queued:true, job, cause }));
  const loadDiscordQueueJobs = DiscordApi.loadDiscordQueueJobs || (async()=>[]);
  const putDiscordQueueJob = DiscordApi.putDiscordQueueJob || (async()=>{});
  const deleteDiscordQueueJob = DiscordApi.deleteDiscordQueueJob || (async()=>{});
  const enqueueDiscordJob = DiscordApi.enqueueDiscordJob || (async(job)=>job);
  const scheduleDiscordQueueProcessing = DiscordApi.scheduleDiscordQueueProcessing || (()=>{});
  const chunkDiscordFieldLines = DiscordApi.chunkDiscordFieldLines || (()=>[]);
  const postDiscordWebhook = DiscordApi.postDiscordWebhook || (async()=>true);
  const postDiscordWebhookWithImage = DiscordApi.postDiscordWebhookWithImage || (async()=>true);
  const getRaceDayBestLapsByTrack = DiscordApi.getRaceDayBestLapsByTrack || (()=>[]);
  const getRaceDayWebhookTableData = DiscordApi.getRaceDayWebhookTableData || (()=>({}));
  const buildRaceDayWebhookMessage = DiscordApi.buildRaceDayWebhookMessage || (()=>({ payload:{}, forumText:'', threadName:'' }));
  const sendDiscordSummaryForRace = DiscordApi.sendDiscordSummaryForRace || (async()=>false);
  const executeDiscordQueueJob = DiscordApi.executeDiscordQueueJob || (async()=>false);
  const processDiscordQueue = DiscordApi.processDiscordQueue || (async()=>{});
  const buildSessionDiscordPreview = DiscordApi.buildSessionDiscordPreview || (async()=>({}));
  const maybeAutoSendDiscordForRace = DiscordApi.maybeAutoSendDiscordForRace || (async()=>{});
  const buildDiscordFakeSummaryData = DiscordApi.buildDiscordFakeSummaryData || (()=>({}));
  const sendDiscordTestWebhook = DiscordApi.sendDiscordTestWebhook || (async()=>false);
  const formatDiscordDateTime = ResultsApi.formatDiscordDateTime || (()=>'');
  const getTrackById = ResultsApi.getTrackById || (()=>null);
  const buildRacePositionTimeline = ResultsApi.buildRacePositionTimeline || (()=>[]);
  const buildRaceSummaryData = ResultsApi.buildRaceSummaryData || (()=>null);
  const buildLapTableRows = ResultsApi.buildLapTableRows || (()=>[]);
  const renderRaceSummaryBlob = ResultsApi.renderRaceSummaryBlob || (async()=>null);
  const renderRaceLapTableBlob = ResultsApi.renderRaceLapTableBlob || (async()=>null);
  const buildLapColumnData = ResultsApi.buildLapColumnData || (()=>[]);
  const renderRaceLapColumnsBlob = ResultsApi.renderRaceLapColumnsBlob || (async()=>null);
  const renderRaceWebhookCompositeBlob = ResultsApi.renderRaceWebhookCompositeBlob || (async()=>null);
  const renderRaceDayWebhookBlob = ResultsApi.renderRaceDayWebhookBlob || (async()=>null);
  const renderSeasonWebhookBlob = ResultsApi.renderSeasonWebhookBlob || (async()=>null);
  const renderEinzellaeufe = PagesApi.renderEinzellaeufe || (()=>{});
  const renderTeamrennen = PagesApi.renderTeamrennen || (()=>{});
  const renderLangstrecke = PagesApi.renderLangstrecke || (()=>{});
  const renderStammdaten = PagesApi.renderStammdaten || (()=>{});
  const renderStrecken = PagesApi.renderStrecken || (()=>{});
  const renderRenntag = PagesApi.renderRenntag || (()=>{});
  const renderSaison = PagesApi.renderSaison || (()=>{});
  const renderOBS = PagesApi.renderOBS || (()=>{});
  const renderEinstellungen = PagesApi.renderEinstellungen || (()=>{});
  const readSettingsForm = PagesApi.readSettingsForm || (()=>({}));
  const commitSettingsDraft = PagesApi.commitSettingsDraft || (()=>({ saved:false, languageChanged:false }));
  const renderAudio = AudioApi.renderAudio || (()=>{});
  const getAudioContext = AudioApi.getAudioContext || (()=>null);
  const openAudioAssetDb = AudioApi.openAudioAssetDb || (async()=>null);
  const audioAssetPut = AudioApi.audioAssetPut || (async()=>true);
  const audioAssetGet = AudioApi.audioAssetGet || (async()=>null);
  const audioAssetDelete = AudioApi.audioAssetDelete || (async()=>true);
  const audioAssetGetAll = AudioApi.audioAssetGetAll || (async()=>[]);
  const audioAssetClearAll = AudioApi.audioAssetClearAll || (async()=>true);
  const clearAudioDbAndAssignments = AudioApi.clearAudioDbAndAssignments || (async()=>{});
  const exportAudioDb = AudioApi.exportAudioDb || (async()=>{});
  const importAudioDbFile = AudioApi.importAudioDbFile || (async()=>{});
  const getAudioLibrary = AudioApi.getAudioLibrary || (()=>[]);
  const renderAudioAssetOptionTags = AudioApi.renderAudioAssetOptionTags || (()=>'');
  const getAudioAssetMeta = AudioApi.getAudioAssetMeta || (()=>null);
  const ensureAudioSelection = AudioApi.ensureAudioSelection || (()=>{});
  const formatDb = AudioApi.formatDb || (()=>'—');
  const formatSec = AudioApi.formatSec || (()=>'—');
  const fileToDataUrl = AudioApi.fileToDataUrl || (async()=> '');
  const dataUrlToAudioBuffer = AudioApi.dataUrlToAudioBuffer || (async()=> null);
  const analyzeAudioBuffer = AudioApi.analyzeAudioBuffer || (()=>({}));
  const calcRecommendedGainDb = AudioApi.calcRecommendedGainDb || (()=>0);
  const gainDbToLinear = AudioApi.gainDbToLinear || (()=>1);
  const stopAudioPreview = AudioApi.stopAudioPreview || (()=>{});
  const previewAudioAsset = AudioApi.previewAudioAsset || (async()=>{});
  const createOrReplaceAudioAsset = AudioApi.createOrReplaceAudioAsset || (async()=>null);
  const reanalyzeAudioAsset = AudioApi.reanalyzeAudioAsset || (async()=>null);
  const removeAudioAsset = AudioApi.removeAudioAsset || (async()=>{});
  const getVoices = AudioApi.getVoices || (()=>[]);
  const getSelectedVoice = AudioApi.getSelectedVoice || (()=>null);
  const speak = AudioApi.speak || (()=>{});
  const countLapsForCarInRace = AudioApi.countLapsForCarInRace || (()=>0);
  const playSimpleLapBeep = AudioApi.playSimpleLapBeep || (async()=>false);
  const ensureBuiltInDefaultDriverSound = AudioApi.ensureBuiltInDefaultDriverSound || (async()=>null);
  const playDefaultDriverSound = AudioApi.playDefaultDriverSound || (async()=>false);
  const resolveRootFallbackSoundUrl = AudioApi.resolveRootFallbackSoundUrl || (async()=> '');
  const playRootFallbackSound = AudioApi.playRootFallbackSound || (async()=>false);
  const playDriverLapSound = AudioApi.playDriverLapSound || (async()=>false);
  const maybeSpeakLap = AudioApi.maybeSpeakLap || (()=>{});
  const speakPromise = AudioApi.speakPromise || (async()=>{});
  const queueSpeak = AudioApi.queueSpeak || (async()=>{});
  const ensurePersonalStores = AudioApi.ensurePersonalStores || (()=>{});
  const getPBSeason = AudioApi.getPBSeason || (()=>null);
  const getPBDay = AudioApi.getPBDay || (()=>null);
  const setPBSeason = AudioApi.setPBSeason || (()=>{});
  const setPBDay = AudioApi.setPBDay || (()=>{});
  const speakPersonalBest = AudioApi.speakPersonalBest || (()=>{});
  const updatePersonalBestsOnLap = AudioApi.updatePersonalBestsOnLap || (()=>{});
  const speakTrackRecord = AudioApi.speakTrackRecord || (()=>{});
  const openDriverEditor = DomApi.openDriverEditor || (()=>{});
  const openCarEditor = DomApi.openCarEditor || (()=>{});
  const hostElapsed = SessionApi.hostElapsed || ((startedAt, pausedAt, pauseAccumMs, sessionState)=>{
    if(startedAt==null) return 0;
    const endHost = (sessionState === 'PAUSED' && pausedAt!=null) ? Number(pausedAt) : Date.now();
    return Math.max(0, endHost - Number(startedAt) - Number(pauseAccumMs || 0));
  });
  const isSessionIdle = SessionApi.isSessionIdle || (sessionState => String(sessionState || 'IDLE') === 'IDLE');
  const isFreeDrivingRace = SessionApi.isFreeDrivingRace || (race => !!(race && (race.submode==='Freies Fahren' || race.mode==='free')));
  const isFreeDrivingMode = SessionApi.isFreeDrivingMode || (()=>!!state.session?.isFreeDriving);
  const raceShouldShowPodium = SessionApi.raceShouldShowPodium || (race => !!race && (race.mode==='loop' || !isFreeDrivingRace(race)));
  const ensureCarByChip = SessionApi.ensureCarByChip || (()=>null);
  const getDriverNameForCar = SessionApi.getDriverNameForCar || (()=>'');
  const syncEnduranceSettingsFromPage = SessionApi.syncEnduranceSettingsFromPage || (()=>{});
  const getNormalizedEnduranceDurationMin = SessionApi.getNormalizedEnduranceDurationMin || (()=>Math.max(1, parseInt(state.modes.endurance?.durationMin||30,10) || 30));
  const startNewRace = SessionApi.startNewRace || (()=>null);
  const endCurrentRace = SessionApi.endCurrentRace || (()=>{});
  const endCurrentRaceQuiet = SessionApi.endCurrentRaceQuiet || (()=>{});
  const loopInit = SessionApi.loopInit || (()=>{});
  const loopAdvancePhase = SessionApi.loopAdvancePhase || (()=>{});
  const loopOnPause = SessionApi.loopOnPause || (()=>{});
  const loopOnResume = SessionApi.loopOnResume || (()=>{});
  const loopStartRaceSegment = SessionApi.loopStartRaceSegment || (()=>{});
  const loopTick = SessionApi.loopTick || (()=>{});
  const singleTick = SessionApi.singleTick || (()=>{});
  const teamTick = SessionApi.teamTick || (()=>{});
  const enduranceTick = SessionApi.enduranceTick || (()=>{});
  const showAmpelOverlay = SessionApi.showAmpelOverlay || (()=>{});
  const runAmpelSequence = SessionApi.runAmpelSequence || (async()=>false);
  const sessionStart = SessionApi.sessionStart || (async()=>{});
  const sessionStartImmediate = SessionApi.sessionStartImmediate || (()=>false);
  const sessionElapsedMs = SessionApi.sessionElapsedMs || (()=>0);
  const isAmpelRunning = SessionApi.isAmpelRunning || (()=>false);
  const sessionStop = SessionApi.sessionStop || (()=>{});
  const sessionPause = SessionApi.sessionPause || (()=>{});
  const sessionResume = SessionApi.sessionResume || (()=>{});
  const resetFinishRuntime = SessionApi.resetFinishRuntime || (()=>{});
  const beginFinishWindow = SessionApi.beginFinishWindow || (()=>{});
  const markCarFinished = SessionApi.markCarFinished || (()=>{});
  const finishTick = SessionApi.finishTick || (()=>{});
  const currentPhase = SessionApi.currentPhase || (()=>getLapKind());
  const handleIdlePass = SessionApi.handleIdlePass || (()=>{});
  const handlePass = SessionApi.handlePass || (()=>{});
  const usbConnect = ReaderApi.usbConnect || (async()=>{});
  const usbDisconnect = ReaderApi.usbDisconnect || (async()=>{});
  const usbProbeOnLoad = ReaderApi.usbProbeOnLoad || (async()=>{});
  const setUsbUi = ReaderApi.setUsbUi || (()=>{});
  const getPortInfo = ReaderApi.getPortInfo || (()=>'');
  const installUsbConnectDisconnectListeners = ReaderApi.installUsbConnectDisconnectListeners || (()=>{});
  const onSerialLine = ReaderApi.onSerialLine || (()=>{});
  const enqueuePass = ReaderApi.enqueuePass || (()=>{});
  const processPassQueue = ReaderApi.processPassQueue || (()=>{});
  const driverKeyForLapGlobal = ChampionshipApi.driverKeyForLapGlobal;
  const driverNameByIdGlobal = ChampionshipApi.driverNameByIdGlobal;
  const filterLapsForRaceBounds = ChampionshipApi.filterLapsForRaceBounds;
  const getRaceById = ChampionshipApi.getRaceById;
  const raceUsesBestLapRanking = ChampionshipApi.raceUsesBestLapRanking;
  const sortDriverStandingRows = ChampionshipApi.sortDriverStandingRows;
  const getRelevantRaceLaps = ChampionshipApi.getRelevantRaceLaps;
  const compareDriverStandingRows = ChampionshipApi.compareDriverStandingRows;
  const computeDriverStandingsGlobal = ChampionshipApi.computeDriverStandingsGlobal;
  const parsePointsScheme = ChampionshipApi.parsePointsScheme;
  const computeTeamPointsStandings = ChampionshipApi.computeTeamPointsStandings;
  const computeTeamStandingsGlobal = ChampionshipApi.computeTeamStandingsGlobal;
  const computeRaceEndHighlights = ChampionshipApi.computeRaceEndHighlights;
  const renderRaceEndHighlightsHtml = ChampionshipApi.renderRaceEndHighlightsHtml;
  const renderPodiumSectionGlobal = ChampionshipApi.renderPodiumSectionGlobal;
  const box = ChampionshipApi.box;
  const getRaceDaysForSeason = ChampionshipApi.getRaceDaysForSeason;
  const getRacesForRaceDay = ChampionshipApi.getRacesForRaceDay;
  const getRacesForSeason = ChampionshipApi.getRacesForSeason;
  const getRaceTrackName = ChampionshipApi.getRaceTrackName;
  const getAverageValidLapMsForDriver = ChampionshipApi.getAverageValidLapMsForDriver;
  const getBestTimesByTrackForDriver = ChampionshipApi.getBestTimesByTrackForDriver;
  const getDriverAggregateStatsForRaces = ChampionshipApi.getDriverAggregateStatsForRaces;
  const renderBestByTrackCell = ChampionshipApi.renderBestByTrackCell;
  const renderSessionDriverColumns = ChampionshipApi.renderSessionDriverColumns;
  const renderRenntagAuswertung = ChampionshipApi.renderRenntagAuswertung;
  const getSeasonScoringRaces = ChampionshipApi.getSeasonScoringRaces;
  const getFastestDriverIdFromLaps = ChampionshipApi.getFastestDriverIdFromLaps;
  const getSeasonPointsColor = ChampionshipApi.getSeasonPointsColor;
  const sumBestPoints = ChampionshipApi.sumBestPoints;
  const getSeasonBaseRows = ChampionshipApi.getSeasonBaseRows;
  const getSeasonStatisticsData = ChampionshipApi.getSeasonStatisticsData;
  const getChampionshipSettings = ChampionshipApi.getChampionshipSettings;
  const getChampionshipData = ChampionshipApi.getChampionshipData;
  const renderSeasonPointsChart = ChampionshipApi.renderSeasonPointsChart;
  const renderSaisonAuswertung = ChampionshipApi.renderSaisonAuswertung;
  const clearRaceDataOnly = ChampionshipApi.clearRaceDataOnly;
  const clearAllStoredData = ChampionshipApi.clearAllStoredData;
  const pushBleLogLine = TransportApi.pushBleLogLine;
  const updateMrcCounterFromLine = TransportApi.updateMrcCounterFromLine;
  const getMrcDeltaForCar = TransportApi.getMrcDeltaForCar;
  const formatMrcDeltaMs = TransportApi.formatMrcDeltaMs;
  const getLapTimeSource = TransportApi.getLapTimeSource;
  const resolveLapMsForCar = TransportApi.resolveLapMsForCar;
  const setBleUi = TransportApi.setBleUi;
  const bleSupportsSilentReconnect = TransportApi.bleSupportsSilentReconnect;
  const bleHasKnownDevice = TransportApi.bleHasKnownDevice;
  const bleReconnectDelayMs = TransportApi.bleReconnectDelayMs;
  const clearBleReconnectTimer = TransportApi.clearBleReconnectTimer;
  const scheduleBleReconnect = TransportApi.scheduleBleReconnect;
  const mrcWriteLine = TransportApi.mrcWriteLine;
  const requestMrcSync = TransportApi.requestMrcSync;
  const mrcCountdownSet = TransportApi.mrcCountdownSet;
  const handleMrcMetaLine = TransportApi.handleMrcMetaLine;
  const onBleAsciiLine = TransportApi.onBleAsciiLine;
  const handleBleTextFragment = TransportApi.handleBleTextFragment;
  const bleRememberDevice = TransportApi.bleRememberDevice;
  const bleStartNotify = TransportApi.bleStartNotify;
  const bleConnect = TransportApi.bleConnect;
  const bleAutoReconnectOnLoad = TransportApi.bleAutoReconnectOnLoad;
  const bleDisconnect = TransportApi.bleDisconnect;
  const onBleDisconnected = TransportApi.onBleDisconnected;
  const getUsbPort = TransportApi.getUsbPort || (()=>null);
  const setUsbPort = TransportApi.setUsbPort || (()=>null);
  const getUsbReader = TransportApi.getUsbReader || (()=>null);
  const setUsbReader = TransportApi.setUsbReader || (()=>null);
  const getUsbStopRead = TransportApi.getUsbStopRead || (()=>false);
  const setUsbStopRead = TransportApi.setUsbStopRead || (()=>false);
  const usbReconnectDelayMs = TransportApi.usbReconnectDelayMs;
  const scheduleUsbReconnect = TransportApi.scheduleUsbReconnect;
  const usbAutoConnect = TransportApi.usbAutoConnect;
  const kickTransportAutoReconnect = TransportApi.kickTransportAutoReconnect || (async()=>{});
  const startTransportReconnectWatch = TransportApi.startTransportReconnectWatch || (()=>{});
  const getObsStatus = ObsApi.getObsStatus || (()=>({ available:false, connected:false, connecting:false, scene:'', lastError:'' }));
  const connectObs = ObsApi.connectObs || (async()=>false);
  const disconnectObs = ObsApi.disconnectObs || (async()=>false);
  const sendObsRequest = ObsApi.sendObsRequest || (async()=>false);
  const setObsScene = ObsApi.setObsScene || (async()=>false);
  const testObsScene = ObsApi.testObsScene || (async()=>false);
  const setObsTextSource = ObsApi.setObsTextSource || (async()=>false);
  const syncObsTextSources = ObsApi.syncObsTextSources || (async()=>false);
  const syncObsAutoScene = ObsApi.syncObsAutoScene || (async()=>false);
  const obsAutoConnectOnLoad = ObsApi.obsAutoConnectOnLoad || (async()=>false);
  const loadUi = ShellApi.loadUi || (()=>({}));
  const saveUi = ShellApi.saveUi || (()=>{});
  const applyLogUi = ShellApi.applyLogUi || (()=>{});
  const wireLogResizer = ShellApi.wireLogResizer || (()=>{});
  const renderTopMenu = ShellApi.renderTopMenu || (()=>{});
  const showActivePage = ShellApi.showActivePage || (()=>{});
  const renderHeader = ShellApi.renderHeader || (()=>{});
  const getEnduranceStatusRows = ShellApi.getEnduranceStatusRows || (()=>[]);
  const renderEnduranceStatusHtml = ShellApi.renderEnduranceStatusHtml || (()=>'');
  const renderDauerschleife = ShellApi.renderDauerschleife || (()=>{});
  const clampNum = ShellApi.clampNum || ((v,minV,maxV)=>Math.max(minV, Math.min(maxV, Number(v)||0)));
  const computeTimerDisplay = ShellApi.computeTimerDisplay || (()=>({ text:'00:00.000', sub:'' }));
  const tick = ShellApi.tick || (()=>{});
  const backgroundUiRefresh = ShellApi.backgroundUiRefresh || (()=>{});
  const wire = ShellApi.wire || (()=>{});
  const renderAll = ShellApi.renderAll || (()=>{});
  const syncSharedContext = ShellApi.syncSharedContext || (()=>{});
  const initApp = ShellApi.initApp || (async()=>{});
  const getScaleDenominator = CoreApi.getScaleDenominator || (()=>64);
  const lapMsToAverageKmh = CoreApi.lapMsToAverageKmh || (()=>null);
  const formatKmh = CoreApi.formatKmh || (()=>'—');
  const getTrackLengthMeters = CoreApi.getTrackLengthMeters || (()=>0);
  const isAbsurdLapForTrack = CoreApi.isAbsurdLapForTrack || (()=>false);
  const getTrackPlainName = CoreApi.getTrackPlainName || (()=>'');
  const getTrackDetailsText = CoreApi.getTrackDetailsText || (()=>'');
  const formatTrackDisplayName = CoreApi.formatTrackDisplayName || (()=>'');
  const getActiveSeason = CoreApi.getActiveSeason || (()=>null);
  const getActiveTrack = CoreApi.getActiveTrack || (()=>null);
  const getTrackRecord = CoreApi.getTrackRecord || (()=>null);
  const getRaceDayTrackRecord = CoreApi.getRaceDayTrackRecord || (()=>null);
  const getActiveRaceDay = CoreApi.getActiveRaceDay || (()=>null);
  const getDriverSpeakName = CoreApi.getDriverSpeakName || (()=>'');
  const getDriver = CoreApi.getDriver || (()=>null);
  const getCar = CoreApi.getCar || (()=>null);
  const getCarsForDriver = CoreApi.getCarsForDriver || (()=>[]);
  const getCarsByDriver = CoreApi.getCarsByDriver || (()=>[]);
  const getModeLabel = CoreApi.getModeLabel || (()=>'');
  const getLapKind = CoreApi.getLapKind || (()=>'race');
  const sanitizeDiscordFilename = CoreApi.sanitizeDiscordFilename || ((name)=>String(name||'file'));
  const safeHexToRgb = CoreApi.safeHexToRgb || (()=>[255,255,255]);
  const getChartSeriesColor = CoreApi.getChartSeriesColor || (()=>'#5e97ff');
  const buildDistinctSeriesColorMap = CoreApi.buildDistinctSeriesColorMap || (()=>new Map());
  const sleep = CoreApi.sleep || (ms=>new Promise(resolve=>setTimeout(resolve, Math.max(0, Number(ms)||0))));
  const getDriverAvatarDataUrl = EntitiesApi.getDriverAvatarDataUrl || (()=>'');
  const getDriverLapSoundId = EntitiesApi.getDriverLapSoundId || (()=>'');
  const getDriverLapSoundMeta = EntitiesApi.getDriverLapSoundMeta || (()=>null);
  const refreshFinishCache = EntitiesApi.refreshFinishCache || (()=>{});
  const isDriverFinished = EntitiesApi.isDriverFinished || (()=>false);
  const resetRaceAnnounceRuntime = EntitiesApi.resetRaceAnnounceRuntime || (()=>{});
  const ensureRaceAnnounceRuntime = EntitiesApi.ensureRaceAnnounceRuntime || (()=>{});
  const speakRaceRemaining = EntitiesApi.speakRaceRemaining || (()=>{});
  const getCurrentSingleRaceStandings = EntitiesApi.getCurrentSingleRaceStandings || (()=>[]);
  const buildCurrentRacePositionsSpeech = EntitiesApi.buildCurrentRacePositionsSpeech || (()=>'');
  const maybeAnnounceOvertakeAndLapping = EntitiesApi.maybeAnnounceOvertakeAndLapping || (()=>{});
  const getSpeakNameForCar = EntitiesApi.getSpeakNameForCar || (()=>'');
  const getFinishNameForCarId = EntitiesApi.getFinishNameForCarId || (()=>'');
  const getPlacementsForRace = EntitiesApi.getPlacementsForRace || (()=>[]);
  const speakPlacementsForRace = EntitiesApi.speakPlacementsForRace || (()=>{});
  const loadImageFromUrl = EntitiesApi.loadImageFromUrl || (async()=>null);
  const setDriverAvatar = EntitiesApi.setDriverAvatar || (async()=>{});
  const removeDriverAvatar = EntitiesApi.removeDriverAvatar || (async()=>{});
  const initials = EntitiesApi.initials || (name=>String(name||'').trim().slice(0,2).toUpperCase());
  const renderDriverChip = EntitiesApi.renderDriverChip || (()=>'');
  const getTeamForDriverInMode = EntitiesApi.getTeamForDriverInMode || (()=>null);
  const getEnduranceActiveInfo = EntitiesApi.getEnduranceActiveInfo || (()=>null);
  const setEnduranceActiveInfo = EntitiesApi.setEnduranceActiveInfo || (()=>{});
  const clearEnduranceActiveInfos = EntitiesApi.clearEnduranceActiveInfos || (()=>{});
  const ensureEnduranceStintStore = EntitiesApi.ensureEnduranceStintStore || (()=>{});
  const getEnduranceStintsForRaceTeam = EntitiesApi.getEnduranceStintsForRaceTeam || (()=>[]);
  const setEnduranceStintsForRaceTeam = EntitiesApi.setEnduranceStintsForRaceTeam || (()=>{});
  const clearEnduranceStintsForRace = EntitiesApi.clearEnduranceStintsForRace || (()=>{});
  const finalizeEnduranceStint = EntitiesApi.finalizeEnduranceStint || (()=>{});
  const finalizeAllEnduranceStintsForRace = EntitiesApi.finalizeAllEnduranceStintsForRace || (()=>{});
  const getEnduranceRuleStateForTeam = EntitiesApi.getEnduranceRuleStateForTeam || (()=>({ compliant:true, violations:[] }));
  const countEnduranceStintLapsForDriver = EntitiesApi.countEnduranceStintLapsForDriver || (()=>0);
  const getTeamsForMode = EntitiesApi.getTeamsForMode || (()=>[]);
  const setTeamsForMode = EntitiesApi.setTeamsForMode || (()=>{});
  const unassignDriverFromTeams = EntitiesApi.unassignDriverFromTeams || (()=>{});
  const assignDriverToTeam = EntitiesApi.assignDriverToTeam || (()=>{});
  const getRaceRelevantLaps = RuntimeApi.getRaceRelevantLaps || (()=>[]);
  const getCurrentMrcClock = RuntimeApi.getCurrentMrcClock || (()=>null);
  const updateMrcClock = RuntimeApi.updateMrcClock || (()=>{});
  const getTimelineNowMs = RuntimeApi.getTimelineNowMs || (()=>Date.now());
  const getRaceStartTs = RuntimeApi.getRaceStartTs || (()=>0);
  const getDriverRaceTotalFromStartMs = RuntimeApi.getDriverRaceTotalFromStartMs || (()=>null);
  const getTeamRaceTotalFromStartMs = RuntimeApi.getTeamRaceTotalFromStartMs || (()=>null);
  const msToSpeechTime = RuntimeApi.msToSpeechTime || ((ms)=>String(ms||0));
  const toast = RuntimeApi.toast || (()=>{});
  const readLoopMinsFromUI = RuntimeApi.readLoopMinsFromUI || (()=>({ trainingMin:0, setupMin:0, raceMin:0.01, podiumMin:0 }));
  const getAverageLastNLapsMs = RuntimeApi.getAverageLastNLapsMs || (()=>null);
  const buildFinalRaceRowsFromStandings = RuntimeApi.buildFinalRaceRowsFromStandings || (()=>[]);
  const buildPresenterSnapshot = RuntimeApi.buildPresenterSnapshot || (()=>({}));
  const logLine = RuntimeApi.logLine || (()=>{});
  const deleteLapById = RuntimeApi.deleteLapById || (()=>{});
  const recomputeTrackRecord = RuntimeApi.recomputeTrackRecord || (()=>{});
  const getUiLanguage = LocaleApi.getUiLanguage || (()=>'de');
  const getUiLocale = LocaleApi.getUiLocale || (()=>'de-DE');
  const t = LocaleApi.t || ((key, _vars, fallback='')=>fallback || key);
  const msToTimeLegacyUnused = LocaleApi.msToTimeLegacyUnused || ((ms)=>String(ms ?? ''));
  const pickTextColorForBg = LocaleApi.pickTextColorForBg || (()=>'#fff');
  let state = getState();
  ensureAutoEntities(state);
  window.TIMTIME_SHARED = Object.assign(
    window.TIMTIME_SHARED || {},
    UtilsApi,
    DashboardApi,
    PresenterApi,
    DiscordApi,
    StateApi,
    ResultsApi,
    PagesApi,
    AudioApi,
    DomApi,
    SessionApi,
    ReaderApi,
    ChampionshipApi,
    TransportApi,
    ObsApi,
    ShellApi,
    CoreApi,
    EntitiesApi,
    RuntimeApi,
    LocaleApi,
    {
    BUILD,
    TABS,
    state,
    now,
    uid,
    clamp,
    clampInt,
    demojibake,
    sleep,
    esc,
    msToTime,
    t,
    getUiLanguage,
    getUiLocale,
    renderSessionControl,
    renderDashboard,
    openPresenterWindow,
    sendPresenterSnapshot,
    saveState,
    hydrateExternalAppData,
    ensureAutoEntities,
    getModeLabel,
    getActiveTrack,
    getTrackRecord,
    getRaceDayTrackRecord,
    getActiveSeason,
    formatTrackDisplayName,
    getDriver,
    getCar,
    getCarsForDriver,
    getCarsByDriver,
    getDriverSpeakName,
    getDriverAvatarDataUrl,
    initials,
    getEnduranceRuleStateForTeam,
    isDriverFinished,
    isAmpelRunning,
    sessionElapsedMs,
    isFreeDrivingMode,
    raceShouldShowPodium,
    getCurrentMrcClock,
    getTimelineNowMs,
    ensureRaceAnnounceRuntime,
    queueSpeak,
    speak,
    speakRaceRemaining,
    computeTimerDisplay,
    loopTick,
    singleTick,
    teamTick,
    enduranceTick,
    finishTick,
    processDiscordQueue,
    scheduleDiscordQueueProcessing,
    sessionStart,
    sessionStop,
    sessionPause,
    sessionResume,
    usbConnect,
    usbDisconnect,
    installUsbConnectDisconnectListeners,
    usbProbeOnLoad,
    setUsbUi,
    bleConnect,
    bleDisconnect,
    bleAutoReconnectOnLoad,
    kickTransportAutoReconnect,
    startTransportReconnectWatch,
    getObsStatus,
    connectObs,
    disconnectObs,
    sendObsRequest,
    setObsScene,
    testObsScene,
    setObsTextSource,
    syncObsTextSources,
    syncObsAutoScene,
    obsAutoConnectOnLoad,
    getUsbPort,
    setUsbPort,
    getUsbReader,
    setUsbReader,
    getUsbStopRead,
    setUsbStopRead,
    setBleUi,
    toast,
    logLine,
    ensureBuiltInDefaultDriverSound,
    renderAudio,
    renderEinzellaeufe,
    renderTeamrennen,
    renderLangstrecke,
    renderStammdaten,
    renderStrecken,
    renderRenntag,
    renderRenntagAuswertung,
    renderSaison,
    renderSaisonAuswertung,
    renderOBS,
    renderEinstellungen,
    getRaceDaysForSeason,
    getRaceById,
    computeTeamPointsStandings,
    computeDriverStandingsGlobal,
    computeTeamStandingsGlobal,
    parsePointsScheme,
    getDriverAggregateStatsForRaces,
    getChampionshipSettings,
    getChampionshipData,
    getSeasonStatisticsData,
    getSeasonScoringRaces,
    buildSeasonWebhookMessage,
    getRaceDayWebhookTableData,
    buildRaceDayWebhookMessage,
    getActiveRaceDay,
    setDriverAvatar,
    removeDriverAvatar,
    renderDriverChip,
    openDriverEditor,
    openCarEditor,
    getScaleDenominator,
    getTrackLengthMeters,
    getTrackPlainName,
    getTrackDetailsText,
    getTrackById,
    lapMsToAverageKmh,
    formatKmh,
    getMrcDeltaForCar,
    formatMrcDeltaMs,
    pickTextColorForBg,
    buildPresenterSnapshot,
    formatDiscordDateTime,
    buildRacePositionTimeline,
    buildRaceSummaryData,
    buildLapTableRows,
    renderRaceSummaryBlob,
    renderRaceLapTableBlob,
    buildLapColumnData,
    renderRaceLapColumnsBlob,
    renderRaceWebhookCompositeBlob,
    renderRaceDayWebhookBlob,
    renderSeasonWebhookBlob,
    sendRaceDayWebhook,
    sendSeasonWebhook,
    copyTextToClipboard,
    setDiscordPreviewText,
    setDiscordPreviewImage,
    formatDiscordPayloadPreview,
    commitSettingsDraft,
    readSettingsForm,
    exportAll,
    exportStammdaten,
    importStammdatenFromJson,
    clearRaceDataOnly,
    getAudioLibrary,
    getAudioAssetMeta,
    ensureAudioSelection,
    renderAudioAssetOptionTags,
    formatDb,
    formatSec,
    stopAudioPreview,
    calcRecommendedGainDb,
    createOrReplaceAudioAsset,
    previewAudioAsset,
    reanalyzeAudioAsset,
    removeAudioAsset
  });
  let _appDataDbPromise = null;
  let _appDataPersistTimer = null;
  let _appDataPersistInFlight = null;
  let _appDataHydrated = false;
// --------------------- Entities ---------------------
  
  
  
  // --------------------- Session / Race ---------------------
  // --------------------- Audio (TTS) ---------------------

// --------------------- Transport ---------------------
// --------------------- UI Shell ---------------------
})();









