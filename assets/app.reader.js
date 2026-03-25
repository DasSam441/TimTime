window.TIMTIME_READER = (function(){
  'use strict';
  function bindShared(){
    Object.assign(globalThis, window.TIMTIME_SHARED || {});
  }
function setUsbUi(connected){
    bindShared();
    const dot = document.getElementById('usbDot');
    const label = document.getElementById('usbLabel');

    dot.classList.toggle('green', !!connected);
    dot.classList.toggle('amber', !connected && !!state.usb.available);

    const info = state.usb.info ? (' ('+state.usb.info+')') : '';
    if(connected){
      label.textContent = 'USB verbunden' + info;
    } else if(state.usb.available){
      label.textContent = 'USB erkannt' + info;
    } else {
      label.textContent = 'USB verbinden';
    }
    document.getElementById('badgeUsb').textContent = 'USB: ' + (connected?'an':(state.usb.available?'bereit':'aus'));
  }

  function getPortInfo(p){
    bindShared();
    try{
      const i = p.getInfo();
      const parts=[];
      if(i.usbVendorId) parts.push('VID ' + i.usbVendorId.toString(16));
      if(i.usbProductId) parts.push('PID ' + i.usbProductId.toString(16));
      return parts.join(' ');
    }catch{ return ''; }
  }

  

  async function usbProbeOnLoad(){
    if(!('serial' in navigator)) return;
    try{
      // If state says connected but we don't have an open port, reset
      if(state.usb.connected && !getUsbPort()){
        state.usb.connected=false;
      }
      const ports = await navigator.serial.getPorts();
      if(ports && ports.length){
        state.usb.available=true;
        // Pick first previously authorized port
        const p = ports[0];
        state.usb.info = getPortInfo(p);
        state.usb.lastError = '';
        // Try a quick open/close to verify it is accessible (does not keep it open)
        try{
          await p.open({ baudRate: state.settings.baudRate||19200, dataBits:8, stopBits:1, parity:'none', flowControl:'none' });
          await p.close();
        }catch(e){
          state.usb.lastError = String(e?.message||e);
          // Still "available", but might be busy/blocked
        }

        // Auto-reconnect if we have an authorized port
        if(!state.usb.connected) await usbAutoConnect('onload');
      } else {
        state.usb.available=false;
        state.usb.info='';
        state.usb.lastError='';
      }
      saveState();
      setUsbUi(!!state.usb.connected);
      if(state.usb.available && state.usb.lastError){
        logLine('USB Hinweis: Gerät erkannt, aber nicht geöffnet (' + state.usb.lastError + ')');
      } else if(state.usb.available){
        logLine('USB erkannt ' + (state.usb.info?('('+state.usb.info+')'):''));
      }
    }catch(e){
      // ignore
    }
  }

  function installUsbConnectDisconnectListeners(){
    bindShared();
    if(!('serial' in navigator)) return;
    try{
      navigator.serial.addEventListener('connect', async (ev)=>{
        try{
          const p = ev?.target || ev?.port || null;
          state.usb.available=true;
          state.usb.info = p ? getPortInfo(p) : state.usb.info;
          state.usb.lastError='';
          saveState();
          setUsbUi(!!state.usb.connected);
          logLine('USB Gerät verbunden ' + (state.usb.info?('('+state.usb.info+')'):''));
          toast('USB','Gerät verbunden.','ok');
          if(!state.usb.connected) scheduleUsbReconnect('device-connect');
        }catch{}
      });
      navigator.serial.addEventListener('disconnect', async ()=>{
        try{
          state.usb.available=false;
          state.usb.info='';
          state.usb.lastError='';
          // If the currently open port vanished, ensure we disconnect
          if(state.usb.connected) await usbDisconnect();
          saveState();
          setUsbUi(false);
          logLine('USB Gerät getrennt');
          toast('USB','Gerät getrennt.','warn');
        }catch{}
      });
    }catch{}
  }
async function usbConnect(){
    if(!('serial' in navigator)){
      toast('USB', 'WebSerial nur in Chrome/Edge verfügbar.', 'err');
      return;
    }
    try{
      setUsbStopRead(false);
      setUsbPort(await navigator.serial.requestPort());
      await getUsbPort().open({ baudRate: state.settings.baudRate||19200, dataBits:8, stopBits:1, parity:'none', flowControl:'none' });
      state.usb.connected=true;
      state.usb.info=getPortInfo(getUsbPort());
      saveState();
      setUsbUi(true);
      logLine('USB verbunden ' + (state.usb.info?('('+state.usb.info+')'):''));
      toast('USB','Verbunden.','ok');
      readLoop();
      setTimeout(()=>{ try{ mrcWriteLine('CMD_INIT'); }catch{} try{ requestMrcSync('usb-connect'); }catch{} }, 120);
    }catch(e){
      toast('USB','Verbindung fehlgeschlagen/abgebrochen: ' + String(e?.message||e), 'err');
      logLine('USB Fehler: ' + String(e?.message||e));
      await usbDisconnect();
    }
  }

  async function usbDisconnect(){
    try{
      setUsbStopRead(true);
      try{
        const activeReader = getUsbReader();
        if(activeReader){ await activeReader.cancel(); activeReader.releaseLock(); }
      }catch{}
      setUsbReader(null);
      try{
        const activePort = getUsbPort();
        if(activePort){ await activePort.close(); }
      }catch{}
      setUsbPort(null);
    } finally {
      state.usb.connected=false;
      state.usb.info='';
      saveState();
      setUsbUi(false);
      logLine('USB getrennt');
      toast('USB','Getrennt.','warn');
    }
  }

  async function readLoop(){
    const dec = new TextDecoder('utf-8');
    let buf='';
    while(getUsbPort()?.readable && !getUsbStopRead()){
      setUsbReader(getUsbPort().readable.getReader());
      try{
        while(!getUsbStopRead()){
          const {value,done} = await getUsbReader().read();
          if(done) break;
          if(value){
            buf += dec.decode(value, {stream:true});
            let idx;
            while((idx = buf.indexOf('\n')) >= 0){
              const line = buf.slice(0, idx).trim();
              buf = buf.slice(idx+1);
              if(line) onSerialLine(line);
            }
          }
        }
      } catch(e){
        logLine('USB Read Fehler: ' + String(e?.message||e));
      } finally {
        try{ getUsbReader()?.releaseLock(); }catch{}
        setUsbReader(null);
      }
    }
  
// If the loop ends unexpectedly (port closed), try to reconnect
if(!getUsbStopRead()){
  state.usb.connected=false;
  saveState();
  setUsbUi(false);
  scheduleUsbReconnect('readloop-end');
}
}

  function onSerialLine(line){
    bindShared();
    logLine('SERIAL: ' + line);
    if(handleMrcMetaLine(line)) return;
    const m = /^\s*\d+\s*,\s*([0-9A-Fa-f]+)\s*,\s*(\d+)\s*$/.exec(line);
    if(!m) return;
    updateMrcCounterFromLine(line);
    const chip = m[1].toUpperCase();
    const ts = parseInt(m[2], 10);
    updateMrcClock(ts, 'pass');
    enqueuePass(chip, ts, line);
  }

  
  // --------------------- Pass queue (messkritischer Kern zuerst) ---------------------
  let passQueue = [];
  let passQueueBusy = false;

  function enqueuePass(chip, ts, rawLine=''){
    bindShared();
    passQueue.push({ chip, ts, rawLine });
    if(passQueueBusy) return;
    passQueueBusy = true;
    setTimeout(processPassQueue, 0);
  }

  function processPassQueue(){
    bindShared();
    try{
      // Work through a small batch, then yield back to the browser.
      let n = 0;
      while(passQueue.length && n < 12){
        const item = passQueue.shift();
        try{
          handlePass(item.chip, item.ts);
        }catch(e){
          logLine('Pass-Queue Fehler: ' + String(e?.message||e));
        }
        n++;
      }
    } finally {
      if(passQueue.length){
        setTimeout(processPassQueue, 0);
      } else {
        passQueueBusy = false;
      }
    }
  }

// --------------------- RunLog collapse + resize ---------------------
  
  return {
    usbProbeOnLoad,
    usbConnect,
    usbDisconnect,
    setUsbUi,
    getPortInfo,
    installUsbConnectDisconnectListeners,
    onSerialLine,
    enqueuePass,
    processPassQueue
  };
})();
