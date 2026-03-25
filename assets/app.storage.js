window.TIMTIME_STORAGE = (function(){
  'use strict';

  function deepCloneJson(value, fallback){
    try{
      return JSON.parse(JSON.stringify(value));
    }catch{
      return fallback;
    }
  }

  function deepMerge(a,b){
    if(Array.isArray(a) || Array.isArray(b)) return (b ?? a);
    if(a && b && typeof a==='object' && typeof b==='object'){
      const out = {...a};
      for(const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
      return out;
    }
    return (b ?? a);
  }

  function buildExternalAppDataSnapshot(srcState){
    return {
      driverAvatars: { ...(((srcState && srcState.media) && srcState.media.driverAvatars) || {}) },
      laps: Array.isArray(srcState?.session?.laps) ? srcState.session.laps.map(l=>({ ...l })) : [],
      idleLaps: Array.isArray(srcState?.session?.idleLaps) ? srcState.session.idleLaps.map(l=>({ ...l })) : []
    };
  }

  function buildExternalStateChunkSnapshot(srcState){
    return {
      masterData: deepCloneJson(srcState?.masterData || { drivers:[], cars:[] }, { drivers:[], cars:[] }),
      raceDay: deepCloneJson(srcState?.raceDay || { raceDays:[], activeRaceDayId:'' }, { raceDays:[], activeRaceDayId:'' }),
      season: deepCloneJson(srcState?.season || { seasons:[], activeSeasonId:'' }, { seasons:[], activeSeasonId:'' }),
      tracks: deepCloneJson(srcState?.tracks || { tracks:[], activeTrackId:'' }, { tracks:[], activeTrackId:'' }),
      personalRecords: deepCloneJson(srcState?.personalRecords || { bySeason:{}, byRaceDay:{} }, { bySeason:{}, byRaceDay:{} }),
      enduranceStints: deepCloneJson(srcState?.modes?.endurance?.stintHistoryByRace || {}, {})
    };
  }

  function isStateChunkEmpty(chunkKey, value){
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

  function buildSlimPersistedState(srcState){
    return {
      ...srcState,
      masterData: {
        drivers: [],
        cars: []
      },
      media: {
        ...((srcState && srcState.media) || {}),
        driverAvatars: {}
      },
      personalRecords: {
        bySeason: {},
        byRaceDay: {}
      },
      season: {
        ...((srcState && srcState.season) || {}),
        seasons: []
      },
      tracks: {
        ...((srcState && srcState.tracks) || {}),
        tracks: []
      },
      raceDay: {
        ...((srcState && srcState.raceDay) || {}),
        raceDays: []
      },
      modes: {
        ...((srcState && srcState.modes) || {}),
        endurance: {
          ...(((srcState && srcState.modes) && srcState.modes.endurance) || {}),
          stintHistoryByRace: {}
        }
      },
      session: {
        ...((srcState && srcState.session) || {}),
        laps: [],
        idleLaps: []
      }
    };
  }

  function idbRequestToPromise(req){
    return new Promise((resolve, reject)=>{
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error || new Error('IndexedDB request failed'));
    });
  }

  function replaceObjectStoreData(tx, storeName, rows){
    const store = tx.objectStore(storeName);
    store.clear();
    for(const row of (rows || [])){
      if(row) store.put(row);
    }
  }

  async function readAllFromObjectStore(tx, storeName){
    const store = tx.objectStore(storeName);
    return await idbRequestToPromise(store.getAll());
  }

  return {
    deepMerge,
    buildExternalAppDataSnapshot,
    buildExternalStateChunkSnapshot,
    isStateChunkEmpty,
    buildSlimPersistedState,
    idbRequestToPromise,
    replaceObjectStoreData,
    readAllFromObjectStore
  };
})();
