window.TIMTIME_TRANSPORT = (function(){
  'use strict';
  function bindShared(){
    Object.assign(globalThis, window.TIMTIME_SHARED || {});
  }
// --------------------- BLE (WebBluetooth / MRC NUS) ---------------------
const BLE_NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const BLE_NUS_RX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const BLE_NUS_TX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const BLE_MRC_WRITE_SERVICE_UUID = 'c8659210-af91-4ad3-a995-a58d6fd26145';
let bleDevice = null;
let bleServer = null;
let bleTxChar = null;
let bleRxChar = null;
let bleNotifyHandler = null;
let bleLineBuffer = '';
let bleReconnectTimer = null;
let bleReconnectAttempt = 0;
let bleReconnectSuppressedUntil = 0;
let bleReconnectInFlight = false;
let bleDiagToken = 0;

function pushBleLogLine(line){
    bindShared();
  state.ble.lastLines.unshift(line);
  if(state.ble.lastLines.length>800) state.ble.lastLines = state.ble.lastLines.slice(0,800);
}

function updateMrcCounterFromLine(line){
    bindShared();
  const m = /^\s*\d+\s*,\s*([0-9A-Fa-f]+)\s*,\s*(\d+)\s*$/.exec(String(line||''));
  if(!m) return null;
  const chip = String(m[1]||'').toUpperCase();
  const current = parseInt(m[2], 10);
  if(!chip || !Number.isFinite(current)) return null;
  state.session.mrcCounterByChip = state.session.mrcCounterByChip || {};
  const prev = state.session.mrcCounterByChip[chip] || null;
  const delta = (prev && Number.isFinite(prev.current)) ? Math.max(0, current - prev.current) : null;
  state.session.mrcCounterByChip[chip] = {
    current,
    previous: prev && Number.isFinite(prev.current) ? prev.current : null,
    delta,
    updatedAt: now()
  };
  return state.session.mrcCounterByChip[chip];
}

function getMrcDeltaForCar(carId){
    bindShared();
  const car = carId ? getCar(carId) : null;
  const chip = String(car?.chipCode || '').trim().toUpperCase();
  const rec = chip ? state.session.mrcCounterByChip?.[chip] : null;
  return rec && Number.isFinite(rec.delta) ? rec.delta : null;
}

function formatMrcDeltaMs(ms){
    bindShared();
  return (ms==null || !Number.isFinite(ms)) ? '—' : msToTime(ms, 3);
}

function getLapTimeSource(){
    bindShared();
  return 'mrc';
}

function resolveLapMsForCar(carId, rawMrcLapMs=null){
    bindShared();
  const car = carId ? getCar(carId) : null;
  const mrcMs = car ? getMrcDeltaForCar(car.id) : null;
  const fallbackMrcMs = Number.isFinite(Number(rawMrcLapMs)) && Number(rawMrcLapMs) > 0 ? Number(rawMrcLapMs) : null;
  const effectiveMrcMs = (Number.isFinite(mrcMs) && mrcMs > 0) ? mrcMs : fallbackMrcMs;
  return {
    lapMs: effectiveMrcMs,
    source: 'mrc',
    mrcMs: effectiveMrcMs,
    htmlMs: null
  };
}

function setBleUi(connected){
    bindShared();
  try{
    const dot = document.getElementById('btDot');
    const label = document.getElementById('btLabel');
    const badge = document.getElementById('badgeBt');
    const meta = document.getElementById('btMeta');
    const hasKnown = !!(state.ble?.knownDeviceId || state.ble?.knownDeviceName);
    const deviceName = String(state.ble?.knownDeviceName || state.ble?.info || '').trim();
    const info = deviceName ? (' ('+deviceName+')') : '';
    if(dot){
      dot.classList.toggle('green', !!connected);
      dot.classList.toggle('amber', !connected && !!state.ble.available);
    }
    if(label){
      if(connected) label.textContent = 'BT verbunden' + info;
      else if(state.ble.available && hasKnown) label.textContent = 'BT Reconnect nötig' + info;
      else if(state.ble.available) label.textContent = 'BT bereit';
      else label.textContent = 'BT verbinden';
    }
    if(badge){
      if(connected) badge.textContent = 'BT: ' + (state.ble.notify ? 'an' : 'verb.');
      else if(state.ble.available && hasKnown) badge.textContent = 'BT: reconnect';
      else badge.textContent = 'BT: ' + (state.ble.available ? 'bereit' : 'aus');
    }
    if(meta){
      const knownText = hasKnown ? 'Bekannt: ja' : 'Bekannt: nein';
      const browserText = bleSupportsSilentReconnect() ? 'Browser: prüft…' : 'Browser: kein silent reconnect';
      meta.textContent = knownText + ' • ' + browserText;
      scheduleBleMetaRefresh();
    }
  }catch{}
}

async function refreshBleMeta(){
    bindShared();
  try{
    const meta = document.getElementById('btMeta');
    if(!meta) return;
    const token = ++bleDiagToken;
    const hasKnown = !!(state.ble?.knownDeviceId || state.ble?.knownDeviceName);
    if(!bleSupportsSilentReconnect()){
      meta.textContent = (hasKnown ? 'Bekannt: ja' : 'Bekannt: nein') + ' • Browser: kein silent reconnect';
      return;
    }
    if(!hasKnown){
      meta.textContent = 'Bekannt: nein • Browser: —';
      return;
    }
    const knownId = String(state.ble?.knownDeviceId || '');
    const knownName = String(state.ble?.knownDeviceName || '');
    const devices = await navigator.bluetooth.getDevices();
    if(token !== bleDiagToken) return;
    const found = devices.some(d =>
      (knownId && String(d.id || '') === knownId) ||
      (knownName && String(d.name || '') === knownName)
    );
    meta.textContent = 'Bekannt: ja • Browser: ' + (found ? 'ja' : 'nein');
  }catch{
    try{
      const meta = document.getElementById('btMeta');
      if(meta) meta.textContent = 'Bekannt: ja • Browser: Fehler';
    }catch{}
  }
}

function scheduleBleMetaRefresh(){
    bindShared();
  setTimeout(()=>{ refreshBleMeta(); }, 0);
}

function bleSupportsSilentReconnect(){
    bindShared();
  return !!(('bluetooth' in navigator) && typeof navigator.bluetooth?.getDevices === 'function');
}

function bleHasKnownDevice(){
    bindShared();
  return !!(state.ble?.knownDeviceId || state.ble?.knownDeviceName);
}

function bleReconnectDelayMs(n){
    bindShared();
  return [1000, 2000, 5000, 10000, 15000, 20000][Math.min(n,5)] || 20000;
}

function clearBleReconnectTimer(){
    bindShared();
  if(bleReconnectTimer){
    clearTimeout(bleReconnectTimer);
    bleReconnectTimer = null;
  }
}

function scheduleBleReconnect(reason){
    bindShared();
  if(state.ble.connected || bleDevice?.gatt?.connected) return;
  if(!state.ble?.autoReconnect || !bleHasKnownDevice()) return;
  if(!bleSupportsSilentReconnect()) return;
  if(Date.now() < bleReconnectSuppressedUntil) return;
  if(bleReconnectAttempt >= 6) return;
  if(bleReconnectTimer) return;
  const delay = bleReconnectDelayMs(bleReconnectAttempt);
  bleReconnectAttempt++;
  bleReconnectTimer = setTimeout(async ()=>{
    bleReconnectTimer = null;
    bleReconnectInFlight = true;
    const ok = await bleConnect({ preferKnown:true, silent:true, autoReconnect:true, allowPrompt:false });
    bleReconnectInFlight = false;
    if(ok){
      logLine('BT Auto-Reconnect erfolgreich');
      toast('Bluetooth','Letztes Gerät wieder verbunden.','ok');
    } else {
      logLine('BT Auto-Reconnect fehlgeschlagen');
      scheduleBleReconnect('retry');
    }
  }, delay);
  logLine('BT Auto-Reconnect geplant in ' + Math.round(delay/1000) + 's' + (reason ? (' (' + reason + ')') : ''));
}

async function mrcWriteLine(line){
    bindShared();
  const payload = String(line||'').trim();
  if(!payload) return false;
  const wire = payload.endsWith('\n') ? payload : (payload + '\n');
  const bytes = new TextEncoder().encode(wire);
  let sent = false;
  if(bleRxChar){
    await bleRxChar.writeValue(bytes);
    sent = true;
  }
  if(port?.writable){
    const writer = port.writable.getWriter();
    try{ await writer.write(bytes); sent = true; } finally { try{ writer.releaseLock(); }catch{} }
  }
  if(sent) logLine('MRC CMD: ' + payload);
  return sent;
}

async function requestMrcSync(reason=''){
    bindShared();
  try{
    const ok = await mrcWriteLine('CMD_SYNC');
    if(ok && reason) logLine('MRC SYNC angefordert' + (reason ? ' [' + reason + ']' : ''));
    return ok;
  }catch(e){
    logLine('MRC SYNC Fehler: ' + String(e?.message||e));
    return false;
  }
}

async function mrcCountdownSet(pattern){
    bindShared();
  const p = String(pattern||'').replace(/[^01]/g,'').slice(0,7).padEnd(7,'0');
  return mrcWriteLine('CMD_COUNTDOWN_SET:' + p);
}

function handleMrcMetaLine(line){
    bindShared();
  const s = String(line||'').trim();
  if(!s) return false;
  if(/^MSG_PONG/i.test(s)) return true;
  const mSync = /^MSG_SYNC\s*:\s*(\d+)\s*$/i.exec(s);
  if(mSync){
    const deviceMs = parseInt(mSync[1],10);
    updateMrcClock(deviceMs, 'sync');
    logLine('MRC SYNC: ' + deviceMs + ' ms');
    return true;
  }
  if(/^MSG_INIT_/i.test(s)) return true;
  return false;
}

function onBleAsciiLine(line){
    bindShared();
  logLine('BT: ' + line);
  pushBleLogLine(line);
  if(handleMrcMetaLine(line)) return;
  const m = /^\s*\d+\s*,\s*([0-9A-Fa-f]+)\s*,\s*(\d+)\s*$/.exec(line);
  if(!m) return;
  updateMrcCounterFromLine(line);
  const chip = m[1].toUpperCase();
  const ts = parseInt(m[2], 10);
  updateMrcClock(ts, 'pass');
  enqueuePass(chip, ts, line);
}

function handleBleTextFragment(text){
    bindShared();
  bleLineBuffer += text;
  bleLineBuffer = bleLineBuffer.replace(/\r/g, '');
  let idx;
  while((idx = bleLineBuffer.indexOf('\n')) >= 0){
    const line = bleLineBuffer.slice(0, idx).trim();
    bleLineBuffer = bleLineBuffer.slice(idx + 1);
    if(line) onBleAsciiLine(line);
  }
}

function bleRememberDevice(device){
    bindShared();
  try{
    if(!state.ble) state.ble = {};
    state.ble.knownDeviceId = String(device?.id || '');
    state.ble.knownDeviceName = String(device?.name || '');
    if(!state.ble.info && state.ble.knownDeviceName) state.ble.info = state.ble.knownDeviceName;
    saveState();
  }catch(e){
    try{ logLine('BT Speicherwarnung: ' + String(e?.message||e)); }catch{}
  }
}

async function bleStartNotify(){
    bindShared();
  if(!bleServer) throw new Error('Kein BLE-Server verbunden');
  const service = await bleServer.getPrimaryService(BLE_NUS_SERVICE_UUID);
  bleTxChar = await service.getCharacteristic(BLE_NUS_TX_UUID);
  bleRxChar = await service.getCharacteristic(BLE_NUS_RX_UUID);
  await bleTxChar.startNotifications();
  bleNotifyHandler = ev => {
    try{
      const bytes = new Uint8Array(ev.target.value.buffer.slice(0));
      const dec = new TextDecoder('utf-8');
      handleBleTextFragment(dec.decode(bytes));
    }catch(e){
      logLine('BT Read Fehler: ' + String(e?.message||e));
    }
  };
  bleTxChar.addEventListener('characteristicvaluechanged', bleNotifyHandler);
  state.ble.notify = true;
  saveState();
  setBleUi(true);
  logLine('BT Notify aktiv (MRC NUS)');
}

async function bleConnect(opts){
    bindShared();
  const options = opts || {};
  const silent = !!options.silent;
  const allowPrompt = options.allowPrompt !== false;
  if(!('bluetooth' in navigator)){
    if(!silent) toast('Bluetooth', 'Web Bluetooth nur in Chrome/Edge und sicherem Kontext verfügbar.', 'err');
    logLine('BT Fehler: Web Bluetooth nicht verfügbar');
    return false;
  }
  try{
    state.ble.available = true;
    let device = options.device || null;
    if(!device && options.preferKnown && typeof navigator.bluetooth.getDevices === 'function'){
      const devices = await navigator.bluetooth.getDevices();
      const knownId = String(state.ble.knownDeviceId || '');
      const knownName = String(state.ble.knownDeviceName || '');
      device = devices.find(d => knownId && String(d.id||'')===knownId)
        || devices.find(d => knownName && String(d.name||'')===knownName)
        || devices.find(d => String(d.name||'').startsWith('MRC'))
        || null;
    }
    if(!device){
      if(!allowPrompt){
        state.ble.lastError = 'Kein autorisiertes Bluetooth-Gerät verfügbar.';
        saveState();
        setBleUi(false);
        return false;
      }
      device = await navigator.bluetooth.requestDevice({
        filters:[{ namePrefix:'MRC' }],
        optionalServices:[0x1800, 0x1801, BLE_NUS_SERVICE_UUID, BLE_MRC_WRITE_SERVICE_UUID]
      });
    }
    bleDevice = device;
    bleRememberDevice(device);
    try{ bleDevice.removeEventListener('gattserverdisconnected', onBleDisconnected); }catch{}
    bleDevice.addEventListener('gattserverdisconnected', onBleDisconnected);
    bleServer = await bleDevice.gatt.connect();
    state.ble.connected = true;
    state.ble.info = bleDevice.name || state.ble.knownDeviceName || 'BLE';
    state.ble.lastError = '';
    clearBleReconnectTimer();
    bleReconnectAttempt = 0;
    bleReconnectSuppressedUntil = 0;
    saveState();
    setBleUi(true);
    logLine('BT verbunden ' + (state.ble.info?('('+state.ble.info+')'):''));
    if(!silent) toast('Bluetooth','Verbunden.','ok');
    await bleStartNotify();
    try{ await mrcWriteLine('CMD_INIT'); }catch{}
    try{ await requestMrcSync('bt-connect'); }catch{}
    return true;
  }catch(e){
    bleServer = null;
    state.ble.connected = false;
    state.ble.notify = false;
    state.ble.lastError = String(e?.message||e);
    saveState();
    setBleUi(false);
    logLine('BT Fehler: ' + state.ble.lastError);
    if(!silent) toast('Bluetooth','Verbindung fehlgeschlagen/abgebrochen: ' + state.ble.lastError,'err');
    return false;
  }
}

async function bleAutoReconnectOnLoad(){
    bindShared();
  try{
    if(bleReconnectInFlight) return false;
    if(!('bluetooth' in navigator)) return false;
    if(!state.ble?.autoReconnect) return false;
    if(!bleHasKnownDevice()) return false;
    if(!bleSupportsSilentReconnect()){
      state.ble.connected = false;
      state.ble.notify = false;
      saveState();
      setBleUi(false);
      const knownName = String(state.ble?.knownDeviceName || 'letztes Gerät');
      logLine('BT Auto-Reconnect nicht verfügbar: Browser erlaubt kein stilles Wiederverbinden (kein getDevices).');
      try{ toast('Bluetooth', 'Automatisches Wiederverbinden wird von diesem Browser nicht unterstützt. Bitte „Bluetooth verbinden“ für ' + knownName + ' antippen.', 'warn'); }catch{}
      return false;
    }
    logLine('BT Auto-Reconnect: versuche letztes Gerät wieder zu verbinden');
    const ok = await bleConnect({ preferKnown:true, silent:true, autoReconnect:true, allowPrompt:false });
    if(ok){
      logLine('BT Auto-Reconnect erfolgreich');
      toast('Bluetooth','Letztes Gerät wieder verbunden.','ok');
    } else {
      logLine('BT Auto-Reconnect nicht möglich');
    }
    return ok;
  }catch(e){
    bleReconnectInFlight = false;
    logLine('BT Auto-Reconnect Fehler: ' + String(e?.message||e));
    return false;
  }
}

async function bleDisconnect(silent, opts){
    bindShared();
  const options = opts || {};
  const manual = options.manual !== false;
  const allowReconnect = options.scheduleReconnect !== false;
  if(manual){
    bleReconnectSuppressedUntil = Date.now() + 4000;
    clearBleReconnectTimer();
    bleReconnectAttempt = 0;
  }
  try{
    if(bleTxChar && bleNotifyHandler){
      try{ bleTxChar.removeEventListener('characteristicvaluechanged', bleNotifyHandler); }catch{}
      try{ await bleTxChar.stopNotifications(); }catch{}
    }
    bleNotifyHandler = null;
    bleTxChar = null;
    bleRxChar = null;
    bleLineBuffer = '';
    try{ if(bleDevice?.gatt?.connected) bleDevice.gatt.disconnect(); }catch{}
  } finally {
    bleDevice = null;
    bleServer = null;
    state.ble.connected = false;
    state.ble.notify = false;
    state.ble.info = '';
    saveState();
    setBleUi(false);
    if(!silent){
      logLine('BT getrennt');
      toast('Bluetooth','Getrennt.','warn');
    }
    if(!manual && allowReconnect) scheduleBleReconnect('disconnect');
  }
}

function onBleDisconnected(){
    bindShared();
  if(state.ble.connected || state.ble.notify){
    logLine('BT Gerät getrennt');
    toast('Bluetooth','Gerät getrennt.','warn');
  }
  bleDisconnect(true, { manual:false, scheduleReconnect:true });
}

// --------------------- USB (WebSerial) ---------------------
  let port=null, reader=null, stopRead=false;

function getUsbPort(){
    bindShared();
  return port;
}

function setUsbPort(value){
    bindShared();
  port = value || null;
  return port;
}

function getUsbReader(){
    bindShared();
  return reader;
}

function setUsbReader(value){
    bindShared();
  reader = value || null;
  return reader;
}

function getUsbStopRead(){
    bindShared();
  return !!stopRead;
}

function setUsbStopRead(value){
    bindShared();
  stopRead = !!value;
  return stopRead;
}


let usbReconnectTimer=null;
let usbReconnectAttempt=0;
let transportReconnectWatchStarted = false;
let transportReconnectPollTimer = null;

function usbReconnectDelayMs(n){
    bindShared();
  // simple backoff: 1s, 2s, 5s, 10s, 15s ...
  return [1000, 2000, 5000, 10000, 15000, 20000][Math.min(n,5)] || 20000;
}

function scheduleUsbReconnect(reason){
    bindShared();
  if(!('serial' in navigator)) return;
  if(state.usb.connected) return;
  if(usbReconnectAttempt>=6) return;
  if(usbReconnectTimer) return;
  const delay = usbReconnectDelayMs(usbReconnectAttempt);
  usbReconnectAttempt++;
  usbReconnectTimer = setTimeout(async ()=>{
    usbReconnectTimer=null;
    await usbAutoConnect(reason || 'retry');
  }, delay);
  logLine('USB Auto-Reconnect geplant in ' + Math.round(delay/1000) + 's' + (reason?(' ('+reason+')'):''));
}

async function usbAutoConnect(reason){
    bindShared();
  if(state.usb.connected || port) return;
  if(!('serial' in navigator)) return;
  try{
    const ports = await navigator.serial.getPorts();
    if(!ports || !ports.length) return;
    const p = ports[0];
    stopRead=false;
    port = p;
    await port.open({ baudRate: state.settings.baudRate||19200, dataBits:8, stopBits:1, parity:'none', flowControl:'none' });
    state.usb.available=true;
    state.usb.connected=true;
    state.usb.info=getPortInfo(port);
    state.usb.lastError='';
    saveState();
    setUsbUi(true);
    usbReconnectAttempt=0;
    logLine('USB auto-verbunden ' + (state.usb.info?('('+state.usb.info+')'):'') + (reason?(' ['+reason+']'):''));
    toast('USB','Auto-verbunden.','ok');
    readLoop();
    setTimeout(()=>{ try{ mrcWriteLine('CMD_INIT'); }catch{} try{ requestMrcSync('usb-autoconnect'); }catch{} }, 120);
  }catch(e){
    // Failed (busy, permission, etc.)
    try{ if(port){ try{ await port.close(); }catch{} } }catch{}
    port=null;
    state.usb.connected=false;
    state.usb.lastError = String(e?.message||e);
    saveState();
    setUsbUi(false);
    logLine('USB Auto-Reconnect fehlgeschlagen: ' + state.usb.lastError);
    scheduleUsbReconnect('fail');
  }
}

async function kickTransportAutoReconnect(reason='watch'){
    bindShared();
  try{
    if(!state.usb?.connected){
      await usbAutoConnect(reason);
    }
  }catch{}
  try{
    if(!state.ble?.connected && state.ble?.autoReconnect && bleHasKnownDevice() && bleSupportsSilentReconnect()){
      const ok = await bleAutoReconnectOnLoad();
      if(!ok) scheduleBleReconnect(reason);
    }
  }catch{}
}

function startTransportReconnectWatch(){
    bindShared();
  if(transportReconnectWatchStarted) return;
  transportReconnectWatchStarted = true;
  const onWake = ()=>{
    kickTransportAutoReconnect('resume');
  };
  try{ window.addEventListener('focus', onWake); }catch{}
  try{
    document.addEventListener('visibilitychange', ()=>{
      if(document.visibilityState === 'visible') kickTransportAutoReconnect('visible');
    });
  }catch{}
  try{ window.addEventListener('online', ()=>kickTransportAutoReconnect('online')); }catch{}
  try{
    transportReconnectPollTimer = setInterval(()=>{ kickTransportAutoReconnect('poll'); }, 15000);
  }catch{}
}


  // --------------------- Reader / USB ---------------------

  return {
    pushBleLogLine,
    updateMrcCounterFromLine,
    getMrcDeltaForCar,
    formatMrcDeltaMs,
    getLapTimeSource,
    resolveLapMsForCar,
    setBleUi,
    bleSupportsSilentReconnect,
    bleHasKnownDevice,
    bleReconnectDelayMs,
    clearBleReconnectTimer,
    scheduleBleReconnect,
    mrcWriteLine,
    requestMrcSync,
    mrcCountdownSet,
    handleMrcMetaLine,
    onBleAsciiLine,
    handleBleTextFragment,
    bleRememberDevice,
    bleStartNotify,
    bleConnect,
    bleAutoReconnectOnLoad,
    bleDisconnect,
    onBleDisconnected,
    getUsbPort,
    setUsbPort,
    getUsbReader,
    setUsbReader,
    getUsbStopRead,
    setUsbStopRead,
    usbReconnectDelayMs,
    scheduleUsbReconnect,
    usbAutoConnect,
    kickTransportAutoReconnect,
    startTransportReconnectWatch
  };
})();
