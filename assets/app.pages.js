window.TIMTIME_PAGES = (function(){
  function bindShared(){ Object.assign(globalThis, window.TIMTIME_SHARED || {}); }
  function renderEinzellaeufe(){
    bindShared();
    const el = document.getElementById('pageEinzellaeufe');
    const active = state.modes.activeMode==='single';
    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>${esc(t('single.title'))}</h2><span class="pill">${esc(active ? t('common.active') : t('common.inactive'))}</span></div>
          <div class="card-b">
            <div class="muted">${esc(t('single.hint'))}</div>
            <div class="hr"></div>
            <div class="field">
              <label>${esc(t('single.submode'))}</label>
              <select id="singleSub">
                ${[
                  { value:'Training', label:t('submode.training') },
                  { value:'Qualifying', label:t('submode.qualifying') },
                  { value:'Rennen', label:t('submode.race') }
                ].map(x=>`<option value="${esc(x.value)}" ${state.modes.singleSubmode===x.value?'selected':''}>${esc(x.label)}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>${esc(t('single.finish_after'))}</label>
              <select id="singleFinishMode">
                <option value="none" ${state.modes.single.finishMode==='none'?'selected':''}>${esc(t('single.limit_none'))}</option>
                <option value="time" ${state.modes.single.finishMode==='time'?'selected':''}>${esc(t('single.limit_time'))}</option>
                <option value="laps" ${state.modes.single.finishMode==='laps'?'selected':''}>${esc(t('single.limit_laps'))}</option>
              </select>
            </div>
            <div class="grid2" style="gap:12px;">
              <div class="field" id="singleTimeWrap">
                <label>${esc(t('single.time_minutes'))}</label>
                <input id="singleTimeMin" type="number" min="1" step="1" value="${Math.max(1, Math.round((state.modes.single.timeLimitSec||180)/60))}">
              </div>
              <div class="field" id="singleLapWrap">
                <label>${esc(t('single.laps'))}</label>
                <input id="singleLapCount" type="number" min="1" step="1" value="${Math.max(1, state.modes.single.lapLimit||20)}">
              </div>
            </div>
            <div class="row">
              <button class="btn btn-primary" id="btnActivateSingle">${esc(t('single.activate'))}</button>
            </div>
          </div>
        </div>
        <div class="card"><div class="card-h"><h2>${esc(t('single.info'))}</h2></div><div class="card-b"><div class="muted">${esc(t('single.info_body'))}</div></div></div>
      </div>
    `;
    el.querySelector('#singleSub').onchange=(e)=>{ state.modes.singleSubmode=e.target.value; saveState(); renderAll(); };
    const fm = el.querySelector('#singleFinishMode');
    const timeWrap = el.querySelector('#singleTimeWrap');
    const lapWrap = el.querySelector('#singleLapWrap');
    function syncSingleFinishUI(){
      const mode = state.modes.single.finishMode || 'none';
      if(timeWrap) timeWrap.style.display = (mode==='time') ? '' : 'none';
      if(lapWrap) lapWrap.style.display = (mode==='laps') ? '' : 'none';
    }
    if(fm){
      fm.onchange = (e)=>{ state.modes.single.finishMode = e.target.value; saveState(); syncSingleFinishUI(); };
    }
    const tmin = el.querySelector('#singleTimeMin');
    if(tmin){
      tmin.onchange = (e)=>{ const v = Math.max(1, parseInt(e.target.value||'0',10)||1); state.modes.single.timeLimitSec = v*60; saveState(); };
    }
    const lcnt = el.querySelector('#singleLapCount');
    if(lcnt){
      lcnt.onchange = (e)=>{ const v = Math.max(1, parseInt(e.target.value||'0',10)||1); state.modes.single.lapLimit = v; saveState(); };
    }
    syncSingleFinishUI();

    el.querySelector('#btnActivateSingle').onclick=()=>{
      state.ui.freeDrivingEnabled = false;
      state.session.isFreeDriving = false;
      state.modes.activeMode='single';
      saveState();
      logLine(t('single.log_activated', { submode:state.modes.singleSubmode }));
      toast('Modus', t('single.activated'),'ok');
      renderSessionControl(); renderAll();
    };
  }


  function renderTeamrennen(){
    bindShared();
    const el = document.getElementById('pageTeamrennen');
    const active = state.modes.activeMode==='team';
    const driversAll = state.masterData.drivers.slice();
    const q = (state.ui.teamAssignQuery||'').trim().toLowerCase();
    const teams = state.modes.team.teams || [];
    const assigned = new Set(teams.flatMap(t=>t.driverIds||[]));
    const drivers = driversAll
      .filter(d=>!assigned.has(d.id))
      .filter(d=>!q || String(d.name||'').toLowerCase().includes(q));

    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h">
            <h2>${esc(t('team.title'))}</h2>
            <span class="pill">${esc(active ? t('common.active') : t('common.inactive'))}</span>
          </div>
          <div class="card-b">
            <div class="row between">
              <div class="field" style="flex:1">
                <label>${esc(t('team.search_driver'))}</label>
                <input class="input" id="teamAssignQuery" placeholder="${esc(t('common.search_name_placeholder'))}" value="${esc(state.ui.teamAssignQuery||'')}"/>
              </div>
            </div>
            <div class="hr"></div>

            <div class="field">
              <label>${esc(t('team.finish'))}</label>
              <select id="teamFinishMode">
                <option value="time" ${state.modes.team.finishMode==='time'?'selected':''}>${esc(t('single.limit_time'))}</option>
                <option value="laps" ${state.modes.team.finishMode==='laps'?'selected':''}>${esc(t('single.limit_laps'))}</option>
                <option value="none" ${state.modes.team.finishMode==='none'?'selected':''}>${esc(t('team.finish_manual'))}</option>
              </select>
            </div>

            <div class="row" style="gap:10px; flex-wrap:wrap">
              <div class="field" style="flex:1; min-width:180px">
                <label>${esc(t('team.time_limit_min'))}</label>
                <input class="input" id="teamTimeLimitMin" type="number" min="1" step="1" value="${esc(Math.max(1, Math.round((state.modes.team.timeLimitSec||180)/60)))}"/>
              </div>
              <div class="field" style="flex:1; min-width:180px">
                <label>${esc(t('team.lap_limit'))}</label>
                <input class="input" id="teamLapLimit" type="number" min="1" step="1" value="${esc(state.modes.team.lapLimit||20)}"/>
              </div>
              <div class="field" style="flex:2; min-width:260px">
                <label>${esc(t('team.points_scheme'))}</label>
                <input class="input" id="teamPointsScheme" placeholder="${esc(t('team.points_placeholder'))}" value="${esc(state.modes.team.pointsScheme||'10,8,6,5,4,3,2,1')}"/>
                <div class="muted small">${esc(t('team.points_hint'))}</div>
              </div>
            </div>

            <div class="muted small">${esc(t('team.drag_hint'))}</div>
            <div id="teamPool" class="dnd-pool" aria-label="${esc(t('team.search_driver'))}"></div>
            <div class="hr"></div>
            <div class="row">
              <button class="btn" id="btnAddTeam">${esc(t('team.add'))}</button>
              <button class="btn btn-primary" id="btnActivateTeam">${esc(t('team.activate'))}</button>
              <button class="btn" id="btnDeactivateTeam">${esc(t('team.deactivate'))}</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-h">
            <h2>${esc(t('common.teams'))}</h2>
            <span class="pill">${teams.length} ${esc(t('common.teams'))}</span>
          </div>
          <div class="card-b">
            <div id="teamBoxes" class="team-boxes"></div>
            <div class="hr"></div>
            <div class="drop-unassigned" id="dropUnassigned">${esc(t('team.drop_remove'))}</div>
          </div>
        </div>
      </div>
    ` + `
      <div class="card" style="margin-top:12px">
        <div class="card-h"><h2>${esc(t('team.points_title'))}</h2></div>
        <div class="card-b">
          ${(()=>{
            const rid = state.session.currentRaceId || '';
            const race = getActiveRaceDay()?.races?.find(r=>r.id===rid && r.mode==='team') || null;
            const laps = race ? getRelevantRaceLaps(race.id, state.session.laps||[]) : [];
            const teamsLive = computeTeamPointsStandings(laps);
            const drvLive = computeDriverStandingsGlobal(laps);
            const ptsScheme = parsePointsScheme(state.modes.team.pointsScheme);
            return `
              <div class="muted">${esc(t('team.points_intro'))}</div>
              <div class="row wrap" style="gap:8px">${ptsScheme.map((p,idx)=>`<span class="badge">P${idx+1}: ${p}</span>`).join('')}</div>
              <table class="table">
                <thead><tr><th>#</th><th>${esc(t('common.team'))}</th><th>${esc(t('team.points'))}</th><th>${esc(t('team.members'))}</th></tr></thead>
                <tbody>
                  ${teamsLive.map((teamRow,idx)=>`<tr><td>${idx+1}</td><td>${esc(teamRow.name)}</td><td><b>${teamRow.points||0}</b></td><td>${esc(teamRow.members||'—')}</td></tr>`).join('') || `<tr><td colspan="4" class="muted">${esc(t('common.no_data'))}</td></tr>`}
                </tbody>
              </table>
              <div class="hr"></div>
              <table class="table">
                <thead><tr><th>#</th><th>${esc(t('team.driver'))}</th><th>${esc(t('common.team'))}</th><th>${esc(t('team.points'))}</th><th>${esc(t('single.laps'))}</th><th>${esc(t('team.time'))}</th></tr></thead>
                <tbody>
                  ${drvLive.map((d,idx)=>{
                    const teamRow = (state.modes.team.teams||[]).find(team=>(team.driverIds||[]).includes(d.id));
                    const pts = ptsScheme[idx] || 0;
                    return `<tr><td>${idx+1}</td><td>${esc(d.name||'—')}</td><td>${esc(teamRow?.name||'—')}</td><td>${pts}</td><td>${d.lapsCount||d.laps||0}</td><td class="mono">${d.totalMs!=null?esc(msToTime(d.totalMs,3)):'—'}</td></tr>`;
                  }).join('') || `<tr><td colspan="6" class="muted">${esc(t('common.no_data'))}</td></tr>`}
                </tbody>
              </table>
            `;
          })()}
        </div>
      </div>
`;

    // pool
    const pool = el.querySelector('#teamPool');
    pool.innerHTML = drivers.length ? drivers.map(d=>renderDriverChip(d,'pool')).join('') : `<div class="muted">${esc(t('common.no_free_drivers'))}</div>`;

    // teams
    const boxes = el.querySelector('#teamBoxes');
    boxes.innerHTML = teams.map((team, idx)=>{
      const members = (team.driverIds||[]).map(id=>state.masterData.drivers.find(d=>d.id===id)).filter(Boolean);
      return `
        <div class="team-box" data-team-id="${esc(team.id)}">
          <div class="team-box-h">
            <input class="input team-name" data-team-name="${esc(team.id)}" value="${esc(team.name||t('team.default_name', { n:idx+1 }))}" />
            <button class="icon-btn" title="${esc(t('team.delete_title'))}" data-del-team="${esc(team.id)}">🗑</button>
          </div>
          <div class="team-drop" data-drop-team="${esc(team.id)}">
            ${members.length ? members.map(d=>renderDriverChip(d,'team',team.id)).join('') : `<div class="muted small">${esc(t('team.drop_here'))}</div>`}
          </div>
        </div>
      `;
    }).join('');

    // bindings
    el.querySelector('#teamAssignQuery').addEventListener('change', (e)=>{
      state.ui.teamAssignQuery = e.target.value;
      saveState();
      renderTeamrennen();
    });

    el.querySelector('#btnAddTeam').addEventListener('click', ()=>{
      state.modes.team.teams.push({id:uid(), name:t('team.default_name', { n:state.modes.team.teams.length+1 }), driverIds:[]});
      saveState(); renderTeamrennen(); toast('Modus', t('team.added'),'ok');
    });

    el.querySelector('#btnActivateTeam').addEventListener('click', ()=>{
      state.ui.freeDrivingEnabled = false;
      state.session.isFreeDriving = false;
      state.modes.activeMode='team';
      saveState(); renderAll(); toast('Modus', t('team.activated'),'ok');
    });
    el.querySelector('#btnDeactivateTeam').addEventListener('click', ()=>{
      if(state.modes.activeMode==='team') state.modes.activeMode='none';
      saveState(); renderAll(); toast('Modus', t('team.deactivated'),'ok');
    });

    // team name edits + delete
    boxes.querySelectorAll('input[data-team-name]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const id = inp.getAttribute('data-team-name');
        const team = state.modes.team.teams.find(x=>x.id===id);
        if(team){ team.name = inp.value.trim()||team.name; saveState(); toast('Modus', t('team.name_saved'),'ok'); renderTeamrennen(); }
      });
    });
    boxes.querySelectorAll('[data-del-team]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-del-team');
        const team = state.modes.team.teams.find(x=>x.id===id);
        if(!team) return;
        if((team.driverIds||[]).length){ toast('Modus', t('team.not_empty'),'warn'); return; }
        state.modes.team.teams = state.modes.team.teams.filter(x=>x.id!==id);
        saveState(); renderTeamrennen(); toast('Modus', t('team.deleted'),'ok');
      });
    });

    // Drag & drop
    el.querySelectorAll('.driver-chip[draggable="true"]').forEach(ch=>{
      ch.addEventListener('dragstart', (ev)=>{
        ev.dataTransfer.setData('text/plain', ch.getAttribute('data-driver-id'));
        ev.dataTransfer.effectAllowed='move';
      });
    });

    boxes.querySelectorAll('[data-drop-team]').forEach(zone=>{
      zone.addEventListener('dragover', (ev)=>{ ev.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', ()=>zone.classList.remove('dragover'));
      zone.addEventListener('drop', (ev)=>{
        ev.preventDefault(); zone.classList.remove('dragover');
        const driverId = ev.dataTransfer.getData('text/plain');
        const teamId = zone.getAttribute('data-drop-team');
        assignDriverToTeam('team', driverId, teamId);
        renderTeamrennen();
      });
    });

    const un = el.querySelector('#dropUnassigned');
    un.addEventListener('dragover', (ev)=>{ ev.preventDefault(); un.classList.add('dragover'); });
    un.addEventListener('dragleave', ()=>un.classList.remove('dragover'));
    un.addEventListener('drop', (ev)=>{
      ev.preventDefault(); un.classList.remove('dragover');
      const driverId = ev.dataTransfer.getData('text/plain');
      unassignDriverFromTeams('team', driverId);
      renderTeamrennen();
    });

    // remove buttons on chips
    boxes.querySelectorAll('[data-remove-from-team]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const driverId = btn.getAttribute('data-remove-from-team');
        unassignDriverFromTeams('team', driverId);
        renderTeamrennen();
      });
    });
  }


  function renderLangstrecke(){
    bindShared();
    const el = document.getElementById('pageLangstrecke');
    const active = state.modes.activeMode==='endurance';
    const driversAll = state.masterData.drivers.slice();
    const q = (state.ui.endAssignQuery||'').trim().toLowerCase();
    if(!Array.isArray(state.modes.endurance.teams)) state.modes.endurance.teams=[];
    const teams = state.modes.endurance.teams;
    const assigned = new Set(teams.flatMap(t=>t.driverIds||[]));
    const drivers = driversAll
      .filter(d=>!assigned.has(d.id))
      .filter(d=>!q || String(d.name||'').toLowerCase().includes(q));

    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>${esc(t('endurance.title'))}</h2><span class="pill">${esc(active ? t('common.active') : t('common.inactive'))}</span></div>
          <div class="card-b">
            <div class="field">
              <label>${esc(t('endurance.duration_min'))}</label>
              <input class="input" id="endDur" type="number" min="1" step="1" value="${esc(state.modes.endurance.durationMin)}"/>
            </div>
            <div class="field">
              <label>${esc(t('endurance.min_stint'))}</label>
              <input class="input" id="endMinStintLaps" type="number" min="0" step="1" value="${esc(state.modes.endurance.minStintLaps||0)}"/>
            </div>
            <div class="field">
              <label>${esc(t('endurance.max_stint'))}</label>
              <input class="input" id="endMaxStintLaps" type="number" min="0" step="1" value="${esc(state.modes.endurance.maxStintLaps||0)}"/>
            </div>
            <div class="field">
              <label>${esc(t('endurance.penalty_seconds'))}</label>
              <input class="input" id="endPenaltySeconds" type="number" min="0" step="1" value="${esc(state.modes.endurance.penaltySecondsPerViolation||0)}"/>
            </div>
            <div class="field">
              <label>${esc(t('endurance.penalty_threshold'))}</label>
              <input class="input" id="endPenaltyLapThresholdSeconds" type="number" min="0" step="1" value="${esc(state.modes.endurance.penaltyLapThresholdSeconds||0)}"/>
            </div>
            <div class="field">
              <label>${esc(t('endurance.penalty_laps'))}</label>
              <input class="input" id="endPenaltyLapsPerThreshold" type="number" min="0" step="1" value="${esc(state.modes.endurance.penaltyLapsPerThreshold||0)}"/>
            </div>
            <div class="muted small">${esc(t('endurance.intro'))}</div>

            <div class="hr"></div>
            <div class="field">
              <label>${esc(t('endurance.search_driver'))}</label>
              <input class="input" id="endAssignQuery" placeholder="${esc(t('common.search_name_placeholder'))}" value="${esc(state.ui.endAssignQuery||'')}"/>
            </div>
            <div class="muted small">${esc(t('endurance.drag_hint'))}</div>
            <div id="endPool" class="dnd-pool"></div>

            <div class="hr"></div>
            <div class="row">
              <button class="btn" id="btnAddEndTeam">${esc(t('endurance.add'))}</button>
              <button class="btn btn-primary" id="btnActivateEnd">${esc(t('endurance.activate'))}</button>
              <button class="btn" id="btnDeactivateEnd">${esc(t('endurance.deactivate'))}</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h2>${esc(t('common.teams'))}</h2><span class="pill">${teams.length} ${esc(t('common.teams'))}</span></div>
          <div class="card-b">
            <div id="endTeamBoxes" class="team-boxes"></div>
            <div class="hr"></div>
            <div class="drop-unassigned" id="endDropUnassigned">${esc(t('endurance.drop_remove'))}</div>
          </div>
        </div>
      <div class="muted small" style="margin-top:12px">${esc(t('endurance.note_status'))}</div>
      </div>
    `;

    // bindings for duration/laps
    const saveEnduranceSettings = ()=>{
      const durNode = document.getElementById('endDur');
      const minNode = document.getElementById('endMinStintLaps');
      const maxNode = document.getElementById('endMaxStintLaps');
      const penaltyNode = document.getElementById('endPenaltySeconds');
      const thresholdNode = document.getElementById('endPenaltyLapThresholdSeconds');
      const lapsNode = document.getElementById('endPenaltyLapsPerThreshold');
      state.modes.endurance.durationMin = clampInt(Number(durNode?.value||0), 1, 24*60);
      state.modes.endurance.minStintLaps = clampInt(Number(minNode?.value||0), 0, 99999);
      state.modes.endurance.maxStintLaps = clampInt(Number(maxNode?.value||0), 0, 99999);
      state.modes.endurance.penaltySecondsPerViolation = clampInt(Number(penaltyNode?.value||0), 0, 99999);
      state.modes.endurance.penaltyLapThresholdSeconds = clampInt(Number(thresholdNode?.value||0), 0, 99999);
      state.modes.endurance.penaltyLapsPerThreshold = clampInt(Number(lapsNode?.value||0), 0, 99999);
      saveState();
      try{ renderSessionControl(); }catch(e){ console.warn('renderSessionControl failed after endurance settings save', e); }
      try{ renderDashboard(); }catch(e){ console.warn('renderDashboard failed after endurance settings save', e); }
    };
    ['#endDur','#endMinStintLaps','#endMaxStintLaps','#endPenaltySeconds','#endPenaltyLapThresholdSeconds','#endPenaltyLapsPerThreshold'].forEach(sel=>{
      const node = el.querySelector(sel);
      if(node) node.addEventListener('input', saveEnduranceSettings);
      if(node) node.addEventListener('change', ()=>{ saveEnduranceSettings(); toast('Modus', t('common.saved'),'ok'); });
    });

    el.querySelector('#endAssignQuery').addEventListener('change', (e)=>{
      state.ui.endAssignQuery = e.target.value;
      saveState();
      renderLangstrecke();
    });

    const pool = el.querySelector('#endPool');
    pool.innerHTML = drivers.length ? drivers.map(d=>renderDriverChip(d,'pool')).join('') : `<div class="muted">${esc(t('common.no_free_drivers'))}</div>`;

    const boxes = el.querySelector('#endTeamBoxes');
    boxes.innerHTML = teams.map((team, idx)=>{
      const members = (team.driverIds||[]).map(id=>state.masterData.drivers.find(d=>d.id===id)).filter(Boolean);
      return `
        <div class="team-box" data-team-id="${esc(team.id)}">
          <div class="team-box-h">
            <input class="input team-name" data-end-team-name="${esc(team.id)}" value="${esc(team.name||t('endurance.default_name', { n:idx+1 }))}" />
            <button class="icon-btn" title="${esc(t('endurance.delete_title'))}" data-end-del-team="${esc(team.id)}">🗑</button>
          </div>
          <div class="team-drop" data-end-drop-team="${esc(team.id)}">
            ${members.length ? members.map(d=>renderDriverChip(d,'team',team.id)).join('') : `<div class="muted small">${esc(t('endurance.drop_here'))}</div>`}
          </div>
        </div>
      `;
    }).join('');

    el.querySelector('#btnAddEndTeam').addEventListener('click', ()=>{
      state.modes.endurance.teams.push({id:uid(), name:t('endurance.default_name', { n:state.modes.endurance.teams.length+1 }), driverIds:[]});
      saveState(); renderLangstrecke(); toast('Modus', t('endurance.added'),'ok');
    });
    el.querySelector('#btnActivateEnd').addEventListener('click', ()=>{
      try{
        state.ui.freeDrivingEnabled = false;
        state.session.isFreeDriving = false;
        const durNode = document.getElementById('endDur');
        const minNode = document.getElementById('endMinStintLaps');
        const maxNode = document.getElementById('endMaxStintLaps');
        const penaltyNode = document.getElementById('endPenaltySeconds');
        const thresholdNode = document.getElementById('endPenaltyLapThresholdSeconds');
        const lapsNode = document.getElementById('endPenaltyLapsPerThreshold');
        state.modes.endurance.durationMin = clampInt(Number(durNode?.value||0), 1, 24*60);
        state.modes.endurance.minStintLaps = clampInt(Number(minNode?.value||0), 0, 99999);
        state.modes.endurance.maxStintLaps = clampInt(Number(maxNode?.value||0), 0, 99999);
        state.modes.endurance.penaltySecondsPerViolation = clampInt(Number(penaltyNode?.value||0), 0, 99999);
        state.modes.endurance.penaltyLapThresholdSeconds = clampInt(Number(thresholdNode?.value||0), 0, 99999);
        state.modes.endurance.penaltyLapsPerThreshold = clampInt(Number(lapsNode?.value||0), 0, 99999);
        state.modes.activeMode='endurance';
        saveState();
        logLine(t('endurance.log_activated', {
          duration:state.modes.endurance.durationMin,
          minStint:state.modes.endurance.minStintLaps,
          maxStint:state.modes.endurance.maxStintLaps||0,
          penalty:state.modes.endurance.penaltySecondsPerViolation||0,
          threshold:state.modes.endurance.penaltyLapThresholdSeconds||0,
          laps:state.modes.endurance.penaltyLapsPerThreshold||0
        }));
        renderAll();
        toast('Modus', t('endurance.activated'),'ok');
      }catch(e){
        console.error('btnActivateEnd failed', e);
        toast('Modus', t('endurance.activate_failed'),'err');
      }
    });
    el.querySelector('#btnDeactivateEnd').addEventListener('click', ()=>{
      if(state.modes.activeMode==='endurance') state.modes.activeMode='none';
      saveState(); renderAll(); toast('Modus', t('endurance.deactivated'),'ok');
    });

    boxes.querySelectorAll('input[data-end-team-name]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const id = inp.getAttribute('data-end-team-name');
        const team = state.modes.endurance.teams.find(x=>x.id===id);
        if(team){ team.name = inp.value.trim()||team.name; saveState(); toast('Modus', t('endurance.name_saved'),'ok'); renderLangstrecke(); }
      });
    });
    boxes.querySelectorAll('[data-end-del-team]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-end-del-team');
        const team = state.modes.endurance.teams.find(x=>x.id===id);
        if(!team) return;
        if((team.driverIds||[]).length){ toast('Modus', t('endurance.not_empty'),'warn'); return; }
        state.modes.endurance.teams = state.modes.endurance.teams.filter(x=>x.id!==id);
        saveState(); renderLangstrecke(); toast('Modus', t('endurance.deleted'),'ok');
      });
    });

    // Drag setup
    el.querySelectorAll('.driver-chip[draggable="true"]').forEach(ch=>{
      ch.addEventListener('dragstart', (ev)=>{
        ev.dataTransfer.setData('text/plain', ch.getAttribute('data-driver-id'));
        ev.dataTransfer.effectAllowed='move';
      });
    });

    boxes.querySelectorAll('[data-end-drop-team]').forEach(zone=>{
      zone.addEventListener('dragover', (ev)=>{ ev.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', ()=>zone.classList.remove('dragover'));
      zone.addEventListener('drop', (ev)=>{
        ev.preventDefault(); zone.classList.remove('dragover');
        const driverId = ev.dataTransfer.getData('text/plain');
        const teamId = zone.getAttribute('data-end-drop-team');
        assignDriverToTeam('endurance', driverId, teamId);
        renderLangstrecke();
      });
    });

    const un = el.querySelector('#endDropUnassigned');
    un.addEventListener('dragover', (ev)=>{ ev.preventDefault(); un.classList.add('dragover'); });
    un.addEventListener('dragleave', ()=>un.classList.remove('dragover'));
    un.addEventListener('drop', (ev)=>{
      ev.preventDefault(); un.classList.remove('dragover');
      const driverId = ev.dataTransfer.getData('text/plain');
      unassignDriverFromTeams('endurance', driverId);
      renderLangstrecke();
    });

    boxes.querySelectorAll('[data-remove-from-team]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const driverId = btn.getAttribute('data-remove-from-team');
        unassignDriverFromTeams('endurance', driverId);
        renderLangstrecke();
      });
    });
  }

  // -------- Stammdaten (Driver/Car) --------

  function renderStammdaten(){
    bindShared();
    const el = document.getElementById('pageStammdaten');
    const driversAll = state.masterData.drivers.slice();
    const carsAll = state.masterData.cars.slice();
    const qDrivers = (state.ui.stammdatenDriverQuery||'').trim().toLowerCase();
    const qCars = (state.ui.stammdatenCarQuery||'').trim().toLowerCase();

    const drivers = qDrivers ? driversAll.filter(d=>String(d.name||'').toLowerCase().includes(qDrivers)) : driversAll;
    const cars = carsAll;
    const unknown = cars.filter(c=>!c.driverId).filter(c=>{
      if(!qCars) return true;
      const name = String(c.name||'').toLowerCase();
      const chip = String(c.chipCode||'').toLowerCase();
      return name.includes(qCars) || chip.includes(qCars);
    });

    const selDriverId = state.ui.stammdatenSelectedDriverId || '';
    const selDriver = selDriverId ? getDriver(selDriverId) : null;
    const selDriverCars = selDriver ? cars.filter(c=>c.driverId===selDriver.id).filter(c=>{
      if(!qCars) return true;
      const name = String(c.name||'').toLowerCase();
      const chip = String(c.chipCode||'').toLowerCase();
      return name.includes(qCars) || chip.includes(qCars);
    }) : [];

    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>${esc(t('common.driver', null, 'Driver'))}</h2></div>
          <div class="card-b">
            <div class="row"><button class="btn btn-primary" id="btnAddDriver">${esc(t('masterdata.add_driver', null, '+ Driver'))}</button></div>
            <div class="hr"></div>
            <div class="field" style="margin:0;">
              <label class="muted small">${esc(t('masterdata.search_drivers', null, 'Search drivers'))}</label>
              <input class="input" id="drvSearch" placeholder="${esc(t('common.search_name_placeholder', null, 'Name...'))}" value="${esc(state.ui.stammdatenDriverQuery||'')}"/>
            </div>
            <div class="hr"></div>
            <div id="driverList"></div>
            <div class="hr"></div>
            <div id="driverEditor"><div class="muted small">${esc(t('masterdata.select_driver_to_edit', null, 'Select a driver to edit.'))}</div></div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h2>${esc(t('common.car', null, 'Car'))}</h2></div>
          <div class="card-b">
            <div class="row"><button class="btn btn-primary" id="btnAddCar">${esc(t('masterdata.add_car', null, '+ Car'))}</button></div>
            <div class="hr"></div>
            <div class="field" style="margin:0;">
              <label class="muted small">${esc(t('masterdata.search_cars', null, 'Search cars'))}</label>
              <input class="input" id="carSearch" placeholder="${esc(t('masterdata.search_cars_placeholder', null, 'Name or chip...'))}" value="${esc(state.ui.stammdatenCarQuery||'')}"/>
            </div>
            <div class="hr"></div>

            <div class="muted">${esc(t('masterdata.unknown_cars', null, 'Unknown cars (unassigned)'))}</div>
            <div id="unknownCars"></div>

            <div class="hr"></div>
            <div class="muted">${selDriver ? t('masterdata.cars_of_driver', { name: `<b>${esc(selDriver.name)}</b>` }, `Cars of <b>${esc(selDriver.name)}</b>`) : esc(t('masterdata.select_driver_for_cars', null, 'Select a driver on the left to view cars.'))}</div>
            <div id="carList"></div>

            <div class="hr"></div>
            <div id="carEditor"><div class="muted small">${esc(t('masterdata.select_car_to_edit', null, 'Select a car to edit/assign.'))}</div></div>
          </div>
        </div>
      </div>
    `;

    const driverList = el.querySelector('#driverList');
    driverList.innerHTML = drivers.length ? drivers.map(d=>{
      const nCars = getCarsForDriver(d.id).length;
      const isSel = (selDriver && selDriver.id===d.id);
      return `
        <div class="row wrap" style="justify-content:space-between; margin:8px 0; padding:8px; border-radius:12px; ${isSel?'background:rgba(56,189,248,.10); outline:1px solid rgba(56,189,248,.25);':''}">
          <div>
            <div style="font-weight:850">${esc(d.name)}</div>
            <div class="muted small">${nCars} ${esc(t('masterdata.cars_label', null, 'cars'))}</div>
          </div>
          <div class="row">
            <button class="btn smallbtn" data-edit-driver="${esc(d.id)}">${esc(t('common.select', null, 'Select'))}</button>
          </div>
        </div>
      `;
    }).join('') : `<div class="muted">${esc(driversAll.length ? t('common.no_matches', null, 'No matches.') : t('masterdata.no_drivers', null, 'No drivers yet.'))}</div>`;

    const unknownEl = el.querySelector('#unknownCars');
    unknownEl.innerHTML = unknown.length ? unknown.map(c=>`
      <div class="row wrap" style="justify-content:space-between; margin:8px 0;">
        <div>
          <div style="font-weight:850">${esc(c.name)}</div>
          <div class="muted small mono">${esc(c.chipCode || '')}</div>
        </div>
        <button class="btn smallbtn" data-edit-car="${esc(c.id)}">${esc(t('masterdata.assign', null, 'Assign'))}</button>
      </div>
    `).join('') : `<div class="muted small">${esc((carsAll.filter(c=>!c.driverId).length && qCars) ? t('common.no_matches', null, 'No matches.') : t('masterdata.no_unknown_cars', null, 'No unknown cars.'))}</div>`;

    const carList = el.querySelector('#carList');
    if(selDriver){
      carList.innerHTML = selDriverCars.length ? selDriverCars.map(c=>`
        <div class="row wrap" style="justify-content:space-between; margin:8px 0;">
          <div>
            <div style="font-weight:850">${esc(c.name)}</div>
            <div class="muted small"><span class="mono">${esc(c.chipCode||'')}</span></div>
          </div>
          <button class="btn smallbtn" data-edit-car="${esc(c.id)}">${esc(t('common.edit', null, 'Edit'))}</button>
        </div>
      `).join('') : `<div class="muted small">${esc((carsAll.filter(c=>c.driverId===selDriver.id).length && qCars) ? t('common.no_matches', null, 'No matches.') : t('masterdata.driver_has_no_cars', null, 'This driver has no cars yet.'))}</div>`;
    } else {
      carList.innerHTML = `<div class="muted small">${esc(t('masterdata.select_driver_to_view_cars', null, 'Select a driver on the left to see cars here.'))}</div>`;
    }
    const driverEditor = el.querySelector('#driverEditor');
    if(selDriver){
      const avatar = getDriverAvatarDataUrl(selDriver.id);
      const ini = initials(selDriver.name);
      driverEditor.innerHTML = `
        <div class="row between">
          <div class="row" style="gap:12px">
            <div class="avatar-lg">${avatar?'<img src="'+avatar+'" alt=""/>' : '<span>'+esc(ini)+'</span>'}</div>
            <div>
              <div class="muted small">${esc(t('common.driver', null, 'Driver'))}</div>
              <div style="font-weight:800;font-size:18px">${esc(selDriver.name)}</div>
            </div>
          </div>
          <div class="row">
            <input type="file" id="driverAvatarFile" accept="image/*" style="display:none"/>
            <button class="btn" id="btnDriverAvatar">${esc(t('driver.upload_image', null, 'Upload image'))}</button>
            <button class="btn" id="btnDriverAvatarDel">${esc(t('driver.remove_image', null, 'Remove'))}</button>
          </div>
        </div>
        <div class="muted small">${esc(t('driver.avatar_tip', null, 'Tip: If iPhone HEIC fails, save the image as JPG/WebP first.'))}</div>
      `;
      const fileInput = driverEditor.querySelector('#driverAvatarFile');
      driverEditor.querySelector('#btnDriverAvatar').addEventListener('click', ()=>fileInput.click());
      fileInput.addEventListener('change', async ()=>{
        const f = fileInput.files && fileInput.files[0];
        if(f) await setDriverAvatar(selDriver.id, f);
        fileInput.value='';
      });
      driverEditor.querySelector('#btnDriverAvatarDel').addEventListener('click', ()=>removeDriverAvatar(selDriver.id));
    }else{
      driverEditor.innerHTML = `<div class="muted small">${esc(t('masterdata.select_driver_to_edit_profile', null, 'Select a driver on the left to edit image/name.'))}</div>`;
    }


    // Search bindings
    el.querySelector('#drvSearch').onchange = (e)=>{
      state.ui.stammdatenDriverQuery = e.target.value;
      saveState();
      renderStammdaten();
    };
    el.querySelector('#carSearch').onchange = (e)=>{
      state.ui.stammdatenCarQuery = e.target.value;
      saveState();
      renderStammdaten();
    };

    el.querySelector('#btnAddDriver').onclick=()=>{
      state.masterData.drivers.push({ id:uid('drv'), name:'Neuer Fahrer', photoDataUrl:'' });
      saveState(); toast('Stammdaten','Fahrer angelegt.','ok'); renderAll();
    };
    el.querySelector('#btnAddCar').onclick=()=>{
      state.masterData.cars.push({ id:uid('car'), name:'Neues Auto', chipCode:'', driverId:'' });
      saveState(); toast('Stammdaten','Auto angelegt.','ok'); renderAll();
    };

    el.querySelectorAll('[data-edit-driver]').forEach(btn => btn.onclick=()=>{
      state.ui.stammdatenSelectedDriverId = btn.getAttribute('data-edit-driver') || '';
      saveState();
      renderAll();
    });
    el.querySelectorAll('[data-edit-car]').forEach(btn => btn.onclick=()=> openCarEditor(btn.getAttribute('data-edit-car')) );

    // Re-open editor after re-render
    if(selDriver && getDriver(selDriver.id)){
      openDriverEditor(selDriver.id);
    }
  }


  function renderStrecken(){
    bindShared();
    const el = document.getElementById('pageStrecken');
    const tracks = state.tracks.tracks;
    const activeId = state.tracks.activeTrackId;
    const active = getActiveTrack();
    const rec = getTrackRecord(active);
    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>${esc(t('tracks.title', null, 'Tracks'))}</h2></div>
          <div class="card-b">
            <div class="field">
              <label>${esc(t('tracks.active', null, 'Active track'))}</label>
              <select id="trackSel">
                ${tracks.map(t=>`<option value="${esc(t.id)}" ${t.id===activeId?'selected':''}>${esc(formatTrackDisplayName(t))}</option>`).join('')}
              </select>
            </div>
            <div class="row">
              <button class="btn btn-primary" id="trackAdd">${esc(t('tracks.add', null, '+ Track'))}</button>
              <button class="btn btn-danger" id="trackDel">${esc(t('tracks.delete', null, 'Delete track'))}</button>
            </div>
            <div class="hr"></div>

            <div class="field">
              <label>${esc(t('common.name', null, 'Name'))}</label>
              <input class="input" id="trackName" value="${esc(active?.name||'')}"/>
            </div>
            <div class="field">
              <label>${esc(t('tracks.min_lap_ms', null, 'Minimum lap time (ms)'))}</label>
              <input class="input" id="trackMin" type="number" min="0" step="1" value="${esc(active?.minLapMs||0)}"/>
            </div>

            <div class="hr"></div>

            <div class="field">
              <label>${esc(t('tracks.mode', null, 'Mode'))}</label>
              <select id="setupMode">
                ${['Simulation','Schnell'].map(x=>`<option ${active?.setup?.mode===x?'selected':''}>${x}</option>`).join('')}
              </select>
            </div>

            <div class="field">
              <label>${esc(t('tracks.tire_wear', null, 'Tire wear'))}</label>
              <select id="setupTire">
                ${['Aus','Normal','Realistisch'].map(x=>`<option ${active?.setup?.tireWear===x?'selected':''}>${x}</option>`).join('')}
              </select>
            </div>

            <div class="field">
              <label>${esc(t('tracks.boost', null, 'Boost'))}</label>
              <select id="setupBoost">
                <option value="false" ${active?.setup?.boost?'' :'selected'}>${esc(t('common.no', null, 'No'))}</option>
                <option value="true" ${active?.setup?.boost?'selected':''}>${esc(t('common.yes', null, 'Yes'))}</option>
              </select>
            </div>

            <div class="field">
              <label>${esc(t('tracks.length_meters', null, 'Length (meters)'))}</label>
              <input class="input" id="trackLength" type="number" min="0" step="0.01" placeholder="z.B. 12.5" value="${esc(getTrackLengthMeters(active)||0)}"/>
            </div>

            <div class="muted small">${esc(t('tracks.display_hint', null, 'Display format: Name M:Mode, R:Tires, B:Yes/Off, L:123m'))}</div>
            <div class="row"><button class="btn btn-primary" id="trackSave">${esc(t('common.save', null, 'Save'))}</button></div>
          </div>
        </div>

      </div>
    `;
    el.querySelector('#trackSel').onchange=(e)=>{ state.tracks.activeTrackId=e.target.value; saveState(); renderAll(); };
    el.querySelector('#trackAdd').onclick=()=>{
      const id=uid('track');
      state.tracks.tracks.push({ id, name:'Neue Strecke', minLapMs:3000, displayLengthMeters:0, lengthMeters:0, trackLengthMeters:0, setup:{mode:'Schnell', tireWear:'Aus', boost:false}, record:{ms:null,driverName:'',carName:''} });
      state.tracks.activeTrackId=id;
      saveState(); toast('Strecken','Neue Strecke angelegt.','ok'); renderAll();
    };
    el.querySelector('#trackDel').onclick=()=>{
      if(state.tracks.tracks.length<=1){ toast('Strecken','Mindestens 1 Strecke muss bleiben.','warn'); return; }
      const delId=state.tracks.activeTrackId;
      state.tracks.tracks = state.tracks.tracks.filter(t=>t.id!==delId);
      state.tracks.activeTrackId = state.tracks.tracks[0].id;
      saveState(); toast('Strecken','Strecke geloescht.','ok'); renderAll();
    };
    el.querySelector('#trackSave').onclick=()=>{
      const t=getActiveTrack(); if(!t) return;
      t.name = el.querySelector('#trackName').value.trim() || t.name;
      t.minLapMs = Math.max(0, parseInt(el.querySelector('#trackMin').value,10)||0);
      t.setup.mode = el.querySelector('#setupMode').value;
      t.setup.tireWear = el.querySelector('#setupTire').value;
      t.setup.boost = (el.querySelector('#setupBoost').value==='true');
      t.displayLengthMeters = Math.max(0, parseFloat(el.querySelector('#trackLength').value||0) || 0);
      saveState(); toast('Strecken','Gespeichert.','ok'); logLine('Strecke gespeichert: '+formatTrackDisplayName(t));
      renderAll();
    };
  }

  // -------- Renntag --------
  
  // -------- Ergebnis / Podium (global, fuer Renntag & Dashboard) --------

function renderRenntag(){
    bindShared();
    const el = document.getElementById('pageRenntag');
    const rd = getActiveRaceDay();
    if(!rd){ el.innerHTML=`<div class="card"><div class="card-b">${esc(t('renntag.none'))}</div></div>`; return; }

    const races = rd.races.slice().sort((a,b)=>(b.startedAt||0)-(a.startedAt||0));
    const selectedRaceId = state.ui.selectedRaceId || (races[0]?.id || '');
    if(selectedRaceId && state.ui.selectedRaceId !== selectedRaceId){
      state.ui.selectedRaceId = selectedRaceId; saveState();
    }
    const race = races.find(r=>r.id===selectedRaceId) || null;
    const raceLaps = race ? state.session.laps.filter(l=>l.raceId===race.id) : [];
    const driverIds = Array.from(new Set(raceLaps.map(l=>l.driverId).filter(Boolean)));
    const carsIds = Array.from(new Set(raceLaps.map(l=>l.carId).filter(Boolean)));

    el.innerHTML = `
      <div class="card">
        <div class="card-h"><h2>${t('renntag.title')}</h2></div>
        <div class="card-b">
          <div class="muted">${t('renntag.intro')}</div>
          <div class="hr"></div>

          <div class="field">
            <label>${t('renntag.select_day')}</label>
            <select id="raceDaySel">
              ${state.raceDay.raceDays.slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).map(d=>`<option value="${esc(d.id)}" ${d.id===state.raceDay.activeRaceDayId?'selected':''}>${esc(d.name)}</option>`).join('')}
            </select>
          </div>

          <div class="row">
            <button class="btn" id="raceDayNew">${t('renntag.new_day')}</button>
          </div>

          <div class="hr"></div>

          <div class="field">
            <label>${t('renntag.select_session')}</label>
            <select id="raceSel">
              ${races.map(r=>`<option value="${esc(r.id)}" ${r.id===selectedRaceId?'selected':''}>${esc(r.name)}</option>`).join('') || `<option value="">${esc(t('renntag.no_sessions'))}</option>`}
            </select>
          </div>

          <div class="row" style="gap:10px; flex-wrap:wrap">
            <button class="btn" id="raceDelete">🗑 ${t('renntag.delete_session')}</button>
            <button class="btn" id="raceDeleteAll">🗑 ${t('renntag.delete_all_sessions')}</button>
          </div>

          <div class="hr"></div>
          <div class="row wrap">
            <span class="badge">${t('renntag.badge_laps', { count:raceLaps.length })}</span>
            <span class="badge">${t('renntag.badge_drivers', { count:driverIds.length })}</span>
            <span class="badge">${t('renntag.badge_cars', { count:carsIds.length })}</span>
          </div>
          <div class="hr"></div>
          <div class="card">
            <div class="card-h"><h3>${t('renntag.preview_title')}</h3></div>
            <div class="card-b">
              <div class="discord-preview-grid">
                <div class="discord-preview-pane">
                  <div class="muted small" style="margin-bottom:8px">${t('preview.text')}</div>
                  <pre class="discord-preview-text" id="raceDayMainPreviewText">${t('preview.loading')}</pre>
                </div>
                <div class="discord-preview-pane">
                  <div class="muted small" style="margin-bottom:8px">${t('preview.image')}</div>
                  <div class="discord-preview-imagebox" id="raceDayMainPreviewImage"><div class="muted small">${t('preview.loading_image')}</div></div>
                </div>
              </div>
              <div class="row wrap" style="gap:10px; margin-top:12px">
                <button class="btn" id="btnRaceDayMainForumCopy" type="button">${t('renntag.copy_forum')}</button>
                <button class="btn" id="btnRaceDayMainWebhook" type="button">${t('renntag.send')}</button>
              </div>
            </div>
          </div>
          <div class="hr"></div>
          <div class="card">
            <div class="card-h"><h3>${t('session.preview_title')}</h3></div>
            <div class="card-b">
              <div class="discord-preview-grid">
                <div class="discord-preview-pane">
                  <div class="muted small" style="margin-bottom:8px">${t('preview.text')}</div>
                  <pre class="discord-preview-text" id="sessionMainPreviewText">${race ? t('preview.loading') : t('preview.no_session')}</pre>
                </div>
                <div class="discord-preview-pane">
                  <div class="muted small" style="margin-bottom:8px">${t('preview.image')}</div>
                  <div class="discord-preview-imagebox" id="sessionMainPreviewImage"><div class="muted small">${race ? t('preview.loading_image') : t('preview.no_session')}</div></div>
                </div>
              </div>
              <div class="row wrap" style="gap:10px; margin-top:12px">
                <button class="btn" id="btnSessionMainWebhook" type="button" ${race?'':'disabled'}>${t('session.send')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const rds = el.querySelector('#raceDaySel');
    if(rds) rds.onchange = (e)=>{ state.raceDay.activeRaceDayId = e.target.value; state.ui.selectedRaceId=''; state.ui.selectedRaceDriverId=''; saveState(); renderRenntag(); };
    const btnNewRd = el.querySelector('#raceDayNew');
    if(btnNewRd) btnNewRd.onclick = ()=>{
      const id = uid('raceday');
      const name = (getUiLanguage()==='en' ? 'Race Day ' : 'Renntag ') + new Date().toLocaleDateString(getUiLocale()) + ' • ' + new Date().toLocaleTimeString(getUiLocale(),{hour12:false});
      const rd = { id, name, seasonId: state.season.activeSeasonId, trackId: state.tracks.activeTrackId, createdAt: now(), races: [] };
      state.raceDay.raceDays.push(rd);
      state.raceDay.activeRaceDayId = id;
      state.ui.selectedRaceId=''; state.ui.selectedRaceDriverId='';
      saveState();
      toast(t('renntag.title'), t('renntag.created'),'ok');
      logLine('Renntag erstellt: ' + name);
      renderRenntag(); renderSessionControl();
    };

    el.querySelector('#raceSel').onchange=(e)=>{ state.ui.selectedRaceId=e.target.value; state.ui.selectedRaceDriverId=''; saveState(); renderRenntag(); };
    const renntagPreviewRoot = el;
    Promise.resolve().then(async ()=>{
      try{
        const msg = buildRaceDayWebhookMessage(rd.id);
        const blob = await renderRaceDayWebhookBlob(rd.id);
        if(renntagPreviewRoot !== document.getElementById('pageRenntag')) return;
        setDiscordPreviewText(renntagPreviewRoot, '#raceDayMainPreviewText', formatDiscordPayloadPreview(msg.payload));
        setDiscordPreviewImage(renntagPreviewRoot, '#raceDayMainPreviewImage', blob, 'Renntag Discord Vorschau');
      }catch(err){
        setDiscordPreviewText(renntagPreviewRoot, '#raceDayMainPreviewText', t('preview.failed'));
        setDiscordPreviewImage(renntagPreviewRoot, '#raceDayMainPreviewImage', null, 'Vorschau konnte nicht geladen werden');
        logLine('Renntag Vorschau Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }
    });
    if(race){
      Promise.resolve().then(async ()=>{
        try{
          const preview = await buildSessionDiscordPreview(race.id);
          if(renntagPreviewRoot !== document.getElementById('pageRenntag')) return;
          setDiscordPreviewText(renntagPreviewRoot, '#sessionMainPreviewText', formatDiscordPayloadPreview(preview.payload));
          setDiscordPreviewImage(renntagPreviewRoot, '#sessionMainPreviewImage', preview.blob, 'Session Discord Vorschau');
        }catch(err){
          setDiscordPreviewText(renntagPreviewRoot, '#sessionMainPreviewText', t('preview.failed'));
          setDiscordPreviewImage(renntagPreviewRoot, '#sessionMainPreviewImage', null, 'Vorschau konnte nicht geladen werden');
          logLine('Session Vorschau Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      });
    }
    const btnRaceDayMainWebhook = el.querySelector('#btnRaceDayMainWebhook');
    if(btnRaceDayMainWebhook){
      btnRaceDayMainWebhook.onclick = async ()=>{
        btnRaceDayMainWebhook.disabled = true;
        const prev = btnRaceDayMainWebhook.textContent;
        btnRaceDayMainWebhook.textContent = t('button.sending');
        try{
          await sendRaceDayWebhook(rd.id);
          toast('Discord', t('renntag.sent'),'ok');
          logLine('Renntag Webhook gesendet: ' + (rd.name||rd.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Renntag in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Renntag ' + String(rd.name || rd.id));
          }else{
            toast('Discord', t('renntag.send_failed'),'err');
            logLine('Renntag Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnRaceDayMainWebhook.disabled = false;
          btnRaceDayMainWebhook.textContent = prev;
        }
      };
    }
    const btnRaceDayMainForumCopy = el.querySelector('#btnRaceDayMainForumCopy');
    if(btnRaceDayMainForumCopy){
      btnRaceDayMainForumCopy.onclick = async ()=>{
        try{
          const msg = buildRaceDayWebhookMessage(rd.id);
          await copyTextToClipboard(msg.forumText);
          toast('Forum', t('renntag.copied'),'ok');
        }catch(err){
          toast('Forum', t('copy.failed'),'err');
          logLine('Renntag Forum-Text Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      };
    }
    const btnSessionMainWebhook = el.querySelector('#btnSessionMainWebhook');
    if(btnSessionMainWebhook){
      btnSessionMainWebhook.onclick = async ()=>{
        if(!race) return;
        btnSessionMainWebhook.disabled = true;
        const prev = btnSessionMainWebhook.textContent;
        btnSessionMainWebhook.textContent = t('button.sending');
        try{
          await sendDiscordSummaryForRace(race.id, { force:true });
          toast('Discord', t('session.sent'),'ok');
          logLine('Session Webhook gesendet: ' + (race.name||race.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Session in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Session ' + String(race.name || race.id));
          }else{
            toast('Discord', t('session.send_failed'),'err');
            logLine('Session Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnSessionMainWebhook.disabled = false;
          btnSessionMainWebhook.textContent = prev;
        }
      };
    }
  }

  // -------- Saison --------

  function renderSaison(){
    bindShared();
    const el = document.getElementById('pageSaison');
    const seasons = state.season.seasons.slice().sort((a,b)=>b.createdAt-a.createdAt);
    const active = getActiveSeason();
    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>${t('season.title')}</h2></div>
          <div class="card-b">
            <div class="muted">${t('season.intro')}</div>
            <div class="hr"></div>
            <div class="field">
              <label>${t('season.active')}</label>
              <select id="seasonSel">
                ${seasons.map(s=>`<option value="${esc(s.id)}" ${s.id===state.season.activeSeasonId?'selected':''}>${esc(s.name)}${s.status==='active' ? ` (${t('season.status_active')})` : ` (${t('season.status_closed')})`}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>${t('season.name')}</label>
              <input class="input" id="seasonName" value="${esc(active?.name||'')}"/>
            </div>
            <div class="row">
              <button class="btn btn-primary" id="seasonSave">${t('season.save')}</button>
              <button class="btn btn-danger" id="seasonEnd">${t('season.end')}</button>
              <button class="btn" id="seasonNew">${t('season.new')}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="card-h"><h2>${t('season.preview_title')}</h2></div>
        <div class="card-b">
          <div class="discord-preview-grid">
            <div class="discord-preview-pane">
              <div class="muted small" style="margin-bottom:8px">${t('preview.text')}</div>
              <pre class="discord-preview-text" id="seasonMainPreviewText">${active ? t('preview.loading') : t('season.no_active')}</pre>
            </div>
            <div class="discord-preview-pane">
              <div class="muted small" style="margin-bottom:8px">${t('preview.image')}</div>
              <div class="discord-preview-imagebox" id="seasonMainPreviewImage"><div class="muted small">${active ? t('preview.loading_image') : t('season.no_active')}</div></div>
            </div>
          </div>
          <div class="row wrap" style="gap:10px; margin-top:12px">
            <button class="btn" id="btnSeasonMainForumCopy" type="button" ${active?'':'disabled'}>${t('season.copy_forum')}</button>
            <button class="btn" id="btnSeasonMainWebhook" type="button" ${active?'':'disabled'}>${t('season.send')}</button>
          </div>
        </div>
      </div>
    `;
    const saisonPreviewRoot = el;
    if(active){
      Promise.resolve().then(async ()=>{
        try{
          const msg = buildSeasonWebhookMessage(active.id);
          const blob = await renderSeasonWebhookBlob(active.id);
          if(saisonPreviewRoot !== document.getElementById('pageSaison')) return;
          setDiscordPreviewText(saisonPreviewRoot, '#seasonMainPreviewText', formatDiscordPayloadPreview(msg.payload));
          setDiscordPreviewImage(saisonPreviewRoot, '#seasonMainPreviewImage', blob, 'Saison Discord Vorschau');
        }catch(err){
          setDiscordPreviewText(saisonPreviewRoot, '#seasonMainPreviewText', t('preview.failed'));
          setDiscordPreviewImage(saisonPreviewRoot, '#seasonMainPreviewImage', null, 'Vorschau konnte nicht geladen werden');
          logLine('Saison Vorschau Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      });
    }
    el.querySelector('#seasonSel').onchange=(e)=>{ state.season.activeSeasonId=e.target.value; saveState(); renderAll(); };
    el.querySelector('#seasonSave').onclick=()=>{
      const s=getActiveSeason(); if(!s) return;
      s.name = el.querySelector('#seasonName').value.trim() || s.name;
      saveState(); toast(t('season.title'), t('season.saved'),'ok'); renderAll();
    };
    el.querySelector('#seasonEnd').onclick=()=>{
      const s=getActiveSeason(); if(!s) return;
      s.status='closed'; s.endedAt=now();
      const id=uid('season'); const year=new Date().getFullYear();
      state.season.seasons.push({ id, name:t('season.new_name', { year }), status:'active', createdAt:now(), endedAt:null });
      state.season.activeSeasonId=id;
      for(const t of state.tracks.tracks){
        if(!t.recordsBySeason) t.recordsBySeason = {};
        t.recordsBySeason[id] = { ms:null, driverName:'', carName:'' };
      }
      saveState(); toast(t('season.title'), t('season.ended'),'ok'); renderAll();
    };
    el.querySelector('#seasonNew').onclick=()=>{
      for(const s of state.season.seasons){ if(s.status==='active'){ s.status='closed'; s.endedAt=now(); } }
      const id=uid('season'); const year=new Date().getFullYear();
      state.season.seasons.push({ id, name:t('season.new_name', { year }), status:'active', createdAt:now(), endedAt:null });
      state.season.activeSeasonId=id;
      for(const t of state.tracks.tracks){
        if(!t.recordsBySeason) t.recordsBySeason = {};
        t.recordsBySeason[id] = { ms:null, driverName:'', carName:'' };
      }
      saveState(); toast(t('season.title'), t('season.created'),'ok'); renderAll();
    };
    const btnSeasonMainWebhook = el.querySelector('#btnSeasonMainWebhook');
    if(btnSeasonMainWebhook){
      btnSeasonMainWebhook.onclick = async ()=>{
        const s = getActiveSeason();
        if(!s) return;
        btnSeasonMainWebhook.disabled = true;
        const prev = btnSeasonMainWebhook.textContent;
        btnSeasonMainWebhook.textContent = t('button.sending');
        try{
          await sendSeasonWebhook(s.id);
          toast('Discord', t('season.sent'),'ok');
          logLine('Saison Webhook gesendet: ' + (s.name||s.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Saison in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Saison ' + String(s.name || s.id));
          }else{
            toast('Discord', t('season.send_failed'),'err');
            logLine('Saison Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnSeasonMainWebhook.disabled = false;
          btnSeasonMainWebhook.textContent = prev;
        }
      };
    }
    const btnSeasonMainForumCopy = el.querySelector('#btnSeasonMainForumCopy');
    if(btnSeasonMainForumCopy){
      btnSeasonMainForumCopy.onclick = async ()=>{
        const s = getActiveSeason();
        if(!s) return;
        try{
          const msg = buildSeasonWebhookMessage(s.id);
          await copyTextToClipboard(msg.forumText);
          toast('Forum', t('season.copied'),'ok');
        }catch(err){
          toast('Forum', t('copy.failed'),'err');
          logLine('Saison Forum-Text Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      };
    }
  }


  // -------- Audio Asset DB --------
  let _audioAssetDbPromise = null;
  let _audioPreviewCtx = null;
  let _audioPreviewSource = null;
  let _audioPreviewGain = null;


  function renderEinstellungen(){
    bindShared();
    const el = document.getElementById('pageEinstellungen');
    function readSettingsForm(){
      return {
        appName: el.querySelector('#appName').value.trim() || 'Zeitnahme 2.0',
        language: String(el.querySelector('#appLanguage')?.value || 'de').trim() === 'en' ? 'en' : 'de',
        allowIdleReads: false,
        discordWebhook: String(el.querySelector('#webhook')?.value || '').trim(),
        discordAutoSend: !!el.querySelector('#discordAutoSend')?.checked,
        discordUseThread: !!el.querySelector('#discordUseThread')?.checked,
        discordThreadName: String(el.querySelector('#discordThreadName')?.value || '').trim(),
        discordRaceDayWebhook: String(el.querySelector('#raceDayWebhook')?.value || '').trim(),
        discordSeasonWebhook: String(el.querySelector('#seasonWebhook')?.value || '').trim(),
        discordRaceDayUseThread: !!el.querySelector('#discordRaceDayUseThread')?.checked,
        discordSeasonUseThread: !!el.querySelector('#discordSeasonUseThread')?.checked,
        discordRaceDayThreadName: String(el.querySelector('#discordRaceDayThreadName')?.value || '').trim(),
        discordSeasonThreadName: String(el.querySelector('#discordSeasonThreadName')?.value || '').trim(),
        obsEnabled: !!el.querySelector('#obsEnabled')?.checked,
        obsHost: String(el.querySelector('#obsHost')?.value || '127.0.0.1').trim() || '127.0.0.1',
        obsPort: Math.max(1, parseInt(el.querySelector('#obsPort')?.value,10)||4455),
        obsPassword: String(el.querySelector('#obsPassword')?.value || '').trim(),
        obsSceneTraining: String(el.querySelector('#obsSceneTraining')?.value || '').trim(),
        obsSceneQualifying: String(el.querySelector('#obsSceneQualifying')?.value || '').trim(),
        obsSceneRace: String(el.querySelector('#obsSceneRace')?.value || '').trim(),
        obsScenePodium: String(el.querySelector('#obsScenePodium')?.value || '').trim(),
        scaleDenominator: Math.max(1, parseInt(el.querySelector('#setScaleDenominator').value,10)||50),
        lapTimeSource:'mrc'
      };
    }

    function commitSettingsDraft(draft, {notify=false, log=false} = {}){
      const languageChanged = String(state.settings?.language || 'de') !== String(draft?.language || 'de');
      Object.assign(state.settings, draft);
      saveState();
      renderTopMenu();
      renderHeader();
      if(languageChanged) renderAll();
      if(notify) toast(t('tab.pageEinstellungen'), t('settings.saved'),'ok');
      if(log) logLine(t('settings.saved_log'));
      return draft;
    }

    function saveSettingsFromForm(opts={}){
      return commitSettingsDraft(readSettingsForm(), opts);
    }

    el.innerHTML = `
      <div class="settings-page">
        <div class="card settings-card settings-overview">
          <div class="card-b settings-overview-b">
            <div>
              <div class="settings-kicker">Einstellungen</div>
              <div class="settings-overview-title">Betrieb, Integrationen und Datenpflege</div>
              <div class="muted settings-overview-copy">Der Tab ist in System, Discord und Datenaustausch getrennt, damit typische Anpassungen schneller auffindbar bleiben.</div>
            </div>
            <div class="settings-overview-meta">
              <span class="pill">Build ${BUILD}</span>
              <span class="pill">MRC only</span>
              <span class="pill">Local first</span>
            </div>
          </div>
        </div>

      <div class="settings-grid">
        <div class="settings-stack">
          <div class="settings-sectionlabel">Betrieb</div>
          <div class="settings-mini-grid">
            <div class="card settings-card" style="margin-bottom:12px">
            <div class="card-h"><h2>${t('settings.general')}</h2></div>
            <div class="card-b">
              <div class="field" style="margin-bottom:0">
                <label>${t('settings.header_name')}</label>
                <input class="input" id="appName" value="${esc(state.settings.appName)}"/>
              </div>
              <div class="field" style="margin-top:12px; margin-bottom:0">
                <label>${t('settings.language')}</label>
                <select id="appLanguage">
                  <option value="de" ${getUiLanguage()==='de'?'selected':''}>${t('settings.language_de')}</option>
                  <option value="en" ${getUiLanguage()==='en'?'selected':''}>${t('settings.language_en')}</option>
                </select>
              </div>
              <div class="settings-actionbar">
                <div class="muted settings-action-note">Speichern uebernimmt alle editierbaren Felder in diesem Tab, inklusive Discord- und Massstab-Werten.</div>
                <button class="btn btn-primary" id="saveSettings">${t('settings.save')}</button>
              </div>
            </div>
          </div>

            <div class="card settings-card" style="margin-bottom:12px">
            <div class="card-h"><h2>Zeitmessung</h2></div>
            <div class="card-b">
              <div class="settings-tag">Timing</div>
              <div class="field">
                <label>Quelle fuer Rundenzeit</label>
                <div class="pill" id="setLapTimeSource" data-fixed="mrc">Nur MRC-Rundenzeit</div>
                <div class="muted">Browser-/HTML-Zeit ist vollstaendig deaktiviert. Ohne gueltige MRC-Zeitbasis startet kein Rennen.</div>
              </div>
            </div>
          </div>

            <div class="card settings-card" style="margin-bottom:12px">
            <div class="card-h"><h2>Massstab</h2></div>
            <div class="card-b">
              <div class="field">
                <label>Massstab</label>
                <div class="row" style="gap:8px; align-items:center">
                  <span class="muted">1 zu</span>
                  <input class="input settings-inline-input" id="setScaleDenominator" type="number" min="1" step="1" value="${esc(getScaleDenominator())}"/>
                </div>
                <div class="muted">Standard: 50</div>
              </div>
            </div>
          </div>
          </div>

          <div class="settings-sectionlabel">Sicherung und Reset</div>
          <div class="card settings-card" id="settingsBackupCard" style="margin-bottom:12px">
            <div class="card-h"><h2>Backup / Restore</h2></div>
            <div class="card-b">
              <div class="muted">Backup exportiert alles als JSON. Restore importiert JSON und ueberschreibt den aktuellen Stand.</div>
              <div class="settings-actions">
                <button class="btn" id="btnBackup">Backup exportieren</button>
                <label class="btn" style="cursor:pointer;">
                  Restore importieren
                  <input id="fileRestore" type="file" accept="application/json" style="display:none"/>
                </label>
              </div>
            </div>
          </div>

          <div class="card settings-card">
            <div class="card-h"><h2>Daten zuruecksetzen</h2></div>
            <div class="card-b">
              <div class="muted">Loescht Browserdaten dieser Zeitnahme direkt in der App - ohne AppData-Gefummel.</div>
              <div class="settings-actions">
                <button class="btn btn-danger" id="btnResetAll" type="button">Alles loeschen</button>
                <button class="btn" id="btnResetRaceData" type="button">Nur Renndaten loeschen</button>
                <button class="btn" id="btnResetAudioDb" type="button">Nur Audio-DB loeschen</button>
              </div>
              <div class="muted small" style="margin-top:8px">Alles loeschen: Stammdaten, Sessions, Einstellungen und Audio. Renndaten loeschen: Sessions, Saison, Renntag, Rekorde und freie Reads. Audio-DB loeschen: importierte Sounds und Fahrersound-Zuordnung. Der eingebaute Standardsound wird automatisch wieder angelegt.</div>
            </div>
          </div>
        </div>

        <div class="settings-stack">
          <div class="settings-sectionlabel">Integrationen und Austausch</div>
          <div class="card settings-card" style="margin-bottom:12px">
            <div class="card-h"><h2>Discord</h2></div>
            <div class="card-b">
              <div class="settings-discord-intro">
                <div class="settings-note">
                  <div>Discord-Ausgaben sind nach Session, Renntag und Saison getrennt.</div>
                  <div class="muted small">So bleibt klar, welcher Webhook und welcher Titel fuer welchen Versand genutzt wird.</div>
                </div>
                <div class="settings-discord-badges">
                  <span class="pill">Session</span>
                  <span class="pill">Renntag</span>
                  <span class="pill">Saison</span>
                </div>
              </div>
              <div class="settings-discord-grid">
                <div class="settings-subcard settings-discord-card">
                  <div class="settings-tag">Session</div>
                  <h3>Session-Webhook</h3>
              <div class="field">
                <label>Session Webhook</label>
                <input class="input" id="webhook" value="${esc(state.settings.discordWebhook)}" placeholder="https://..."/>
                <div class="muted small">Fuer die bestehende automatische Session-Grafik nach Rennende.</div>
              </div>
              <div class="field">
                <label class="row" style="gap:8px; align-items:center">
                  <input type="checkbox" id="discordAutoSend" ${state.settings.discordAutoSend?'checked':''}/>
                  <span>Nach Session-Ende automatisch an Discord senden</span>
                </label>
                <div class="muted">Sendet nach Rennende automatisch eine Grafik mit Podium bzw. Bestzeiten an den Session-Webhook.</div>
              </div>
              <div class="field">
                <label class="row" style="gap:8px; align-items:center">
                  <input type="checkbox" id="discordUseThread" ${state.settings.discordUseThread?'checked':''}/>
                  <span>Session optional als Thread senden (fuer Forum-Kanaele)</span>
                </label>
              </div>
              <div class="field">
                <label>Session Thread-Name</label>
                <input class="input" id="discordThreadName" value="${esc(state.settings.discordThreadName || '{track}, {date} {time}') }" placeholder="{track}, {date} {time}"/>
                <div class="muted">Platzhalter: {track}, {mode}, {session}, {type}, {season}, {renntag}, {date}, {time}</div>
              </div>
                </div>
                <div class="settings-subcard settings-discord-card">
                  <div class="settings-tag">Renntag</div>
                  <h3>Renntag-Webhook</h3>
              <div class="field">
                <label>Renntag Webhook</label>
                <input class="input" id="raceDayWebhook" value="${esc(state.settings.discordRaceDayWebhook || '')}" placeholder="https://..."/>
                <div class="muted small">Sendet pro Strecke alle Fahrer mit ihrer besten Runde des Renntags.</div>
              </div>
              <div class="field">
                <label class="row" style="gap:8px; align-items:center">
                  <input type="checkbox" id="discordRaceDayUseThread" ${state.settings.discordRaceDayUseThread?'checked':''}/>
                  <span>Renntag als Thread / Forum-Beitrag senden</span>
                </label>
              </div>
              <div class="field">
                <label>Renntag Thread-/Post-Titel</label>
                <input class="input" id="discordRaceDayThreadName" value="${esc(state.settings.discordRaceDayThreadName || '{type} - {date}') }" placeholder="{type} - {date}"/>
                <div class="muted">Platzhalter: {track}, {type}, {renntag}, {date}, {time}</div>
              </div>
              <div class="settings-actions">
                <button class="btn" id="btnRaceDayWebhookTest" type="button">Renntag-Test senden</button>
              </div>
                </div>
                <div class="settings-subcard settings-discord-card">
                  <div class="settings-tag">Saison</div>
                  <h3>Saison-Webhook</h3>
              <div class="field">
                <label>Saison Webhook</label>
                <input class="input" id="seasonWebhook" value="${esc(state.settings.discordSeasonWebhook || '')}" placeholder="https://..."/>
                <div class="muted small">Sendet die Saison-Gesamtwertung plus Awards und Statistik.</div>
              </div>
              <div class="field">
                <label class="row" style="gap:8px; align-items:center">
                  <input type="checkbox" id="discordSeasonUseThread" ${state.settings.discordSeasonUseThread?'checked':''}/>
                  <span>Saison als Thread / Forum-Beitrag senden</span>
                </label>
              </div>
              <div class="field">
                <label>Saison Thread-/Post-Titel</label>
                <input class="input" id="discordSeasonThreadName" value="${esc(state.settings.discordSeasonThreadName || '{type} - {season}') }" placeholder="{type} - {season}"/>
                <div class="muted">Platzhalter: {type}, {season}, {date}, {time}</div>
              </div>
              <div class="settings-actions">
                <button class="btn" id="btnSeasonWebhookTest" type="button">Saison-Test senden</button>
              </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card settings-card" style="margin-bottom:12px">
            <div class="card-h"><h2>OBS</h2></div>
            <div class="card-b">
              <div class="settings-note" style="margin-bottom:12px">
                <div>Direkte Verbindung zu OBS per obs-websocket.</div>
                <div class="muted small">Typisch: Host 127.0.0.1, Port 4455, dazu dein OBS-WebSocket-Passwort.</div>
              </div>
              <label class="row settings-toggle" style="margin-bottom:12px">
                <input type="checkbox" id="obsEnabled" ${state.settings.obsEnabled?'checked':''}/>
                <span>OBS-Anbindung aktivieren</span>
              </label>
              <div class="settings-subcards settings-subcards-compact">
                <div class="settings-subcard">
                  <div class="settings-tag">Verbindung</div>
                  <h3>OBS WebSocket</h3>
                  <div class="field">
                    <label>Host</label>
                    <input class="input" id="obsHost" value="${esc(state.settings.obsHost || '127.0.0.1')}" placeholder="127.0.0.1"/>
                  </div>
                  <div class="field">
                    <label>Port</label>
                    <input class="input" id="obsPort" type="number" min="1" step="1" value="${esc(Number(state.settings.obsPort || 4455))}" placeholder="4455"/>
                  </div>
                  <div class="field">
                    <label>Passwort</label>
                    <input class="input" id="obsPassword" type="password" value="${esc(state.settings.obsPassword || '')}" placeholder="OBS WebSocket Passwort"/>
                  </div>
                  <div class="muted small" id="obsStatusLine">OBS: nicht verbunden</div>
                  <div class="settings-actions">
                    <button class="btn btn-primary" id="btnObsConnect" type="button">OBS verbinden</button>
                    <button class="btn" id="btnObsDisconnect" type="button">Trennen</button>
                  </div>
                </div>
                <div class="settings-subcard">
                  <div class="settings-tag">Szenen</div>
                  <h3>Automatischer Wechsel</h3>
                  <div class="field">
                    <label>Training</label>
                    <input class="input" id="obsSceneTraining" value="${esc(state.settings.obsSceneTraining || '')}" placeholder="Trainingsszene"/>
                  </div>
                  <div class="field">
                    <label>Qualifying</label>
                    <input class="input" id="obsSceneQualifying" value="${esc(state.settings.obsSceneQualifying || '')}" placeholder="Qualifyingszene"/>
                  </div>
                  <div class="field">
                    <label>Rennen</label>
                    <input class="input" id="obsSceneRace" value="${esc(state.settings.obsSceneRace || '')}" placeholder="Rennszene"/>
                  </div>
                  <div class="field">
                    <label>Podium</label>
                    <input class="input" id="obsScenePodium" value="${esc(state.settings.obsScenePodium || '')}" placeholder="Podiumsszene"/>
                  </div>
                  <div class="settings-actions">
                    <button class="btn" id="btnObsTestRace" type="button">Rennszene testen</button>
                    <button class="btn" id="btnObsTestPodium" type="button">Podium testen</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card settings-card" id="settingsDataExchangeCard">
            <div class="card-h"><h2>Import / Export</h2></div>
            <div class="card-b">
              <div class="settings-actions">
                <button class="btn" id="btnExportMaster">Stammdaten exportieren</button>
                <button class="btn" id="btnExportAll">Alles exportieren</button>
              </div>
              <div class="hr"></div>
              <div class="row" style="gap:10px; flex-wrap:wrap; align-items:center">
                <input class="input settings-file-input" type="file" id="importFile" accept="application/json"/>
                <label class="row" style="gap:8px"><input type="checkbox" id="importAllowDupNames"/> Duplikate nach Name erlauben</label>
                <button class="btn" id="btnImportMaster">Stammdaten importieren (kein Ueberschreiben)</button>
              </div>
              <div class="muted" style="margin-top:8px">Hinweis: Import ueberschreibt nichts. Fahrer/Autos mit gleicher ID oder gleicher Chip-ID werden uebersprungen. (Chip-ID = chipId/chipCode)</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    `;

    const backupCard = el.querySelector('#settingsBackupCard .card-b');
    if(backupCard){
      backupCard.innerHTML = `
        <div class="settings-subcard settings-folder-hero">
          <div class="settings-tag">Datenordner</div>
          <h3>TimTime-Ordner verbinden</h3>
          <div class="muted settings-subcopy">Wichtig: Hier legst du fest, wo TimTime seine Daten direkt im Unterordner <b>data</b> speichert. Ohne diese Verbindung bleiben Speichern und Wiederladen unzuverlaessig.</div>
          <div class="muted small settings-folder-path" id="projectDataFolderHint">${esc(state.settings?.projectDataFolderName || 'Noch kein TimTime-Ordner verbunden.')}</div>
          <div class="settings-actions settings-folder-actions">
            <button class="btn btn-primary settings-folder-btn" id="btnPickProjectDataFolder">TimTime-Ordner jetzt verbinden</button>
          </div>
          <div class="settings-warning" id="projectDataWarning" style="display:none; margin-top:12px"></div>
        </div>
        <div class="settings-subcards settings-subcards-compact" style="margin-top:12px">
          <div class="settings-subcard">
            <div class="settings-tag">App-Backup</div>
            <h3>Komplette App-Daten sichern</h3>
            <div class="muted settings-subcopy">Exportiert Sessions, Renntag, Saison, Stammdaten und Einstellungen als JSON. Die Audio-DB wird separat im Audio-Tab exportiert.</div>
            <div class="settings-actions">
              <button class="btn" id="btnBackup">App-Backup exportieren</button>
            </div>
          </div>
          <div class="settings-subcard">
            <div class="settings-tag">Restore</div>
            <h3>Backup zurueckspielen</h3>
            <div class="muted settings-subcopy">Akzeptiert aktuelle App-Backups und aeltere rohe State-Backups. Stammdaten- und Audio-Exporte gehoeren nicht hier hinein.</div>
            <div class="settings-actions">
              <label class="btn" style="cursor:pointer;">
                Backup importieren
                <input id="fileRestore" type="file" accept="application/json" style="display:none"/>
              </label>
            </div>
          </div>
        </div>
      `;
    }

    const dataExchangeCard = el.querySelector('#settingsDataExchangeCard .card-b');
    if(dataExchangeCard){
      dataExchangeCard.innerHTML = `
        <div class="settings-subcards settings-subcards-compact">
          <div class="settings-subcard">
            <div class="settings-tag">Stammdaten</div>
            <h3>Fahrer und Autos austauschen</h3>
            <div class="muted settings-subcopy">Exportiert und importiert nur Stammdaten. Bestehende Datensaetze werden nicht ueberschrieben; doppelte Chip-IDs werden uebersprungen.</div>
            <div class="settings-actions">
              <button class="btn" id="btnExportMaster">Stammdaten exportieren</button>
            </div>
            <div class="hr"></div>
            <div class="field" style="margin-bottom:0">
              <label>Stammdaten-Datei</label>
              <input class="input settings-file-input" type="file" id="importFile" accept="application/json"/>
            </div>
            <label class="row settings-toggle" style="margin-top:12px">
              <input type="checkbox" id="importAllowDupNames"/>
              <span>Duplikate nach Name erlauben</span>
            </label>
            <div class="settings-actions">
              <button class="btn" id="btnImportMaster">Stammdaten importieren</button>
            </div>
          </div>
          <div class="settings-note">
            <div class="settings-tag">Audio</div>
            <h3 style="margin:8px 0 0">Audio-DB separat</h3>
            <div class="muted settings-subcopy">Sounds liegen in IndexedDB und werden deshalb im Audio-Tab separat exportiert und importiert.</div>
          </div>
        </div>
      `;
    }

    const generalFormRow = el.querySelector('.settings-form-row');
    const baudField = el.querySelector('#baud')?.closest('.field');
    if(baudField){
      baudField.remove();
      if(generalFormRow) generalFormRow.style.gridTemplateColumns = '1fr';
    }

    const lapTimeCard = el.querySelector('#setLapTimeSource')?.closest('.settings-card');
    if(lapTimeCard) lapTimeCard.remove();

    const settingsStacks = el.querySelectorAll('.settings-stack');
    const dataExchangeCardNode = el.querySelector('#settingsDataExchangeCard');
    const backupCardNode = el.querySelector('#settingsBackupCard');
    const resetCardNode = el.querySelector('#btnResetAll')?.closest('.settings-card');
    if(settingsStacks.length >= 2 && dataExchangeCardNode && backupCardNode){
      settingsStacks[0].insertBefore(dataExchangeCardNode, resetCardNode || null);
      const rightSectionLabel = settingsStacks[1].querySelector('.settings-sectionlabel');
      if(rightSectionLabel) rightSectionLabel.textContent = 'Integrationen';
    }

    el.querySelector('#saveSettings').onclick=()=>{
      saveSettingsFromForm({ notify:true, log:true });
    };

    const btnRaceDayWebhookTest = el.querySelector('#btnRaceDayWebhookTest');
    if(btnRaceDayWebhookTest){
      btnRaceDayWebhookTest.onclick = async ()=>{
        const draft = readSettingsForm();
        const webhookUrl = draft.discordRaceDayWebhook;
        const rd = getActiveRaceDay();
        if(!webhookUrl){ toast('Discord','Bitte zuerst einen Renntag-Webhook eintragen.','err'); return; }
        if(!rd){ toast('Discord','Kein aktiver Renntag vorhanden.','err'); return; }
        commitSettingsDraft(draft);
        btnRaceDayWebhookTest.disabled = true;
        const prev = btnRaceDayWebhookTest.textContent;
        btnRaceDayWebhookTest.textContent = 'Sende Test...';
        try{
          await sendRaceDayWebhook(rd.id);
          toast('Discord','Renntag erfolgreich gesendet.','ok');
          logLine('Renntag Test erfolgreich gesendet');
        }catch(err){
          if(err?.queued){
            toast('Discord','Renntag-Test in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Renntag Test');
          }else{
            toast('Discord','Renntag-Test fehlgeschlagen.','err');
            logLine('Renntag Test Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnRaceDayWebhookTest.disabled = false;
          btnRaceDayWebhookTest.textContent = prev;
        }
      };
    }
    const btnSeasonWebhookTest = el.querySelector('#btnSeasonWebhookTest');
    if(btnSeasonWebhookTest){
      btnSeasonWebhookTest.onclick = async ()=>{
        const draft = readSettingsForm();
        const webhookUrl = draft.discordSeasonWebhook;
        const season = getActiveSeason();
        if(!webhookUrl){ toast('Discord','Bitte zuerst einen Saison-Webhook eintragen.','err'); return; }
        if(!season){ toast('Discord','Keine aktive Saison vorhanden.','err'); return; }
        commitSettingsDraft(draft);
        btnSeasonWebhookTest.disabled = true;
        const prev = btnSeasonWebhookTest.textContent;
        btnSeasonWebhookTest.textContent = 'Sende Test...';
        try{
          await sendSeasonWebhook(season.id);
          toast('Discord','Saison erfolgreich gesendet.','ok');
          logLine('Saison Test erfolgreich gesendet');
        }catch(err){
          if(err?.queued){
            toast('Discord','Saison-Test in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Saison Test');
          }else{
            toast('Discord','Saison-Test fehlgeschlagen.','err');
            logLine('Saison Test Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnSeasonWebhookTest.disabled = false;
          btnSeasonWebhookTest.textContent = prev;
        }
      };
    }

    const btnBackup = el.querySelector('#btnBackup');
    if(btnBackup) btnBackup.onclick = ()=>{
      exportAll();
    };

    const btnPickProjectDataFolder = el.querySelector('#btnPickProjectDataFolder');
    if(btnPickProjectDataFolder) btnPickProjectDataFolder.onclick = async ()=>{
      try{
        await chooseProjectDataDirectory();
        toast('Ordner', 'Datenordner verbunden.', 'ok');
        logLine('Projektordner fuer Daten verbunden');
        renderEinstellungen();
      }catch(err){
        const code = String(err?.message || err || '');
        if(code === 'fs_access_not_supported'){
          toast('Ordner', 'Dieser Browser unterstuetzt keine Ordnerfreigabe.', 'err');
        }else if(code === 'fs_access_denied'){
          toast('Ordner', 'Ordnerfreigabe wurde nicht erlaubt.', 'warn');
        }else{
          toast('Ordner', 'Ordner konnte nicht verbunden werden.', 'err');
        }
        logLine('Datenordner Fehler: ' + code);
      }
    };
    Promise.resolve().then(async ()=>{
      const warn = el.querySelector('#projectDataWarning');
      const hint = el.querySelector('#projectDataFolderHint');
      if(!warn) return;
      try{
        const status = await getProjectDataStatus();
        if(hint && status.folderName) hint.textContent = status.folderName;
        if(!status.supported){
          warn.style.display = '';
          warn.innerHTML = '<b>Warnung:</b> Dieser Browser unterstuetzt keine feste Ordnerfreigabe.';
          return;
        }
        if(!status.configured){
          warn.style.display = '';
          warn.innerHTML = '<b>Warnung:</b> Es ist noch kein TimTime-Datenordner verbunden.';
          return;
        }
        if(!status.reachable){
          warn.style.display = '';
          warn.innerHTML = '<b>Warnung:</b> Der verbundene Datenordner ist aktuell nicht erreichbar oder die Freigabe fehlt.';
          return;
        }
        warn.style.display = 'none';
        warn.innerHTML = '';
      }catch{
        warn.style.display = '';
        warn.innerHTML = '<b>Warnung:</b> Der Datenordner konnte nicht geprüft werden.';
      }
    });

    const obsStatusLine = el.querySelector('#obsStatusLine');
    const refreshObsStatus = ()=>{
      if(!obsStatusLine) return;
      const st = (typeof getObsStatus === 'function') ? getObsStatus() : {};
      if(st.connecting){
        obsStatusLine.textContent = 'OBS: verbinde ...';
        return;
      }
      if(st.connected){
        const sceneText = String(st.scene || '').trim();
        obsStatusLine.textContent = sceneText ? `OBS: verbunden • Szene ${sceneText}` : 'OBS: verbunden';
        return;
      }
      if(st.lastError){
        obsStatusLine.textContent = `OBS: Fehler • ${String(st.lastError)}`;
        return;
      }
      obsStatusLine.textContent = 'OBS: nicht verbunden';
    };
    refreshObsStatus();

    const btnObsConnect = el.querySelector('#btnObsConnect');
    if(btnObsConnect) btnObsConnect.onclick = async ()=>{
      commitSettingsDraft(readSettingsForm());
      btnObsConnect.disabled = true;
      const prev = btnObsConnect.textContent;
      btnObsConnect.textContent = 'Verbinde ...';
      try{
        await connectObs(true);
        refreshObsStatus();
        toast('OBS','OBS verbunden.','ok');
      }catch(err){
        refreshObsStatus();
        toast('OBS','OBS Verbindung fehlgeschlagen.','err');
        logLine('OBS Connect Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }finally{
        btnObsConnect.disabled = false;
        btnObsConnect.textContent = prev;
      }
    };

    const btnObsDisconnect = el.querySelector('#btnObsDisconnect');
    if(btnObsDisconnect) btnObsDisconnect.onclick = async ()=>{
      try{
        await disconnectObs();
        refreshObsStatus();
        toast('OBS','OBS getrennt.','ok');
      }catch(err){
        toast('OBS','OBS Trennen fehlgeschlagen.','err');
        logLine('OBS Disconnect Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }
    };

    const btnObsTestRace = el.querySelector('#btnObsTestRace');
    if(btnObsTestRace) btnObsTestRace.onclick = async ()=>{
      commitSettingsDraft(readSettingsForm());
      try{
        await testObsScene('race');
        refreshObsStatus();
        toast('OBS','Rennszene gesetzt.','ok');
      }catch(err){
        refreshObsStatus();
        toast('OBS','Rennszene konnte nicht gesetzt werden.','err');
        logLine('OBS Test Rennen Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }
    };

    const btnObsTestPodium = el.querySelector('#btnObsTestPodium');
    if(btnObsTestPodium) btnObsTestPodium.onclick = async ()=>{
      commitSettingsDraft(readSettingsForm());
      try{
        await testObsScene('podium');
        refreshObsStatus();
        toast('OBS','Podiumsszene gesetzt.','ok');
      }catch(err){
        refreshObsStatus();
        toast('OBS','Podiumsszene konnte nicht gesetzt werden.','err');
        logLine('OBS Test Podium Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }
    };

    const btnExportMaster = el.querySelector('#btnExportMaster');
    if(btnExportMaster) btnExportMaster.onclick = ()=>{
      exportStammdaten();
    };

    const btnImportMaster = el.querySelector('#btnImportMaster');
    if(btnImportMaster) btnImportMaster.onclick = async ()=>{
      const importFile = el.querySelector('#importFile');
      const file = importFile?.files?.[0];
      if(!file){ toast('Import','Bitte Datei auswaehlen.','warn'); return; }
      try{
        const allowDup = !!el.querySelector('#importAllowDupNames')?.checked;
        await importStammdatenFile(file, allowDup);
      }catch(err){
        const code = String(err?.message || err || '');
        const msg = code==='import_invalid_masterdata_file'
          ? 'Ungueltige Stammdaten-Datei.'
          : 'Konnte Datei nicht importieren.';
        toast('Import', msg, 'err');
        logLine('Import Fehler: ' + code);
      } finally {
        if(importFile) importFile.value = '';
      }
    };


    el.querySelector('#btnResetAll').onclick=async ()=>{
      await clearAllStoredData();
      toast('Reset','Alles geloescht.','ok');
      logLine('Reset: Alles geloescht');
      renderAll();
    };

    el.querySelector('#btnResetRaceData').onclick=async ()=>{
      await clearRaceDataOnly();
      toast('Reset','Renndaten geloescht.','ok');
      logLine('Reset: Nur Renndaten geloescht');
      renderAll();
    };

    el.querySelector('#btnResetAudioDb').onclick=async ()=>{
      await clearAudioDbAndAssignments();
      toast('Reset','Audio-DB geloescht.','ok');
      logLine('Reset: Nur Audio-DB geloescht');
      renderAll();
    };

    el.querySelector('#fileRestore').onchange=async (ev)=>{
      const f = ev.target.files && ev.target.files[0];
      if(!f) return;
      try{
        await restoreStateFromFile(f);
        toast('Restore','Backup importiert.','ok');
        logLine('Restore import erfolgreich');
      }catch(e){
        const code = String(e?.message || e || '');
        const msg = code==='restore_received_masterdata_export'
          ? 'Das ist ein Stammdaten-Export. Bitte unten bei Stammdaten importieren.'
          : (code==='restore_received_audio_export'
            ? 'Das ist ein Audio-DB-Export. Bitte im Audio-Tab importieren.'
            : 'Ungueltige Backup-Datei.');
        toast('Restore', msg, 'err');
        logLine('Restore Fehler: ' + code);
      } finally { ev.target.value=''; }
    };

  }

    let lastDashRenderTs = 0;
// --------------------- Timer tick ---------------------
  

  return { renderEinzellaeufe, renderTeamrennen, renderLangstrecke, renderStammdaten, renderStrecken, renderRenntag, renderSaison, renderEinstellungen };
})();
