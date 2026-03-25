window.TIMTIME_LOCALE = (function(){
  'use strict';

  function bindShared(){
    Object.assign(globalThis, window.TIMTIME_SHARED || {});
  }

  bindShared();
  const I18N = window.TIMTIME_I18N || {};

  function getUiLanguage(){
    return state?.settings?.language === 'en' ? 'en' : 'de';
  }
  function getUiLocale(){
    return getUiLanguage() === 'en' ? 'en-US' : 'de-DE';
  }
  function t(key, vars=null, fallback=''){
    let out = I18N[getUiLanguage()]?.[key];
    if(out == null) out = I18N.de?.[key];
    if(out == null) out = fallback || key;
    out = String(out);
    if(vars && typeof vars === 'object'){
      for(const [name, value] of Object.entries(vars)){
        out = out.replaceAll(`{${name}}`, String(value ?? ''));
      }
    }
    return typeof demojibake === 'function' ? demojibake(out) : out;
  }

  function msToTimeLegacyUnused(ms, decimals=3){
    if(ms==null) return '—';
    const s = ms/1000;
    const m = Math.floor(s/60);
    const rem = s - m*60;
    const dp = Math.max(0, Math.min(3, decimals|0));
    const remStr = rem.toFixed(dp).padStart(2 + (dp?dp+1:0), '0');
    return m>0 ? `${m}:${remStr}` : remStr;
  }

function pickTextColorForBg(hex){
  if(!hex || typeof hex!=='string') return '#fff';
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if(!m) return '#fff';
  const v=m[1];
  const r=parseInt(v.slice(0,2),16)/255;
  const g=parseInt(v.slice(2,4),16)/255;
  const b=parseInt(v.slice(4,6),16)/255;
  const toLin=(c)=>(c<=0.03928)?c/12.92:((c+0.055)/1.055)**2.4;
  const L=0.2126*toLin(r)+0.7152*toLin(g)+0.0722*toLin(b);
  return L>0.5 ? '#000' : '#fff';
}

  return {
    getUiLanguage,
    getUiLocale,
    t,
    msToTimeLegacyUnused,
    pickTextColorForBg
  };
})();

