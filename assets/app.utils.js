window.TIMTIME_UTILS = (function(){
  'use strict';

  function now(){ return Date.now(); }
  function uid(prefix){ return prefix + '_' + Math.random().toString(16).slice(2,10); }
  function clamp(n,a,b){ n=Number(n); return Math.max(a, Math.min(b,n)); }
  function clampInt(v,minV,maxV){
    const n = parseInt(v,10);
    if(!Number.isFinite(n)) return minV;
    return Math.max(minV, Math.min(maxV, n));
  }
  function demojibake(value){
    let out = String(value ?? '');
    const replacements = [
      [/ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â/g, '—'],
      [/ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢/g, '•'],
      [/Ã¢â‚¬â€/g, '—'],
      [/Ã¢â‚¬Â¦/g, '…'],
      [/â€¢/g, '•'],
      [/â€”/g, '—'],
      [/â€“/g, '–'],
      [/â€¦/g, '…'],
      [/ÃƒÆ’Ã†â€™Ãƒâ€¹Ã…â€œ/g, 'Ø'],
      [/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼/g, 'ü'],
      [/ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¼/g, 'ü'],
      [/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶/g, 'ö'],
      [/ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶/g, 'ö'],
      [/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¤/g, 'ä'],
      [/ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤/g, 'ä'],
      [/ÃƒÆ’Ã†â€™Ãƒâ€¦Ã¢â‚¬Å“/g, 'Ü'],
      [/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚â€“/g, 'Ö'],
      [/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚â€ž/g, 'Ä'],
      [/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Å¸/g, 'ß'],
      [/Ã„/g, 'Ä'],
      [/Ã–/g, 'Ö'],
      [/Ãœ/g, 'Ü'],
      [/Ã¤/g, 'ä'],
      [/Ã¶/g, 'ö'],
      [/Ã¼/g, 'ü'],
      [/ÃŸ/g, 'ß']
    ];
    for(const [pattern, replacement] of replacements){
      out = out.replace(pattern, replacement);
    }
    const badPattern = /Ã|Â|â|�/;
    const score = (s)=>{
      if(!s) return 0;
      let n = 0;
      for(const ch of String(s)){
        const code = ch.charCodeAt(0);
        if(ch === 'Ã' || ch === 'Â' || ch === 'â' || ch === '�') n += 3;
        else if((code >= 0 && code < 32 && ch !== '\n' && ch !== '\r' && ch !== '\t')) n += 5;
      }
      return n;
    };
    if(!badPattern.test(out)) return out;
    for(let i=0; i<4; i++){
      try{
        const bytes = new Uint8Array(Array.from(out, ch => ch.charCodeAt(0) & 0xff));
        const next = new TextDecoder('utf-8', { fatal:false }).decode(bytes);
        if(!next || next === out) break;
        if(score(next) >= score(out)) break;
        out = next;
        if(!badPattern.test(out)) break;
      }catch{
        break;
      }
    }
    return out;
  }
  function esc(s){
    return demojibake(String(s ?? '')).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function msToTime(ms, decimals=3){
    if(ms==null) return '\u2014';
    const s = ms/1000;
    const m = Math.floor(s/60);
    const rem = s - m*60;
    const dp = Math.max(0, Math.min(3, decimals|0));
    const remStr = rem.toFixed(dp).padStart(2 + (dp?dp+1:0), '0');
    return m>0 ? `${m}:${remStr}` : remStr;
  }

  return { now, uid, clamp, clampInt, demojibake, esc, msToTime };
})();
