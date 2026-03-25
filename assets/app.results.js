window.TIMTIME_RESULTS = (function(){
  'use strict';
  function bindShared(){ Object.assign(globalThis, window.TIMTIME_SHARED || {}); }
  function formatDiscordDateTime(ts){
    bindShared();
    if(!ts) return '—';
    try{ return new Date(ts).toLocaleString('de-DE'); }catch{ return '—'; }
  }

  function getTrackById(trackId){
    bindShared();
    return state.tracks.tracks.find(t=>t.id===trackId) || null;
  }

  function buildRacePositionTimeline(race, laps){
    bindShared();
    const ordered = (laps||[]).filter(l=>l && l.lapMs!=null).slice().sort((a,b)=>{
      const at = Number(a.ts||a.time||0), bt = Number(b.ts||b.time||0);
      if(at!==bt) return at-bt;
      const al = Number(a.lapNo||0), bl = Number(b.lapNo||0);
      if(al!==bl) return al-bl;
      return String(driverKeyForLapGlobal(a)).localeCompare(String(driverKeyForLapGlobal(b)),'de');
    });
    const byDriver = new Map();
    for(const lap of ordered){
      const did = String(driverKeyForLapGlobal(lap)||'').trim();
      if(!did) continue;
      if(!byDriver.has(did)) byDriver.set(did, []);
      byDriver.get(did).push(lap);
    }
    const driverIds = Array.from(byDriver.keys());
    const maxLap = Math.max(0, ...Array.from(byDriver.values()).map(arr=>arr.length));
    const history = new Map(driverIds.map(did=>[did, []]));
    for(let lapNo=1; lapNo<=maxLap; lapNo++){
      const snapshot = [];
      for(const did of driverIds){
        const dlaps = byDriver.get(did) || [];
        const upto = dlaps.slice(0, Math.min(lapNo, dlaps.length));
        snapshot.push(...upto);
      }
      const standings = computeDriverStandingsGlobal(snapshot);
      const posMap = new Map(standings.map((s,idx)=>[s.id, idx+1]));
      for(const did of driverIds){
        history.get(did).push({ lap: lapNo, pos: posMap.get(did) || standings.length || driverIds.length || 1 });
      }
    }
    return driverIds.map(driverId=>({
      driverId,
      name: driverNameByIdGlobal(driverId),
      color: (getDriver(driverId)?.color)||'',
      points: history.get(driverId) || []
    }));
  }

  function buildRaceSummaryData(raceId){
    bindShared();
    const race = getRaceById(raceId);
    if(!race) return null;
    const laps = getRelevantRaceLaps(raceId, state.session.laps||[]);
    const track = getTrackById(race.trackId) || getActiveTrack();
    const freeDriving = isFreeDrivingRace(race);
    const standings = computeDriverStandingsGlobal(laps);
    const top3 = standings.slice(0,3);
    const bestLap = (laps||[]).filter(l=>l && l.lapMs!=null).slice().sort((a,b)=>(a.lapMs||9e15)-(b.lapMs||9e15))[0] || null;
    const chart = freeDriving ? [] : buildRacePositionTimeline(race, laps);
    const title = freeDriving ? 'Freies Fahren' : 'Rennergebnis';
    return {
      raceId,
      race,
      laps,
      track,
      freeDriving,
      standings,
      top3,
      bestLap,
      chart,
      title,
      subtitle: `${getTrackPlainName(track)} • ${race.submode || getModeLabel() || race.mode || 'Session'}`
    };
  }


  function buildLapTableRows(summary){
    bindShared();
    const standings = Array.isArray(summary?.standings) ? summary.standings : [];
    const laps = Array.isArray(summary?.laps) ? summary.laps.filter(l=>l && l.lapMs!=null) : [];
    const byDriver = new Map();
    for(const lap of laps){
      const did = driverKeyForLapGlobal(lap);
      if(!did) continue;
      if(!byDriver.has(did)) byDriver.set(did, []);
      byDriver.get(did).push(lap);
    }
    const rows = standings.map((row, idx)=>{
      const driverId = String(row?.id || '').trim();
      const driverLaps = (byDriver.get(driverId) || []).slice().sort((a,b)=>{
        const ao = Number.isFinite(Number(a?.lapNo)) ? Number(a.lapNo) : Infinity;
        const bo = Number.isFinite(Number(b?.lapNo)) ? Number(b.lapNo) : Infinity;
        if(ao !== bo) return ao - bo;
        const at = Number(a?.ts || a?.time || 0);
        const bt = Number(b?.ts || b?.time || 0);
        return at - bt;
      });
      const bestLapMs = Number.isFinite(Number(row?.bestMs)) ? Number(row.bestMs) : (driverLaps.reduce((m,l)=>Math.min(m, Number(l?.lapMs)||Infinity), Infinity));
      const lapItems = driverLaps.map((lap, lapIdx)=>{
        const lapMs = Number(lap?.lapMs);
        const lapNo = Number.isFinite(Number(lap?.lapNo)) ? Number(lap.lapNo) : (lapIdx + 1);
        const txt = `${lapNo}. ${Number.isFinite(lapMs) ? msToTime(lapMs,3) : '—'}`;
        return {
          lapNo,
          lapMs: Number.isFinite(lapMs) ? lapMs : null,
          text: txt,
          isBest: Number.isFinite(lapMs) && Number.isFinite(bestLapMs) && lapMs === bestLapMs
        };
      });
      return {
        id: driverId,
        pos: idx + 1,
        name: String(row?.name || driverNameByIdGlobal(driverId) || '—'),
        best: Number.isFinite(bestLapMs) ? msToTime(bestLapMs,3) : '—',
        bestLapMs: Number.isFinite(bestLapMs) ? bestLapMs : null,
        lapCount: lapItems.length,
        laps: lapItems,
        color: getDriver(driverId)?.color || '',
        _lapLines: lapItems.length ? chunkTextList(lapItems.map(x=>x.text), 46) : ['Keine gültigen Runden']
      };
    });
    return rows;
  }

  function chunkTextList(items, maxLen=46){
    bindShared();
    const out = [];
    let line = '';
    for(const raw of (items||[])){
      const item = String(raw || '').trim();
      if(!item) continue;
      const next = line ? `${line}  •  ${item}` : item;
      if(next.length > maxLen && line){
        out.push(line);
        line = item;
      } else {
        line = next;
      }
    }
    if(line) out.push(line);
    return out.length ? out : ['—'];
  }

  async function renderRaceSummaryBlob(summary){
    bindShared();
    const width = 1600, height = 900;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    const bg = '#0f1218', panel='#181c24', panel2='#1d222c', text='#eff3f8', muted='#a5afbe', grid='#3b4658';
    function rr(x,y,w,h,r,fill){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); if(fill){ ctx.fillStyle=fill; ctx.fill(); } }
    function txt(str,x,y,font,color,align='left'){ ctx.font=font; ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='top'; ctx.fillText(String(str||''),x,y); }
    function fitText(str,maxWidth,startPx,weight='700'){ let px=startPx; for(; px>=16; px-=2){ ctx.font=`${weight} ${px}px sans-serif`; if(ctx.measureText(String(str||'')).width<=maxWidth) break; } return `${weight} ${px}px sans-serif`; }
    function clipCircle(x,y,r){ ctx.save(); ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.closePath(); ctx.clip(); }
    function drawAvatarOrInitial(row,cx,cy,r){
      const avatarSrc = row?.avatarUrl || getDriverAvatarDataUrl(row?.id);
      return loadImageFromUrl(avatarSrc).then(img=>{
        ctx.save();
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.closePath();
        ctx.fillStyle = '#10141b'; ctx.fill();
        if(img){
          ctx.clip();
          ctx.drawImage(img, cx-r, cy-r, r*2, r*2);
        } else {
          ctx.fillStyle = '#293142';
          ctx.fill();
          const ini = String((row?.name||'').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase() || '?');
          txt(ini, cx, cy-18, '700 30px sans-serif', text, 'center');
        }
        ctx.restore();
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.closePath();
        ctx.lineWidth = 4; ctx.strokeStyle = '#e8edf5'; ctx.stroke();
      });
    }
    ctx.fillStyle = bg; ctx.fillRect(0,0,width,height);
    for(let i=0;i<width;i+=82){ ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i-220,height); ctx.stroke(); }
    rr(40,30,width-80,104,28,panel);
    txt('TimTime Race Summary',70,54,'700 44px sans-serif',text);
    txt(summary.subtitle || 'Session', width-70, 60, '400 24px sans-serif', muted, 'right');
    rr(40,160,460,680,28,panel);
    rr(530,160,1030,680,28,panel);
    txt(summary.freeDriving ? 'Bestzeiten' : 'Podium',70,190,'700 30px sans-serif',text);
    const standings = summary.standings || [];
    if(summary.freeDriving){
      const rows = standings.slice(0,8);
      rows.forEach((row,idx)=>{
        const y = 250 + idx*68;
        rr(70,y,400,54,18,panel2);
        txt(String(idx+1), 96, y+11, '700 24px sans-serif', muted);
        txt(row.name||'—', 140, y+10, fitText(row.name||'—', 170, 24), text);
        txt(row.bestMs!=null ? msToTime(row.bestMs,3) : '—', 450, y+11, '700 24px monospace', text, 'right');
      });
      txt('Schnellste Runde',70,810-90,'400 22px sans-serif',muted);
      txt(summary.bestLap ? `${driverNameByIdGlobal(driverKeyForLapGlobal(summary.bestLap))} • ${msToTime(summary.bestLap.lapMs,3)}` : '—',70,810-56,'700 28px sans-serif',text);
    } else {
      const podium = [standings[1]||null, standings[0]||null, standings[2]||null];
      const podiumColors = ['#b9c1c9','#e8bf5a','#b07a52'];
      const podiumHeights = [132,180,96];
      const xs = [95,225,355];
      const baseY = 610;
      const avatarPromises = [];
      podium.forEach((row,idx)=>{
        const x = xs[idx], w=110, h=podiumHeights[idx], y=baseY-h;
        rr(x,y,w,h,18,podiumColors[idx]);
        txt(String(idx===1?1:(idx===0?2:3)), x+w/2, y+26, '700 52px sans-serif', '#191919', 'center');
        const name = row?.name || '—';
        const avatarY = y-86;
        const nameY = y-34;
        avatarPromises.push(drawAvatarOrInitial(row, x+w/2, avatarY, 42));
        txt(name, x+w/2, nameY, fitText(name, 190, 24), text, 'center');
      });
      await Promise.all(avatarPromises);
      txt('Schnellste Runde',70,665,'400 22px sans-serif',muted);
      txt(summary.bestLap ? `${driverNameByIdGlobal(driverKeyForLapGlobal(summary.bestLap))} • ${msToTime(summary.bestLap.lapMs,3)}` : '—',70,700,'700 28px sans-serif',text);
      txt('Beendet',70,755,'400 22px sans-serif',muted);
      txt(formatDiscordDateTime(summary.race?.endedAt),70,790,'700 28px sans-serif',text);
    }
    txt(summary.freeDriving ? 'Bestzeiten der Session' : 'Positionsverlauf',560,190,'700 30px sans-serif',text);
    rr(590,245,920,515,24,panel2);
    if(summary.freeDriving){
      const rows = standings.slice(0,10);
      const barX = 640, barW = 760, barY = 300, rowH = 38;
      const values = rows.map(r=>Number(r.bestMs||0)).filter(Boolean);
      const min = values.length ? Math.min(...values) : 0;
      const max = values.length ? Math.max(...values) : 1;
      rows.forEach((row,idx)=>{
        const color = getChartSeriesColor({color:getDriver(row.id)?.color}, idx);
        const y = barY + idx*46;
        txt(row.name||'—', 620, y+3, fitText(row.name||'—', 190, 22), text);
        rr(860, y+2, barW, rowH, 16, '#242b36');
        const frac = max===min ? 0.82 : (1 - ((row.bestMs-min)/(max-min))*0.72);
        rr(860, y+2, Math.max(80, Math.min(barW, barW*frac)), rowH, 16, color);
        txt(row.bestMs!=null ? msToTime(row.bestMs,3) : '—', 1570, y+6, '700 20px monospace', text, 'right');
      });
    } else {
      const chart = summary.chart || [];
      const chartColorMap = buildDistinctSeriesColorMap(chart);
      const plot = { x:650, y:285, w:800, h:420 };
      const maxLap = Math.max(2, ...chart.map(c=>Math.max(0,...c.points.map(p=>p.lap||0))), 2);
      const maxPos = Math.max(2, standings.length, 2);
      for(let i=0;i<maxLap;i++){
        const x = plot.x + (i*(plot.w-40)/Math.max(1,maxLap-1));
        ctx.strokeStyle = grid; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,plot.y); ctx.lineTo(x,plot.y+plot.h); ctx.stroke();
        txt(String(i+1), x, plot.y+plot.h+10, '400 16px sans-serif', muted, 'center');
      }
      for(let pos=1; pos<=maxPos; pos++){
        const y = plot.y + ((pos-1)*(plot.h-20)/Math.max(1,maxPos-1));
        ctx.strokeStyle = grid; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(plot.x,y); ctx.lineTo(plot.x+plot.w,y); ctx.stroke();
        txt(String(pos), plot.x-18, y-10, '400 16px sans-serif', muted, 'right');
      }
      const overlapLaneMap = new Map();
      const overlapGapPx = 9;
      chart.forEach((series,idx)=>{
        const sid = String(series?.driverId || series?.id || series?.name || idx);
        (series?.points||[]).forEach((p)=>{
          const lap = Number(p?.lap || 1);
          const pos = Number(p?.pos || 1);
          const key = `${lap}|${pos}`;
          if(!overlapLaneMap.has(key)) overlapLaneMap.set(key, []);
          overlapLaneMap.get(key).push(sid);
        });
      });
      overlapLaneMap.forEach((arr,key)=>{
        const uniq = [];
        for(const sid of arr){ if(!uniq.includes(sid)) uniq.push(sid); }
        overlapLaneMap.set(key, uniq);
      });
      const overlapXGapPx = 10;
      const overlapYGapPx = 7;
      function getChartPointCoords(series, idx, p){
        const sid = String(series?.driverId || series?.id || series?.name || idx);
        const lap = Number(p?.lap || 1);
        const pos = Number(p?.pos || 1);
        const baseX = plot.x + ((lap-1)*(plot.w-40)/Math.max(1,maxLap-1));
        const baseY = plot.y + ((pos-1)*(plot.h-20)/Math.max(1,maxPos-1));
        const laneList = overlapLaneMap.get(`${lap}|${pos}`) || [sid];
        const laneIdx = Math.max(0, laneList.indexOf(sid));
        const center = (laneList.length - 1) / 2;
        const laneShift = (laneIdx - center);
        const x = baseX + (laneShift * overlapXGapPx);
        const y = baseY + (laneShift * overlapYGapPx);
        return { x, y };
      }
      chart.forEach((series,idx)=>{
        const lineColor = chartColorMap.get(String(series?.driverId || series?.id || series?.name || idx)) || getChartSeriesColor(series, idx);
        const rgb = safeHexToRgb(lineColor, [94,151,255]);
        ctx.strokeStyle = `rgb(${rgb.join(',')})`;
        ctx.fillStyle = `rgb(${rgb.join(',')})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        series.points.forEach((p,pi)=>{
          const {x,y} = getChartPointCoords(series, idx, p);
          if(pi===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
        ctx.stroke();
        series.points.forEach(p=>{
          const {x,y} = getChartPointCoords(series, idx, p);
          ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
          ctx.strokeStyle = `rgb(${rgb.join(',')})`; ctx.lineWidth=5;
        });
      });
      let lx=620, ly=785;
      chart.forEach((series,idx)=>{
        const lineColor = chartColorMap.get(String(series?.driverId || series?.id || series?.name || idx)) || getChartSeriesColor(series, idx);
        const rgb = safeHexToRgb(lineColor, [94,151,255]);
        rr(lx,ly,170,34,17,'#212733');
        ctx.fillStyle=`rgb(${rgb.join(',')})`; ctx.beginPath(); ctx.arc(lx+18, ly+17, 8, 0, Math.PI*2); ctx.fill();
        txt(series.name||'—', lx+36, ly+6, fitText(series.name||'—', 120, 18), text);
        lx += 184;
        if(lx>1360){ lx=620; ly+=42; }
      });
    }
    rr(40,855,width-80,26,12,'#161a21');
    txt(summary.freeDriving ? 'Automatische Discord-Zusammenfassung • Freies Fahren' : 'Automatische Discord-Zusammenfassung • Rennen', 60, 858, '400 16px sans-serif', muted);
    const blob = await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
    return blob;
  }


  function wrapTokensToLines(ctx, tokens, maxWidth){
    bindShared();
    const lines = [];
    let current = '';
    for(const token of (tokens||[])) {
      const probe = current ? `${current}    ${token}` : token;
      if(current && ctx.measureText(probe).width > maxWidth){
        lines.push(current);
        current = token;
      } else {
        current = probe;
      }
    }
    if(current) lines.push(current);
    return lines.length ? lines : ['—'];
  }

  async function renderRaceLapTableBlob(summary){
    bindShared();
    const rows = buildLapTableRows(summary);
    const width = 1900;
    const margins = { left: 44, right: 44, top: 36, bottom: 36 };
    const col = { pos: 70, driver: 360, best: 180 };
    const lapsX = margins.left + col.pos + col.driver + col.best + 48;
    const lapsWidth = width - margins.right - lapsX;
    const headH = 122;
    const tableHeadH = 44;
    const rowGap = 12;
    const rowHeights = [];
    const canvas = document.createElement('canvas');
    const probe = canvas.getContext('2d');
    probe.font = '500 24px monospace';
    for(const row of rows){
      const lines = wrapTokensToLines(probe, row.laps, lapsWidth - 24);
      row._lapLines = lines;
      rowHeights.push(Math.max(60, 22 + lines.length * 30));
    }
    const tableHeight = rowHeights.reduce((a,b)=>a+b,0) + Math.max(0, rows.length-1)*rowGap;
    const height = margins.top + headH + 18 + tableHeadH + 12 + tableHeight + margins.bottom;
    canvas.width = width;
    canvas.height = Math.max(420, height);
    const ctx = canvas.getContext('2d');
    const bg = '#0f1218', panel='#181c24', panel2='#1d222c', text='#eff3f8', muted='#a5afbe', border='#2a3342';
    function rr(x,y,w,h,r,fill,stroke=''){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); if(fill){ ctx.fillStyle=fill; ctx.fill(); } if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); } }
    function txt(str,x,y,font,color,align='left'){ ctx.font=font; ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='top'; ctx.fillText(String(str||''),x,y); }
    function fitText(str,maxWidth,startPx,weight='700'){ let px=startPx; for(; px>=16; px-=1){ ctx.font=`${weight} ${px}px sans-serif`; if(ctx.measureText(String(str||'')).width<=maxWidth) break; } return `${weight} ${px}px sans-serif`; }

    ctx.fillStyle = bg; ctx.fillRect(0,0,width,canvas.height);
    for(let i=0;i<width;i+=92){ ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i-260,canvas.height); ctx.stroke(); }
    rr(margins.left, margins.top, width - margins.left - margins.right, headH, 26, panel);
    txt('TimTime Session-Laptabelle', margins.left + 28, margins.top + 24, '700 42px sans-serif', text);
    txt(summary.subtitle || 'Session', width - margins.right - 28, margins.top + 28, '400 24px sans-serif', muted, 'right');
    const metaY = margins.top + 78;
    const race = summary?.race || {};
    txt(`Session: ${race.name || '—'}`, margins.left + 30, metaY, '500 18px sans-serif', muted);
    txt(`Beendet: ${formatDiscordDateTime(race.endedAt)}`, margins.left + 430, metaY, '500 18px sans-serif', muted);
    txt(`Fahrer: ${rows.length}`, width - margins.right - 28, metaY, '500 18px sans-serif', muted, 'right');

    const top = margins.top + headH + 18;
    rr(margins.left, top, width - margins.left - margins.right, tableHeadH, 18, '#202633');
    txt('#', margins.left + 24, top + 8, '700 22px sans-serif', text);
    txt('Fahrer', margins.left + col.pos + 18, top + 8, '700 22px sans-serif', text);
    txt('Bestzeit', margins.left + col.pos + col.driver + 18, top + 8, '700 22px sans-serif', text);
    txt('Rundenzeiten', lapsX + 12, top + 8, '700 22px sans-serif', text);

    let y = top + tableHeadH + 12;
    rows.forEach((row, idx)=>{
      const h = rowHeights[idx];
      rr(margins.left, y, width - margins.left - margins.right, h, 18, idx % 2 ? panel : panel2, border);
      txt(String(row.pos), margins.left + 28, y + 16, '700 26px sans-serif', muted);
      txt(row.name, margins.left + col.pos + 18, y + 16, fitText(row.name, col.driver - 36, 28), text);
      txt(row.best, margins.left + col.pos + col.driver + 18, y + 16, '700 24px monospace', text);
      txt(`${row.lapCount} Runden`, margins.left + col.pos + col.driver + 18, y + 48, '400 16px sans-serif', muted);
      let ly = y + 14;
      for(const line of row._lapLines){
        txt(line, lapsX + 12, ly, '500 24px monospace', text);
        ly += 30;
      }
      y += h + rowGap;
    });
    rr(margins.left, canvas.height - 28, width - margins.left - margins.right, 12, 6, '#161a21');
    txt('Session-Webhook • Fahrer, Bestzeit und komplette Rundenliste als Grafik', margins.left + 14, canvas.height - 27, '400 14px sans-serif', muted);
    const blob = await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
    return blob;
  }


  function buildLapColumnData(summary){
    bindShared();
    const rows = buildLapTableRows(summary);
    const maxLaps = rows.reduce((m,row)=>Math.max(m, Array.isArray(row.laps)?row.laps.length:0), 0);
    return { rows, maxLaps };
  }

  async function renderRaceLapColumnsBlob(summary){
    bindShared();
    const { rows, maxLaps } = buildLapColumnData(summary);
    const rowColorMap = buildDistinctSeriesColorMap(rows.map((row, idx)=>({ id:row.id, name:row.name, color:row.color, idx })));
    const width = 1600;
    const margins = { left: 36, right: 36, top: 30, bottom: 28 };
    const colGap = 14;
    const maxColsPerRow = rows.length > 8 ? 4 : rows.length > 6 ? 5 : 6;
    const chunkedRows = [];
    for(let i=0; i<rows.length; i += maxColsPerRow) chunkedRows.push(rows.slice(i, i + maxColsPerRow));
    const contentWidth = width - margins.left - margins.right;
    const headerH = 116;
    const lapHeadH = 42;
    const rowH = 34;
    const bandGap = 22;
    const perBandHeight = headerH + 12 + lapHeadH + Math.max(1, maxLaps) * rowH;
    const height = Math.max(280, margins.top + 84 + chunkedRows.length * perBandHeight + Math.max(0, chunkedRows.length - 1) * bandGap + margins.bottom);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const bg = '#0f1218', panel = '#181c24', panel2 = '#1d222c', text = '#eff3f8', muted = '#a5afbe', border = '#2a3342', accent = '#5e97ff', bestFill = '#183221', bestStroke = '#2ed17d', overallFill = '#2d2312', overallStroke = '#f2c14e';
    const overallBestMs = rows.reduce((m,row)=>Number.isFinite(row.bestLapMs) ? Math.min(m,row.bestLapMs) : m, Infinity);
    function rr(x,y,w,h,r,fill,stroke=''){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); if(fill){ ctx.fillStyle=fill; ctx.fill(); } if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); } }
    function txt(str,x,y,font,color,align='left'){ ctx.font=font; ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='top'; ctx.fillText(String(str||''),x,y); }
    function fitText(str,maxWidth,startPx,weight='700'){ let px=startPx; for(; px>=14; px-=1){ ctx.font=`${weight} ${px}px sans-serif`; if(ctx.measureText(String(str||'')).width<=maxWidth) break; } return `${weight} ${px}px sans-serif`; }

    ctx.fillStyle = bg; ctx.fillRect(0,0,width,height);
    for(let i=0;i<width;i+=92){ ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i-220,height); ctx.stroke(); }
    rr(margins.left, margins.top, contentWidth, height - margins.top - margins.bottom, 26, panel, border);
    txt('Rundenübersicht', margins.left + 24, margins.top + 18, '700 34px sans-serif', text);
    txt('Fahrer oben • beste Runde farbig markiert', width - margins.right - 24, margins.top + 22, '400 18px sans-serif', muted, 'right');
    let bandY = margins.top + 68;
    chunkedRows.forEach((group, groupIdx)=>{
      const colCount = Math.max(1, group.length || 1);
      const colWidth = Math.max(180, Math.floor((contentWidth - colGap * Math.max(0, colCount - 1)) / colCount));
      for(let i=0;i<colCount;i++){
        const row = group[i] || { name:'—', best:'—', lapCount:0, laps:[], bestLapMs:null, pos:0, color:'' };
        const x = margins.left + i * (colWidth + colGap);
        const headerBg = groupIdx % 2 ? panel2 : '#202633';
        rr(x, bandY, colWidth, headerH, 18, headerBg, border);
        txt(`${row.pos}. ${row.name}`, x + 14, bandY + 14, fitText(`${row.pos}. ${row.name}`, colWidth - 28, 28), text);
        const lineColor = rowColorMap.get(String(row.id || row.name || ((groupIdx * maxColsPerRow) + i))) || getChartSeriesColor({color:row.color}, (groupIdx * maxColsPerRow) + i);
        rr(x + 14, bandY + 56, colWidth - 28, 8, 4, lineColor);
        txt(`Bestzeit ${row.best}`, x + 14, bandY + 72, '700 20px monospace', accent);
        txt(`${row.lapCount} Runden`, x + 14, bandY + 96, '400 15px sans-serif', muted);
        rr(x, bandY + headerH + 12, colWidth, lapHeadH, 14, '#151922', border);
        txt('Runden', x + 14, bandY + headerH + 20, '700 18px sans-serif', text);
        for(let lapIdx=0; lapIdx<Math.max(1, maxLaps); lapIdx++){
          const y = bandY + headerH + 12 + lapHeadH + lapIdx * rowH;
          const lap = row.laps[lapIdx] || null;
          let fill = lapIdx % 2 ? '#151922' : '#12161d';
          let stroke = '';
          let color = lap ? text : muted;
          if(lap?.isBest){ fill = bestFill; stroke = bestStroke; }
          if(lap?.isBest && Number(lap?.lapMs) === Number(overallBestMs)){ fill = overallFill; stroke = overallStroke; }
          rr(x, y, colWidth, rowH - 4, 10, fill, stroke);
          txt(lap ? lap.text : `${lapIdx+1}: —`, x + 14, y + 6, '500 17px monospace', color);
        }
      }
      bandY += perBandHeight + bandGap;
    });
    txt('Session-Webhook • Summary + Rundenübersicht', margins.left + 10, height - margins.bottom + 2, '400 14px sans-serif', muted);
    return await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
  }


  async function renderRaceWebhookCompositeBlob(summary){
    bindShared();
    const summaryBlob = await renderRaceSummaryBlob(summary);
    const lapBlob = await renderRaceLapColumnsBlob(summary);
    const summaryImg = await createImageBitmap(summaryBlob);
    const lapImg = await createImageBitmap(lapBlob);
    const width = Math.max(summaryImg.width, lapImg.width);
    const gap = 26;
    const pad = 24;
    const height = pad + summaryImg.height + gap + lapImg.height + pad;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f1218';
    ctx.fillRect(0,0,width,height);
    ctx.drawImage(summaryImg, Math.floor((width-summaryImg.width)/2), pad);
    ctx.drawImage(lapImg, Math.floor((width-lapImg.width)/2), pad + summaryImg.height + gap);
    return await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
  }



  async function renderRaceDayWebhookBlob(raceDayId){
    bindShared();
    const data = getRaceDayWebhookTableData(raceDayId);
    const { rd, tracks, placementHeaders, table1Rows, table2Rows, createdAt } = data;
    const width = 1800;
    const margins = { left: 36, right: 36, top: 30, bottom: 30 };
    const gap = 24;
    const titleH = 118;
    const panelGap = 22;
    const driverColW = 220;
    const minTrackColW = 150;
    const statColW = 86;
    const bestColW = 150;
    const fastestColW = 118;
    const table1TrackW = tracks.length ? Math.max(minTrackColW, Math.floor((width - margins.left - margins.right - driverColW) / Math.max(1, tracks.length))) : minTrackColW;
    const table1Cols = [driverColW].concat(tracks.map(()=>table1TrackW));
    const table1H = 66 + 42 + Math.max(1, table1Rows.length) * 34;
    const table2Cols = [driverColW].concat(placementHeaders.map(()=>statColW), [bestColW, fastestColW]);
    const table2H = 66 + 42 + Math.max(1, table2Rows.length) * 34;
    const height = margins.top + titleH + panelGap + table1H + gap + table2H + margins.bottom;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const bg = '#0f1218', panel='#181c24', panel2='#1d222c', text='#eff3f8', muted='#a5afbe', border='#2a3342', header='#202633', accent='#5e97ff', bestFill='#183221', bestStroke='#2ed17d';
    function rr(x,y,w,h,r,fill,stroke=''){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); if(fill){ ctx.fillStyle=fill; ctx.fill(); } if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); } }
    function txt(str,x,y,font,color,align='left'){ ctx.font=font; ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='top'; ctx.fillText(String(str||''),x,y); }
    function fitText(str,maxWidth,startPx,weight='700'){ let px=startPx; for(; px>=12; px-=1){ ctx.font=`${weight} ${px}px sans-serif`; if(ctx.measureText(String(str||'')).width<=maxWidth) break; } return `${weight} ${px}px sans-serif`; }
    function drawTable(panelX, panelY, panelW, panelH, title, subtitle, columns, headerLabels, rows, rowRenderer){
      rr(panelX, panelY, panelW, panelH, 24, panel, border);
      txt(title, panelX + 22, panelY + 18, '700 28px sans-serif', text);
      txt(subtitle, panelX + panelW - 22, panelY + 22, '400 16px sans-serif', muted, 'right');
      let x = panelX;
      const headY = panelY + 66;
      columns.forEach((w, idx)=>{
        rr(x, headY, w, 42, idx===0?16:10, header, border);
        txt(headerLabels[idx]||'', x + (idx===0?14:w/2), headY + 10, fitText(headerLabels[idx]||'', w-18, 18, '700'), text, idx===0?'left':'center');
        x += w;
      });
      let y = headY + 42;
      rows.forEach((row, rowIdx)=>{ rowRenderer({ row, rowIdx, y, panelX, columns }); y += 34; });
      if(!rows.length) txt('Keine Daten', panelX + 20, headY + 54, '500 18px sans-serif', muted);
    }

    ctx.fillStyle = bg; ctx.fillRect(0,0,width,height);
    for(let i=0;i<width;i+=92){ ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i-220,height); ctx.stroke(); }
    rr(margins.left, margins.top, width - margins.left - margins.right, titleH, 26, panel, border);
    txt('TimTime Renntag-Auswertung', margins.left + 28, margins.top + 24, '700 42px sans-serif', text);
    txt(rd?.name || 'Renntag', margins.left + 28, margins.top + 74, '500 22px sans-serif', muted);
    txt(`${new Date(createdAt).toLocaleDateString('de-DE')} • ${tracks.length} Strecke${tracks.length===1?'':'n'} • ${table1Rows.length} Fahrer`, width - margins.right - 28, margins.top + 30, '500 20px sans-serif', muted, 'right');
    txt('1) Schnellste Runde je Fahrer und Strecke • 2) Wie oft Platz 1, 2, 3 … plus schnellste Rennrunde', width - margins.right - 28, margins.top + 74, '400 16px sans-serif', accent, 'right');

    const panelX = margins.left;
    const panelW = width - margins.left - margins.right;
    let curY = margins.top + titleH + panelGap;
    drawTable(panelX, curY, panelW, table1H, 'Bestzeiten je gefahrene Strecke', 'Fahrer links • pro Strecke die schnellste Runde', table1Cols, ['Fahrer', ...tracks.map(t=>t.trackDisplayName || t.trackName)], table1Rows, ({row,rowIdx,y,panelX,columns})=>{
      let x = panelX;
      const band = rowIdx % 2 ? panel2 : '#151922';
      columns.forEach((w, idx)=>{ rr(x, y, w, 34, idx===0?12:8, band, border); x += w; });
      x = panelX;
      txt(row.driverName, x + 14, y + 8, fitText(row.driverName, columns[0]-20, 18), text); x += columns[0];
      row.cells.forEach((cell, idx)=>{
        const topRow = tracks[idx]?.rows?.[0] || null;
        const isBest = cell !== '—' && topRow && topRow.driverId === row.driverId;
        if(isBest) rr(x+4, y+4, columns[idx+1]-8, 26, 8, bestFill, bestStroke);
        txt(cell, x + columns[idx+1]/2, y + 8, '700 16px monospace', cell==='—'?muted:text, 'center');
        x += columns[idx+1];
      });
    });
    curY += table1H + gap;
    drawTable(panelX, curY, panelW, table2H, 'Platzierungen und schnellste Rennrunden', 'Wie oft Platz 1, 2, 3 … plus Tagesbestzeit und Anzahl schnellster Rennrunden', table2Cols, ['Fahrer', ...placementHeaders, 'Bestzeit', 'SR'], table2Rows, ({row,rowIdx,y,panelX,columns})=>{
      let x = panelX;
      const band = rowIdx % 2 ? panel2 : '#151922';
      columns.forEach((w, idx)=>{ rr(x, y, w, 34, idx===0?12:8, band, border); x += w; });
      x = panelX;
      txt(row.driverName, x + 14, y + 8, fitText(row.driverName, columns[0]-20, 18), text); x += columns[0];
      row.placeCounts.forEach((val, idx)=>{ txt(val, x + columns[idx+1]/2, y + 8, '700 16px monospace', val?text:muted, 'center'); x += columns[idx+1]; });
      txt(row.bestDayMs!=null ? msToTime(row.bestDayMs,3) : '—', x + columns[columns.length-2]/2, y + 8, '700 16px monospace', row.bestDayMs!=null?text:muted, 'center'); x += columns[columns.length-2];
      txt(row.fastestLapCount, x + columns[columns.length-1]/2, y + 8, '700 16px monospace', row.fastestLapCount?accent:muted, 'center');
    });
    return await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
  }

  async function renderSeasonWebhookBlob(seasonId){
    bindShared();
    const season = (state.season?.seasons||[]).find(x=>x.id===seasonId) || null;
    if(!season) throw new Error('Saison nicht gefunden');
    const champ = getChampionshipData(seasonId, getChampionshipSettings());
    const stats = getSeasonStatisticsData(seasonId);
    const createdAt = season.createdAt || Date.now();
    const width = 1800;
    const margins = { left:36, right:36, top:30, bottom:30 };
    const titleH = 126;
    const sectionGap = 24;
    const cardGap = 18;
    const cardCols = 4;
    const cardW = Math.floor((width - margins.left - margins.right - (cardGap * (cardCols - 1))) / cardCols);
    const cardH = 124;
    const tableTopRows = (champ.rows||[]).slice(0, 10);
    const statTopRows = (stats.rows||[]).slice(0, 10);
    const champCols = [70, 360, 150, 150, 120, 120, 120];
    const statCols = [70, 360, 110, 110, 110, 120, 180];
    const tableHeaderH = 42;
    const tableRowH = 34;
    const tableTitleH = 64;
    const champTableH = tableTitleH + tableHeaderH + Math.max(1, tableTopRows.length) * tableRowH;
    const statTableH = tableTitleH + tableHeaderH + Math.max(1, statTopRows.length) * tableRowH;
    const height = margins.top + titleH + sectionGap + cardH + sectionGap + champTableH + sectionGap + statTableH + margins.bottom;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const bg = '#0f1218';
    const panel = '#181c24';
    const panel2 = '#1d222c';
    const text = '#eff3f8';
    const muted = '#a5afbe';
    const border = '#2a3342';
    const header = '#202633';
    const accent = '#7d5cff';
    const accent2 = '#4ea1ff';
    const positive = '#2ed17d';
    const totalDiscardedRacePoints = (champ.rows||[]).reduce((sum, row)=>sum + (Number(row.discardedRacePoints)||0), 0);
    const totalDiscardedBonusPoints = (champ.rows||[]).reduce((sum, row)=>sum + (Number(row.discardedBonusPoints)||0), 0);
    const champLeader = champ.rows?.[0] || null;
    const winsLeader = (stats.rows||[]).slice().sort((a,b)=>(b.wins-a.wins)||(b.podiums-a.podiums))[0] || null;
    const podiumLeader = (stats.rows||[]).slice().sort((a,b)=>(b.podiums-a.podiums)||(b.wins-a.wins))[0] || null;
    const fastestLeader = (stats.rows||[]).slice().sort((a,b)=>(b.fastestLapCount-a.fastestLapCount)||(b.wins-a.wins))[0] || null;
    const rr = (x,y,w,h,r,fill,stroke='')=>{
      ctx.beginPath();
      ctx.moveTo(x+r,y);
      ctx.arcTo(x+w,y,x+w,y+h,r);
      ctx.arcTo(x+w,y+h,x,y+h,r);
      ctx.arcTo(x,y+h,x,y,r);
      ctx.arcTo(x,y,x+w,y,r);
      ctx.closePath();
      if(fill){ ctx.fillStyle = fill; ctx.fill(); }
      if(stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    };
    const txt = (str,x,y,font,color,align='left')=>{
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = 'top';
      ctx.fillText(String(str||''), x, y);
    };
    const fitText = (str,maxWidth,startPx,weight='700')=>{
      let px = startPx;
      for(; px>=12; px-=1){
        ctx.font = `${weight} ${px}px sans-serif`;
        if(ctx.measureText(String(str||'')).width <= maxWidth) break;
      }
      return `${weight} ${px}px sans-serif`;
    };
    const drawMetricCard = (x, y, label, value, sub, accentColor)=>{
      rr(x, y, cardW, cardH, 22, panel, border);
      txt(label, x + 18, y + 16, '600 16px sans-serif', muted);
      txt(value, x + 18, y + 48, fitText(value, cardW - 36, 30, '700'), text);
      txt(sub, x + 18, y + 88, '500 15px sans-serif', accentColor || accent);
    };
    const drawTable = (y, title, subtitle, cols, headers, rows, rowRenderer)=>{
      const panelX = margins.left;
      const panelW = width - margins.left - margins.right;
      const tableH = tableTitleH + tableHeaderH + Math.max(1, rows.length) * tableRowH;
      rr(panelX, y, panelW, tableH, 24, panel, border);
      txt(title, panelX + 22, y + 18, '700 28px sans-serif', text);
      txt(subtitle, panelX + panelW - 22, y + 22, '400 16px sans-serif', muted, 'right');
      let x = panelX;
      const headY = y + tableTitleH;
      cols.forEach((w, idx)=>{
        rr(x, headY, w, tableHeaderH, idx===0?16:10, header, border);
        txt(headers[idx] || '', x + (idx===1 ? 14 : w/2), headY + 10, fitText(headers[idx] || '', w - 18, 18, '700'), text, idx===1 ? 'left' : 'center');
        x += w;
      });
      let rowY = headY + tableHeaderH;
      rows.forEach((row, rowIdx)=>{
        rowRenderer({ row, rowIdx, y:rowY, panelX, cols });
        rowY += tableRowH;
      });
      if(!rows.length) txt('Keine Daten', panelX + 20, headY + 54, '500 18px sans-serif', muted);
      return tableH;
    };

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    for(let i=0;i<width;i+=92){
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.beginPath();
      ctx.moveTo(i,0);
      ctx.lineTo(i-220,height);
      ctx.stroke();
    }
    rr(margins.left, margins.top, width - margins.left - margins.right, titleH, 26, panel, border);
    txt('TimTime Saison-Auswertung', margins.left + 28, margins.top + 24, '700 42px sans-serif', text);
    txt(season.name || 'Saison', margins.left + 28, margins.top + 76, '500 22px sans-serif', muted);
    txt(`${new Date(createdAt).toLocaleDateString('de-DE')} - ${getRaceDaysForSeason(seasonId).length} Renntage - ${stats.races.length} Rennen - ${stats.rows.length} Fahrer`, width - margins.right - 28, margins.top + 30, '500 20px sans-serif', muted, 'right');
    txt(`Wertung: ${champ.settings.countedRaces || 'alle'} Rennen - ${champ.settings.countedFastestLaps || 'alle'} SR - Faktor ${champ.settings.factor} - ${champ.settings.fastestLapPoints} SR-Pkt.`, width - margins.right - 28, margins.top + 76, '400 16px sans-serif', accent2, 'right');

    const cardsY = margins.top + titleH + sectionGap;
    drawMetricCard(margins.left, cardsY, 'Meisterschaft', champLeader ? champLeader.driver.name : '-', champLeader ? `${champLeader.totalPoints} Punkte` : 'Keine Daten', accent);
    drawMetricCard(margins.left + (cardW + cardGap), cardsY, 'Meiste Siege', winsLeader ? winsLeader.driver.name : '-', winsLeader ? `${winsLeader.wins} Siege` : 'Keine Daten', accent2);
    drawMetricCard(margins.left + ((cardW + cardGap) * 2), cardsY, 'Meiste Podien', podiumLeader ? podiumLeader.driver.name : '-', podiumLeader ? `${podiumLeader.podiums} Podien` : 'Keine Daten', positive);
    drawMetricCard(margins.left + ((cardW + cardGap) * 3), cardsY, 'Meiste SR', fastestLeader ? fastestLeader.driver.name : '-', fastestLeader ? `${fastestLeader.fastestLapCount} schnellste Runden` : 'Keine Daten', '#f59e0b');

    let curY = cardsY + cardH + sectionGap;
    curY += drawTable(curY, 'Gesamtwertung', `Gestrichen: Rennen ${totalDiscardedRacePoints} - Bonus ${totalDiscardedBonusPoints}`, champCols, ['#', 'Fahrer', 'Gesamt', 'Rennen', 'Bonus', 'Siege', 'Podien'], tableTopRows, ({row,rowIdx,y,panelX,cols})=>{
      let x = panelX;
      const band = rowIdx % 2 ? panel2 : '#151922';
      cols.forEach((w, idx)=>{ rr(x, y, w, tableRowH, idx===0?12:8, band, border); x += w; });
      x = panelX;
      txt(rowIdx + 1, x + cols[0]/2, y + 8, '700 16px sans-serif', text, 'center'); x += cols[0];
      txt(row.driver?.name || '-', x + 14, y + 8, fitText(row.driver?.name || '-', cols[1] - 20, 18), text); x += cols[1];
      txt(row.totalPoints || 0, x + cols[2]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[2];
      txt(row.countedRacePoints || 0, x + cols[3]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[3];
      txt(row.countedBonusPoints || 0, x + cols[4]/2, y + 8, '700 16px monospace', accent2, 'center'); x += cols[4];
      txt(row.wins || 0, x + cols[5]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[5];
      txt(row.podiums || 0, x + cols[6]/2, y + 8, '700 16px monospace', text, 'center');
    });
    curY += sectionGap;
    drawTable(curY, 'Saison Statistik', 'Starts, Siege, Podien, schnellste Runden und Durchschnittsplatz', statCols, ['#', 'Fahrer', 'Starts', 'Siege', 'Podien', 'SR', 'Ø Platz'], statTopRows, ({row,rowIdx,y,panelX,cols})=>{
      let x = panelX;
      const band = rowIdx % 2 ? panel2 : '#151922';
      cols.forEach((w, idx)=>{ rr(x, y, w, tableRowH, idx===0?12:8, band, border); x += w; });
      x = panelX;
      txt(rowIdx + 1, x + cols[0]/2, y + 8, '700 16px sans-serif', text, 'center'); x += cols[0];
      txt(row.driver?.name || '-', x + 14, y + 8, fitText(row.driver?.name || '-', cols[1] - 20, 18), text); x += cols[1];
      txt(row.races || 0, x + cols[2]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[2];
      txt(row.wins || 0, x + cols[3]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[3];
      txt(row.podiums || 0, x + cols[4]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[4];
      txt(row.fastestLapCount || 0, x + cols[5]/2, y + 8, '700 16px monospace', accent2, 'center'); x += cols[5];
      const avgPos = row.avgPos!=null ? String(row.avgPos.toFixed(2)).replace('.', ',') : '-';
      txt(avgPos, x + cols[6]/2, y + 8, '700 16px monospace', row.avgPos!=null ? text : muted, 'center');
    });
    return await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
  }


  return { formatDiscordDateTime, getTrackById, buildRacePositionTimeline, buildRaceSummaryData, buildLapTableRows, renderRaceSummaryBlob, renderRaceLapTableBlob, buildLapColumnData, renderRaceLapColumnsBlob, renderRaceWebhookCompositeBlob, renderRaceDayWebhookBlob, renderSeasonWebhookBlob };
})();
