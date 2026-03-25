window.TIMTIME_DOM = (function(){
  'use strict';

  function bindShared(){
    Object.assign(globalThis, window.TIMTIME_SHARED || {});
  }

  function setText(id, value){
    const el = document.getElementById(id);
    if(el) el.textContent = value;
  }

  function setHtml(id, value){
    const el = document.getElementById(id);
    if(el) el.innerHTML = value;
  }

  function show(id, visible){
    const el = document.getElementById(id);
    if(el) el.style.display = visible ? '' : 'none';
  }

  function openDriverEditor(driverId){
    bindShared();
    const d = getDriver(driverId);
    if(!d) return;
    state.ui.stammdatenSelectedDriverId = d.id;
    saveState();
    const page = document.getElementById('pageStammdaten');
    const host = page?.querySelector('#driverEditor');
    if(!host) return;
    host.innerHTML = `
      <div class="card" style="background:rgba(15,23,42,.35);">
        <div class="card-h"><h2>${esc(t('driver.edit_title', null, 'Edit driver'))}</h2></div>
        <div class="card-b">
          <div class="row between" style="align-items:center;">
            <div class="row" style="gap:12px">
              <div class="avatar-lg">${getDriverAvatarDataUrl(d.id)?'<img src="'+getDriverAvatarDataUrl(d.id)+'" alt=""/>' : '<span>'+esc(initials(d.name))+'</span>'}</div>
              <div>
                <div class="muted small">${esc(t('driver.avatar', null, 'Profile image'))}</div>
                <div class="muted small">${esc(t('driver.avatar_hint', null, 'Stored as 512x512, 1:1.'))}</div>
              </div>
            </div>
            <div class="row">
              <input type="file" id="driverAvatarFile2" accept="image/*" style="display:none"/>
              <button class="btn" id="btnDriverAvatar2">${esc(t('driver.upload_image', null, 'Upload image'))}</button>
              <button class="btn" id="btnDriverAvatarDel2">${esc(t('driver.remove_image', null, 'Remove'))}</button>
            </div>
          </div>
          <div class="muted small">${esc(t('driver.avatar_tip', null, 'Tip: If iPhone HEIC fails, save the image as JPG/WebP first.'))}</div>

          <div class="hr"></div>

          <div class="field">
            <label>${esc(t('common.name', null, 'Name'))}</label>
            <input class="input" id="drvName" value="${esc(d.name)}"/>
          </div>
          <div class="field">
            <label>${esc(t('driver.phonetic_name', null, 'Phonetic name (announcement)'))}</label>
            <input class="input" id="drvPhonetic" placeholder="${esc(t('driver.phonetic_placeholder', null, 'e.g. Tim / Olli / Schumacher'))}" value="${esc(d.phoneticName||'')}"/>
            <div class="row" style="margin-top:8px">
              <button class="btn" id="btnTestDriverPronounce" type="button">${esc(t('driver.test_pronounce', null, 'Test announcement'))}</button>
            </div>
            <div class="muted small" style="margin-top:6px">${esc(t('driver.phonetic_hint', null, 'Used only for speech output.'))}</div>
          </div>

          <div class="field">
            <label>${esc(t('driver.color', null, 'Color (dashboard)'))}</label>
            <div class="row" style="gap:10px; align-items:center; flex-wrap:wrap">
              <input class="input" id="drvColor" type="color" value="${esc(d.color||'#2d6cdf')}" style="width:64px; padding:0; height:38px"/>
              <label class="row" style="gap:8px"><input type="checkbox" id="drvColorAutoText" ${d.colorAutoText!==false?'checked':''}/> ${esc(t('driver.auto_text_color', null, 'Auto text color'))}</label>
            </div>
          </div>
          <div class="field">
            <label>${esc(t('driver.best_only_sound', null, 'Driver sound for “best lap only”'))}</label>
            <select class="input" id="drvLapSoundId">${renderAudioAssetOptionTags(d.lapSoundAssetId||'', t('driver.use_standard_sound', null, 'Use default sound'))}</select>
            <div class="muted small" style="margin-top:6px">${esc(t('driver.best_only_sound_hint', null, 'A short custom sound for this driver. Without selection the default audio sound is used.'))}</div>
          </div>

          <div class="row">
            <button class="btn btn-primary" id="drvSave">${esc(t('common.save', null, 'Save'))}</button>
            <button class="btn btn-danger" id="drvDel">${esc(t('common.delete', null, 'Delete'))}</button>
          </div>
        </div>
      </div>
    `;

    const fi = host.querySelector('#driverAvatarFile2');
    const btnUp = host.querySelector('#btnDriverAvatar2');
    const btnDel = host.querySelector('#btnDriverAvatarDel2');
    if(btnUp && fi){
      btnUp.addEventListener('click', ()=>fi.click());
      fi.addEventListener('change', async ()=>{
        const f = fi.files && fi.files[0];
        if(f) await setDriverAvatar(d.id, f);
        fi.value='';
        openDriverEditor(d.id);
      });
    }
    if(btnDel){
      btnDel.addEventListener('click', ()=>{
        removeDriverAvatar(d.id);
        openDriverEditor(d.id);
      });
    }

    const btnTestPronounce = host.querySelector('#btnTestDriverPronounce');
    if(btnTestPronounce){
      btnTestPronounce.onclick = ()=>{
        const name = (host.querySelector('#drvPhonetic')?.value || host.querySelector('#drvName')?.value || d.name || '').trim();
        if(!name){
          toast(t('audio.title', null, 'Audio'), t('driver.no_name_for_test', null, 'No name available for test.'), 'err');
          return;
        }
        queueSpeak(name);
        toast(t('audio.title', null, 'Audio'), t('driver.test_playing', null, 'Announcement is playing.'), 'ok');
      };
    }

    host.querySelector('#drvSave').onclick = ()=>{
      const name = host.querySelector('#drvName').value.trim();
      const phon = host.querySelector('#drvPhonetic')?.value?.trim() || '';
      const color = host.querySelector('#drvColor')?.value || '';
      const autoText = !!host.querySelector('#drvColorAutoText')?.checked;
      const lapSoundAssetId = host.querySelector('#drvLapSoundId')?.value || '';

      if(name) d.name = name;
      d.phoneticName = phon;
      d.color = color;
      d.colorAutoText = autoText;
      d.lapSoundAssetId = lapSoundAssetId;

      saveState();
      toast(t('common.driver', null, 'Driver'), t('common.saved', null, 'Saved.'), 'ok');
      renderAll();
    };

    const col = host.querySelector('#drvColor');
    const auto = host.querySelector('#drvColorAutoText');
    if(col){
      col.oninput = ()=>{
        d.color = col.value || '';
        saveState();
        renderDashboard();
      };
    }
    if(auto){
      auto.onchange = ()=>{
        d.colorAutoText = !!auto.checked;
        saveState();
        renderDashboard();
      };
    }
    host.querySelector('#drvDel').onclick = ()=>{
      state.masterData.cars.forEach(c=>{ if(c.driverId===d.id) c.driverId=''; });
      state.masterData.drivers = state.masterData.drivers.filter(x=>x.id!==d.id);
      state.ui.stammdatenSelectedDriverId = '';
      saveState();
      toast(t('common.driver', null, 'Driver'), t('driver.deleted_unassigned', null, 'Driver deleted. Cars are now unassigned.'), 'warn');
      renderAll();
    };
  }

  function openCarEditor(carId){
    bindShared();
    const c = getCar(carId);
    if(!c) return;
    const page = document.getElementById('pageStammdaten');
    const host = page?.querySelector('#carEditor');
    if(!host) return;
    const drivers = state.masterData.drivers;
    host.innerHTML = `
      <div class="card" style="background:rgba(15,23,42,.35);">
        <div class="card-h"><h2>${esc(t('car.edit_title', null, 'Edit / assign car'))}</h2></div>
        <div class="card-b">
          <div class="field">
            <label>${esc(t('common.name', null, 'Name'))}</label>
            <input class="input" id="carName" value="${esc(c.name)}"/>
          </div>
          <div class="field">
            <label>${esc(t('car.chip_code', null, 'Chip code (between commas)'))}</label>
            <input class="input mono" id="carChip" value="${esc(c.chipCode||'')}"/>
          </div>
          <div class="field">
            <label>${esc(t('common.driver', null, 'Driver'))}</label>
            <select id="carDriver">
              <option value="">${esc(t('car.unassigned', null, 'Unassigned'))}</option>
              ${drivers.map(d=>`<option value="${esc(d.id)}" ${c.driverId===d.id?'selected':''}>${esc(d.name)}</option>`).join('')}
            </select>
          </div>

          <div class="row">
            <button class="btn btn-primary" id="carSave">${esc(t('common.save', null, 'Save'))}</button>
            <button class="btn btn-danger" id="carDel">${esc(t('common.delete', null, 'Delete'))}</button>
          </div>
        </div>
      </div>
    `;
    host.querySelector('#carSave').onclick = ()=>{
      const prevDriverId = c.driverId || '';
      c.name = host.querySelector('#carName').value.trim() || c.name;
      c.chipCode = host.querySelector('#carChip').value.trim().toUpperCase();
      c.driverId = host.querySelector('#carDriver').value;

      if(prevDriverId !== (c.driverId || '')){
        const activeRace = state.session.currentRaceId ? (getActiveRaceDay()?.races||[]).find(r=>r.id===state.session.currentRaceId) : null;
        const isLiveEndurance = !!(state.session.state==='RUNNING' && activeRace && activeRace.mode==='endurance');
        state.session.ignoreNextLapByCarId = state.session.ignoreNextLapByCarId || {};
        state.session.lastPassByCarId = state.session.lastPassByCarId || {};
        state.session.lastPassSeenByCarId = state.session.lastPassSeenByCarId || {};
        if(isLiveEndurance){
          delete state.session.ignoreNextLapByCarId[c.id];
          delete state.session.lastPassSeenByCarId[c.id];
          logLine(t('car.reassigned_endurance_log', { name: c.name }, `Car reassigned: ${c.name} - endurance switch without lap loss active`));
        }else{
          state.session.ignoreNextLapByCarId[c.id] = true;
          delete state.session.lastPassByCarId[c.id];
          delete state.session.lastPassSeenByCarId[c.id];
          logLine(t('car.reassigned_ignore_log', { name: c.name }, `Car reassigned: ${c.name} - next full lap will be ignored`));
        }
      }

      saveState();
      toast(t('common.car', null, 'Car'), t('common.saved', null, 'Saved.'), 'ok');
      renderAll();
    };
    host.querySelector('#carDel').onclick = ()=>{
      state.masterData.cars = state.masterData.cars.filter(x=>x.id!==c.id);
      saveState();
      toast(t('common.car', null, 'Car'), t('car.deleted', null, 'Car deleted.'), 'warn');
      renderAll();
    };
  }

  return { setText, setHtml, show, openDriverEditor, openCarEditor };
})();
