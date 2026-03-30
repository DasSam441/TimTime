window.TIMTIME_SHELL = (function(){
  'use strict';
  let state = window.TIMTIME_SHARED?.state || {
    ui:{ activeTab:'Dashboard' },
    settings:{},
    usb:{ lastLines:[] },
    ble:{ lastLines:[] },
    modes:{ loop:{} },
    session:{ state:'IDLE' },
    loopRuntime:{}
  };
  const BUILD = window.TIMTIME_CONSTANTS?.BUILD || 'v17.5';
  const TABS = window.TIMTIME_CONSTANTS?.TABS || [];
  const LS_UI = window.TIMTIME_SHARED?.LS_UI || 'zeitnahme2_ui_v3';
  const LocaleApi = window.TIMTIME_LOCALE || {};
  const now = window.TIMTIME_SHARED?.now || (()=>Date.now());
  const uid = window.TIMTIME_SHARED?.uid || ((prefix='id')=>`${prefix}_${Math.random().toString(16).slice(2,10)}`);
  const clamp = window.TIMTIME_SHARED?.clamp || ((n,a,b)=>{
    n = Number(n);
    return Math.max(a, Math.min(b, n));
  });
  const esc = window.TIMTIME_SHARED?.esc || (s => String(s ?? '').replace(/[&<>\"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c])));
  const msToTime = window.TIMTIME_SHARED?.msToTime || ((ms)=>String(ms ?? ''));
  const getUiLanguage = LocaleApi.getUiLanguage || (()=>'de');
  const getUiLocale = LocaleApi.getUiLocale || (()=>'de-DE');
  const t = LocaleApi.t || ((key, _vars, fallback='')=>fallback || key);
  function clampNum(v, minV, defV){
    const n = parseFloat(v);
    if(!Number.isFinite(n)) return defV;
    return Math.max(minV, n);
  }
  function bindShared(){
    Object.assign(globalThis, window.TIMTIME_SHARED || {});
    state = globalThis.state || state;
  }
function loadUi(){
    bindShared();
    const w = window.innerWidth || 1600;
    try{
      const raw = localStorage.getItem(LS_UI);
      const base = raw ? JSON.parse(raw) : {};
      const ui = { logW: Number(base.logW||760), logCollapsed: !!base.logCollapsed };

      // On normal desktop widths we default to EXPANDED.
      // (Users kept getting "stuck" in collapsed mode.)
      if(w >= 1100){
        ui.logCollapsed = false;
      } else if(w < 900){
        ui.logCollapsed = true;
      }

      return ui;
    }catch{
      return { logW: 760, logCollapsed: (w < 900) };
    }
  }
  const ui = loadUi();
  function saveUi(){ localStorage.setItem(LS_UI, JSON.stringify(ui)); }

  function applyLogUi(){
    bindShared();
    const root = document.getElementById('layoutRoot');

    // Keep layout usable: avoid an oversized log pane squeezing the main content.
    const w = window.innerWidth || 1600;

    // Hard caps
    const minLogW = 240;
    const maxLogW = Math.max(560, Math.min(960, Math.floor(w * 0.5)));
    ui.logW = clamp(ui.logW, minLogW, maxLogW);

    // If screen is very narrow (mobile), auto-collapse log.
    // Do NOT force-collapse on normal laptop widths; user toggle should win.
    if(w < 900){
      ui.logCollapsed = true;
    }
    if(ui.logCollapsed){
      root.classList.add('collapsed');
    } else {
      root.classList.remove('collapsed');
      root.style.setProperty('--logw', ui.logW + 'px');
    }

    const btn = document.getElementById('btnToggleLog');
    const dockBtn = document.getElementById('btnToggleLogDock');
    if(btn) btn.textContent = ui.logCollapsed ? 'Log <' : 'Log >';
    if(btn) btn.title = ui.logCollapsed ? 'Run Log ausklappen' : 'Run Log einklappen';
    if(dockBtn){
      dockBtn.textContent = ui.logCollapsed ? 'Log <' : 'Log >';
      dockBtn.title = ui.logCollapsed ? 'Run Log ausklappen' : 'Run Log einklappen';
    }
    saveUi();
  }

  function wireLogResizer(){
    bindShared();
    const res = document.getElementById('logResizer');
    let dragging=false, startX=0, startW=ui.logW;
    res.addEventListener('mousedown',(e)=>{
      if(ui.logCollapsed) return;
      dragging=true; startX=e.clientX; startW=ui.logW;
      document.body.style.userSelect='none';
    });
    window.addEventListener('mouseup',()=>{
      if(!dragging) return;
      dragging=false;
      document.body.style.userSelect='';
      saveUi();
    });
    window.addEventListener('mousemove',(e)=>{
      if(!dragging) return;
      const dx = startX - e.clientX;
      const w = window.innerWidth || 1600;
      ui.logW = clamp(startW + dx, 240, Math.max(560, Math.min(960, Math.floor(w * 0.5))));
      applyLogUi();
    });
  }

  // --------------------- Rendering ---------------------
  function renderTopMenu(){
    bindShared();
    const menu = document.getElementById('topMenu');
    menu.innerHTML='';
    for(const tab of TABS){
      const b = document.createElement('div');
      b.className = 'tab' + (state.ui.activeTab===tab.key?' active':'');
      b.textContent = t('tab.' + tab.page, null, tab.key);
      b.onclick = ()=>{ state.ui.activeTab=tab.key; saveState(); renderAll(); };
      menu.appendChild(b);
    }
  }
  function showActivePage(){
    bindShared();
    for(const t of TABS){
      const el = document.getElementById(t.page);
      if(el) el.classList.toggle('active', state.ui.activeTab===t.key);
    }
  }

  function sanitizeVisibleText(root=document.body){
    bindShared();
    if(typeof demojibake !== 'function') return;
    const maybeBad = /Ã|Â|â|�/;
    try{
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while((node = walker.nextNode())){
        const raw = String(node?.nodeValue || '');
        if(!raw || !maybeBad.test(raw)) continue;
        const tag = String(node.parentNode?.nodeName || '').toUpperCase();
        if(tag === 'SCRIPT' || tag === 'STYLE') continue;
        const next = demojibake(raw);
        if(next && next !== raw) node.nodeValue = next;
      }
      root.querySelectorAll?.('[title],[placeholder],[aria-label],button,option').forEach((el)=>{
        ['title','placeholder','aria-label'].forEach((attr)=>{
          const cur = el.getAttribute?.(attr);
          if(cur && maybeBad.test(cur)){
            const next = demojibake(cur);
            if(next && next !== cur) el.setAttribute(attr, next);
          }
        });
        if(el.childElementCount === 0){
          const cur = el.textContent;
          if(cur && maybeBad.test(cur)){
            const next = demojibake(cur);
            if(next && next !== cur) el.textContent = next;
          }
        }
      });
    }catch{}
  }

  function renderHeader(){
    bindShared();
    document.getElementById('brandTitle').textContent = state.settings.appName || 'Zeitnahme 2.0';
    const sub=document.getElementById('brandSub');
if(sub) sub.textContent = t('header.subtitle', { build:BUILD }, 'offline - HTML/JS/CSS - build ' + BUILD);
    setUsbUi(state.usb.connected);
    setBleUi(state.ble.connected);
  }

  async function renderGlobalProjectDataWarning(){
    bindShared();
    const bar = document.getElementById('globalProjectDataWarning');
    if(!bar) return;
    try{
      if(typeof getProjectDataStatus !== 'function'){
        bar.style.display = 'none';
        bar.textContent = '';
        return;
      }
      const status = await getProjectDataStatus();
      if(!status.supported){
        bar.style.display = '';
        bar.textContent = 'Wichtige Warnung: Dieser Browser unterstuetzt keine feste TimTime-Ordnerfreigabe. Speichern und Wiederladen sind dadurch nicht zuverlaessig.';
        return;
      }
      if(!status.configured){
        bar.style.display = '';
        bar.textContent = 'Wichtige Warnung: Es ist noch kein TimTime-Datenordner verbunden. Bitte sofort unter Einstellungen den TimTime-Ordner verbinden.';
        return;
      }
      if(!status.reachable){
        bar.style.display = '';
        bar.textContent = 'Wichtige Warnung: Der verbundene TimTime-Datenordner ist aktuell nicht erreichbar oder die Freigabe fehlt.';
        return;
      }
      bar.style.display = 'none';
      bar.textContent = '';
    }catch{
      bar.style.display = '';
      bar.textContent = 'Wichtige Warnung: Der TimTime-Datenordner konnte nicht geprüft werden.';
    }
  }
  
  function getEnduranceStatusRows(){
    bindShared();
    const teams = state.modes.endurance?.teams || [];
    const rid = state.session.currentRaceId || '';
    const activeMap = state.modes.endurance?.activeByTeamId || {};
    return teams.map(t=>{
      const ai = activeMap[t.id] || null;
      const d = ai?.driverId ? getDriver(ai.driverId) : null;
      const car = ai?.carId ? getCar(ai.carId) : null;
      const stint = ai ? Math.max(0, parseInt(ai.stintLaps||0,10) || 0) : 0;
      const rule = rid ? getEnduranceRuleStateForTeam(t.id, rid) : { compliant:true, invalidStintCount:0, statusText:'OK' };
      return {
        teamId:t.id,
        teamName:t.name||'Team',
        driverName:d?.name||'-',
        carName:car?.name||'-',
        stint,
        minStint: rule.minStint || 0,
        maxStint: rule.maxStint || 0,
        compliant: !!rule.compliant,
        invalidStintCount: rule.invalidStintCount||0,
        statusText: rule.statusText || 'OK'
      };
    });
  }

  function renderEnduranceStatusHtml(){
    bindShared();
    const rows = getEnduranceStatusRows();
    if(!rows.length) return '';
    return `
      <div class="card" style="margin-bottom:12px">
        <div class="card-h"><h2>${esc(t('endurance.status_title'))}</h2></div>
        <div class="card-b">
          <table class="table">
            <thead><tr><th>${esc(t('common.team'))}</th><th>${esc(t('endurance.active_driver'))}</th><th>${esc(t('endurance.stint'))}</th><th>${esc(t('endurance.status'))}</th><th>${esc(t('endurance.car'))}</th></tr></thead>
            <tbody>
              ${rows.map(row=>`
                <tr>
                  <td>${esc(row.teamName || t('common.team', null, 'Team'))}</td>
                  <td>${esc(row.driverName || '-')}</td>
                  <td>${esc(`${row.stint} / ${row.maxStint>0 ? row.maxStint : row.minStint || 0}`)}</td>
                  <td>${esc(row.statusText || t('endurance.status_ok', null, 'OK'))}</td>
                  <td>${esc(row.carName || '-')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderDauerschleife(){
    bindShared();
    const el = document.getElementById('pageDauerschleife');
    const active = state.modes.activeMode==='loop';
    const phase = state.loopRuntime?.phase || '';
    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>${esc(t('tab.pageDauerschleife', null, 'Loop Mode'))}</h2><span class="pill">${active ? esc(t('common.active', null, 'ACTIVE')) : esc(t('common.inactive', null, 'inactive'))}</span></div>
          <div class="card-b">
            <div class="muted"><b>${esc(t('loop.auto', null, 'Automatic'))}</b>: ${esc(t('loop.auto_desc', null, 'Training -> Race -> Training -> ... (Start/Stop on the left).'))}</div>
            <div class="hr"></div>

            <div class="field">
              <label>${esc(t('loop.training_minutes', null, 'Training (minutes)'))}</label>
              <input class="input" id="loopTrainMin" type="number" min="0" step="0.5" value="${esc(state.modes.loop.trainingMin)}"/>
            </div>
            <div class="field">
              <label>${esc(t('loop.race_minutes', null, 'Race (minutes)'))}</label>
              <input class="input" id="loopRaceMin" type="number" min="0.1" step="0.5" value="${esc(state.modes.loop.raceMin)}"/>
            </div>
            <div class="field">
              <label>${esc(t('loop.setup_minutes', null, 'Grid phase (minutes)'))}</label>
              <input class="input" id="loopSetupMin" type="number" min="0" step="0.5" value="${esc(state.modes.loop.setupMin)}"/>
            </div>
            <div class="field">
              <label>${esc(t('loop.podium_minutes', null, 'Podium (minutes)'))}</label>
              <input class="input" id="loopPodiumMin" type="number" min="0" step="0.5" value="${esc(state.modes.loop.podiumMin)}"/>
            </div>

            <div class="row">
              <button class="btn btn-primary" id="btnActivateLoop">${esc(t('single.activate', null, 'Set active'))}</button>
              <button class="btn" id="btnSaveLoop">${esc(t('common.save', null, 'Save'))}</button>
            </div>
            <div class="hr"></div>
            <div class="muted">${esc(t('loop.current_phase', null, 'Current phase'))}: <b>${esc(phase || t('mode.none', null, '-'))}</b></div>
          </div>
        </div>
        <div class="card"><div class="card-h"><h2>${esc(t('single.info', null, 'Info'))}</h2></div><div class="card-b"><div class="muted">${esc(t('loop.pause_hint', null, 'Pause freezes the phase switch timer.'))}</div></div></div>
      </div>
    `;

    // Auto-save loop minute settings on change (so values are always applied)
    const iTrain = el.querySelector('#loopTrainMin');
    const iSetup = el.querySelector('#loopSetupMin');
    const iRace = el.querySelector('#loopRaceMin');
    const iPod  = el.querySelector('#loopPodiumMin');
    const saveLoop = ()=>{
      state.modes.loop.trainingMin = clampNum(iTrain?.value, 0, state.modes.loop.trainingMin||0);
      state.modes.loop.setupMin    = clampNum(iSetup?.value, 0, state.modes.loop.setupMin||0);
      state.modes.loop.raceMin     = clampNum(iRace?.value, 0.01, state.modes.loop.raceMin||0.01);
      state.modes.loop.podiumMin   = clampNum(iPod?.value, 0, state.modes.loop.podiumMin||0);
      saveState();
    };
    [iTrain,iSetup,iRace,iPod].forEach(inp=>{ if(inp) inp.onchange = saveLoop; if(inp) inp.oninput = saveLoop; });
    el.querySelector('#btnSaveLoop').onclick=()=>{
      saveLoop();
      saveState();
      toast(t('tab.pageDauerschleife', null, 'Loop Mode'), t('common.saved', null, 'Saved.'), 'ok');
      logLine('Loop settings saved');
      renderAll();
    };
    el.querySelector('#btnActivateLoop').onclick=()=>{
      const trainVal = parseFloat(el.querySelector('#loopTrainMin')?.value||'0');
      const setupVal = parseFloat(el.querySelector('#loopSetupMin')?.value||'0');
      const raceVal = parseFloat(el.querySelector('#loopRaceMin')?.value||'0');
      const podiumVal = parseFloat(el.querySelector('#loopPodiumMin')?.value||'0');
      state.ui.freeDrivingEnabled = false;
      state.session.isFreeDriving = false;
      state.modes.loop.trainingMin = Number.isFinite(trainVal) ? Math.max(0, trainVal) : 0;
      state.modes.loop.setupMin = Number.isFinite(setupVal) ? Math.max(0, setupVal) : 0;
      state.modes.loop.raceMin = Number.isFinite(raceVal) ? Math.max(0.01, raceVal) : 0.01;
      state.modes.loop.podiumMin = Number.isFinite(podiumVal) ? Math.max(0, podiumVal) : 0;
      state.modes.activeMode = 'loop';
      saveState();
      toast(t('tab.pageDauerschleife', null, 'Loop Mode'), t('single.activated', null, 'Set active.'), 'ok');
      renderAll();
    };
  }

  // -------- Renntag --------
  
  // -------- Ergebnis / Podium (global, fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¼r Renntag & Dashboard) --------
  // --------------------- Championship / Results ---------------------
  function computeTimerDisplay(){
    bindShared();
    // Default: elapsed session time
    let ms = sessionElapsedMs();
    let prefix = '';

    if(state.modes.activeMode==='loop' && state.loopRuntime && state.loopRuntime.phase){
      const ph = state.loopRuntime.phase;
      if(ph==='race'){
        const limitMs = Math.max(0.01, Number(state.modes.loop.raceMin||0))*60_000;
        const f = state.session.finish;
        if(f?.pending && f.type==='time'){
          const base = (f.firstFinishTs && f.firstFinishTs>0) ? f.firstFinishTs : getTimelineNowMs();
          ms = Math.max(0, getTimelineNowMs() - base);
          prefix = 'UEBERZEIT +';
        } else {
          const elapsed = Math.max(0, getTimelineNowMs() - (state.loopRuntime.phaseStartedAt || getTimelineNowMs()));
          ms = Math.max(0, limitMs - elapsed);
          prefix = '';
        }
      } else {
        ms = state.loopRuntime.phaseEndsAt ? Math.max(0, state.loopRuntime.phaseEndsAt - getTimelineNowMs()) : 0;
        prefix = '';
      }
    }

    if(!isFreeDrivingMode() && state.modes.activeMode==='single' && (state.modes.single?.finishMode||'none')==='time'){
      const limitMs = Math.max(1, (state.modes.single.timeLimitSec||180)) * 1000;
      const f = state.session.finish;
      if(f?.pending && f.type==='time'){
        const base = (f.firstFinishTs && f.firstFinishTs>0) ? f.firstFinishTs : getTimelineNowMs();
        ms = Math.max(0, getTimelineNowMs() - base);
        prefix = 'UEBERZEIT +';
      } else {
        ms = Math.max(0, limitMs - sessionElapsedMs());
        prefix = '';
      }
    }

    if(state.modes.activeMode==='team' && (state.modes.team?.finishMode||'none')==='time'){
      const limitMs = Math.max(1, (state.modes.team.timeLimitSec||180)) * 1000;
      const f = state.session.finish;
      if(f?.pending && f.type==='time'){
        const base = (f.firstFinishTs && f.firstFinishTs>0) ? f.firstFinishTs : getTimelineNowMs();
        ms = Math.max(0, getTimelineNowMs() - base);
        prefix = 'UEBERZEIT +';
      } else {
        ms = Math.max(0, limitMs - sessionElapsedMs());
        prefix = '';
      }
    }

    if(state.modes.activeMode==='endurance'){
      const liveRace = state.session.currentRaceId ? (getActiveRaceDay()?.races?.find(r=>r.id===state.session.currentRaceId) || null) : null;
      const limitMs = Math.max(1, Number(liveRace?.enduranceDurationMin || state.modes.endurance?.durationMin || 30)) * 60_000;
      const f = state.session.finish;
      if(f?.pending && f.type==='time'){
        const base = (f.firstFinishTs && f.firstFinishTs>0) ? f.firstFinishTs : getTimelineNowMs();
        ms = Math.max(0, getTimelineNowMs() - base);
        prefix = 'UEBERZEIT +';
      } else if(state.session.state==='RUNNING'){
        ms = Math.max(0, limitMs - sessionElapsedMs());
        prefix = '';
      }
    }

    return prefix + msToTime(ms, 0);
  }

  let lastDashRenderTs = 0;
function tick(){
    bindShared();
    const t = document.getElementById('scTimer');
    if(t){
      t.textContent = computeTimerDisplay();

    // Live-refresh Dashboard without requiring a tab click
    if(state.ui.activeTab==='Dashboard'){
      const nowTs = now();
      if(nowTs - lastDashRenderTs > 250){
        lastDashRenderTs = nowTs;
        try{ renderDashboard(); }catch{}
      }
    }

    }
    
    // Race countdown / finish announcements
    if(state.session.state==='RUNNING'){
      ensureRaceAnnounceRuntime();
      let remainingSec = null;
      let activeRaceId = state.session.currentRaceId || '';

      if(!isFreeDrivingMode() && state.modes.activeMode==='single' && (state.modes.single?.finishMode||'none')==='time'){
        const limitMs = Math.max(1, (state.modes.single.timeLimitSec||180)) * 1000;
        if(!(state.session.finish?.pending)){
          remainingSec = Math.ceil(Math.max(0, limitMs - sessionElapsedMs()) / 1000);
        } else if(!state.session.announce.timeExpiredSaid && state.audio?.enabled && state.audio?.sayTimeExpired){
          queueSpeak('Zeit abgelaufen');
          state.session.announce.timeExpiredSaid = true;
          saveState();
        }
      } else if(state.modes.activeMode==='loop' && (state.loopRuntime?.phase==='race' || state.loopRuntime?.phase==='setup')){
        const limitMs = Math.max(0.01, Number(state.modes.loop.raceMin||0))*60_000;
        const elapsed = Math.max(0, getTimelineNowMs() - (state.loopRuntime.phaseStartedAt || getTimelineNowMs()));
        if(!(state.session.finish?.pending)){
          remainingSec = Math.ceil(Math.max(0, limitMs - elapsed) / 1000);
        } else if(!state.session.announce.timeExpiredSaid && state.audio?.enabled && state.audio?.sayTimeExpired){
          queueSpeak('Zeit abgelaufen');
          state.session.announce.timeExpiredSaid = true;
          saveState();
        }
      }

      if(remainingSec!=null){
        const listTimes = (state.audio?.restAnnouncementTimes||[]).filter(x=>Number.isFinite(x));
        const maxSec = (state.modes.activeMode==='loop' && state.loopRuntime?.phase==='setup' && state.loopRuntime?.phaseTotalSec) ? state.loopRuntime.phaseTotalSec : null;
        for(const tSec of listTimes){
          const key = String(activeRaceId)+':'+String(tSec);
          if(remainingSec===tSec && !state.session.announce.restSaidKeys[key]){
            const totalSec = (state.modes.activeMode==='loop' && state.loopRuntime?.phaseTotalSec) ? state.loopRuntime.phaseTotalSec : null;
            if(maxSec!=null && tSec>maxSec) continue;
            if(totalSec!=null && tSec===totalSec){
              state.session.announce.restSaidKeys[key] = true;
              continue;
            }
            speakRaceRemaining(tSec);
            state.session.announce.restSaidKeys[key] = true;
            saveState();
            break;
          }
        }
      }
    }

sendPresenterSnapshot();
    try{ if(typeof syncObsAutoScene === 'function') syncObsAutoScene(false); }catch{}
    try{ if(typeof syncObsTextSources === 'function') syncObsTextSources(false); }catch{}
    loopTick();
    singleTick();
    teamTick();
    enduranceTick();
    // also enforce finish window for other modes (if started)
    finishTick();
    requestAnimationFrame(tick);
  }

  
  let backgroundUiTs = 0;
  function backgroundUiRefresh(force=false){
    bindShared();
    const nowTs = now();
    if(!force && (nowTs - backgroundUiTs) < 250) return;
    backgroundUiTs = nowTs;
    try{
      const t = document.getElementById('scTimer');
      if(t) t.textContent = computeTimerDisplay();
    }catch{}
    try{ renderSessionControl(); }catch{}
    try{ if(state.ui.activeTab==='Dashboard') renderDashboard(); }catch{}
    try{ sendPresenterSnapshot(false); }catch{}
  }

  setInterval(()=>{
    backgroundUiRefresh(false);
  }, 250);

  setInterval(()=>{
    processDiscordQueue(false).catch(()=>{});
  }, 30000);

  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden){
      backgroundUiRefresh(true);
      processDiscordQueue(false).catch(()=>{});
    }
  });
  window.addEventListener('focus', ()=>{
    backgroundUiRefresh(true);
    processDiscordQueue(false).catch(()=>{});
  });
  window.addEventListener('online', ()=>scheduleDiscordQueueProcessing(250));

// --------------------- Wire buttons ---------------------
  function wire(){
    bindShared();
    document.getElementById('btnStart').onclick=sessionStart;
    document.getElementById('btnStop').onclick=sessionStop;
    document.getElementById('btnPause').onclick=sessionPause;
    document.getElementById('btnResume').onclick=sessionResume;


    const scUse = document.getElementById('scUseAmpel');
    if(scUse) scUse.onchange = ()=>{ state.settings.useAmpel = scUse.checked; saveState(); toast('Ampel', scUse.checked?'Ampel aktiv.':'Ampel aus.','ok'); };

    const btnFreeDrivingOn = document.getElementById('btnFreeDrivingOn');
    if(btnFreeDrivingOn) btnFreeDrivingOn.onclick = async ()=>{
      if(state.session.state !== 'IDLE') return;
      state.ui.freeDrivingEnabled = true;
      saveState();
      renderSessionControl();
      sendPresenterSnapshot(true);
      await sessionStart();
    };

    const btnFreeDrivingOff = document.getElementById('btnFreeDrivingOff');
    if(btnFreeDrivingOff) btnFreeDrivingOff.onclick = ()=>{
      if(state.session.isFreeDriving || state.ui.freeDrivingEnabled){
        sessionStop();
        toast('Session', 'Freies Fahren aus.', 'ok');
      }
    };

    document.getElementById('btnUsb').onclick=async ()=>{
      if(state.usb.connected) await usbDisconnect(); else await usbConnect();
    };

    const btnBt = document.getElementById('btnBt');
    if(btnBt) btnBt.onclick=async ()=>{
      if(state.ble.connected) await bleDisconnect(); else await bleConnect();
    };

    document.getElementById('btnClearLog').onclick=()=>{
      state.usb.lastLines=[]; state.ble.lastLines=[]; saveState();
      const el=document.getElementById('runLog'); if(el) el.textContent='';
      toast('Log','Geleert.','ok');
    };

    const toggleLogPane = ()=>{
      ui.logCollapsed = !ui.logCollapsed;
      applyLogUi();
    };
    document.getElementById('btnToggleLog').onclick=toggleLogPane;
    const btnToggleLogDock = document.getElementById('btnToggleLogDock');
    if(btnToggleLogDock) btnToggleLogDock.onclick = toggleLogPane;
    const btnPresenter = document.getElementById('btnPresenter');
    if(btnPresenter) btnPresenter.onclick = ()=>openPresenterWindow();

    wireLogResizer();
  
}

  // --------------------- Render all ---------------------
  function renderAll(){
    bindShared();
    ensureAutoEntities(state);
    const safeRender = (name, fn)=>{
      try{
        fn();
      }catch(err){
        logLine('Render Fehler [' + name + ']: ' + String(err?.message || err || 'Unbekannter Fehler'));
        try{ console.error('Render Fehler [' + name + ']', err); }catch{}
      }
    };
    safeRender('Header', renderHeader);
    renderGlobalProjectDataWarning();
    safeRender('TopMenu', renderTopMenu);
    safeRender('ActivePage', showActivePage);
    safeRender('SessionControl', renderSessionControl);
    try{ sendPresenterSnapshot(true); }catch{}
    safeRender('Dashboard', renderDashboard);
    safeRender('Einzellaeufe', renderEinzellaeufe);
    safeRender('Teamrennen', renderTeamrennen);
    safeRender('Dauerschleife', renderDauerschleife);
    safeRender('Langstrecke', renderLangstrecke);
    safeRender('Stammdaten', renderStammdaten);
    safeRender('Strecken', renderStrecken);
    safeRender('Renntag', renderRenntag);
    safeRender('RenntagAuswertung', renderRenntagAuswertung);
    safeRender('Saison', renderSaison);
    safeRender('SaisonAuswertung', renderSaisonAuswertung);
    safeRender('OBS', renderOBS);
    safeRender('Audio', renderAudio);
    safeRender('Einstellungen', renderEinstellungen);
    sanitizeVisibleText(document.body);

    const logEl=document.getElementById('runLog');
    if(logEl) logEl.textContent = [...(state.ble.lastLines||[]), ...(state.usb.lastLines||[])].slice(0,500).join('\n');
    applyLogUi();
  }

  // voices update
  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged = ()=>{ if(state.ui.activeTab==='Audio') renderAudio(); };
    // Renntag: Session lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶schen (delegated, robust gegen Re-Renders)
    document.addEventListener('click', (ev)=>{
      const t = ev.target;
      if(!t || !t.id) return;
      if(t.id==='raceDelete'){
        try{
          const rd = getActiveRaceDay();
          const selectedRaceId = state.ui.selectedRaceId || '';
          if(!rd || !selectedRaceId){
          toast('Renntag','Bitte zuerst eine Session auswaehlen.','warn');
            return;
          }
          rd.races = (rd.races||[]).filter(r=>r.id!==selectedRaceId);
          state.session.laps = state.session.laps.filter(l=>l.raceId!==selectedRaceId);
          state.ui.selectedRaceId = '';
          state.ui.selectedDriverId = '';
          saveState();
          toast('Renntag','Session geloescht.','ok');
          renderRenntag(); renderDashboard();
        }catch(e){
          toast('Renntag','Fehler beim Loeschen.','err');
          logLine('Renntag delete error: '+(e?.message||e));
        }
      }
      if(t.id==='raceDeleteAll'){
        try{
          const rd = getActiveRaceDay();
          if(!rd){
            toast('Renntag','Kein Renntag aktiv.','warn');
            return;
          }
          const ids = new Set((rd.races||[]).map(r=>r.id));
          rd.races = [];
          state.session.laps = state.session.laps.filter(l=>!ids.has(l.raceId));
          state.ui.selectedRaceId = '';
          state.ui.selectedDriverId = '';
          saveState();
          toast('Renntag','Alle Sessions geloescht.','ok');
          renderRenntag(); renderDashboard();
        }catch(e){
          toast('Renntag','Fehler beim Loeschen.','err');
          logLine('Renntag delete all error: '+(e?.message||e));
        }
      }
    }, true);
    // raceDelete delegated

    // Legacy Import/Export path intentionally disabled; handled in renderEinstellungen.
    if(false) document.addEventListener('click', async (ev)=>{
      const t = ev.target;
      if(!t || !t.id) return;
      // handled directly in renderEinstellungen / wire to avoid duplicate exports/imports
      return;

      if(t.id==='btnExportMaster'){
        try{ exportStammdaten(); }catch(e){ toast('Export','Fehler.','err'); logLine('Export error: '+(e?.message||e)); }
      }
      if(t.id==='btnExportAll'){
        try{ exportAll(); }catch(e){ toast('Export','Fehler.','err'); logLine('Export error: '+(e?.message||e)); }
      }
      if(t.id==='btnImportMaster'){
        try{
          const file = document.getElementById('importFile')?.files?.[0];
        if(!file){ toast('Import','Bitte Datei auswaehlen.','warn'); return; }
          const txt = await file.text();
          const obj = JSON.parse(txt);
          const allowDup = !!document.getElementById('importAllowDupNames')?.checked;
          importStammdatenFromJson(obj, allowDup);
        }catch(e){
          toast('Import','Konnte Datei nicht importieren.','err');
          logLine('Import error: '+(e?.message||e));
        }
      }
    }, true);
    // Import/Export delegated

  }

  function syncSharedContext(){
    bindShared();
    window.TIMTIME_SHARED = Object.assign(
      window.TIMTIME_SHARED || {},
      window.TIMTIME_UTILS || {},
      window.TIMTIME_DASHBOARD || {},
      window.TIMTIME_PRESENTER || {},
      window.TIMTIME_DISCORD || {},
      window.TIMTIME_STATE || {},
      window.TIMTIME_RESULTS || {},
      window.TIMTIME_PAGES || {},
      window.TIMTIME_AUDIO || {},
      window.TIMTIME_DOM || {},
      window.TIMTIME_SESSION || {},
      window.TIMTIME_READER || {},
      window.TIMTIME_CHAMPIONSHIP || {},
      window.TIMTIME_TRANSPORT || {},
      window.TIMTIME_CORE || {},
      window.TIMTIME_ENTITIES || {},
      window.TIMTIME_RUNTIME || {},
      window.TIMTIME_LOCALE || {},
      {
      BUILD,
      state,
      now,
      uid,
      clamp,
      clampInt,
      esc,
      msToTime,
      t,
      getUiLanguage,
      getUiLocale,
      toast,
      logLine,
      saveState,
      renderAll,
      renderDashboard,
      renderAudio,
      getModeLabel,
      getActiveTrack,
      getTrackRecord,
      getRaceDayTrackRecord,
      getActiveRaceDay,
      getActiveSeason,
      getEnduranceStatusRows,
      formatTrackDisplayName,
      getDriver,
      getCar,
      getCarsByDriver,
      getDriverSpeakName,
      getDriverAvatarDataUrl,
      initials,
      queueSpeak,
      speak,
      raceShouldShowPodium,
      setDriverAvatar,
      removeDriverAvatar,
      openDriverEditor,
      openCarEditor,
      getScaleDenominator,
      getTrackLengthMeters,
      getTrackPlainName,
      getTrackById,
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
      buildSeasonWebhookMessage,
      sendRaceDayWebhook,
      sendSeasonWebhook,
      copyTextToClipboard,
      setDiscordPreviewText,
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
  }

  function sanitizeTransientReloadState(){
    bindShared();
    let changed = false;
    if(!state.ui) state.ui = { activeTab:'Dashboard' };
    if(!state.session) state.session = { state:'IDLE' };
    if(!state.loopRuntime) state.loopRuntime = {};

    const hadAmpelUi = !!state.ui.ampel?.visible;
    const hadLoopAmpel = String(state.loopRuntime.phase || '').toLowerCase() === 'ampel';
    if(hadAmpelUi || hadLoopAmpel){
      state.ui.ampel = Object.assign({}, state.ui.ampel || {}, {
        visible: false,
        step: 0,
        go: false,
        text: '-'
      });
      changed = true;
    }

    if(hadLoopAmpel){
      state.session.state = 'IDLE';
      state.session.startedAt = null;
      state.session.startedAtMrc = null;
      state.session.pausedAt = null;
      state.session.pausedAtMrc = null;
      state.session.pauseAccumMs = 0;
      state.session.pauseAccumMrcMs = 0;
      state.session.currentRaceId = null;
      state.session.isFreeDriving = false;
      state.session.lastPassByCarId = {};
      state.session.lastPassSeenByCarId = {};
      state.session.raceStartArmedByCarId = {};
      state.session.mrcCounterByChip = {};
      state.loopRuntime.phase = null;
      state.loopRuntime.phaseEndsAt = null;
      state.loopRuntime.remainingMs = null;
      state.loopRuntime.phaseStartedAt = null;
      state.loopRuntime.phaseTotalSec = null;
      if(state.ui) state.ui.freeDrivingEnabled = false;
      changed = true;
    }

    if(changed){
      try{ saveState(); }catch{}
    }
  }


  async function initApp(){
    bindShared();
    applyLogUi();
    state.ble.available = ('bluetooth' in navigator);
    setBleUi(false);
    window.addEventListener('resize', applyLogUi);
    await hydrateExternalAppData();
    sanitizeTransientReloadState();
    syncSharedContext();
      renderAll();
      wire();
      installUsbConnectDisconnectListeners();
      startTransportReconnectWatch();
      try{ await obsAutoConnectOnLoad(); }catch{}
      await usbProbeOnLoad();
      try{ await syncObsAutoScene(true); }catch{}
      try{ await syncObsTextSources(true); }catch{}
      ensureBuiltInDefaultDriverSound().then(()=>{ try{ renderAudio(); }catch{} });
    scheduleDiscordQueueProcessing(2000);
    requestAnimationFrame(tick);
    logLine('Zeitnahme 2.0 geladen (' + BUILD + ')');
    toast('Build', 'Geladen: ' + BUILD, 'ok');
    try{
      if(typeof getProjectDataStatus === 'function'){
        const dataStatus = await getProjectDataStatus();
        if(!dataStatus.supported){
          toast('Datenordner', 'Browser unterstuetzt keine feste Ordnerfreigabe.', 'warn');
        }else if(!dataStatus.configured){
          toast('Datenordner', 'Kein TimTime-Datenordner verbunden.', 'warn');
        }else if(!dataStatus.reachable){
          toast('Datenordner', 'TimTime-Datenordner aktuell nicht erreichbar.', 'warn');
        }
      }
    }catch{}
    await bleAutoReconnectOnLoad();
    await kickTransportAutoReconnect('init');
  }
  return {
    loadUi,
    saveUi,
    applyLogUi,
    wireLogResizer,
    renderTopMenu,
    showActivePage,
    renderHeader,
    getEnduranceStatusRows,
    renderEnduranceStatusHtml,
    renderDauerschleife,
    clampNum,
    computeTimerDisplay,
    tick,
    backgroundUiRefresh,
    wire,
    renderAll,
    syncSharedContext,
    initApp
  };
})();
