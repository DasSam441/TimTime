window.TIMTIME_PRESENTER = (function(){
  'use strict';
  function bindShared(){ Object.assign(globalThis, window.TIMTIME_SHARED || {}); }

  function openWindow(){
    const href = (()=>{ try{ return new URL('presenter.html', window.location.href).href; }catch{ return 'presenter.html'; } })();
    const isFile = (()=>{ try{ return window.location?.protocol === 'file:'; }catch{ return false; } })();
    const targetName = isFile ? `zeitnahme_presenter_${Date.now()}` : 'zeitnahme_presenter';
    return window.open(href, targetName, 'width=1200,height=800');
  }

function openPresenterWindow(){
    bindShared();
    try{
      presenterWin = window.TIMTIME_PRESENTER?.openWindow ? window.TIMTIME_PRESENTER.openWindow() : openWindow();
      if(!presenterWin){
        toast('Presenter','Popup blockiert – bitte Popups für diese Seite erlauben.','warn');
      } else {
        toast('Presenter','Fenster geöffnet (2. Monitor).','ok');
        sendPresenterSnapshot(true);
      }
    }catch(e){
      toast('Presenter','Konnte Fenster nicht öffnen.','err');
    }
  }



  function postSnapshot(targetWindow, payload, targetOrigin='*'){
    try{
      targetWindow?.postMessage({ type:'snapshot', payload }, targetOrigin);
      return true;
    }catch{
      return false;
    }
  }

  function postReady(targetWindow, targetOrigin='*'){
    try{
      targetWindow?.postMessage({ type:'presenter-ready' }, targetOrigin);
      return true;
    }catch{
      return false;
    }
  }

  function sendPresenterSnapshot(force=false){
    bindShared();
    const computePreciseTimerText = ()=>{
      try{
        const time0 = (ms)=> (typeof msToTime === 'function' ? msToTime(ms, 0) : String(ms || 0));
        const activeMode = String(state?.modes?.activeMode || '');
        const finish = state?.session?.finish || null;
        if(activeMode === 'loop' && state?.loopRuntime?.phase){
          const phase = String(state.loopRuntime.phase || '').toLowerCase();
          if(phase === 'race'){
            const limitMs = Math.max(0.01, Number(state?.modes?.loop?.raceMin || 0)) * 60000;
            if(finish?.pending && finish.type === 'time'){
              const base = (finish.firstFinishTs && finish.firstFinishTs > 0) ? finish.firstFinishTs : (typeof getTimelineNowMs === 'function' ? getTimelineNowMs() : 0);
              const nowMs = (typeof getTimelineNowMs === 'function' ? getTimelineNowMs() : base);
              return `UEBERZEIT + ${time0(Math.max(0, nowMs - base))}`.trim();
            }
            const phaseStart = Number(state?.loopRuntime?.phaseStartedAt || (typeof getTimelineNowMs === 'function' ? getTimelineNowMs() : 0));
            const nowMs = (typeof getTimelineNowMs === 'function' ? getTimelineNowMs() : phaseStart);
            return time0(Math.max(0, limitMs - Math.max(0, nowMs - phaseStart)));
          }
          const phaseEnd = Number(state?.loopRuntime?.phaseEndsAt || 0);
          const nowMs = (typeof getTimelineNowMs === 'function' ? getTimelineNowMs() : 0);
          if(phaseEnd > 0) return time0(Math.max(0, phaseEnd - nowMs));
        }
        if(!isFreeDrivingMode?.() && activeMode === 'single' && String(state?.modes?.single?.finishMode || 'none') === 'time'){
          const limitMs = Math.max(1, Number(state?.modes?.single?.timeLimitSec || 180)) * 1000;
          if(finish?.pending && finish.type === 'time'){
            const base = (finish.firstFinishTs && finish.firstFinishTs > 0) ? finish.firstFinishTs : (typeof getTimelineNowMs === 'function' ? getTimelineNowMs() : 0);
            const nowMs = (typeof getTimelineNowMs === 'function' ? getTimelineNowMs() : base);
            return `UEBERZEIT + ${time0(Math.max(0, nowMs - base))}`.trim();
          }
          return time0(Math.max(0, limitMs - (typeof sessionElapsedMs === 'function' ? sessionElapsedMs() : 0)));
        }
        if(activeMode === 'team' && String(state?.modes?.team?.finishMode || 'none') === 'time'){
          const limitMs = Math.max(1, Number(state?.modes?.team?.timeLimitSec || 180)) * 1000;
          if(finish?.pending && finish.type === 'time'){
            const base = (finish.firstFinishTs && finish.firstFinishTs > 0) ? finish.firstFinishTs : (typeof getTimelineNowMs === 'function' ? getTimelineNowMs() : 0);
            const nowMs = (typeof getTimelineNowMs === 'function' ? getTimelineNowMs() : base);
            return `UEBERZEIT + ${time0(Math.max(0, nowMs - base))}`.trim();
          }
          return time0(Math.max(0, limitMs - (typeof sessionElapsedMs === 'function' ? sessionElapsedMs() : 0)));
        }
        if(activeMode === 'endurance'){
          const liveRace = state?.session?.currentRaceId ? (getActiveRaceDay?.()?.races?.find(r=>r.id===state.session.currentRaceId) || null) : null;
          const limitMs = Math.max(1, Number(liveRace?.enduranceDurationMin || state?.modes?.endurance?.durationMin || 30)) * 60000;
          if(finish?.pending && finish.type === 'time'){
            const base = (finish.firstFinishTs && finish.firstFinishTs > 0) ? finish.firstFinishTs : (typeof getTimelineNowMs === 'function' ? getTimelineNowMs() : 0);
            const nowMs = (typeof getTimelineNowMs === 'function' ? getTimelineNowMs() : base);
            return `UEBERZEIT + ${time0(Math.max(0, nowMs - base))}`.trim();
          }
          if(state?.session?.state === 'RUNNING'){
            return time0(Math.max(0, limitMs - (typeof sessionElapsedMs === 'function' ? sessionElapsedMs() : 0)));
          }
        }
        if(typeof sessionElapsedMs === 'function'){
          return time0(sessionElapsedMs());
        }
      }catch{}
      return '';
    };
    const normalizePresenterTimer = (value)=>{
      const raw = String(value || '').trim();
      if(!raw) return '';
      const over = raw.match(/^([^0-9]*)(\d+:\d{2})(?:[.,](\d+))?/);
      if(over){
        const prefix = (over[1] || '').trim();
        const base = over[2];
        return `${prefix ? prefix + ' ' : ''}${base}`.trim();
      }
      const plain = raw.match(/^(\d+:\d{2})(?:[.,](\d+))?/);
      if(plain){
        return `${plain[1]}`;
      }
      return raw;
    };
    const resolveTimerText = ()=>{
      try{
        const precise = computePreciseTimerText();
        if(precise) return precise;
        const domText = String(document.getElementById('scTimer')?.textContent || '').trim();
        if(domText) return normalizePresenterTimer(domText);
        const raw = (typeof computeTimerDisplay === 'function') ? computeTimerDisplay() : '';
        if(raw && typeof raw === 'object') return normalizePresenterTimer(String(raw.text || raw.value || raw.label || ''));
        return normalizePresenterTimer(String(raw || ''));
      }catch{
        try{ return normalizePresenterTimer(String(document.getElementById('scTimer')?.textContent || '')); }catch{ return ''; }
      }
    };
    let payload;
    try{
      payload = buildPresenterSnapshot();
    }catch{
      payload = {
        modeLabel: getModeLabel ? getModeLabel() : '',
        inRace: !!state?.session?.currentRaceId,
        showPodium: false,
        timerText: resolveTimerText(),
        trackName: (typeof getTrackPlainName === 'function' && typeof getActiveTrack === 'function') ? getTrackPlainName(getActiveTrack()) : '',
        trackDetails: '',
        trackLengthMeters: 0,
        scaleDenominator: 0,
        recordSeason: '—',
        recordDay: '—',
        averageSpeedText: '—',
        enduranceRows: [],
        rows: [],
        top3: [],
        raceEndHighlights: null,
        isFreeDriving: !!state?.session?.isFreeDriving,
        lastLapTime: '—',
        lastLapName: '—',
        ampel: state?.ui?.ampel || null
      };
    }
    if(!payload || typeof payload !== 'object') payload = {};
    if(payload.timerText && typeof payload.timerText === 'object'){
      payload.timerText = String(payload.timerText.text || payload.timerText.value || payload.timerText.label || '');
    }
    payload.timerText = resolveTimerText();
    const nowTs = now();
    const timerKey = String(payload.timerText || '');
    const ampelKey = JSON.stringify(payload.ampel || null);
    const corePayload = {
      ...payload,
      timerText: '',
      ampel: null
    };
    const coreSig = JSON.stringify(corePayload);
    const minGap = (payload.ampel && payload.ampel.visible) ? 120 : 1000;

    if(!force){
      const sameCore = state.session._lastPresenterCoreSig === coreSig;
      const sameTimer = state.session._lastPresenterTimerKey === timerKey;
      const sameAmpel = state.session._lastPresenterAmpelKey === ampelKey;
      if(state.session._lastPresenterTs && (nowTs - state.session._lastPresenterTs) < minGap && sameCore && sameTimer && sameAmpel) return;
      if(sameCore && sameTimer && sameAmpel) return;
    }

    state.session._lastPresenterTs = nowTs;
    state.session._lastPresenterCoreSig = coreSig;
    state.session._lastPresenterTimerKey = timerKey;
    state.session._lastPresenterAmpelKey = ampelKey;

    const targetOrigin = (window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : '*';
    try{
      if(presenterWin && presenterWin.closed) presenterWin = null;
    }catch{}
    try{ localStorage.setItem(PRES_SNAPSHOT_KEY, JSON.stringify(payload)); }catch{}
    try{ presenterBc?.postMessage({type:'snapshot', payload}); }catch{}
    try{ presenterWin?.postMessage({type:'snapshot', payload}, targetOrigin); }catch{}
  }

  window.addEventListener('message', (e)=>{
    try{
      if(e?.data?.type !== 'presenter-ready') return;
      sendPresenterSnapshot(true);
    }catch{}
  });



  return { openWindow, openPresenterWindow, postSnapshot, postReady, sendPresenterSnapshot };
})();

