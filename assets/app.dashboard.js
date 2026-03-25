window.TIMTIME_DASHBOARD = (function(){
  'use strict';
  function bindShared(){ Object.assign(globalThis, window.TIMTIME_SHARED || {}); }

  function resolveRaceId(sessionState, currentRaceId, podiumRaceId){
    return sessionState === 'RUNNING' ? (currentRaceId || '') : (currentRaceId || podiumRaceId || '');
  }

  function isLiveRace(sessionState, currentRaceId, raceId, finishPending){
    return !!(raceId && raceId === currentRaceId && sessionState === 'RUNNING' && !finishPending);
  }

function renderSessionControl(){
    bindShared();
    const ampelActive = !!(typeof isAmpelRunning==='function' ? isAmpelRunning() : false) || !!state.ui?.ampel?.visible;
    const sessionStateLabel = ampelActive ? 'AMPEL' : state.session.state;
    const setText = (id, value)=>{
      const node = document.getElementById(id);
      if(node) node.textContent = value;
    };
    setText('scTitle', t('session.title'));
    setText('quickStatusTitle', t('session.quick_status'));
    setText('scLabelTimer', t('session.timer'));
    setText('scLabelMode', t('session.current_mode'));
    setText('scLabelTrack', t('session.track'));
    setText('scLabelMinLap', t('session.minimum_time'));
    setText('scLabelTrackRecord', t('session.track_record'));
    setText('scLabelDayRecord', t('session.day_record'));
    setText('scLabelFreeDriving', t('session.free_driving'));
    setText('scFreeDrivingDesc', t('session.free_driving_desc'));
    setText('scAmpelTitle', t('session.start_light'));
    setText('scAmpelBeforeLabel', t('session.start_light_before'));
    setText('scAmpelSequence', t('session.start_light_sequence'));
    setText('scControlHint', t('session.control_hint'));
    setText('btnStart', t('session.start'));
    setText('btnPause', t('session.pause'));
    setText('btnResume', t('session.resume'));
    setText('btnStop', t('session.stop'));
    setText('btnFreeDrivingOn', t('session.on'));
    setText('btnFreeDrivingOff', t('session.off'));
    const badgeSessionState = document.getElementById('badgeSessionState');
    if(badgeSessionState){
      badgeSessionState.textContent = sessionStateLabel;
      badgeSessionState.dataset.state = sessionStateLabel;
    }
    document.getElementById('scMode').textContent = getModeLabel();
    const track = getActiveTrack();
    document.getElementById('scTrack').textContent = formatTrackDisplayName(track);
    document.getElementById('scMinLap').textContent = track ? msToTime(track.minLapMs, 3) : '—';
    const rec = getTrackRecord(track);
    document.getElementById('scRecordTime').textContent = rec?.ms!=null ? msToTime(rec.ms, 3) : '—';
    document.getElementById('scRecordName').textContent =
      rec?.ms!=null ? `${(rec.driverId ? (getDriver(rec.driverId)?.name||rec.driverName) : rec.driverName)||t('dashboard.unknown')} • ${rec.carName||''}` : '—';

    // Renntag-Rekord nur wenn Renntag zur aktuellen Strecke passt
    const rd = getActiveRaceDay();
    let dayRec = null;
    if(rd && track){
      dayRec = getRaceDayTrackRecord(rd, track.id);
    }
    const dTime = document.getElementById('scDayRecordTime');
    const dName = document.getElementById('scDayRecordName');
    if(dTime && dName){
      dTime.textContent = dayRec?.ms!=null ? msToTime(dayRec.ms, 3) : '—';
      dName.textContent = dayRec?.ms!=null ? `${(dayRec.driverId ? (getDriver(dayRec.driverId)?.name||dayRec.driverName) : dayRec.driverName)||t('dashboard.unknown')} • ${dayRec.carName||''}` : '—';
    }

    document.getElementById('btnStart').disabled = (state.session.state!=='IDLE') || ampelActive;
    document.getElementById('btnPause').disabled = (state.session.state!=='RUNNING');
    document.getElementById('btnResume').disabled = (state.session.state!=='PAUSED');
    document.getElementById('btnStop').disabled = (state.session.state==='IDLE');

    const btnFreeDrivingOn = document.getElementById('btnFreeDrivingOn');
    const btnFreeDrivingOff = document.getElementById('btnFreeDrivingOff');
    const freeDrivingState = document.getElementById('scFreeDrivingState');
    const useAmpelChk = document.getElementById('scUseAmpel');
    const ampelWrap = document.getElementById('scAmpelWrap');
    const freeDrivingPending = !!state.ui.freeDrivingEnabled && !state.session.isFreeDriving;
    const freeDrivingActive = !!state.session.isFreeDriving || !!state.ui.freeDrivingEnabled;
    if(btnFreeDrivingOn) btnFreeDrivingOn.disabled = freeDrivingActive || state.session.state!=='IDLE';
    if(btnFreeDrivingOff) btnFreeDrivingOff.disabled = !freeDrivingActive;
    if(freeDrivingState) freeDrivingState.textContent = state.session.isFreeDriving ? t('session.on') : (freeDrivingPending ? t('session.waiting_for_start') : t('session.off'));
    if(useAmpelChk){
      useAmpelChk.checked = !!state.settings.useAmpel;
      useAmpelChk.disabled = freeDrivingActive || state.session.state!=='IDLE' || ampelActive;
    }
    if(ampelWrap){
      ampelWrap.style.opacity = freeDrivingActive ? '0.55' : '1';
      ampelWrap.classList.toggle('is-running', ampelActive);
    }

    document.getElementById('badgeSeason').textContent = t('badge.season', { name:(getActiveSeason()?.name || '—') });
    document.getElementById('badgeRaceDay').textContent = t('badge.raceday', { name:(getActiveRaceDay()?.name || '—') });
    const isEndurance = (state.modes.activeMode==='endurance') || (state.session.currentRaceId && getActiveRaceDay()?.races?.find(r=>r.id===state.session.currentRaceId)?.mode==='endurance');
    const endBox = document.getElementById('scEnduranceBox');
    const endHr = document.getElementById('scEnduranceHr');
    const endStatus = document.getElementById('scEnduranceStatus');
    if(endBox && endHr && endStatus){
      endBox.style.display = isEndurance ? '' : 'none';
      endHr.style.display = isEndurance ? '' : 'none';

      const minStint = Math.max(0, parseInt(state.modes.endurance?.minStintLaps||0,10) || 0);
      const maxStint = Math.max(0, parseInt(state.modes.endurance?.maxStintLaps||0,10) || 0);
      const rows = getEnduranceStatusRows();
      const teamText = rows.length
        ? rows.map(r=>`${esc(r.teamName)}: ${esc(r.driverName)} (${r.stint}/min ${r.minStint}${r.maxStint>0 ? '/max '+r.maxStint : ''})`).join(' • ')
        : t('dashboard.no_teams');
      const rulesText = esc(`Stint-Regeln: min ${minStint}${maxStint>0 ? ' / max '+maxStint : ''}`);
      endStatus.innerHTML = `${rulesText}<br>${teamText}`;
    }

  }

  function renderDashboard(){
    bindShared();
    const el = document.getElementById('pageDashboard');
    const liveRaceId = state.session.currentRaceId || '';
    const podiumRaceId = state.ui.podiumRaceId || '';
    const raceId = liveRaceId || podiumRaceId || '';
    const rd = getActiveRaceDay();
    const race = (raceId && rd) ? rd.races.find(r=>r.id===raceId) : null;
    const raceMode = race?.mode || null;
    const loopPhase = (state.loop?.phase || state.session.loopPhase || '').toString().toUpperCase();
    const inRace = !!liveRaceId && !isFreeDrivingRace(race) && (race?.submode!=='Training') && (raceMode!=='loop' || loopPhase==='RACE');
    const postRaceResultMode = !liveRaceId && !!podiumRaceId && !!race && raceShouldShowPodium(race);
    const hasTeamishMode = (raceMode==='team' || raceMode==='endurance' || state.modes.activeMode==='team' || state.modes.activeMode==='endurance');
    const showEnduranceStatus = ((raceMode==='endurance') || state.modes.activeMode==='endurance' || Object.keys(state.modes.endurance?.activeByTeamId||{}).length>0);

    // UI prefs (persisted)
    const viewPref = state.ui.dashboardView || 'auto'; // auto | race | drivers | live | teams
    let view = viewPref==='auto'
      ? ((inRace || postRaceResultMode) ? ((raceMode==='team' || raceMode==='endurance') ? 'teams' : 'race') : (hasTeamishMode ? 'teams' : 'drivers'))
      : viewPref;
    if(view==='race' && !(inRace || postRaceResultMode)) view='drivers';
    if(view==='teams' && !hasTeamishMode) view = (inRace || postRaceResultMode) ? 'race' : 'drivers';

    const sortPref = state.ui.dashboardSort || 'best'; // best | last | name
    const showLiveFallback = (state.ui.dashboardShowLiveFallback !== false);

    const idleMode = (!raceId && state.session.state==='IDLE');
    const lapsAll = idleMode ? (state.session.idleLaps||[]) : state.session.laps;
    const relevantLapsRaw = raceId
      ? (postRaceResultMode
          ? (lapsAll||[]).filter(l=>l && l.raceId===raceId)
          : getRelevantRaceLaps(raceId, lapsAll))
      : lapsAll;
    // Live lap counts must never be distorted by display filters.
    // For the dashboard we therefore always use all race-relevant laps.
    const relevantLaps = (relevantLapsRaw||[]);

    // --- build views ---
    function driverKeyForLap(l){
      const car = l.carId ? getCar(l.carId) : null;
      const did = (l.driverId || car?.driverId || '').trim();
      return did || '__unknown__';
    }
    function driverNameById(id){
      if(id==='__unknown__') return t('dashboard.unknown');
      const d = getDriver(id);
      return d?.name || t('dashboard.unknown');
    }
    function carNameForLap(l){
      const car = l.carId ? getCar(l.carId) : null;
      return car?.name || '—';
    }
    function getLatestCarIdForDriver(driverId, laps){
      const arr = (laps||[]).filter(l=>driverKeyForLap(l)===driverId && l.carId);
      if(!arr.length) return '';
      arr.sort((a,b)=>(b.ts||0)-(a.ts||0));
      return arr[0]?.carId || '';
    }
    // --------------------- Podium (after race) ---------------------
    function computeDriverStandings(laps){
      const map = new Map();
      laps.forEach(l=>{
        const id = driverKeyForLap(l);
        if(!map.has(id)){
          map.set(id,{ id, name: driverNameById(id), laps:0, totalMs:0, bestMs:null, lastMs:null, lastTs:0, finished:false });
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
      for(const s of arr){ s.finished = isDriverFinished(s.id); }
arr.sort((a,b)=>{
        // Placement: laps DESC, total time ASC (tie-breaker), then best lap ASC
        if(b.laps!==a.laps) return b.laps-a.laps;

        const at = a.totalMs==null ? 9e15 : a.totalMs;
        const bt = b.totalMs==null ? 9e15 : b.totalMs;
        if(at!==bt) return at-bt;

        const ab = a.bestMs==null ? 9e15 : a.bestMs;
        const bb = b.bestMs==null ? 9e15 : b.bestMs;
        if(ab!==bb) return ab-bb;

        const al = a.lastMs==null ? 9e15 : a.lastMs;
        const bl = b.lastMs==null ? 9e15 : b.lastMs;
        return al-bl;
      });
      return arr;
    }

    function computeTeamStandings(laps, mode, finish){
      const teams = (mode==='team') ? (state.modes.team?.teams||[]) : (state.modes.endurance?.teams||[]);
      const raceId = (laps && laps[0] && laps[0].raceId) ? laps[0].raceId : (state.session.currentRaceId || '');
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
        const raceOnly = tlaps.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
        const rel = raceOnly.length ? raceOnly : tlaps;
        const lapCount = rel.length;
        const totalMs = rel.reduce((s,l)=>s+(l.lapMs||0),0);
        const bestMs = lapCount ? Math.min(...rel.map(l=>l.lapMs||Infinity)) : null;
        const lastMs = lapCount ? rel[rel.length-1].lapMs : null;
        const members = driverIds.map(id=>driverNameById(id)).join(', ') || '—';
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
          name:t.name||t('dashboard.team'),
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
          projectedDeductedLaps: mode==='endurance' ? (rule.projectedDeductedLaps||0) : 0
        };
      });
      rows.sort((a,b)=>{
        if(b.lapCount!==a.lapCount) return b.lapCount-a.lapCount;
        return (a.totalMs||0)-(b.totalMs||0);
      });
      return rows;
    }


function buildPodiumConfettiHtml(){
  const pieces = [];
  for(let i=0;i<54;i++){
    const left = (2 + (i*1.83)%96).toFixed(2);
    const delay = (i*0.06).toFixed(2);
    const dur = (2.4 + (i%6)*0.18).toFixed(2);
    const drift = (((i%2===0)?1:-1) * (18 + (i%7)*8));
    const x = (((i%3)-1) * (8 + (i%5)*3));
    const fall = 280 + (i%8)*22;
      pieces.push(`<i style="left:${left}%;--delay:${delay}s;--dur:${dur}s;--drift:${drift}px;--x:${x}px;--fall:${fall}px"></i>`);
  }
  return `<div class="podiumConfetti" aria-hidden="true">${pieces.join('')}</div>`;
}

    function renderPodiumSection(podiumRace){
      const mode = podiumRace?.mode || 'single';
      const laps = state.session.laps.filter(l=>l.raceId===podiumRace.id);
      const dec = 3;
      // Finish-window status used to show the finish flag when a driver/team has completed.
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
        standings = computeTeamStandings(laps, mode, finish);
      } else {
        standings = computeDriverStandings(laps);
      }

      const top = standings.slice(0,3).map(x=> isTeams ? ({...x, isTeam:true}) : x);
      const rest = standings.slice(3).map(x=> isTeams ? ({...x, isTeam:true}) : x);

      function box(pos, data){
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
                <div class="podiumStats small">
                  <div><span>Runden</span><b>${data.lapCount}</b></div>
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

      const podiumHtml = `
        <div class="card podiumCard">
          ${buildPodiumConfettiHtml()}
          <div class="row" style="align-items:center; justify-content:space-between; gap:12px;">
            <div>
              <div class="title">🏁 Siegerpodest</div>
              <div class="muted small">${esc(podiumRace.name||t('submode.race'))} • beendet ${new Date(podiumRace.endedAt).toLocaleString('de-DE')}</div>
            </div>
            <button class="btn" id="btnClosePodium">${t('common.close', null, 'Schliessen')}</button>
          </div>

          <div class="podiumWrap">
            <div class="podiumCol second">${box(2, top[1])}</div>
            <div class="podiumCol first">${box(1, top[0])}</div>
            <div class="podiumCol third">${box(3, top[2])}</div>
          </div>

          <div class="hr"></div>

          ${isTeams ? `
            <div class="muted">${t('dashboard.remaining_places', null, 'Restliche Plaetze')}</div>
            <table class="table dashBig">
              <thead><tr><th>#</th><th>Team</th><th>Runden</th><th>Gesamtzeit</th><th>Best</th><th>Ø km/h</th><th>Letzte</th></tr></thead>
              <tbody>
                ${rest.map((t,i)=>`<tr>
                  <td class="mono">${i+4}</td>
                  <td><b>${esc(t.name)}</b><div class="muted tiny">${esc(t.members)}</div>${(mode==='endurance' && t.compliant===false)?`<div class="tiny" style="color:#ff8f8f">${esc(t.statusText||t('endurance.rule_violation'))}</div>`:''}</td>
                  <td class="mono">${t.lapCount}</td>
                  <td class="mono">${t.totalMs?msToTime(t.totalMs, dec):'—'}</td>
                  <td class="mono">${t.bestMs!=null && isFinite(t.bestMs)?msToTime(t.bestMs, dec):'—'}</td>
                  <td class="mono">${t.lastMs!=null && isFinite(t.lastMs)?msToTime(t.lastMs, dec):'—'}</td>
                </tr>`).join('') || `<tr><td colspan="6" class="muted">—</td></tr>`}
              </tbody>
            </table>
          ` : `
            <div class="muted">${t('dashboard.remaining_places', null, 'Restliche Plaetze')}</div>
            <table class="table dashBig">
              <thead><tr><th>#</th><th>Fahrer</th><th>Runden</th><th>Gesamtzeit</th><th>Best</th><th>Ø km/h</th><th>Letzte</th></tr></thead>
              <tbody>
                ${rest.map((s,i)=>`<tr>
                  <td class="mono">${i+4}</td>
                  <td><div class="nameCell">${(()=>{const url=getDriverAvatarDataUrl(s.id);const nm=(s.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return url?`<img class=\"avatar\" src=\"${esc(url)}\" alt=\"\"/>`:`<div class=\"avatar fallback\">${esc(ini||'?')}</div>`;})()}<span class="nm">${esc(s.name)}</span>${s.finished?'<span class="finishFlag">🏁</span>':''}</div></td>
                  <td class="mono">${s.laps}</td>
                  <td class="mono">${s.totalMs?msToTime(s.totalMs, dec):'—'}</td>
                  <td class="mono">${s.bestMs!=null?msToTime(s.bestMs, dec):'—'}</td>
                  <td class="mono">${s.lastMs!=null?msToTime(s.lastMs, dec):'—'}</td>
                </tr>`).join('') || `<tr><td colspan="5" class="muted">—</td></tr>`}
              </tbody>
            </table>
          `}
        </div>
      `;

      return podiumHtml;
    }


    // Live laps table (existing)
    function renderLive(){
      const showCarColumn = !!state.session.isFreeDriving || !!state.ui.freeDrivingEnabled;
      const laps = relevantLaps.slice(-40).reverse();
      const rows = laps.map(l=>{
        const car = getCar(l.carId);
        const driver = l.driverId ? getDriver(l.driverId) : null;
        const name = driver?.name || (car?.driverId ? getDriverSpeakName(car.driverId) : '') || getDriverNameForCar(car) || t('dashboard.unknown');
        const carName = car?.name || '—';
        return `<tr><td>${esc(name)}</td>${showCarColumn ? `<td>${esc(carName)}</td>` : ''}<td class="mono">${esc(msToTime(l.lapMs, 3))}</td><td class="small">${esc(l.phase||'')}</td></tr>`;
      }).join('');
      const colspan = showCarColumn ? 4 : 3;
      return `
        <div class="muted">${t('dashboard.live_intro')}</div>
        <div class="hr"></div>
        <table class="table dashBig">
          <thead><tr><th>${t('dashboard.driver')}</th>${showCarColumn ? `<th>${t('dashboard.car')}</th>` : ''}<th>${t('dashboard.lap')}</th><th>${t('dashboard.phase')}</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="${colspan}" class="muted">${t('dashboard.no_laps')}</td></tr>`}</tbody>
        </table>
      `;
    }


    // Team overview (Teamrennen + Langstrecke)
    function renderTeams(){
      const teams = (raceMode==='team') ? (state.modes.team?.teams||[]) : (state.modes.endurance?.teams||[]);
      if(!teams.length){
        return `<div class="muted">${t('dashboard.no_teams')}</div>`;
      }
      const computeTeams =
        (typeof computeTeamStandingsGlobal === 'function')
          ? computeTeamStandingsGlobal
          : computeTeamStandings;
      const formatSpeed =
        (typeof formatKmh === 'function')
          ? formatKmh
          : ((value)=>{
              const num = Number(value);
              return Number.isFinite(num) ? `${num.toFixed(2).replace('.', ',')} km/h` : '—';
            });
      const lapToKmh =
        (typeof lapMsToAverageKmh === 'function')
          ? lapMsToAverageKmh
          : (()=>null);
      const teamRows = computeTeams(
        relevantLaps.filter(l=>!raceId || l.raceId===raceId),
        raceMode,
        (state.session.finish?.pending ? state.session.finish : null)
      );
      const rowsHtml = teamRows.map((t,i)=>{
        const pos = i+1;
        const status = (raceMode==='endurance') ? (t.compliant===false ? `<span class="pill bad">Strafe</span><div class="muted tiny">${esc(t.statusText||'')}</div>` : `<span class="pill ok">OK</span>`) : '';
        return `<tr>
          <td class="mono">${pos}</td>
          <td><b>${esc(t.name)}</b><div class="muted tiny">${esc(t.members)}</div>${status}</td>
          <td class="mono">${t.lapCount}</td>
          <td class="mono">${t.totalMs?msToTime(t.totalMs, 3):'—'}</td>
          <td class="mono">${t.bestMs!=null && isFinite(t.bestMs)?msToTime(t.bestMs, 3):'—'}</td>
          <td class="mono">${formatSpeed(lapToKmh(t.bestMs, getActiveTrack()))}</td>
          <td class="mono">${t.lastMs!=null && isFinite(t.lastMs)?msToTime(t.lastMs, 3):'—'}</td>
        </tr>`;
      }).join('');

      return `
        <div class="muted">${t('dashboard.team_intro')} ${raceMode==='endurance' ? t('dashboard.team_intro_endurance') : t('dashboard.team_intro_regular')}</div>
        <div class="hr"></div>
        <table class="table dashBig">
          <thead><tr><th>#</th><th>${t('dashboard.team')}</th><th>${t('dashboard.laps')}</th><th>${t('dashboard.total_time')}</th><th>${t('dashboard.best')}</th><th>${t('dashboard.last')}</th></tr></thead>
          <tbody>${rowsHtml || `<tr><td colspan="7" class="muted">${t('dashboard.no_team_laps')}</td></tr>`}</tbody>
        </table>
      `;
    }

    // Driver overview (best + last)
    function buildDriverStats(){
      const map = new Map(); // id -> {id,name,lastMs,lastTs,bestMs,lapsCount}
      const raceIdNow = raceId || '';
      // Finish-window status used to show the finish flag.
      const finish = (state.session.finish && state.session.finish.pending) ? state.session.finish : null;
      const finishedDriverIds = new Set();
      if(finish && finish.finishedCarIds){
        for(const carId of Object.keys(finish.finishedCarIds)){
          const c = getCar(carId);
          const did = (c?.driverId||'').trim();
          if(did) finishedDriverIds.add(did);
        }
      }

      function touch(id){
        if(!map.has(id)){
          map.set(id, { id, name: driverNameById(id), lastMs:null, lastTs:0, bestMs:null, lapsCount:0, totalMs:null, finished:false });
        }
        return map.get(id);
      }

      const rl0 = (relevantLaps||[]).filter(l=>l && l.lapMs!=null);
      const raceOnly = rl0.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
      const rl = raceOnly.length ? raceOnly : rl0;
      rl.forEach(l=>{
        const id = driverKeyForLap(l);
        const s = touch(id);
        s.lapsCount++;
        if(s.bestMs==null || l.lapMs < s.bestMs) s.bestMs = l.lapMs;
        if(l.ts && l.ts >= (s.lastTs||0)){
          s.lastTs = l.ts;
          s.lastMs = l.lapMs;
        }
      });

      // sort
      const arr = Array.from(map.values());
      for(const s of arr){
        if(raceIdNow){
          const rt = getDriverRaceTotalFromStartMs(raceIdNow, s.id, rl);
          if(rt!=null) s.totalMs = rt;
        }
      }
      for(const s of arr){ s.finished = isDriverFinished(s.id); }
      if(inRace || postRaceResultMode){
        const liveRaceRows = !!(raceIdNow && raceIdNow===state.session.currentRaceId && state.session.state==='RUNNING' && !(state.session.finish&&state.session.finish.pending));
        sortDriverStandingRows(arr, race, { live: liveRaceRows });
      } else {
        arr.sort((a,b)=>{
          if(sortPref==='name') return (a.name||'').localeCompare(b.name||'', getUiLocale());
          if(sortPref==='last'){
            const av = a.lastMs==null ? 9e15 : a.lastMs;
            const bv = b.lastMs==null ? 9e15 : b.lastMs;
            if(av!==bv) return av-bv;
            const ab = a.bestMs==null ? 9e15 : a.bestMs;
            const bb = b.bestMs==null ? 9e15 : b.bestMs;
            return ab-bb;
          }
          const av = a.bestMs==null ? 9e15 : a.bestMs;
          const bv = b.bestMs==null ? 9e15 : b.bestMs;
          if(av!==bv) return av-bv;
          const al = a.lastMs==null ? 9e15 : a.lastMs;
          const bl = b.lastMs==null ? 9e15 : b.lastMs;
          return al-bl;
        });
      }
      return arr;
    }

    function renderDrivers(){
      const stats = buildDriverStats();
      const formatMrcDelta =
        (typeof formatMrcDeltaMs === 'function')
          ? formatMrcDeltaMs
          : ((value)=>{
              const num = Number(value);
              return Number.isFinite(num) ? msToTime(Math.abs(num), 3) : '—';
            });
      const getMrcDelta =
        (typeof getMrcDeltaForCar === 'function')
          ? getMrcDeltaForCar
          : (()=>null);
      const formatSpeed =
        (typeof formatKmh === 'function')
          ? formatKmh
          : ((value)=>{
              const num = Number(value);
              return Number.isFinite(num) ? `${num.toFixed(2).replace('.', ',')} km/h` : '—';
            });
      const lapToKmh =
        (typeof lapMsToAverageKmh === 'function')
          ? lapMsToAverageKmh
          : (()=>null);
      const pickTextColor =
        (typeof pickTextColorForBg === 'function')
          ? pickTextColorForBg
          : (()=>'#ffffff');
      const rows = stats.map((s,idx)=>{
        const drv = getDriver(s.id) || null;
        const bg = drv?.color || '';
        const tc = bg ? (drv?.colorAutoText!==false ? pickTextColor(bg) : (drv?.textColor||pickTextColor(bg))) : '';
        const style = bg ? ` style=\"background:${bg};color:${tc}\"` : '';
        return `
        <tr${style}>
          ${inRace ? `<td>${idx+1}</td>` : ``}
          <td><div class="nameCell">${(()=>{const url=getDriverAvatarDataUrl(s.id);const nm=(s.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return url?`<img class=\"avatar\" src=\"${esc(url)}\" alt=\"\"/>`:`<div class=\"avatar fallback\">${esc(ini||'?')}</div>`;})()}<span class="nm">${esc(s.name)}</span>${s.finished?'<span class="finishFlag">🏁</span>':''}</div></td>
          <td class="mono">${s.lastMs!=null ? esc(msToTime(s.lastMs, 3)) : '—'}</td>
          <td class="mono">${s.bestMs!=null ? esc(msToTime(s.bestMs, 3)) : '—'}</td>
          <td class="mono">${esc(formatMrcDelta(getMrcDelta(getLatestCarIdForDriver(s.id, relevantLaps) || getCarsByDriver(s.id)?.[0]?.id || '')))}</td>
          <td class="mono">${esc(formatSpeed(lapToKmh(s.bestMs, getActiveTrack())))}</td>
          ${inRace ? `<td class="mono">${s.totalMs!=null ? esc(msToTime(s.totalMs, 3)) : '—'}</td>` : ``}
          <td class="small">${s.lapsCount}</td>
        </tr>
      `;
      }).join('');
      return `
        <div class="muted">${inRace ? t('dashboard.driver_intro_race') : t('dashboard.driver_intro_idle')}</div>
        <div class="hr"></div>
        <table class="table dashBig">
          <thead><tr>${inRace?'<th>#</th>':''}<th>${t('dashboard.driver')}</th><th>${t('dashboard.last')}</th><th>${t('dashboard.best')}</th><th>${t('dashboard.mrc_delta')}</th><th>${t('dashboard.average_kmh')}</th>${inRace?`<th>${t('dashboard.total_time')}</th>`:''}<th class="small">${t('dashboard.laps')}</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="${inRace?8:6}" class="muted">${t('dashboard.no_driver_data')}</td></tr>`}</tbody>
        </table>
      `;
    }

    // Race standings (placement)
    function renderRace(){
      // Only use real race laps when available
      const rl0 = (relevantLaps||[]).filter(l=>l && l.lapMs!=null);
      const raceOnly = rl0.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
      const rl = raceOnly.length ? raceOnly : rl0;

      const raceIdNow = raceId || '';
      let arr = [];
      if(postRaceResultMode && raceIdNow){
        arr = buildFinalRaceRowsFromStandings(raceIdNow, rl, getActiveTrack()).map(x=>({
          id:x.driverId,
          name:x.name,
          laps:x.laps,
          totalMs:x.totalMs,
          bestMs:x.bestMs,
          lastMs:x.lastMs,
          finished:x.finished
        }));
      } else {
        // placement by laps desc, then total time asc (tie-breaker), then best lap asc
        const map = new Map();
        rl.forEach(l=>{
          const id = driverKeyForLap(l);
          if(!map.has(id)){
            map.set(id,{ id, name: driverNameById(id), laps:0, totalMs:0, bestMs:null, lastMs:null, lastTs:0, finished:false });
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
        arr = Array.from(map.values());
        for(const s of arr){
          s.finished = isDriverFinished(s.id);
          if(raceIdNow){
            const rt = getDriverRaceTotalFromStartMs(raceIdNow, s.id, rl);
            if(rt!=null) s.totalMs = rt;
          }
        }
        const liveRaceRows = !!(raceIdNow && raceIdNow===state.session.currentRaceId && state.session.state==='RUNNING' && !(state.session.finish&&state.session.finish.pending));
        sortDriverStandingRows(arr, race, { live: liveRaceRows });
      }
      const formatMrcDelta =
        (typeof formatMrcDeltaMs === 'function')
          ? formatMrcDeltaMs
          : ((value)=>{
              const num = Number(value);
              return Number.isFinite(num) ? msToTime(Math.abs(num), 3) : '—';
            });
      const getMrcDelta =
        (typeof getMrcDeltaForCar === 'function')
          ? getMrcDeltaForCar
          : (()=>null);
      const formatSpeed =
        (typeof formatKmh === 'function')
          ? formatKmh
          : ((value)=>{
              const num = Number(value);
              return Number.isFinite(num) ? `${num.toFixed(2).replace('.', ',')} km/h` : '—';
            });
      const lapToKmh =
        (typeof lapMsToAverageKmh === 'function')
          ? lapMsToAverageKmh
          : (()=>null);
      const rows = arr.map((s,idx)=>`
        <tr>
          <td>${idx+1}</td>
          <td><div class="nameCell">${(()=>{const url=getDriverAvatarDataUrl(s.id);const nm=(s.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return url?`<img class=\"avatar\" src=\"${esc(url)}\" alt=\"\"/>`:`<div class=\"avatar fallback\">${esc(ini||'?')}</div>`;})()}<span class="nm">${esc(s.name)}</span>${s.finished?'<span class="finishFlag">🏁</span>':''}</div></td>
          <td class="small">${s.laps}</td>
          <td class="mono">${s.totalMs!=null ? esc(msToTime(s.totalMs, 3)) : '—'}</td>
          <td class="mono">${s.bestMs!=null ? esc(msToTime(s.bestMs, 3)) : '—'}</td>
          <td class="mono">${esc(formatMrcDelta(getMrcDelta(getLatestCarIdForDriver(s.id, rl) || '')))}</td>
          <td class="mono">${esc(formatSpeed(lapToKmh(s.bestMs, getActiveTrack())))}</td>
          <td class="mono">${s.lastMs!=null ? esc(msToTime(s.lastMs, 3)) : '—'}</td>
        </tr>
      `).join('');
      const body = rows || `<tr><td colspan="8" class="muted">${t('dashboard.no_race_laps')}</td></tr>`;
      const hint = showLiveFallback ? `<div class="muted small" style="margin-top:10px;">${t('dashboard.live_hint')}</div>` : '';
      const raceEndHighlights = (()=>{
        if(!postRaceResultMode || !race || race.mode==='team' || race.mode==='endurance') return '';
        try{ return renderRaceEndHighlightsHtml(computeRaceEndHighlights(race, rl, arr)); }catch{ return ''; }
      })();
      return `
        <div class="muted">${t('dashboard.race_intro')}</div>
        ${raceEndHighlights}
        <div class="hr"></div>
        <table class="table dashBig">
          <thead><tr><th>#</th><th>${t('dashboard.driver')}</th><th class="small">${t('dashboard.laps')}</th><th>${t('dashboard.total_time')}</th><th>${t('dashboard.best')}</th><th>${t('dashboard.mrc_delta')}</th><th>${t('dashboard.average_kmh')}</th><th>${t('dashboard.last')}</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
        ${hint}
      `;
    }

    function viewLabel(v){
      if(v==='auto') return t('dashboard.view_auto');
      if(v==='race') return t('dashboard.view_race');
      if(v==='drivers') return t('dashboard.view_drivers');
      if(v==='live') return t('dashboard.view_live');
      if(v==='teams') return t('dashboard.view_teams');
      return v;
    }

    // header controls
    let viewOptions = [
      {v:'auto', t:t('dashboard.view_auto')},
      {v:'race', t:t('dashboard.view_race')},
      {v:'drivers', t:t('dashboard.view_drivers')},
      {v:'live', t:t('dashboard.view_live')}
    ];
    if(hasTeamishMode){
      // In Team- und Langstreckenrennen ist eine Team-Ansicht sinnvoll
      viewOptions.splice(2, 0, {v:'teams', t:t('dashboard.view_teams')});
    }


    function dashViewBtn(v, label){
      const activeCls = (view===v) ? 'btn btn-primary smallbtn' : 'btn smallbtn';
      return `<button class="${activeCls}" data-dash-view="${esc(v)}">${esc(label)}</button>`;
    }

    const sortOptions = [
      {v:'best', t:t('dashboard.sort_best')},
      {v:'last', t:t('dashboard.sort_last')},
      {v:'name', t:t('dashboard.sort_name')}
    ];

    const title = idleMode ? t('dashboard.free_driving') : ((view==='race') ? ((postRaceResultMode ? t('dashboard.race_result') : t('dashboard.placement'))) : (view==='drivers' ? t('dashboard.drivers') : (view==='teams' ? t('dashboard.teams') : t('dashboard.live_laps'))));

    let content = '';
    if(view==='teams') content = renderTeams();
    else if(view==='race') content = renderRace();
    else if(view==='drivers') content = renderDrivers();
    else content = renderLive();

    // Dashboard intentionally has no podium block.
    if(state.ui.podiumRaceId){
      const pr = rd?.races?.find(r=>r.id===state.ui.podiumRaceId) || null;
      if(!pr || !pr.endedAt){
        state.ui.podiumRaceId = '';
        saveState();
      }
    }

    el.innerHTML = `
      ${showEnduranceStatus ? renderEnduranceStatusHtml() : ''}
      <div class="card">
        <div class="card-h">
          <h2>${esc(title)}</h2>
          <div class="row" style="gap:10px;">
            <div class="row wrap dashViewBtns" style="gap:8px;">
              ${viewOptions.map(o=>dashViewBtn(o.v, o.t)).join('')}
            </div>
            ${(view==='drivers' && !inRace) ? `
              <select id="dashSort" class="pill" title="${esc(t('dashboard.sort_title'))}">
                ${sortOptions.map(o=>`<option value="${o.v}" ${o.v===sortPref?'selected':''}>${esc(t('dashboard.sort_prefix', { label:o.t }))}</option>`).join('')}
              </select>
            ` : ''}
            <span class="pill">${esc(getModeLabel())}</span>
          </div>
        </div>
        <div class="card-b">
          ${content}
        </div>
      </div>
    `;

    el.querySelectorAll('[data-dash-view]').forEach(btn=>{
      btn.onclick = ()=>{
        state.ui.dashboardView = btn.getAttribute('data-dash-view') || 'auto';
        saveState();
        renderDashboard();
      };
    });

    const btnPod = el.querySelector('#btnClosePodium');
    if(btnPod){
      btnPod.onclick = ()=>{
        state.ui.podiumRaceId = '';
        saveState();
        renderDashboard();
      };
    }
    const selSort = el.querySelector('#dashSort');
    if(selSort){
      selSort.onchange = (e)=>{
        state.ui.dashboardSort = e.target.value;
        saveState();
        renderDashboard();
      };
    }
  }


  return { resolveRaceId, isLiveRace, renderSessionControl, renderDashboard };
})();


