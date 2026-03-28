window.TIMTIME_CHAMPIONSHIP = (function(){
  'use strict';
  function bindShared(){
    Object.assign(globalThis, window.TIMTIME_SHARED || {});
  }
function driverKeyForLapGlobal(l){
    bindShared();
    const car = l && l.carId ? getCar(l.carId) : null;
    const did = ((l && (l.driverId || '')) || car?.driverId || '').trim();
    return did || '__unknown__';
  }
  function driverNameByIdGlobal(id){
    bindShared();
    if(id==='__unknown__') return 'Unbekannt';
    const d = getDriver(id);
    return d?.name || 'Unbekannt';
  }


  function filterLapsForRaceBounds(laps, race){
    bindShared();
    if(!race) return laps || [];
    const startMrc = Number(race.startedAtMrc || 0);
    let endMrc = Number(race.endedAtMrc || 0);
    if(!endMrc || (startMrc && endMrc < startMrc)) endMrc = Number.POSITIVE_INFINITY;

    const tid = race.trackId || '';
    return (laps||[]).filter(l=>{
      if(tid && l.trackId && l.trackId!==tid) return false;
      const ts = Number(l.ts || l.time || 0);
      if(!ts) return true;
      if(ts >= 1000000000000) return false;
      if(startMrc && ts < startMrc) return false;
      if(endMrc!==Number.POSITIVE_INFINITY && ts > endMrc) return false;
      return true;
    });
  }

  function getRaceById(raceId){
    bindShared();
    const rd = getActiveRaceDay();
    if(!rd) return null;
    return (rd.races||[]).find(r=>r.id===raceId) || null;
  }

  function raceUsesBestLapRanking(race){
    bindShared();
    const submode = String(race?.submode || '').trim().toLowerCase();
    if(String(race?.mode || '').trim().toLowerCase() === 'loop'){
      const loopPhase = String(state.loopRuntime?.phase || state.loop?.phase || state.session?.loopPhase || '').trim().toUpperCase();
      return loopPhase !== 'RACE' && loopPhase !== 'PODIUM';
    }
    return submode === 'qualifying' || submode === 'training';
  }

  function sortDriverStandingRows(rows, race, opts={}){
    bindShared();
    const locale = getUiLocale();
    const bestLapRanking = raceUsesBestLapRanking(race);
    rows.sort((a,b)=>{
      if(bestLapRanking){
        const ab = a.bestMs==null ? 9e15 : a.bestMs;
        const bb = b.bestMs==null ? 9e15 : b.bestMs;
        if(ab!==bb) return ab-bb;
        const at = a.lastMs==null ? 9e15 : a.lastMs;
        const bt = b.lastMs==null ? 9e15 : b.lastMs;
        if(at!==bt) return at-bt;
        return String(a.name||'').localeCompare(String(b.name||''), locale);
      }
      return compareDriverStandingRows(a,b, opts);
    });
    return rows;
  }

  function getRelevantRaceLaps(raceId, lapsAll){
    bindShared();
    const laps = (lapsAll||[]).filter(l=>l.raceId===raceId);
    const race = getRaceById(raceId);
    return filterLapsForRaceBounds(laps, race);
  }


function compareDriverStandingRows(a,b, opts={}){
    bindShared();
  if((b.laps||0)!==(a.laps||0)) return (b.laps||0)-(a.laps||0);

  const at = a.totalMs==null ? 9e15 : a.totalMs;
  const bt = b.totalMs==null ? 9e15 : b.totalMs;
  if(at!==bt) return at-bt;
  const ab = a.bestMs==null ? 9e15 : a.bestMs;
  const bb = b.bestMs==null ? 9e15 : b.bestMs;
  if(ab!==bb) return ab-bb;
  const al = Number.isFinite(a.lastTs) ? Number(a.lastTs) : Number.MAX_SAFE_INTEGER;
  const bl = Number.isFinite(b.lastTs) ? Number(b.lastTs) : Number.MAX_SAFE_INTEGER;
  if(al!==bl) return al-bl;
  const am = a.lastMs==null ? 9e15 : a.lastMs;
  const bm = b.lastMs==null ? 9e15 : b.lastMs;
  if(am!==bm) return am-bm;
  return String(a.name||'').localeCompare(String(b.name||''),'de');
}

function computeDriverStandingsGlobal(laps){
    bindShared();
laps = (laps||[]).filter(l=>l && l.lapMs!=null);
      const raceOnly = laps.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
      if(raceOnly.length) laps = raceOnly;
      const map = new Map();
      const raceIdNow = state.session.currentRaceId || '';
      const raceId = (laps && laps[0] && laps[0].raceId) ? laps[0].raceId : '';
laps.forEach(l=>{
  const id = driverKeyForLapGlobal(l);
  if(!map.has(id)){
    map.set(id,{ id, name: driverNameByIdGlobal(id), laps:0, totalMs:0, bestMs:null, lastMs:null, lastTs:0, finished:false });
  }
  const s = map.get(id);
  s.laps++;
  s.totalMs += (l.lapMs||0);
  if(s.bestMs==null || l.lapMs < s.bestMs) s.bestMs = l.lapMs;
  if(l.ts && l.ts >= (s.lastTs||0)){
    s.lastTs = l.ts;
    s.lastMs = l.lapMs;
  }
});
const arr = Array.from(map.values());
for(const s of arr){
        s.finished = isDriverFinished(s.id);
        if(raceId){
          const rt = getDriverRaceTotalFromStartMs(raceId, s.id, laps);
          if(rt!=null) s.totalMs = rt;
        }
      }
const liveRaceForThisSet = !!(raceId && raceId===state.session.currentRaceId && state.session.state==='RUNNING' && !(state.session.finish&&state.session.finish.pending));
const race = getRaceById(raceId);
sortDriverStandingRows(arr, race, { live: liveRaceForThisSet });
return arr;
}


function parsePointsScheme(raw){
    bindShared();
  const vals = String(raw||'10,8,6,5,4,3,2,1')
    .split(/[;,\s]+/)
    .map(x=>parseInt(x,10))
    .filter(x=>Number.isFinite(x) && x>=0);
  return vals.length ? vals : [10,8,6,5,4,3,2,1];
}

function computeTeamPointsStandings(laps){
    bindShared();
  const teams = state.modes.team?.teams || [];
  const driverStandings = computeDriverStandingsGlobal(laps);
  const scheme = parsePointsScheme(state.modes.team?.pointsScheme);
  const byDriverPos = new Map();
  driverStandings.forEach((s,idx)=>{
    byDriverPos.set(s.id, { pos: idx+1, points: scheme[idx] || 0, row: s });
  });

  const rows = teams.map(t=>{
    const driverIds = (t.driverIds||[]).map(x=>String(x||'').trim()).filter(Boolean);
    const memberRows = driverIds.map(did=>{
      const p = byDriverPos.get(did);
      return {
        driverId: did,
        name: getDriver(did)?.name || 'Unbekannt',
        pos: p?.pos || null,
        points: p?.points || 0,
        laps: p?.row?.lapsCount || p?.row?.laps || 0,
        totalMs: p?.row?.totalMs ?? null,
        bestMs: p?.row?.bestMs ?? null,
        lastMs: p?.row?.lastMs ?? null
      };
    });
    const points = memberRows.reduce((s,x)=>s+(x.points||0),0);
    const lapCount = memberRows.reduce((s,x)=>s+(x.laps||0),0);
    const totalMs = memberRows.reduce((s,x)=>s+(x.totalMs||0),0);
    const bestMs = memberRows.length ? Math.min(...memberRows.map(x=>x.bestMs==null?Infinity:x.bestMs)) : null;
    const lastMs = memberRows.length ? [...memberRows].sort((a,b)=>(a.lastMs??-1)-(b.lastMs??-1)).slice(-1)[0]?.lastMs ?? null : null;
    return {
      id: t.id,
      name: t.name || 'Team',
      members: memberRows.map(x=>x.name).join(', ') || 'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â',
      memberRows,
      points,
      lapCount,
      totalMs,
      bestMs: (bestMs===Infinity?null:bestMs),
      lastMs,
      finished: false
    };
  });

  rows.sort((a,b)=> (b.points-a.points) || (b.lapCount-a.lapCount) || ((a.totalMs||9e15)-(b.totalMs||9e15)) || String(a.name).localeCompare(String(b.name),'de'));
  return rows;
}

function computeTeamStandingsGlobal(laps, mode, finish){
    bindShared();
  const teams = (mode==='team') ? (state.modes.team?.teams||[]) : (state.modes.endurance?.teams||[]);
  const raceId = (laps && laps[0] && laps[0].raceId) ? laps[0].raceId : '';
  const rows = teams.map(t=>{
    const driverIds = (t.driverIds||[]).map(x=>String(x||'').trim()).filter(Boolean);
    const carIds = new Set();
    driverIds.forEach(did=>{
      getCarsByDriver(did).forEach(c=>carIds.add(c.id));
    });
    const tlaps = laps.filter(l=>{
      if(!l) return false;
      if(l.carId && carIds.has(l.carId)) return true;
      return l.driverId && driverIds.includes(String(l.driverId));
    }).sort((a,b)=>a.ts-b.ts);
    const raceOnly2 = tlaps.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
    const rel = raceOnly2.length ? raceOnly2 : tlaps;
    const lapCount = rel.length;
    const totalMs = rel.reduce((s,l)=>s+(l.lapMs||0),0);
    const bestMs = lapCount ? Math.min(...rel.map(l=>l.lapMs||Infinity)) : null;
    const lastMs = lapCount ? rel[rel.length-1].lapMs : null;
    const members = driverIds.map(id=>driverNameByIdGlobal(id)).join(', ') || 'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â';
    let finished = false;
    if(finish && finish.pending && finish.activeCarIds && finish.finishedCarIds){
      const active = (finish.activeCarIds||[]).filter(cid=>carIds.has(cid));
      if(active.length){
        finished = active.every(cid=>!!finish.finishedCarIds[cid]);
      }
    }
    const raceTotal = raceId ? getTeamRaceTotalFromStartMs(raceId, t.id, mode, rel) : totalMs;
    const rule = (mode==='endurance' && raceId) ? getEnduranceRuleStateForTeam(t.id, raceId) : { compliant:true, invalidStintCount:0, statusText:'OK', minStint:0, stints:[], penaltySecondsTotal:0, deductedLaps:0, projectedDeductedLaps:0 };
    return {
      id:t.id,
      name:t.name||'Team',
      members,
      rawLapCount: lapCount,
      rawTotalMs: (raceTotal==null ? totalMs : raceTotal),
      lapCount: mode==='endurance' ? Math.max(0, lapCount - (rule.deductedLaps||0)) : lapCount,
      totalMs: mode==='endurance' ? (((raceTotal==null ? totalMs : raceTotal) || 0) + ((rule.penaltySecondsTotal||0) * 1000)) : (raceTotal==null ? totalMs : raceTotal),
      bestMs,
      lastMs,
      finished,
      compliant: mode==='endurance' ? !!rule.compliant : true,
      invalidStintCount: mode==='endurance' ? (rule.invalidStintCount||0) : 0,
      statusText: mode==='endurance' ? (rule.statusText||'OK') : 'OK',
      penaltySecondsTotal: mode==='endurance' ? (rule.penaltySecondsTotal||0) : 0,
      deductedLaps: mode==='endurance' ? (rule.deductedLaps||0) : 0,
      projectedDeductedLaps: mode==='endurance' ? (rule.projectedDeductedLaps||0) : 0,
      minStintLaps: mode==='endurance' ? (rule.minStint||0) : 0,
      stintCount: mode==='endurance' ? ((rule.stints||[]).length) : 0
    };
  });
  rows.sort((a,b)=>{
    if(b.lapCount!==a.lapCount) return b.lapCount-a.lapCount;
    return (a.totalMs||0)-(b.totalMs||0);
  });
  return rows;
}


function computeRaceEndHighlights(podiumRace, laps, standings){
    bindShared();
  const empty = {
    closestGapHtml: '<span class="muted">—</span>',
    comebackHtml: '<span class="muted">—</span>',
    fastestHtml: '<span class="muted">—</span>',
    leadHtml: '<span class="muted">—</span>'
  };
  if(!podiumRace || !Array.isArray(laps) || !laps.length) return empty;
  const mode = podiumRace?.mode || 'single';
  if(mode==='team' || mode==='endurance') return empty;

  const dec = 3;
  const sortedLaps = laps.slice().sort((a,b)=>(a.ts||0)-(b.ts||0));
  const byDriver = new Map();
  for(const l of sortedLaps){
    const did = driverKeyForLapGlobal(l);
    if(did==='__unknown__') continue;
    if(!byDriver.has(did)) byDriver.set(did, []);
    byDriver.get(did).push(l);
  }

  let fastest = null;
  for(const l of sortedLaps){
    if(l.lapMs==null) continue;
    if(!fastest || l.lapMs < fastest.lapMs) fastest = l;
  }

  const firstLapOrder = Array.from(byDriver.entries())
    .map(([did, arr])=>({ did, ts: Number(arr[0]?.ts||0) }))
    .sort((a,b)=>a.ts-b.ts)
    .map((x,i)=>({ did:x.did, startPos:i+1 }));
  const startPosByDriver = new Map(firstLapOrder.map(x=>[x.did, x.startPos]));
  let comeback = null;
  (standings||[]).forEach((row, idx)=>{
    const startPos = startPosByDriver.get(row.id);
    const finalPos = idx + 1;
    if(!startPos) return;
    const gain = startPos - finalPos;
    if(gain > 0 && (!comeback || gain > comeback.gain || (gain===comeback.gain && finalPos < comeback.finalPos))){
      comeback = { id: row.id, name: row.name, gain, startPos, finalPos };
    }
  });

  const progress = new Map();
  const leadCounts = new Map();
  for(const l of sortedLaps){
    const did = driverKeyForLapGlobal(l);
    if(did==='__unknown__') continue;
    if(!progress.has(did)) progress.set(did, { id: did, name: driverNameByIdGlobal(did), laps:0, totalMs:0, bestMs:null, lastMs:null });
    const p = progress.get(did);
    p.laps += 1;
    p.totalMs += Number(l.lapMs||0);
    p.lastMs = Number(l.lapMs||0);
    p.bestMs = (p.bestMs==null) ? Number(l.lapMs||0) : Math.min(p.bestMs, Number(l.lapMs||0));
    const rows = Array.from(progress.values()).slice().sort((a,b)=>{
      if(b.laps!==a.laps) return b.laps-a.laps;
      if((a.totalMs||0)!==(b.totalMs||0)) return (a.totalMs||0)-(b.totalMs||0);
      if((a.bestMs??9e15)!==(b.bestMs??9e15)) return (a.bestMs??9e15)-(b.bestMs??9e15);
      return (a.lastMs??9e15)-(b.lastMs??9e15);
    });
    const leader = rows[0];
    // Fuehrungsrunden sollen nur dann zaehlen, wenn der Fahrer mit dieser
    // Ueberfahrt selbst eine Runde als Fuehrender abgeschlossen hat.
    if(leader && leader.id===did){
      leadCounts.set(leader.id, (leadCounts.get(leader.id)||0) + 1);
    }
  }
  let leadLeader = null;
  for(const [did, count] of leadCounts.entries()){
    const name = driverNameByIdGlobal(did);
    if(!leadLeader || count > leadLeader.count) leadLeader = { id: did, name, count };
  }

  let closest = null;
  for(let i=0;i<(standings||[]).length-1;i++){
    const a = standings[i], b = standings[i+1];
    if((a.laps||a.lapsCount||0)===(b.laps||b.lapsCount||0) && a.totalMs!=null && b.totalMs!=null){
      const gapMs = Math.abs(Number(b.totalMs)-Number(a.totalMs));
      if(!closest || gapMs < closest.gapMs){
        closest = { a, b, gapMs, text: `${esc(a.name)} vor ${esc(b.name)} • <span class="mono">${msToTime(gapMs, dec)}</span>` };
      }
    }
  }
  if(!closest && (standings||[]).length>=2){
    const a = standings[0], b = standings[1];
    const lapDiff = Math.max(0, ((a.laps||a.lapsCount||0) - (b.laps||b.lapsCount||0)));
    closest = { a, b, gapMs: null, text: lapDiff>0 ? `${esc(a.name)} vor ${esc(b.name)} • ${lapDiff} Runde${lapDiff===1?'':'n'}` : `${esc(a.name)} vor ${esc(b.name)}` };
  }

  return {
    closestGapHtml: closest ? closest.text : '<span class="muted">—</span>',
    comebackHtml: comeback ? `${esc(comeback.name)} • +${comeback.gain} Plätze` : '<span class="muted">—</span>',
    fastestHtml: fastest ? `${esc(driverNameByIdGlobal(driverKeyForLapGlobal(fastest)))} • <span class="mono">${msToTime(fastest.lapMs, dec)}</span>` : '<span class="muted">—</span>',
    leadHtml: leadLeader ? `${esc(leadLeader.name)} • ${leadLeader.count} Führungsrunde${leadLeader.count===1?'':'n'}` : '<span class="muted">—</span>'
  };
}

function renderRaceEndHighlightsHtml(highlights){
    bindShared();
  const h = highlights || {
    closestGapHtml: '<span class="muted">—</span>',
    comebackHtml: '<span class="muted">—</span>',
    fastestHtml: '<span class="muted">—</span>',
    leadHtml: '<span class="muted">—</span>'
  };
  const item = (label, value) => `<div class="card rehCard"><div class="card-b rehCardB"><span class="muted small rehLabel">${label}</span><span class="rehValue">${value}</span></div></div>`;
  return demojibake(`
    <div class="raceEndHighlights rehInline" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:12px; margin:12px 0 14px; align-items:stretch;">
      ${item('Knappster Abstand', h.closestGapHtml)}
      ${item('Groesste Aufholjagd', h.comebackHtml)}
      ${item('Schnellste Runde', h.fastestHtml)}
      ${item('Meiste Fuehrungsrunden', h.leadHtml)}
    </div>`);
}

function renderPodiumSectionGlobal(podiumRace){
    bindShared();
const mode = podiumRace?.mode || 'single';
const laps = state.session.laps.filter(l=>l.raceId===podiumRace.id);
const dec = 3;
// Finish-window status (used to show checkered flag when a driver/team has completed)
const finish = (state.session.finish && state.session.finish.pending) ? state.session.finish : null;

const finishedCarIds = new Set();
const finishedDriverIds = new Set();
if(finish && finish.finishedCarIds){
  for(const carId of Object.keys(finish.finishedCarIds)){
    finishedCarIds.add(carId);
    const c = getCar(carId);
    const did = (c?.driverId||'').trim();
    if(did) finishedDriverIds.add(did);
  }
}
let standings = [];
let isTeams = (mode==='team' || mode==='endurance');
if(isTeams){
  standings = computeTeamStandingsGlobal(laps, mode, finish);
} else {
  standings = computeDriverStandingsGlobal(laps);
}

const top = standings.slice(0,3).map(x=> isTeams ? ({...x, isTeam:true}) : x);
const rest = standings.slice(3).map(x=> isTeams ? ({...x, isTeam:true}) : x);

function box(pos, data){
    bindShared();
  if(!data){
    return `<div class="podiumStep p${pos}">
      <div class="podiumPos">${pos}</div>
      <div class="podiumName muted">—</div>
    </div>`;
  }
  if(isTeams){
    return `<div class="podiumStep p${pos}">
      <div class="podiumPos">${pos}</div>
      <div class="podiumProfile">
        ${(()=>{const nm=(data.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return `<div class=\"podiumThumb podiumThumbPlaceholder\"><span>${esc(ini||'?')}</span></div>`;})()}
        <div class="podiumInfoCol">
          <div class="podiumName"><span class="nm">${esc(data.name)}</span>${data.finished?'<span class="finishFlag">🏁</span>':''}</div>
          <div class="podiumSub small muted">${esc(data.members)}</div>
          ${(mode==='endurance' && data.compliant===false) ? `<div class="podiumSub small" style="color:#ff8f8f">${esc(data.statusText||'Regelverstoss')}</div>` : ''}
          <div class="podiumStats small">
            ${(mode==='team')?`<div><span>Punkte</span><b>${data.points||0}</b></div>`:''}
            <div><span>Runden</span><b>${data.lapCount||0}</b></div>
            <div><span>Zeit</span><b class="mono">${data.totalMs?msToTime(data.totalMs, dec):'—'}</b></div>
          </div>
        </div>
      </div>
    </div>`;
  } else {
    return `<div class="podiumStep p${pos}">
      <div class="podiumPos">${pos}</div>
      <div class="podiumProfile">
        ${(()=>{const url=getDriverAvatarDataUrl(data.id);const nm=(data.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return url?`<img class=\"podiumThumb\" src=\"${esc(url)}\" alt=\"\"/>`:`<div class=\"podiumThumb podiumThumbPlaceholder\"><span>${esc(ini||'?')}</span></div>`;})()}
        <div class="podiumInfoCol">
          <div class="podiumName"><span class="nm">${esc(data.name)}</span>${data.finished?'<span class="finishFlag">🏁</span>':''}</div>
          <div class="podiumStats small">
            <div><span>Runden</span><b>${data.laps}</b></div>
            <div><span>Zeit</span><b class="mono">${data.totalMs?msToTime(data.totalMs, dec):'—'}</b></div>
            <div><span>Best</span><b class="mono">${data.bestMs!=null?msToTime(data.bestMs, dec):'—'}</b></div>
          </div>
        </div>
      </div>
    </div>`;
  }
}

const __podiumConfettiHtml = (typeof buildPodiumConfettiHtml === "function") ? buildPodiumConfettiHtml() : '<div class="podiumConfetti" aria-hidden="true"></div>';
const podiumHtml = `
  <div class="card podiumCard">
    ${__podiumConfettiHtml}
    <div class="row" style="align-items:center; justify-content:space-between; gap:12px;">
      <div>
        <div class="title">🏁 Siegerpodest</div>
        <div class="muted small">${esc(podiumRace.name||'Rennen')} • beendet ${new Date(podiumRace.endedAt).toLocaleString('de-DE')}</div>
      </div>
      <button class="btn" id="btnClosePodium">Schließen</button>
    </div>

    <div class="podiumWrap">
      <div class="podiumCol second">${box(2, top[1])}</div>
      <div class="podiumCol first">${box(1, top[0])}</div>
      <div class="podiumCol third">${box(3, top[2])}</div>
    </div>

    <div class="hr"></div>

    ${isTeams ? `
      <div class="muted">Restliche PlÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tze</div>
      <table class="table">
        <thead><tr><th>#</th><th>Team</th><th>Runden</th><th>Gesamtzeit</th><th>Best</th><th>Letzte</th></tr></thead>
        <tbody>
          ${rest.map((t,i)=>`<tr>
            <td class="mono">${i+4}</td>
            <td><b>${esc(t.name)}</b><div class="muted tiny">${esc(t.members)}</div>${(mode==='endurance' && t.compliant===false)?`<div class="tiny" style="color:#ff8f8f">${esc(t.statusText||'Regelverstoss')}</div>`:''}</td>
            <td class="mono">${t.lapCount}</td>
            <td class="mono">${t.totalMs?msToTime(t.totalMs, dec):'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â'}</td>
            <td class="mono">${t.bestMs!=null && isFinite(t.bestMs)?msToTime(t.bestMs, dec):'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â'}</td>
            <td class="mono">${t.lastMs!=null && isFinite(t.lastMs)?msToTime(t.lastMs, dec):'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â'}</td>
          </tr>`).join('') || `<tr><td colspan="6" class="muted">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</td></tr>`}
        </tbody>
      </table>
    ` : `
      <div class="muted">Restliche PlÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤tze</div>
      <table class="table">
        <thead><tr><th>#</th><th>Fahrer</th><th>Runden</th><th>Gesamtzeit</th><th>Best</th><th>Letzte</th></tr></thead>
        <tbody>
          ${rest.map((s,i)=>`<tr>
            <td class="mono">${i+4}</td>
            <td><div class="nameCell">${(()=>{const url=getDriverAvatarDataUrl(s.id);const nm=(s.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return url?`<img class=\"avatar\" src=\"${esc(url)}\" alt=\"\"/>`:`<div class=\"avatar fallback\">${esc(ini||'?')}</div>`;})()}<span class="nm">${esc(s.name)}</span>${s.finished?'<span class="finishFlag">ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€šÃ‚ÂÃƒâ€šÃ‚Â</span>':''}</div></td>
            <td class="mono">${s.laps}</td>
            <td class="mono">${s.totalMs?msToTime(s.totalMs, dec):'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â'}</td>
            <td class="mono">${s.bestMs!=null?msToTime(s.bestMs, dec):'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â'}</td>
            <td class="mono">${s.lastMs!=null?msToTime(s.lastMs, dec):'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â'}</td>
          </tr>`).join('') || `<tr><td colspan="6" class="muted">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</td></tr>`}
        </tbody>
      </table>
    `}
  </div>
`;

return demojibake(podiumHtml);
}


  function getRaceDaysForSeason(seasonId){
    bindShared();
    return (state.raceDay?.raceDays||[]).filter(rd=>rd.seasonId===seasonId);
  }

  function getRacesForRaceDay(rd){
    bindShared();
    return (rd?.races||[]).slice();
  }

  function getRacesForSeason(seasonId){
    bindShared();
    return getRaceDaysForSeason(seasonId).flatMap(rd => (rd.races||[]).map(r=>({ ...r, __raceDayId: rd.id, __raceDayName: rd.name })));
  }

  function getRaceTrackName(race){
    bindShared();
    const t = state.tracks.tracks.find(x=>x.id===race?.trackId);
    return formatTrackDisplayName(t);
  }

  function getAverageValidLapMsForDriver(driverId, laps){
    bindShared();
    const vals = (laps||[]).filter(l=>{
      const did = String(l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim();
      if(did !== driverId) return false;
      if(l.lapMs==null) return false;
      const track = state.tracks.tracks.find(t=>t.id===l.trackId);
      const maxMs = (track?.minLapMs || 0) * 3;
      if(maxMs > 0 && l.lapMs > maxMs) return false;
      return true;
    }).map(l=>l.lapMs);
    if(!vals.length) return null;
    return vals.reduce((a,b)=>a+b,0) / vals.length;
  }

  function getBestTimesByTrackForDriver(driverId, laps){
    bindShared();
    const by = {};
    for(const l of (laps||[])){
      const did = String(l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim();
      if(did !== driverId) continue;
      if(l.lapMs==null) continue;
      const tid = l.trackId || '';
      if(!tid) continue;
      if(by[tid]==null || l.lapMs < by[tid]) by[tid] = l.lapMs;
    }
    return by;
  }

  function getDriverAggregateStatsForRaces(races){
    bindShared();
    const allDrivers = (state.masterData?.drivers||[]).slice();
    const allLaps = state.session.laps || [];
    const out = allDrivers.map(d=>({
      driver:d,
      races:0,
      p1:0,
      p2:0,
      p3:0,
      podiums:0,
      fastestLapCount:0,
      avgMs:null,
      avgPos:null,
      posStdDev:null,
      consistencyScore:null,
      bestByTrack:{},
      positions:[]
    }));

    const byId = Object.fromEntries(out.map(x=>[x.driver.id, x]));
    const raceIds = new Set((races||[]).map(r=>r.id));

    for(const race of (races||[])){
      const laps = getRelevantRaceLaps(race.id, allLaps);
      const standings = computeDriverStandingsGlobal(laps);
      standings.forEach((s, idx)=>{
        const row = byId[s.id];
        if(!row) return;
        const pos = idx + 1;
        row.races += 1;
        row.positions.push(pos);
        if(idx===0) row.p1 += 1;
        if(idx===1) row.p2 += 1;
        if(idx===2) row.p3 += 1;
      });

      const fastestByDriver = new Map();
      for(const lap of laps){
        const did = String(lap?.driverId || (lap?.carId ? (getCar(lap.carId)?.driverId||'') : '') || '').trim();
        if(!did) continue;
        const ms = Number(lap?.lapMs||0);
        if(!(ms>0)) continue;
        const prev = fastestByDriver.get(did);
        if(prev==null || ms < prev) fastestByDriver.set(did, ms);
      }
      let fastestDriverId = '';
      let fastestMs = Infinity;
      for(const [did, ms] of fastestByDriver.entries()){
        if(ms < fastestMs){ fastestMs = ms; fastestDriverId = did; }
      }
      if(fastestDriverId && byId[fastestDriverId]) byId[fastestDriverId].fastestLapCount += 1;
    }

    const lapsSubset = allLaps.filter(l=>raceIds.has(l.raceId));
    for(const row of out){
      row.avgMs = getAverageValidLapMsForDriver(row.driver.id, lapsSubset);
      row.bestByTrack = getBestTimesByTrackForDriver(row.driver.id, lapsSubset);
      row.podiums = (row.p1||0) + (row.p2||0) + (row.p3||0);
      if(row.positions.length){
        const avgPos = row.positions.reduce((a,b)=>a+b,0) / row.positions.length;
        row.avgPos = avgPos;
        const variance = row.positions.reduce((a,p)=>a + Math.pow(p-avgPos,2),0) / row.positions.length;
        row.posStdDev = Math.sqrt(variance);
        row.consistencyScore = (avgPos * 1000) + (row.posStdDev * 100) - (row.p1 * 10) - row.fastestLapCount;
      }
    }

    out.sort((a,b)=>(b.p1-a.p1)||(b.podiums-a.podiums)||((a.avgPos??9e15)-(b.avgPos??9e15))||((a.avgMs??9e15)-(b.avgMs??9e15))||((a.driver.name||'').localeCompare(b.driver.name||'','de')));
    return out;
  }

  function renderBestByTrackCell(bestByTrack){
    bindShared();
    const entries = Object.entries(bestByTrack||{});
    if(!entries.length) return '<span class="muted">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</span>';
    entries.sort((a,b)=>{
      const ta = state.tracks.tracks.find(t=>t.id===a[0])?.name || a[0];
      const tb = state.tracks.tracks.find(t=>t.id===b[0])?.name || b[0];
      return ta.localeCompare(tb,'de');
    });
    return entries.map(([tid,ms])=>{
      const nm = state.tracks.tracks.find(t=>t.id===tid)?.name || tid;
      return `<div><b>${esc(formatTrackDisplayName(state.tracks.tracks.find(t=>t.id===tid) || {id:tid,name:nm,setup:{}}))}</b>: <span class="mono">${esc(msToTime(ms,3))}</span></div>`;
    }).join('');
  }

  function renderSessionDriverColumns(race){
    bindShared();
    if(!race) return '<div class="muted">Keine Session gewÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤hlt.</div>';
    const laps = getRelevantRaceLaps(race.id, state.session.laps||[]).slice().sort((a,b)=>a.ts-b.ts);
    const driverIds = Array.from(new Set(laps.map(l=>String(l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim()).filter(Boolean)));
    const drivers = driverIds.map(id=>getDriver(id)).filter(Boolean);
    if(!drivers.length) return '<div class="muted">Keine Fahrer in dieser Session.</div>';

    const selectedId = state.ui.analysisSessionDriverId || drivers[0]?.id || '';
    const driver = drivers.find(d=>d.id===selectedId) || drivers[0] || null;
    const dlaps = driver ? laps.filter(l=>String(l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim()===driver.id) : [];
    const best = dlaps.length ? Math.min(...dlaps.map(l=>l.lapMs||9e15)) : null;

    return `
      <div class="field">
        <label>Fahrer</label>
        <select id="analysisSessionDriverSel">
          ${drivers.map(d=>`<option value="${esc(d.id)}" ${d.id===driver?.id?'selected':''}>${esc(d.name)}</option>`).join('')}
        </select>
      </div>
      ${driver ? `
        <div class="card" style="margin-top:12px">
          <div class="card-h"><h2>${esc(driver.name)}</h2></div>
          <div class="card-b">
            <div class="row wrap" style="gap:8px">
              <span class="badge">Runden: ${dlaps.length}</span>
              <span class="badge">Best: ${best!=null ? esc(msToTime(best,3)) : 'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â'}</span>
            </div>
            <div class="hr"></div>
            <table class="table">
              <thead><tr><th>#</th><th>Zeit</th><th>Phase</th><th class="small">Uhrzeit</th><th></th></tr></thead>
              <tbody>
                ${dlaps.map((l,idx)=>`
                  <tr>
                    <td>${idx+1}</td>
                    <td class="mono">${esc(msToTime(l.lapMs,3))}</td>
                    <td>${esc(l.phase||'')}</td>
                    <td class="small">${esc(new Date(l.ts).toLocaleTimeString('de-DE',{hour12:false}))}</td>
                    <td style="text-align:right"><button class="btn" style="padding:6px 10px" data-del-lap-analysis="${esc(l.id)}">ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“</button></td>
                  </tr>
                `).join('') || `<tr><td colspan="5" class="muted">Keine Runden.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      ` : '<div class="muted">Kein Fahrer gewÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤hlt.</div>'}
    `;
  }

function renderRenntagAuswertung(){
    bindShared();
    const el = document.getElementById('pageRenntagAuswertung');
    const rd = getActiveRaceDay();
    if(!rd){ el.innerHTML=`<div class="card"><div class="card-b">${esc(t('renntag.none'))}</div></div>`; return; }

    const races = (rd.races||[]).slice().sort((a,b)=>(b.startedAt||0)-(a.startedAt||0));
    const stats = getDriverAggregateStatsForRaces(races).filter(x=>x.races>0);
    const selectedRaceId = state.ui.analysisRaceId || (races[0]?.id || '');
    if(selectedRaceId !== (state.ui.analysisRaceId||'')){ state.ui.analysisRaceId = selectedRaceId; saveState(); }
    const race = races.find(r=>r.id===selectedRaceId) || null;
    const winsLeader = stats.slice().sort((a,b)=>(b.p1-a.p1)||((a.avgPos??9e15)-(b.avgPos??9e15))||((a.avgMs??9e15)-(b.avgMs??9e15)))[0] || null;
    const podiumLeader = stats.slice().sort((a,b)=>(b.podiums-a.podiums)||(b.p1-a.p1)||((a.avgPos??9e15)-(b.avgPos??9e15)))[0] || null;
    const fastestLeader = stats.slice().sort((a,b)=>(b.fastestLapCount-a.fastestLapCount)||((a.avgMs??9e15)-(b.avgMs??9e15)))[0] || null;
    const consistencyLeader = stats.filter(x=>x.races>1).slice().sort((a,b)=>(a.consistencyScore??9e15)-(b.consistencyScore??9e15)||((a.avgPos??9e15)-(b.avgPos??9e15))||((b.p1||0)-(a.p1||0)))[0] || stats.slice().sort((a,b)=>(a.consistencyScore??9e15)-(b.consistencyScore??9e15))[0] || null;

    el.innerHTML = demojibake(`
      <div class="card">
        <div class="card-h"><h2>Renntag Auswertung</h2></div>
        <div class="card-b">
          <div class="row wrap" style="gap:10px">
            <span class="badge">Renntag: ${esc(rd.name)}</span>
            <span class="badge">Sessions: ${races.length}</span>
            <span class="badge">Fahrer: ${stats.length}</span>
          </div>
          <div class="row wrap discord-preview-wrap" style="gap:10px; margin-top:12px">
            <div class="card" style="width:100%">
              <div class="card-h"><h3>Discord Vorschau</h3></div>
              <div class="card-b">
                <div class="discord-preview-grid">
                  <div class="discord-preview-pane">
                    <div class="muted small" style="margin-bottom:8px">Text</div>
                    <pre class="discord-preview-text" id="raceDayDiscordPreviewText">Lade Vorschau...</pre>
                  </div>
                  <div class="discord-preview-pane">
                    <div class="muted small" style="margin-bottom:8px">Bild</div>
                    <div class="discord-preview-imagebox" id="raceDayDiscordPreviewImage"><div class="muted small">Lade Bild...</div></div>
                  </div>
                </div>
                <div class="row wrap" style="gap:10px; margin-top:12px">
                  <button class="btn" id="btnRaceDayForumCopy" type="button">Forum-Text kopieren</button>
                  <button class="btn" id="btnRaceDayWebhook" type="button">Renntag an Discord senden</button>
                </div>
                <div class="muted small" style="margin-top:8px">Vorschau von Text und Bild, die an Discord gesendet werden. Für Forum-Kanäle kann optional ein Thread/Post erstellt werden.</div>
              </div>
            </div>
          </div>
          <div class="muted small" style="margin-top:8px">Sendet pro Strecke alle Fahrer mit ihrer besten Runde dieses Renntags. Für Forum-Kanäle kann optional ein Thread/Post erstellt werden.</div>
          <div class="hr"></div>
          <div class="renntag-highlights-grid" style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:12px; align-items:stretch">
            <div class="card"><div class="card-b"><div class="muted small">Meiste Siege</div><div style="font-weight:800; font-size:20px; margin-top:4px">${winsLeader?esc(winsLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${winsLeader?`${winsLeader.p1} Sieg${winsLeader.p1===1?'':'e'}`:'Keine Daten'}</div></div></div>
            <div class="card"><div class="card-b"><div class="muted small">Meiste Podien</div><div style="font-weight:800; font-size:20px; margin-top:4px">${podiumLeader?esc(podiumLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${podiumLeader?`${podiumLeader.podiums} Podien`:'Keine Daten'}</div></div></div>
            <div class="card"><div class="card-b"><div class="muted small">Meiste schnellste Runden</div><div style="font-weight:800; font-size:20px; margin-top:4px">${fastestLeader?esc(fastestLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${fastestLeader?`${fastestLeader.fastestLapCount}x schnellste Runde`:'Keine Daten'}</div></div></div>
            <div class="card"><div class="card-b"><div class="muted small">Konstant am stärksten</div><div style="font-weight:800; font-size:20px; margin-top:4px">${consistencyLeader?esc(consistencyLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${consistencyLeader && consistencyLeader.avgPos!=null?`Ø Platz ${esc((consistencyLeader.avgPos||0).toFixed(2).replace('.',','))}`:'Keine Daten'}</div></div></div>
          </div>
          <div class="hr"></div>
          <table class="table">
            <thead><tr><th>Fahrer</th><th>Rennen</th><th>Siege</th><th>Podien</th><th>Schnellste Runde</th><th>Ø Platzierung</th><th>Ø Runde</th><th>Bestzeiten je Strecke</th></tr></thead>
            <tbody>
              ${stats.map(x=>`
                <tr>
                  <td>${esc(x.driver.name||'—')}</td>
                  <td>${x.races||0}</td>
                  <td>${x.p1||0}</td>
                  <td>${x.podiums||0}</td>
                  <td>${x.fastestLapCount||0}</td>
                  <td>${x.avgPos!=null ? esc(x.avgPos.toFixed(2).replace('.',',')) : '—'}</td>
                  <td class="mono">${x.avgMs!=null ? esc(msToTime(x.avgMs,3)) : '—'}</td>
                  <td>${renderBestByTrackCell(x.bestByTrack)}</td>
                </tr>
              `).join('') || `<tr><td colspan="8" class="muted">Keine Daten.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="card-h"><h2>Session Auswertung</h2></div>
        <div class="card-b">
          <div class="field">
            <label>Session</label>
            <select id="analysisRaceSel">
              ${races.map(r=>`<option value="${esc(r.id)}" ${r.id===selectedRaceId?'selected':''}>${esc(r.name)} • ${esc(getRaceTrackName(r))}</option>`).join('') || `<option value="">(keine Sessions)</option>`}
            </select>
          </div>
          <div class="row wrap" style="gap:10px; margin-top:12px">
            <button class="btn" id="btnAnalysisSessionDiscord" type="button" ${race?'':'disabled'}>Session an Discord senden</button>
          </div>
          <div class="muted small" style="margin-top:8px">Sendet die aktuell ausgewählte Session mit Summary-Grafik und Rundenübersicht an den Session-Webhook.</div>
          ${race ? `
            <div class="hr"></div>
            <div class="muted">${race.endedAt ? 'Podium' : 'Aktuelle Platzierung'}</div>
            ${renderPodiumSectionGlobal(race)}
          ` : ''}
          <div class="hr"></div>
          ${renderSessionDriverColumns(race)}
        </div>
      </div>
    `);

    const sel = el.querySelector('#analysisRaceSel');
    if(sel) sel.onchange = (e)=>{ state.ui.analysisRaceId = e.target.value; state.ui.analysisSessionDriverId = ''; saveState(); renderRenntagAuswertung(); };
    const dsel = el.querySelector('#analysisSessionDriverSel');
    if(dsel) dsel.onchange = (e)=>{ state.ui.analysisSessionDriverId = e.target.value; saveState(); renderRenntagAuswertung(); };
    const previewRoot = el;
    Promise.resolve().then(async ()=>{
      try{
        const msg = buildRaceDayWebhookMessage(rd.id);
        const blob = await renderRaceDayWebhookBlob(rd.id);
        if(previewRoot !== document.getElementById('pageRenntagAuswertung')) return;
        setDiscordPreviewText(previewRoot, '#raceDayDiscordPreviewText', formatDiscordPayloadPreview(msg.payload));
        setDiscordPreviewImage(previewRoot, '#raceDayDiscordPreviewImage', blob, 'Renntag Discord Vorschau');
      }catch(err){
        setDiscordPreviewText(previewRoot, '#raceDayDiscordPreviewText', 'Vorschau konnte nicht geladen werden.');
        setDiscordPreviewImage(previewRoot, '#raceDayDiscordPreviewImage', null, 'Vorschau konnte nicht geladen werden');
        logLine('Renntag Vorschau Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }
    });
    el.querySelectorAll('[data-del-lap-analysis]').forEach(btn=>{
      btn.onclick = ()=>{
        deleteLapById(btn.getAttribute('data-del-lap-analysis'));
        renderRenntagAuswertung();
        renderRenntag();
        renderDashboard();
      };
    });
    const btnRaceDayWebhook = el.querySelector('#btnRaceDayWebhook');
    if(btnRaceDayWebhook){
      btnRaceDayWebhook.onclick = async ()=>{
        btnRaceDayWebhook.disabled = true;
        const prev = btnRaceDayWebhook.textContent;
        btnRaceDayWebhook.textContent = 'Sende...';
        try{
          await sendRaceDayWebhook(rd.id);
          toast('Discord','Renntag gesendet.','ok');
          logLine('Renntag Webhook gesendet: ' + (rd.name||rd.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Renntag in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Renntag ' + String(rd.name || rd.id));
          }else{
            toast('Discord','Renntag-Webhook fehlgeschlagen.','err');
            logLine('Renntag Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnRaceDayWebhook.disabled = false;
          btnRaceDayWebhook.textContent = prev;
        }
      };
    }
    const btnRaceDayForumCopy = el.querySelector('#btnRaceDayForumCopy');
    if(btnRaceDayForumCopy){
      btnRaceDayForumCopy.onclick = async ()=>{
        try{
          const msg = buildRaceDayWebhookMessage(rd.id);
          await copyTextToClipboard(msg.forumText);
          toast('Forum','Renntag-Text kopiert.','ok');
        }catch(err){
          toast('Forum','Kopieren fehlgeschlagen.','err');
          logLine('Renntag Forum-Text Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      };
    }
    const btnAnalysisSessionDiscord = el.querySelector('#btnAnalysisSessionDiscord');
    if(btnAnalysisSessionDiscord){
      btnAnalysisSessionDiscord.onclick = async ()=>{
        if(!race) return;
        btnAnalysisSessionDiscord.disabled = true;
        const prev = btnAnalysisSessionDiscord.textContent;
        btnAnalysisSessionDiscord.textContent = 'Sende...';
        try{
          await sendDiscordSummaryForRace(race.id, { force:true });
          toast('Discord','Session gesendet.','ok');
          logLine('Session Webhook gesendet: ' + (race.name||race.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Session in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Session ' + String(race.name || race.id));
          }else{
            toast('Discord','Session-Webhook fehlgeschlagen.','err');
            logLine('Session Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnAnalysisSessionDiscord.disabled = false;
          btnAnalysisSessionDiscord.textContent = prev;
        }
      };
    }
  }


  function getSeasonScoringRaces(seasonId){
    bindShared();
    return getRacesForSeason(seasonId)
      .filter(r => !!r?.endedAt && raceShouldShowPodium(r))
      .sort((a,b)=>(a.startedAt||0)-(b.startedAt||0));
  }

  function getFastestDriverIdFromLaps(laps){
    bindShared();
    let bestDid = '';
    let bestMs = Infinity;
    for(const lap of (laps||[])){
      const did = String(lap?.driverId || (lap?.carId ? (getCar(lap.carId)?.driverId||'') : '') || '').trim();
      const ms = Number(lap?.lapMs || 0);
      if(!did || !(ms>0)) continue;
      if(ms < bestMs){ bestMs = ms; bestDid = did; }
    }
    return bestDid;
  }

  function getSeasonPointsColor(key, idx){
    bindShared();
    const src = String(key||idx||'x');
    let h = 0;
    for(let i=0;i<src.length;i++) h = (h*31 + src.charCodeAt(i)) % 360;
    return `hsl(${h}, 72%, 58%)`;
  }

  function sumBestPoints(values, limit){
    bindShared();
    const arr = (values||[]).slice().sort((a,b)=>b-a);
    if(limit>0) arr.length = Math.min(arr.length, limit);
    return arr.reduce((a,b)=>a+(Number(b)||0),0);
  }

  function getSeasonBaseRows(seasonId){
    bindShared();
    const allLaps = state.session.laps || [];
    const races = getSeasonScoringRaces(seasonId);
    const byId = {};
    const raceLabels = [];

    for(const race of races){
      const laps = getRelevantRaceLaps(race.id, allLaps);
      const standings = computeDriverStandingsGlobal(laps);
      const participants = standings.length;
      if(!participants) continue;
      const fastestDid = getFastestDriverIdFromLaps(laps);
      const raceIndex = raceLabels.length;
      raceLabels.push({
        id: race.id,
        label: `${raceIndex+1}`,
        trackName: getRaceTrackName(race),
        name: race.name || `Rennen ${raceIndex+1}`,
        participants,
        fastestDriverId: fastestDid || ''
      });
      for(const s of standings){
        if(!byId[s.id]){
          const driver = getDriver(s.id) || { id:s.id, name:s.name||'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â' };
          byId[s.id] = {
            driver,
            races:0,
            wins:0,
            podiums:0,
            fastestLapCount:0,
            positions:[],
            grossHistory:[],
            color: getSeasonPointsColor(driver.id || driver.name, Object.keys(byId).length),
            avgMs:null,
            bestByTrack:{},
            perRaceStats:[],
            racePointValues:[],
            fastestBonusFlags:[]
          };
        }
      }
      standings.forEach((s, idx)=>{
        const row = byId[s.id];
        const pos = idx + 1;
        row.races += 1;
        row.positions.push(pos);
        if(pos===1) row.wins += 1;
        if(pos<=3) row.podiums += 1;
        row.perRaceStats.push({
          raceId: race.id,
          raceName: race.name || `Rennen ${raceIndex+1}`,
          raceLabel: `${raceIndex+1}`,
          participants,
          position: pos,
          laps: s.laps,
          totalMs: s.totalMs,
          bestMs: s.bestMs,
          finalGapMs: s.finalGapMs,
          wasFastest: fastestDid === s.id
        });
      });
      if(fastestDid && byId[fastestDid]) byId[fastestDid].fastestLapCount += 1;
      const ids = Object.keys(byId);
      for(const id of ids){
        const row = byId[id];
        row.grossHistory.push(row.races);
      }
    }

    const raceIdSet = new Set(races.map(r=>r.id));
    const lapsSubset = allLaps.filter(l=>raceIdSet.has(l.raceId));
    const rows = Object.values(byId);
    for(const row of rows){
      row.avgMs = getAverageValidLapMsForDriver(row.driver.id, lapsSubset);
      row.bestByTrack = getBestTimesByTrackForDriver(row.driver.id, lapsSubset);
      if(row.positions.length){
        row.avgPos = row.positions.reduce((a,b)=>a+b,0) / row.positions.length;
        const variance = row.positions.reduce((a,p)=>a + Math.pow(p-row.avgPos,2),0) / row.positions.length;
        row.posStdDev = Math.sqrt(variance);
        row.consistencyScore = (row.avgPos * 1000) + (row.posStdDev * 120) - (row.wins * 20) - (row.fastestLapCount * 5);
      }else{
        row.avgPos = null;
        row.posStdDev = null;
        row.consistencyScore = null;
      }
    }
    rows.sort((a,b)=>(b.wins-a.wins)||(b.podiums-a.podiums)||(b.fastestLapCount-a.fastestLapCount)||((a.avgPos??9e15)-(b.avgPos??9e15))||((a.avgMs??9e15)-(b.avgMs??9e15))||((a.driver.name||'').localeCompare(b.driver.name||'','de')));
    return { races, raceLabels, rows };
  }

  function getSeasonStatisticsData(seasonId){
    bindShared();
    return getSeasonBaseRows(seasonId);
  }

  function getChampionshipSettings(){
    bindShared();
    const ui = state.ui = state.ui || {};
    return {
      countedRaces: Math.max(0, Number(ui.championshipCountedRaces ?? 5) || 5),
      factor: Math.max(1, Number(ui.championshipFactor ?? 4) || 4),
      fastestLapPoints: Math.max(0, Number(ui.championshipFastestLapPoints ?? 1) || 1),
      countedFastestLaps: Math.max(0, Number(ui.championshipCountedFastestLaps ?? 5) || 5)
    };
  }

  function getChampionshipData(seasonId, settings){
    bindShared();
    const base = getSeasonBaseRows(seasonId);
    const byId = {};
    const raceLabels = base.raceLabels.map(x=>({ ...x }));

    for(const row of (base.rows||[])){
      byId[row.driver.id] = {
        driver: row.driver,
        color: row.color,
        races: row.races,
        wins: row.wins,
        podiums: row.podiums,
        fastestLapCount: row.fastestLapCount,
        avgPos: row.avgPos,
        avgMs: row.avgMs,
        bestByTrack: row.bestByTrack,
        consistencyScore: row.consistencyScore,
        positions: row.positions.slice(),
        racePoints: [],
        racePointValues: [],
        bonusFlags: [],
        bonusValues: [],
        countedRacePoints: 0,
        discardedRacePoints: 0,
        countedBonusPoints: 0,
        discardedBonusPoints: 0,
        totalPoints: 0,
        countedRaceResults: 0,
        countedFastestResults: 0,
        grossHistory: [],
        countedHistory: []
      };
    }

    for(const race of base.races){
      const laps = getRelevantRaceLaps(race.id, state.session.laps || []);
      const standings = computeDriverStandingsGlobal(laps);
      const participants = standings.length;
      const fastestDid = getFastestDriverIdFromLaps(laps);
      if(!participants) continue;

      for(const s of standings){
        const row = byId[s.id];
        if(!row) continue;
        const pos = standings.findIndex(x=>x.id===s.id) + 1;
        const pts = Math.max(1, participants - (pos-1)) * settings.factor;
        row.racePointValues.push(pts);
        row.racePoints.push({ raceId: race.id, points: pts, position: pos, participants, raceName: race.name || '' });
        const hasFastest = fastestDid === s.id;
        row.bonusFlags.push(hasFastest ? 1 : 0);
        row.bonusValues.push(hasFastest ? settings.fastestLapPoints : 0);
      }
      for(const id of Object.keys(byId)){
        const row = byId[id];
        row.grossHistory.push(
          row.racePointValues.reduce((a,b)=>a+(Number(b)||0),0) + row.bonusValues.reduce((a,b)=>a+(Number(b)||0),0)
        );
        row.countedHistory.push(
          sumBestPoints(row.racePointValues, settings.countedRaces) + sumBestPoints(row.bonusValues, settings.countedFastestLaps)
        );
      }
    }

    const rows = Object.values(byId);
    for(const row of rows){
      row.countedRacePoints = sumBestPoints(row.racePointValues, settings.countedRaces);
      row.discardedRacePoints = Math.max(0, row.racePointValues.reduce((a,b)=>a+(Number(b)||0),0) - row.countedRacePoints);
      row.countedBonusPoints = sumBestPoints(row.bonusValues, settings.countedFastestLaps);
      row.discardedBonusPoints = Math.max(0, row.bonusValues.reduce((a,b)=>a+(Number(b)||0),0) - row.countedBonusPoints);
      row.totalPoints = row.countedRacePoints + row.countedBonusPoints;
      row.countedRaceResults = settings.countedRaces>0 ? Math.min(row.racePointValues.length, row.racePointValues.slice().sort((a,b)=>b-a).slice(0, settings.countedRaces).length) : row.racePointValues.length;
      row.countedFastestResults = settings.countedFastestLaps>0 ? Math.min(row.bonusFlags.reduce((a,b)=>a+b,0), settings.countedFastestLaps) : row.bonusFlags.reduce((a,b)=>a+b,0);
    }
    rows.sort((a,b)=>(b.totalPoints-a.totalPoints)||(b.countedRacePoints-a.countedRacePoints)||(b.countedBonusPoints-a.countedBonusPoints)||(b.wins-a.wins)||(b.podiums-a.podiums)||((a.avgPos??9e15)-(b.avgPos??9e15))||((a.driver.name||'').localeCompare(b.driver.name||'','de')));
    return { races: base.races, raceLabels, rows, settings };
  }

  function renderSeasonPointsChart(data, mode){
    bindShared();
    const key = mode==='championship' ? 'countedHistory' : 'grossHistory';
    const rows = (data?.rows||[]).filter(r=>(r[key]||[]).some(v=>v>0));
    const labels = data?.raceLabels||[];
    if(!labels.length || !rows.length) return '<div class="muted">Noch keine gewerteten Rennen.</div>';
    const W=980, H=300, L=54, R=18, T=18, B=38;
    const maxY = Math.max(1, ...rows.flatMap(r=>r[key]||[0]));
    const n = Math.max(1, labels.length-1);
    const xAt = (i)=> L + ((W-L-R) * (labels.length===1 ? 0.5 : (i / n)));
    const yAt = (v)=> T + ((H-T-B) * (1 - (v / maxY)));
    const yTicks = Array.from({length:5}, (_,i)=>Math.round((maxY/4) * i));
    const lines = rows.map((row)=>{
      const series = row[key] || [];
      const pts = series.map((v,i)=>`${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');
      const endX = xAt(series.length-1);
      const endY = yAt(series[series.length-1]);
      return `
        <polyline fill="none" stroke="${row.color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" points="${pts}"/>
        ${series.map((v,i)=>`<circle cx="${xAt(i).toFixed(1)}" cy="${yAt(v).toFixed(1)}" r="3.5" fill="${row.color}"/>`).join('')}
        <text x="${Math.min(W-6, endX+8).toFixed(1)}" y="${Math.max(12, endY-8).toFixed(1)}" fill="${row.color}" font-size="12" font-weight="700">${esc(row.driver.name||'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â')}</text>
      `;
    }).join('');
    const sub = mode==='championship'
      ? 'X-Achse: Rennen dieser Saison ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Y-Achse: Meisterschaftspunkte nach aktueller Regel'
      : 'X-Achse: Rennen dieser Saison ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Y-Achse: kumulierte Saisondaten';
    return `
      <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; display:block; background:#0f131a; border-radius:16px; border:1px solid rgba(255,255,255,.08)">
        ${yTicks.map(v=>`<g><line x1="${L}" y1="${yAt(v).toFixed(1)}" x2="${W-R}" y2="${yAt(v).toFixed(1)}" stroke="rgba(255,255,255,.08)"/><text x="${L-10}" y="${(yAt(v)+4).toFixed(1)}" fill="rgba(255,255,255,.6)" font-size="11" text-anchor="end">${v}</text></g>`).join('')}
        ${labels.map((lab,i)=>`<g><line x1="${xAt(i).toFixed(1)}" y1="${T}" x2="${xAt(i).toFixed(1)}" y2="${H-B}" stroke="rgba(255,255,255,.05)"/><text x="${xAt(i).toFixed(1)}" y="${H-14}" fill="rgba(255,255,255,.7)" font-size="11" text-anchor="middle">${esc(lab.label)}</text></g>`).join('')}
        <line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="rgba(255,255,255,.18)"/>
        <line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="rgba(255,255,255,.18)"/>
        ${lines}
      </svg>
      <div class="muted small" style="margin-top:8px">${sub}</div>
    `;
  }

  function renderSaisonAuswertung(){
    bindShared();
    const el = document.getElementById('pageSaisonAuswertung');
    const active = getActiveSeason();
    if(!active){ el.innerHTML='<div class="card"><div class="card-b">Keine Saison.</div></div>'; return; }

    const stats = getSeasonStatisticsData(active.id);
    const statRows = stats.rows;
    const statWinsLeader = statRows.slice().sort((a,b)=>(b.wins-a.wins)||(b.races-a.races))[0] || null;
    const statPodiumLeader = statRows.slice().sort((a,b)=>(b.podiums-a.podiums)||(b.wins-a.wins))[0] || null;
    const statFastestLeader = statRows.slice().sort((a,b)=>(b.fastestLapCount-a.fastestLapCount)||(b.wins-a.wins))[0] || null;
    const statConsistencyLeader = statRows.filter(x=>x.races>1).slice().sort((a,b)=>(a.consistencyScore??9e15)-(b.consistencyScore??9e15)||((b.wins||0)-(a.wins||0)))[0] || statRows[0] || null;

    const champSettings = getChampionshipSettings();
    const champ = getChampionshipData(active.id, champSettings);
    const champRows = champ.rows;
    const champLeader = champRows[0] || null;
    const champRaceLeader = champRows.slice().sort((a,b)=>(b.countedRacePoints-a.countedRacePoints)||(b.wins-a.wins))[0] || null;
    const champBonusLeader = champRows.slice().sort((a,b)=>(b.countedBonusPoints-a.countedBonusPoints)||(b.fastestLapCount-a.fastestLapCount))[0] || null;
    const champStreakLeader = champRows.slice().sort((a,b)=>((b.totalPoints-(b.discardedRacePoints+b.discardedBonusPoints)) - (a.totalPoints-(a.discardedRacePoints+a.discardedBonusPoints)))||((b.totalPoints||0)-(a.totalPoints||0)))[0] || null;

    el.innerHTML = demojibake(`
      <div class="card">
        <div class="card-h"><h2>Saison Auswertung</h2></div>
        <div class="card-b">
          <div class="row wrap" style="gap:10px; align-items:center; margin-bottom:14px">
            <span class="badge">Saison: ${esc(active.name)}</span>
            <span class="badge">Renntage: ${getRaceDaysForSeason(active.id).length}</span>
            <span class="badge">Rennen dieser Saison: ${stats.races.length}</span>
            <span class="badge">Fahrer: ${statRows.length}</span>
          </div>
          <div class="row wrap discord-preview-wrap" style="gap:10px; margin-bottom:12px">
            <div class="card" style="width:100%">
              <div class="card-h"><h3>Discord Vorschau</h3></div>
              <div class="card-b">
                <div class="discord-preview-grid">
                  <div class="discord-preview-pane">
                    <div class="muted small" style="margin-bottom:8px">Text</div>
                    <pre class="discord-preview-text" id="seasonDiscordPreviewText">Lade Vorschau...</pre>
                  </div>
                  <div class="discord-preview-pane">
                    <div class="muted small" style="margin-bottom:8px">Bild</div>
                    <div class="discord-preview-imagebox" id="seasonDiscordPreviewImage"><div class="muted small">Lade Bild...</div></div>
                  </div>
                </div>
                <div class="row wrap" style="gap:10px; margin-top:12px">
                  <button class="btn" id="btnSeasonForumCopy" type="button">Forum-Text kopieren</button>
                  <button class="btn" id="btnSeasonWebhook" type="button">Saison an Discord senden</button>
                </div>
                <div class="muted small" style="margin-top:8px">Vorschau von Text und Bild, die an Discord gesendet werden. Fuer Forum-Kanaele kann optional direkt ein Thread/Post erstellt werden.</div>
              </div>
            </div>
          </div>
          <div class="muted small" style="margin-bottom:14px">Sendet Gesamtwertung und Awards an Discord. Für Forum-Kanäle kann optional direkt ein Thread/Post erstellt werden.</div>

          <div class="card" style="margin-bottom:14px">
            <div class="card-h"><h3>Saison Statistik</h3></div>
            <div class="card-b">
              <div class="renntag-highlights-grid" style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:12px; align-items:stretch">
                <div class="card"><div class="card-b"><div class="muted small">Meiste Siege</div><div style="font-weight:800; font-size:20px; margin-top:4px">${statWinsLeader?esc(statWinsLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${statWinsLeader?`${statWinsLeader.wins} Sieg${statWinsLeader.wins===1?'':'e'}`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Meiste Podien</div><div style="font-weight:800; font-size:20px; margin-top:4px">${statPodiumLeader?esc(statPodiumLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${statPodiumLeader?`${statPodiumLeader.podiums} Podien`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Meiste schnellste Runden</div><div style="font-weight:800; font-size:20px; margin-top:4px">${statFastestLeader?esc(statFastestLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${statFastestLeader?`${statFastestLeader.fastestLapCount}x schnellste Runde`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Konstantester Fahrer</div><div style="font-weight:800; font-size:20px; margin-top:4px">${statConsistencyLeader?esc(statConsistencyLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${statConsistencyLeader && statConsistencyLeader.avgPos!=null?`Ø Platz ${esc((statConsistencyLeader.avgPos||0).toFixed(2).replace('.',','))}`:'Keine Daten'}</div></div></div>
              </div>
              <div class="hr"></div>
              <div class="card" style="margin-bottom:12px"><div class="card-b"><div class="muted small" style="margin-bottom:8px">Saisonverlauf</div>${renderSeasonPointsChart(stats, 'stats')}</div></div>
              <table class="table">
                <thead><tr><th>#</th><th>Fahrer</th><th>Starts</th><th>Siege</th><th>Podien</th><th>Schnellste Runden</th><th>Ø Platzierung</th><th>Ø Runde</th><th>Bestzeiten je Strecke</th></tr></thead>
                <tbody>
                  ${statRows.map((x,idx)=>`
                    <tr>
                      <td>${idx+1}</td>
                      <td><span style="display:inline-flex; align-items:center; gap:8px"><span style="width:10px; height:10px; border-radius:999px; background:${x.color}; display:inline-block"></span>${esc(x.driver.name||'—')}</span></td>
                      <td>${x.races||0}</td>
                      <td>${x.wins||0}</td>
                      <td>${x.podiums||0}</td>
                      <td>${x.fastestLapCount||0}</td>
                      <td>${x.avgPos!=null ? esc(x.avgPos.toFixed(2).replace('.',',')) : '—'}</td>
                      <td class="mono">${x.avgMs!=null ? esc(msToTime(x.avgMs,3)) : '—'}</td>
                      <td>${renderBestByTrackCell(x.bestByTrack)}</td>
                    </tr>
                  `).join('') || `<tr><td colspan="9" class="muted">Keine Daten.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card settings-card">
            <div class="card-h"><h3>Meisterschaft</h3></div>
            <div class="card-b">
              <div class="grid cols-4" style="gap:12px; align-items:end">
                <div class="field">
                  <label>Gewertete Rennen</label>
                  <input class="input" id="championshipCountedRaces" type="number" min="0" step="1" value="${champSettings.countedRaces}" />
                  <div class="muted small" style="margin-top:6px">0 = alle, sonst zählen die punktstärksten Rennen.</div>
                </div>
                <div class="field">
                  <label>Gewertete schnellste Runden</label>
                  <input class="input" id="championshipCountedFastestLaps" type="number" min="0" step="1" value="${champSettings.countedFastestLaps}" />
                  <div class="muted small" style="margin-top:6px">0 = alle Bonus-Ergebnisse zählen.</div>
                </div>
                <div class="field">
                  <label>Punktefaktor pro Fahrer</label>
                  <input class="input" id="championshipFactor" type="number" min="1" step="1" value="${champSettings.factor}" />
                  <div class="muted small" style="margin-top:6px">Bei 10 Fahrern: 1. Platz = 10 × Faktor.</div>
                </div>
                <div class="field">
                  <label>Punkte für schnellste Runde</label>
                  <input class="input" id="championshipFastestLapPoints" type="number" min="0" step="1" value="${champSettings.fastestLapPoints}" />
                  <div class="muted small" style="margin-top:6px">Bonuspunkte pro Rennen für die schnellste Runde.</div>
                </div>
              </div>
              <div class="row wrap" style="gap:10px; margin-top:10px">
                <span class="badge">Nur echte Rennen dieser Saison</span>
                <span class="badge">Standard: 5 Rennen • Faktor 4 • 1 Punkt • 5 Bonus-Wertungen</span>
              </div>
              <div class="hr"></div>
              <div class="renntag-highlights-grid" style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:12px; align-items:stretch">
                <div class="card"><div class="card-b"><div class="muted small">Meisterschaftsführer</div><div style="font-weight:800; font-size:20px; margin-top:4px">${champLeader?esc(champLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${champLeader?`${champLeader.totalPoints} Punkte`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Meiste Rennpunkte</div><div style="font-weight:800; font-size:20px; margin-top:4px">${champRaceLeader?esc(champRaceLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${champRaceLeader?`${champRaceLeader.countedRacePoints} Punkte`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Meiste Bonuspunkte</div><div style="font-weight:800; font-size:20px; margin-top:4px">${champBonusLeader?esc(champBonusLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${champBonusLeader?`${champBonusLeader.countedBonusPoints} Punkte`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Stärkste Punkteausbeute</div><div style="font-weight:800; font-size:20px; margin-top:4px">${champStreakLeader?esc(champStreakLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${champStreakLeader?`${champStreakLeader.totalPoints} Gesamtpunkte`:'Keine Daten'}</div></div></div>
              </div>
              <div class="hr"></div>
              <div class="card" style="margin-bottom:12px"><div class="card-b"><div class="muted small" style="margin-bottom:8px">Meisterschaftsverlauf</div>${renderSeasonPointsChart(champ, 'championship')}</div></div>
              <table class="table">
                <thead><tr><th>#</th><th>Fahrer</th><th>Gesamt</th><th>Rennpunkte</th><th>Bonus SR</th><th>Streicher Rennen</th><th>Streicher SR</th><th>Siege</th><th>Podien</th><th>Schnellste Runden</th></tr></thead>
                <tbody>
                  ${champRows.map((x,idx)=>`
                    <tr>
                      <td>${idx+1}</td>
                      <td><span style="display:inline-flex; align-items:center; gap:8px"><span style="width:10px; height:10px; border-radius:999px; background:${x.color}; display:inline-block"></span>${esc(x.driver.name||'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â')}</span></td>
                      <td><b>${x.totalPoints||0}</b></td>
                      <td>${x.countedRacePoints||0}</td>
                      <td>${x.countedBonusPoints||0}</td>
                      <td>${x.discardedRacePoints||0}</td>
                      <td>${x.discardedBonusPoints||0}</td>
                      <td>${x.wins||0}</td>
                      <td>${x.podiums||0}</td>
                      <td>${x.fastestLapCount||0}</td>
                    </tr>
                  `).join('') || `<tr><td colspan="10" class="muted">Keine Daten.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `);

    const seasonPreviewRoot = el;
    Promise.resolve().then(async ()=>{
      try{
        const msg = buildSeasonWebhookMessage(active.id);
        const blob = await renderSeasonWebhookBlob(active.id);
        if(seasonPreviewRoot !== document.getElementById('pageSaisonAuswertung')) return;
        setDiscordPreviewText(seasonPreviewRoot, '#seasonDiscordPreviewText', formatDiscordPayloadPreview(msg.payload));
        setDiscordPreviewImage(seasonPreviewRoot, '#seasonDiscordPreviewImage', blob, 'Saison Discord Vorschau');
      }catch(err){
        setDiscordPreviewText(seasonPreviewRoot, '#seasonDiscordPreviewText', 'Vorschau konnte nicht geladen werden.');
        setDiscordPreviewImage(seasonPreviewRoot, '#seasonDiscordPreviewImage', null, 'Vorschau konnte nicht geladen werden');
        logLine('Saison Vorschau Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }
    });
    const btnSeasonWebhook = el.querySelector('#btnSeasonWebhook');
    if(btnSeasonWebhook){
      btnSeasonWebhook.onclick = async ()=>{
        btnSeasonWebhook.disabled = true;
        const prev = btnSeasonWebhook.textContent;
        btnSeasonWebhook.textContent = 'Sende...';
        try{
          await sendSeasonWebhook(active.id);
          toast('Discord','Saison gesendet.','ok');
          logLine('Saison Webhook gesendet: ' + (active.name||active.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Saison in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Saison ' + String(active.name || active.id));
          }else{
            toast('Discord','Saison-Webhook fehlgeschlagen.','err');
            logLine('Saison Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnSeasonWebhook.disabled = false;
          btnSeasonWebhook.textContent = prev;
        }
      };
    }
    const btnSeasonForumCopy = el.querySelector('#btnSeasonForumCopy');
    if(btnSeasonForumCopy){
      btnSeasonForumCopy.onclick = async ()=>{
        try{
          const msg = buildSeasonWebhookMessage(active.id);
          await copyTextToClipboard(msg.forumText);
          toast('Forum','Saison-Text kopiert.','ok');
        }catch(err){
          toast('Forum','Kopieren fehlgeschlagen.','err');
          logLine('Saison Forum-Text Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      };
    }
    const bindNum = (id, key)=>{
      const inp = el.querySelector('#'+id);
      if(!inp) return;
      inp.onchange = ()=>{
        state.ui = state.ui || {};
        state.ui[key] = Math.max(0, Number(inp.value||0) || 0);
        if(key==='championshipFactor') state.ui[key] = Math.max(1, Number(inp.value||1) || 1);
        saveState();
      };
    };
    bindNum('championshipCountedRaces', 'championshipCountedRaces');
    bindNum('championshipCountedFastestLaps', 'championshipCountedFastestLaps');
    bindNum('championshipFactor', 'championshipFactor');
    bindNum('championshipFastestLapPoints', 'championshipFastestLapPoints');
  }


  async function clearRaceDataOnly(){
    bindShared();
    const fresh = defaultState();
    state.personalRecords = fresh.personalRecords;
    state.raceDay = fresh.raceDay;
    state.season = fresh.season;
    state.modes.activeMode = fresh.modes.activeMode;
    state.modes.singleSubmode = fresh.modes.singleSubmode;
    state.modes.single = fresh.modes.single;
    state.modes.team = fresh.modes.team;
    state.modes.loop = fresh.modes.loop;
    state.modes.endurance = fresh.modes.endurance;
    state.session = fresh.session;
    state.loopRuntime = fresh.loopRuntime;
    if(state.ui){
      state.ui.podiumRaceId = '';
      state.ui.freeDrivingEnabled = false;
    }
    state.usb.lastLines = [];
    try{ localStorage.removeItem(PRES_SNAPSHOT_KEY); }catch{}
    saveState();
    await flushExternalAppDataPersist();
  }

  async function clearAllStoredData(){
    bindShared();
    try{ stopAudioPreview(); }catch{}
    await clearExternalAppDataStores();
    try{ localStorage.removeItem(LS_KEY); }catch{}
    try{ localStorage.removeItem(LS_UI); }catch{}
    try{ localStorage.removeItem(PRES_SNAPSHOT_KEY); }catch{}
    replaceStateInPlace(defaultState());
    state = getState();
    ensureAutoEntities(state);
    if(typeof ui==='object' && ui){
      ui.logW = 560;
      ui.logCollapsed = (window.innerWidth || 1600) < 900;
    }
    saveState();
    await flushExternalAppDataPersist();
    saveUi();
    try{ await audioAssetClearAll(); }catch(err){ logLine('audio clear error: ' + (err?.message || err)); }
    await ensureBuiltInDefaultDriverSound();
  }

    let lastDashRenderTs = 0;
// --------------------- Timer tick ---------------------
  
  
  return {
    driverKeyForLapGlobal,
    driverNameByIdGlobal,
    filterLapsForRaceBounds,
    getRaceById,
    raceUsesBestLapRanking,
    sortDriverStandingRows,
    getRelevantRaceLaps,
    compareDriverStandingRows,
    computeDriverStandingsGlobal,
    parsePointsScheme,
    computeTeamPointsStandings,
    computeTeamStandingsGlobal,
    computeRaceEndHighlights,
    renderRaceEndHighlightsHtml,
    renderPodiumSectionGlobal,
    getRaceDaysForSeason,
    getRacesForRaceDay,
    getRacesForSeason,
    getRaceTrackName,
    getAverageValidLapMsForDriver,
    getBestTimesByTrackForDriver,
    getDriverAggregateStatsForRaces,
    renderBestByTrackCell,
    renderSessionDriverColumns,
    renderRenntagAuswertung,
    getSeasonScoringRaces,
    getFastestDriverIdFromLaps,
    getSeasonPointsColor,
    sumBestPoints,
    getSeasonBaseRows,
    getSeasonStatisticsData,
    getChampionshipSettings,
    getChampionshipData,
    renderSeasonPointsChart,
    renderSaisonAuswertung,
    clearRaceDataOnly,
    clearAllStoredData
  };
})();
