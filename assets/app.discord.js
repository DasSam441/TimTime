window.TIMTIME_DISCORD = (function(){
  'use strict';
  function bindShared(){ Object.assign(globalThis, window.TIMTIME_SHARED || {}); }

  function trimDiscordFieldValue(value, max=1024){
    const txt = String(value ?? '').trim();
    if(txt.length <= max) return txt || '—';
    return (txt.slice(0, Math.max(1, max-1)).trimEnd() + '…').slice(0, max);
  }

  function buildDiscordThreadName(baseName, ctx={}, templateOverride=''){
    const template = String(templateOverride || baseName || '').trim() || 'TimTime';
    return template
      .replaceAll('{type}', String(ctx.type || baseName || 'TimTime'))
      .replaceAll('{track}', String(ctx.track || ''))
      .replaceAll('{mode}', String(ctx.mode || ''))
      .replaceAll('{session}', String(ctx.sessionName || ''))
      .replaceAll('{renntag}', String(ctx.raceDayName || ''))
      .replaceAll('{season}', String(ctx.seasonName || ''))
      .replaceAll('{date}', String(ctx.date || ''))
      .replaceAll('{time}', String(ctx.time || ''))
      .trim()
      .slice(0, 100);
  }

  function buildSeasonWebhookMessage(seasonId){
    bindShared();
    const season = (state.season?.seasons||[]).find(x=>x.id===seasonId) || null;
    if(!season) throw new Error('Saison nicht gefunden');
    const champ = getChampionshipData(seasonId, getChampionshipSettings());
    const stats = getSeasonStatisticsData(seasonId);
    const createdAt = season.createdAt || Date.now();
    const topRows = champ.rows.slice(0,20);
    const statRows = stats.rows || [];
    const champRows = champ.rows || [];
    const champLeader = champRows[0] || null;
    const winsLeader = statRows.slice().sort((a,b)=>(b.wins-a.wins)||(b.podiums-a.podiums))[0] || null;
    const podiumLeader = statRows.slice().sort((a,b)=>(b.podiums-a.podiums)||(b.wins-a.wins))[0] || null;
    const fastestLeader = statRows.slice().sort((a,b)=>(b.fastestLapCount-a.fastestLapCount)||(b.wins-a.wins))[0] || null;
    const consistencyLeader = statRows.filter(x=>x.races>1).slice().sort((a,b)=>(a.consistencyScore??9e15)-(b.consistencyScore??9e15))[0] || statRows[0] || null;
    const startsLeader = statRows.slice().sort((a,b)=>(b.races-a.races)||(b.wins-a.wins))[0] || null;
    const avgLapLeader = statRows.filter(x=>x.avgMs!=null).slice().sort((a,b)=>(a.avgMs??9e15)-(b.avgMs??9e15)||(b.wins-a.wins))[0] || null;
    const champRaceLeader = champRows.slice().sort((a,b)=>(b.countedRacePoints-a.countedRacePoints)||(b.wins-a.wins))[0] || null;
    const champBonusLeader = champRows.slice().sort((a,b)=>(b.countedBonusPoints-a.countedBonusPoints)||(b.fastestLapCount-a.fastestLapCount))[0] || null;
    const totalDiscardedRacePoints = champRows.reduce((sum, row)=>sum + (Number(row.discardedRacePoints)||0), 0);
    const totalDiscardedBonusPoints = champRows.reduce((sum, row)=>sum + (Number(row.discardedBonusPoints)||0), 0);
    const awards = [];
    if(statRows.length){
      if(winsLeader) awards.push(`Meiste Siege: ${winsLeader.driver.name} (${winsLeader.wins})`);
      if(podiumLeader) awards.push(`Meiste Podien: ${podiumLeader.driver.name} (${podiumLeader.podiums})`);
      if(fastestLeader) awards.push(`Meiste schnellste Runden: ${fastestLeader.driver.name} (${fastestLeader.fastestLapCount})`);
      if(consistencyLeader && consistencyLeader.avgPos!=null) awards.push(`Konstantester Fahrer: ${consistencyLeader.driver.name} (Ø Platz ${String(consistencyLeader.avgPos.toFixed(2)).replace('.',',')})`);
      if(startsLeader) awards.push(`Meiste Starts: ${startsLeader.driver.name} (${startsLeader.races})`);
      if(avgLapLeader && avgLapLeader.avgMs!=null) awards.push(`Beste Ø Runde: ${avgLapLeader.driver.name} (${msToTime(avgLapLeader.avgMs,3)})`);
    }
    const trackBestMap = new Map();
    for(const row of statRows){
      for(const [trackId, bestMs] of Object.entries(row.bestByTrack||{})){
        const ms = Number(bestMs||0);
        if(!(ms>0)) continue;
        const cur = trackBestMap.get(trackId);
        if(!cur || ms < cur.ms){
          trackBestMap.set(trackId, { trackId, ms, driverName: row.driver?.name || '—' });
        }
      }
    }
    const trackBestLines = Array.from(trackBestMap.values()).sort((a,b)=>{
      const ta = getTrackById(a.trackId)?.name || a.trackId;
      const tb = getTrackById(b.trackId)?.name || b.trackId;
      return ta.localeCompare(tb, 'de');
    }).map(entry=>{
      const track = getTrackById(entry.trackId);
      return `${getTrackPlainName(track)}: ${entry.driverName} (${msToTime(entry.ms,3)})`;
    });
    const seasonRaces = getSeasonScoringRaces(seasonId);
    const recentRaceLines = seasonRaces.slice(-5).map((race, idx, arr)=>{
      const laps = getRelevantRaceLaps(race.id, state.session.laps || []);
      const standings = computeDriverStandingsGlobal(laps);
      const winner = standings[0]?.name || '—';
      const fastestDid = getFastestDriverIdFromLaps(laps);
      const fastestDriver = fastestDid ? (getDriver(fastestDid)?.name || fastestDid) : '';
      const fastestLap = laps.filter(l=>{
        const did = String(l?.driverId || (l?.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim();
        return did && did===fastestDid && Number(l?.lapMs||0)>0;
      }).reduce((best, lap)=>{
        if(!best || Number(lap.lapMs||0) < Number(best.lapMs||0)) return lap;
        return best;
      }, null);
      const parts = [`${seasonRaces.length - arr.length + idx + 1}. ${race.name || 'Rennen'}`, `Sieg: ${winner}`];
      if(fastestDriver && fastestLap?.lapMs) parts.push(`SR: ${fastestDriver} (${msToTime(fastestLap.lapMs,3)})`);
      return parts.join(' • ');
    });
    const standingsLines = topRows.map((row, idx)=>{
      const pieces = [
        `${idx+1}. ${row.driver.name}`,
        `${row.totalPoints} Pkt.`,
        `${row.races || 0}/${row.countedRaceResults || 0} gew. Rennen`,
        `${row.fastestLapCount || 0}/${row.countedFastestResults || 0} gew. SR`,
        `${row.countedRacePoints || 0} Rennen`,
        `${row.countedBonusPoints || 0} Bonus`,
        `${(row.discardedRacePoints||0) + (row.discardedBonusPoints||0)} gestrichen`,
        `${row.wins} Siege`,
        `${row.podiums} Podien`,
        `${row.fastestLapCount} SR`
      ];
      return pieces.join(' • ');
    });
    const highlightLines = [
      winsLeader ? `Meiste Siege: ${winsLeader.driver.name} (${winsLeader.wins})` : '',
      podiumLeader ? `Meiste Podien: ${podiumLeader.driver.name} (${podiumLeader.podiums})` : '',
      fastestLeader ? `Meiste SR: ${fastestLeader.driver.name} (${fastestLeader.fastestLapCount})` : '',
      consistencyLeader && consistencyLeader.avgPos!=null ? `Konstantester Fahrer: ${consistencyLeader.driver.name} (Ø ${String(consistencyLeader.avgPos.toFixed(2)).replace('.',',')})` : '',
      startsLeader ? `Meiste Starts: ${startsLeader.driver.name} (${startsLeader.races})` : '',
      avgLapLeader && avgLapLeader.avgMs!=null ? `Beste Ø Runde: ${avgLapLeader.driver.name} (${msToTime(avgLapLeader.avgMs,3)})` : '',
      champRaceLeader ? `Meiste Rennpunkte: ${champRaceLeader.driver.name} (${champRaceLeader.countedRacePoints || 0})` : '',
      champBonusLeader ? `Meiste Bonuspunkte: ${champBonusLeader.driver.name} (${champBonusLeader.countedBonusPoints || 0})` : ''
    ].filter(Boolean);
    const textLines = [
      `🏁 **Saison-Auswertung**`,
      `**Saison:** ${season.name || '—'}`,
      `**Renntage:** ${getRaceDaysForSeason(seasonId).length}`,
      `**Rennen:** ${stats.races.length}`,
      `**Fahrer:** ${statRows.length}`,
      `**Gewertete Rennen:** ${champ.settings.countedRaces || 'alle'} pro Fahrer`,
      `**Gewertete SR:** ${champ.settings.countedFastestLaps || 'alle'} pro Fahrer`,
      `**Gestrichene Punkte:** Rennen ${totalDiscardedRacePoints} • Bonus ${totalDiscardedBonusPoints}`,
      `**Meisterschaft:** ${champLeader ? `${champLeader.driver.name} mit ${champLeader.totalPoints} Punkten` : '—'}`,
      '',
      '**Gesamtwertung**',
      ...(standingsLines.length ? standingsLines : ['— Keine gewerteten Rennen']),
      '',
      '**Highlights**',
      ...(highlightLines.length ? highlightLines : ['— Keine Daten']),
      '',
      '**Streckenbestzeiten**',
      ...(trackBestLines.length ? trackBestLines : ['— Keine Daten']),
      '',
      '**Letzte Rennen**',
      ...(recentRaceLines.length ? recentRaceLines : ['— Keine Daten'])
    ];
    const embeds = [{
      title: 'Saison-Auswertung',
      description: trimDiscordFieldValue(`${season.name || '—'}\nKomplette Saisonstatistik und Meisterschaftsübersicht`, 4096),
      color: 0x7d5cff,
      fields: [
        { name:'Überblick', value: trimDiscordFieldValue(`Renntage: ${getRaceDaysForSeason(seasonId).length}\nRennen: ${stats.races.length}\nFahrer: ${statRows.length}\nGewertete Rennen gesamt: ${champ.races.length}`), inline:true },
        { name:'Punkte-Regel', value: trimDiscordFieldValue(`Gewertete Rennen: ${champ.settings.countedRaces || 'alle'} pro Fahrer\nGewertete SR: ${champ.settings.countedFastestLaps || 'alle'} pro Fahrer\nFaktor: ${champ.settings.factor}\nSR-Punkte: ${champ.settings.fastestLapPoints}`), inline:true },
        { name:'Streichresultate', value: trimDiscordFieldValue(`Gestrichene Rennpunkte: ${totalDiscardedRacePoints}\nGestrichene Bonuspunkte: ${totalDiscardedBonusPoints}`), inline:true },
        { name:'Meisterschaftsführer', value: trimDiscordFieldValue(champLeader ? `${champLeader.driver.name}\n${champLeader.totalPoints} Punkte\n${champLeader.wins} Siege • ${champLeader.podiums} Podien` : '—'), inline:true }
      ],
      footer: { text:'TimTime Saison Webhook' },
      timestamp: new Date(createdAt).toISOString()
    }];
    const highlightFields = chunkDiscordFieldLines(highlightLines, 'Highlights', 1024);
    const standingFields = chunkDiscordFieldLines(standingsLines, 'Gesamtwertung', 1024);
    const awardFields = chunkDiscordFieldLines(awards, 'Awards', 1024);
    const trackFields = chunkDiscordFieldLines(trackBestLines, 'Streckenbestzeiten', 1024);
    const recentRaceFields = chunkDiscordFieldLines(recentRaceLines, 'Letzte Rennen', 1024);
    for(const field of [...highlightFields, ...standingFields, ...awardFields, ...trackFields, ...recentRaceFields]){
      if(embeds[embeds.length-1].fields.length >= 24){
        embeds.push({ title:'Saison-Auswertung (Fortsetzung)', color:0x7d5cff, fields:[], footer:{ text:'TimTime Saison Webhook' }, timestamp:new Date(createdAt).toISOString() });
      }
      embeds[embeds.length-1].fields.push(field);
    }
    const payload = {
      username: state.settings?.appName || 'TimTime',
      content: '',
      embeds
    };
    const forumText = textLines.join('\n').trim();
    const threadName = buildDiscordThreadName(season.name || 'Saison', {
      type: 'Saison-Auswertung', season: season.name || 'Saison', createdAt
    }, state.settings?.discordSeasonThreadName || '');
  
    return { payload, forumText, threadName, season, champ, stats };
  }

  function createDiscordHttpError(status, detail=''){
    const err = new Error(`Webhook ${status}${detail ? ': '+detail : ''}`);
    err.statusCode = Number(status || 0) || 0;
    err.retryable = err.statusCode === 408 || err.statusCode === 429 || err.statusCode >= 500;
    err.permanent = !err.retryable;
    return err;
  }

  function markDiscordNetworkError(err){
    if(!err) return err;
    err.network = true;
    err.retryable = true;
    err.permanent = false;
    return err;
  }

  function shouldQueueDiscordError(err){
    if(!err) return true;
    if(err.queued) return false;
    if(err.permanent) return false;
    return !!(err.retryable || err.network || navigator.onLine === false);
  }

  function getDiscordImmediateRetryDelayMs(attempt){
    const tries = Math.max(0, Number(attempt)||0);
    return [900, 2500, 6000][tries] || 6000;
  }

  function getDiscordQueueRetryDelayMs(attempts){
    const n = Math.max(0, Number(attempts)||0);
    return Math.min(15 * 60 * 1000, 30 * 1000 * Math.pow(2, Math.min(n, 5)));
  }

  function createQueuedDiscordError(job, cause){
    const err = new Error('discord_queued');
    err.queued = true;
    err.job = job || null;
    err.cause = cause || null;
    return err;
  }

  async function loadDiscordQueueJobs(){
    const db = await getAppDataDb();
    return await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_DISCORD_QUEUE_STORE], 'readonly');
      let rows = [];
      readAllFromObjectStore(tx, APP_DATA_DISCORD_QUEUE_STORE).then((items)=>{
        rows = Array.isArray(items) ? items : [];
      }).catch(reject);
      tx.oncomplete = ()=>resolve(rows);
      tx.onerror = ()=>reject(tx.error || new Error('Discord queue read failed'));
      tx.onabort = ()=>reject(tx.error || new Error('Discord queue read aborted'));
    });
  }

  async function putDiscordQueueJob(job){
    const db = await getAppDataDb();
    await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_DISCORD_QUEUE_STORE], 'readwrite');
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error('Discord queue write failed'));
      tx.onabort = ()=>reject(tx.error || new Error('Discord queue write aborted'));
      tx.objectStore(APP_DATA_DISCORD_QUEUE_STORE).put(job);
    });
  }

  async function deleteDiscordQueueJob(jobId){
    if(!jobId) return;
    const db = await getAppDataDb();
    await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_DISCORD_QUEUE_STORE], 'readwrite');
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error('Discord queue delete failed'));
      tx.onabort = ()=>reject(tx.error || new Error('Discord queue delete aborted'));
      tx.objectStore(APP_DATA_DISCORD_QUEUE_STORE).delete(jobId);
    });
  }

  async function enqueueDiscordJob(job){
    const queueJob = {
      id: job?.id || uid('dq'),
      kind: String(job?.kind || '').trim(),
      targetId: String(job?.targetId || '').trim(),
      webhookUrl: String(job?.webhookUrl || '').trim(),
      useThread: !!job?.useThread,
      threadName: String(job?.threadName || '').trim(),
      force: !!job?.force,
      createdAt: Number(job?.createdAt || now()),
      updatedAt: now(),
      nextAttemptAt: Number(job?.nextAttemptAt || now()),
      attempts: Math.max(0, Number(job?.attempts || 0) || 0),
      lastError: String(job?.lastError || '').trim()
    };
    await putDiscordQueueJob(queueJob);
    return queueJob;
  }

  let _discordQueueProcessing = false;
  let _discordQueueTimer = null;

  function scheduleDiscordQueueProcessing(delayMs=1500){
    if(_discordQueueTimer) clearTimeout(_discordQueueTimer);
    _discordQueueTimer = setTimeout(()=>{
      _discordQueueTimer = null;
      processDiscordQueue(false).catch(()=>{});
    }, Math.max(0, Number(delayMs)||0));
  }

  function chunkDiscordFieldLines(lines, titleBase, maxLen=1024){
    const out = [];
    let buf = [];
    let current = '';
    let idx = 1;
    for(const line of (lines||[])){
      const lineTxt = String(line||'').trim();
      if(!lineTxt) continue;
      const candidate = current ? `${current}\n${lineTxt}` : lineTxt;
      if(candidate.length > maxLen && current){
        out.push({ name: idx===1 ? titleBase : `${titleBase} (${idx})`, value: current });
        idx += 1;
        current = lineTxt;
      }else{
        current = candidate;
      }
    }
    if(current) out.push({ name: idx===1 ? titleBase : `${titleBase} (${idx})`, value: current });
    return out;
  }

  async function postDiscordWebhook(webhookUrl, payload, extra={}){
    const url = String(webhookUrl || '').trim();
    if(!url) throw new Error('Discord Webhook fehlt');
    const finalPayload = { ...(payload||{}) };
    if(extra && extra.thread_name) finalPayload.thread_name = String(extra.thread_name).slice(0,100);
    const fd = new FormData();
    if(extra && extra.fileBlob){ fd.append('files[0]', extra.fileBlob, sanitizeDiscordFilename(extra.filename||'summary.png')); }
    fd.append('payload_json', JSON.stringify(finalPayload));
    let res;
    try{
      res = await fetch(url, { method:'POST', body:fd });
    }catch(err){
      throw markDiscordNetworkError(err instanceof Error ? err : new Error(String(err || 'Discord fetch failed')));
    }
    if(!res.ok){
      let detail = '';
      try{ detail = await res.text(); }catch{}
      throw createDiscordHttpError(res.status, detail);
    }
    return true;
  }

  async function postDiscordWebhookWithImage(webhookUrl, payload, blob, filename, extra={}){
    let lastError = null;
    for(let attempt=0; attempt<3; attempt++){
      try{
        return await postDiscordWebhook(webhookUrl, payload, { ...(extra||{}), fileBlob: blob, filename });
      }catch(err){
        lastError = err;
        if(!(err?.retryable || err?.network) || attempt >= 2) throw err;
        await sleep(getDiscordImmediateRetryDelayMs(attempt));
      }
    }
    throw lastError || new Error('Discord send failed');
  }

  function getRaceDayBestLapsByTrack(raceDayId){
    const rd = (state.raceDay?.raceDays||[]).find(x=>x.id===raceDayId) || null;
    if(!rd) return [];
    const allLaps = state.session.laps || [];
    const raceIds = new Set((rd.races||[]).map(r=>r.id));
    const byTrack = new Map();
    for(const lap of allLaps){
      if(!raceIds.has(lap?.raceId)) continue;
      const ms = Number(lap?.lapMs||0);
      if(!(ms>0)) continue;
      const tid = String(lap?.trackId || '').trim();
      if(!tid) continue;
      const did = String(lap?.driverId || (lap?.carId ? (getCar(lap.carId)?.driverId||'') : '') || '').trim();
      if(!did) continue;
      let trackMap = byTrack.get(tid);
      if(!trackMap){ trackMap = new Map(); byTrack.set(tid, trackMap); }
      const prev = trackMap.get(did);
      if(!prev || ms < prev.bestMs){
        trackMap.set(did, {
          driverId: did,
          driverName: getDriver(did)?.name || lap?.driverName || '—',
          bestMs: ms,
          lapId: lap?.id || '',
          raceId: lap?.raceId || '',
          raceName: getRaceById(lap?.raceId)?.name || ''
        });
      }
    }
    const out = [];
    for(const [trackId, map] of byTrack.entries()){
      const track = getTrackById(trackId) || null;
      const rows = Array.from(map.values()).sort((a,b)=>(a.bestMs-b.bestMs)||((a.driverName||'').localeCompare(b.driverName||'','de')));
      out.push({ trackId, trackName: getTrackPlainName(track) || 'Strecke', trackDisplayName: formatTrackDisplayName(track || {id:trackId,name:getTrackPlainName(track)||trackId,setup:{}}), rows });
    }
    out.sort((a,b)=>(a.trackDisplayName||a.trackName).localeCompare((b.trackDisplayName||b.trackName),'de'));
    return out;
  }

  function getRaceDayWebhookTableData(raceDayId){
    const rd = (state.raceDay?.raceDays||[]).find(x=>x.id===raceDayId) || null;
    if(!rd) throw new Error('Renntag nicht gefunden');
    const races = (rd.races||[]).slice();
    const tracks = Array.isArray(getRaceDayBestLapsByTrack(raceDayId)) ? getRaceDayBestLapsByTrack(raceDayId) : [];
    const driverStats = Array.isArray(getDriverAggregateStatsForRaces(races)) ? getDriverAggregateStatsForRaces(races) : [];
    const maxPos = Math.max(3,
      ...driverStats.map(row=>Math.max(0, ...(row.positions||[]))),
      ...races.map(r=>computeDriverStandingsGlobal(getRelevantRaceLaps(r.id, state.session.laps||[])).length)
    );
    const placementHeaders = Array.from({length:maxPos}, (_,i)=>`${i+1}.`);
    const table1Rows = driverStats.map(row=>({
      driverId: row.driver.id,
      driverName: row.driver.name || '—',
      cells: tracks.map(group=>{
        const ms = Number(row.bestByTrack?.[group.trackId]);
        return Number.isFinite(ms) && ms>0 ? msToTime(ms,3) : '—';
      })
    }));
    const table2Rows = driverStats.map(row=>({
      driverId: row.driver.id,
      driverName: row.driver.name || '-',
      races: row.races || 0,
      wins: row.wins || 0,
      podiums: row.podiums || 0,
      placeCounts: placementHeaders.map((_, idx)=>(row.placeCounts?.[idx] ?? row.placeCounts?.[idx+1] ?? 0)),
      bestDayMs: Number.isFinite(Number(row.bestDayMs)) ? Number(row.bestDayMs) : (Number.isFinite(Number(row.avgMs)) ? Number(row.avgMs) : null),
      fastestLapCount: row.fastestLapCount || 0,
      avgPos: row.avgPos
    }));
    const createdAt = rd.createdAt || now();
    return { rd, races, tracks, driverStats, maxPos, placementHeaders, table1Rows, table2Rows, createdAt };
  }

  function buildRaceDayWebhookMessage(raceDayId){
    const data = getRaceDayWebhookTableData(raceDayId);
    const { rd, tracks, createdAt, table1Rows } = data;
    const embeds = [{
      title: 'Renntag-Auswertung',
      description: trimDiscordFieldValue(`${rd.name || '—'}\n${tracks.length} Strecke${tracks.length===1?'':'n'} • ${table1Rows.length} Fahrer`, 4096),
      color: 0x4ea1ff,
      fields: [
        { name:'Inhalt', value: trimDiscordFieldValue(`1) Schnellste Runde je Fahrer und Strecke\n2) Wie oft Platz 1, 2, 3 …\n3) Wie oft schnellste Rennrunde`, 1024), inline:false }
      ],
      footer: { text:'TimTime Renntag Webhook' },
      timestamp: new Date(createdAt).toISOString(),
      image: { url:'attachment://renntag_auswertung.png' }
    }];
    const forumText = [`🏁 **Renntag-Auswertung**`,`**Renntag:** ${rd.name || '—'}`,`**Datum:** ${new Date(createdAt).toLocaleDateString('de-DE')}`,`**Strecken:** ${tracks.map(t=>t.trackDisplayName || t.trackName).join(', ') || '—'}`].join('\n');
    const payload = { username: state.settings?.appName || 'TimTime', content:'', embeds };
    const threadName = buildDiscordThreadName(rd.name || 'Renntag', { type:'Renntag-Auswertung', raceDay: rd.name || 'Renntag', track: tracks[0]?.trackDisplayName || 'Strecke', createdAt }, state.settings?.discordRaceDayThreadName || '');
    return { payload, forumText, threadName, raceDay: rd, tracks, tableData:data };
  }


  function setDiscordPreviewImage(root, selector, blob, alt){
    const node = root?.querySelector(selector);
    if(!node) return;
    const prevUrl = node.getAttribute('data-preview-url');
    if(prevUrl) URL.revokeObjectURL(prevUrl);
    node.removeAttribute('data-preview-url');
    node.innerHTML = '';
    if(!(blob instanceof Blob)){
      node.innerHTML = `<div class="muted small">${esc(alt || 'Kein Bild verfuegbar')}</div>`;
      return;
    }
    const url = URL.createObjectURL(blob);
    node.setAttribute('data-preview-url', url);
    node.innerHTML = `<img src="${url}" alt="${esc(alt || 'Discord Vorschau')}" />`;
    const img = node.querySelector('img');
    if(img){
      img.onload = ()=>setTimeout(()=>URL.revokeObjectURL(url), 1200);
    }
  }

  async function sendDiscordSummaryForRace(raceId, opts={}){
    const summary = buildRaceSummaryData(raceId);
    if(!summary) throw new Error('Session nicht gefunden');
    const race = summary.race;
    if(race.discordSentAt && !opts.force) return false;
    const webhookUrl = String((opts.webhookUrl ?? state.settings?.discordWebhook) || '').trim();
    if(!webhookUrl) throw new Error('Discord Webhook fehlt');
    const standings = summary.standings || [];
    const top = standings.slice(0,3).map((s,idx)=>`${idx+1}. ${s.name||'—'} (${s.bestMs!=null ? msToTime(s.bestMs,3) : '—'})`).join('\n') || '—';
    const bestText = summary.bestLap ? `${driverNameByIdGlobal(driverKeyForLapGlobal(summary.bestLap))} • ${msToTime(summary.bestLap.lapMs,3)}` : '—';
    const payload = {
      username: state.settings?.appName || 'TimTime',
      embeds: [{
        title: summary.freeDriving ? 'Freies Fahren beendet' : 'Rennen beendet',
        description: summary.subtitle,
        color: summary.freeDriving ? 5814783 : 5153791,
        fields: [
          { name: summary.freeDriving ? 'Top Bestzeiten' : 'Podium', value: top || '—', inline: false },
          { name:'Schnellste Runde', value: bestText, inline:true },
          { name:'Beendet', value: formatDiscordDateTime(race.endedAt), inline:true }
        ],
        image: { url: 'attachment://session_summary.png' },
        footer: { text: 'TimTime Discord Webhook' },
        timestamp: new Date(race.endedAt || Date.now()).toISOString()
      }]
    };
    const trackName = getTrackPlainName(summary.track);
    const useThread = opts.useThread ?? state.settings?.discordUseThread;
    const threadName = buildDiscordThreadName(race.name || 'Rennen', { track:trackName, mode: summary.freeDriving ? 'Freies Fahren' : 'Rennen', sessionName:race.name || 'Rennen', endedAt: race.endedAt });
    const extra = useThread ? { thread_name: (opts.threadName || threadName) } : {};
    try{
      const blob = await renderRaceWebhookCompositeBlob(summary);
      await postDiscordWebhookWithImage(webhookUrl, payload, blob, 'session_summary.png', extra);
      race.discordSentAt = now();
      race.discordSendError = '';
      saveState();
      return { queued:false, sent:true };
    }catch(err){
      race.discordSendError = String(err?.message || err || 'Unbekannter Fehler');
      saveState();
      if(opts.allowQueue !== false && shouldQueueDiscordError(err)){
        const job = await enqueueDiscordJob({
          kind:'session',
          targetId: raceId,
          webhookUrl,
          useThread: !!useThread,
          threadName: extra.thread_name || '',
          force: !!opts.force,
          lastError: race.discordSendError
        });
        scheduleDiscordQueueProcessing(1500);
        throw createQueuedDiscordError(job, err);
      }
      throw err;
    }
  }

  async function executeDiscordQueueJob(job){
    const kind = String(job?.kind || '').trim();
    if(kind==='session'){
      return await sendDiscordSummaryForRace(job.targetId, {
        force: !!job.force,
        webhookUrl: job.webhookUrl,
        useThread: !!job.useThread,
        threadName: job.threadName || '',
        allowQueue: false
      });
    }
    if(kind==='raceday'){
      return await sendRaceDayWebhook(job.targetId, {
        webhookUrl: job.webhookUrl,
        useThread: !!job.useThread,
        threadName: job.threadName || '',
        allowQueue: false
      });
    }
    if(kind==='season'){
      return await sendSeasonWebhook(job.targetId, {
        webhookUrl: job.webhookUrl,
        useThread: !!job.useThread,
        threadName: job.threadName || '',
        allowQueue: false
      });
    }
    throw new Error('Unbekannter Discord-Queue-Typ');
  }

  async function processDiscordQueue(force=false){
    if(_discordQueueProcessing) return;
    if(!force && navigator.onLine === false) return;
    _discordQueueProcessing = true;
    try{
      const jobs = (await loadDiscordQueueJobs())
        .filter(job => Number(job?.nextAttemptAt || 0) <= now())
        .sort((a,b)=>(Number(a?.nextAttemptAt || 0) - Number(b?.nextAttemptAt || 0)) || (Number(a?.createdAt || 0) - Number(b?.createdAt || 0)));
      for(const job of jobs){
        try{
          await executeDiscordQueueJob(job);
          await deleteDiscordQueueJob(job.id);
          logLine('Discord Queue gesendet: ' + String(job.kind || 'job') + ' ' + String(job.targetId || ''));
        }catch(err){
          if(shouldQueueDiscordError(err)){
            job.attempts = Math.max(0, Number(job.attempts || 0) || 0) + 1;
            job.updatedAt = now();
            job.lastError = String(err?.message || err || 'Unbekannter Fehler');
            job.nextAttemptAt = now() + getDiscordQueueRetryDelayMs(job.attempts);
            await putDiscordQueueJob(job);
            logLine('Discord Queue verschoben: ' + String(job.kind || 'job') + ' in ' + Math.round((job.nextAttemptAt - now())/1000) + 's');
          }else{
            await deleteDiscordQueueJob(job.id);
            logLine('Discord Queue verworfen: ' + String(job.kind || 'job') + ' • ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }
      }
    }finally{
      _discordQueueProcessing = false;
    }
  }

  async function buildSessionDiscordPreview(raceId){
    const summary = buildRaceSummaryData(raceId);
    if(!summary) throw new Error('Session nicht gefunden');
    const race = summary.race;
    const blob = await renderRaceWebhookCompositeBlob(summary);
    const standings = summary.standings || [];
    const top = standings.slice(0,3).map((s,idx)=>`${idx+1}. ${s.name||'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â'} (${s.bestMs!=null ? msToTime(s.bestMs,3) : 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â'})`).join('\n') || 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â';
    const bestText = summary.bestLap ? `${driverNameByIdGlobal(driverKeyForLapGlobal(summary.bestLap))} ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ ${msToTime(summary.bestLap.lapMs,3)}` : 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â';
    const payload = {
      username: state.settings?.appName || 'TimTime',
      embeds: [{
        title: summary.freeDriving ? 'Freies Fahren beendet' : 'Rennen beendet',
        description: summary.subtitle,
        color: summary.freeDriving ? 5814783 : 5153791,
        fields: [
          { name: summary.freeDriving ? 'Top Bestzeiten' : 'Podium', value: top || 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â', inline: false },
          { name:'Schnellste Runde', value: bestText, inline:true },
          { name:'Beendet', value: formatDiscordDateTime(race.endedAt), inline:true }
        ],
        image: { url:'attachment://session_summary.png' },
        footer: { text:'TimTime Discord Webhook' },
        timestamp: new Date(race.endedAt || Date.now()).toISOString()
      }]
    };
    return { summary, race, payload, blob };
  }

  async function maybeAutoSendDiscordForRace(raceId){
    const race = getRaceById(raceId);
    if(!race || race.discordSentAt) return;
    if(!state.settings?.discordAutoSend) return;
    if(!String(state.settings?.discordWebhook || '').trim()) return;
    try{
      await sendDiscordSummaryForRace(raceId);
      toast('Discord','Session automatisch gesendet.','ok');
      logLine(`Discord Webhook gesendet: ${race.name||raceId}`);
    }catch(err){
      if(err?.queued){
        race.discordSendError = 'Warteschlange aktiv';
        saveState();
        toast('Discord','Session in Warteschlange. Wird automatisch erneut versucht.','warn');
        logLine('Discord Queue aktiv: Session ' + String(race.name || raceId));
        return;
      }
      race.discordSendError = String(err?.message || err || 'Unbekannter Fehler');
      saveState();
      toast('Discord','Webhook fehlgeschlagen.','err');
      logLine('Discord Webhook Fehler: ' + race.discordSendError);
    }
  }


  function buildDiscordFakeSummaryData(){
    const driverPool = (state.drivers||[]).slice(0,4);
    const names = driverPool.length ? driverPool.map(d=>d.name||'ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â') : ['Tim','Alex','Roland','Beegle'];
    const colors = driverPool.length ? driverPool.map(d=>d.color||'') : ['#5e97ff','#62d296','#ff835c','#d66cff'];
    const endedAt = Date.now();
    const track = getTrackById(state.session?.currentTrackId || '') || state.tracks?.[0] || null;
    const fakeRace = {
      id: uid('discord_test_'),
      name: 'Discord Test',
      mode: 'single',
      submode: 'Rennen',
      endedAt,
      trackId: track?.id || ''
    };
    const bests = [4211, 4298, 4376, 4522];
    const standings = names.map((name, idx)=>(
      { id: driverPool[idx]?.id || `fake_${idx+1}`, name, laps: Math.max(9, 12-idx), bestMs: bests[idx] || (4300 + idx*120) }
    ));
    const pointTemplates = [
      [2,2,1,1,1,1,1,1,1,1,1,1],
      [1,1,2,2,2,2,2,2,2,2,2,2],
      [3,3,3,3,3,3,3,3,3,3,3,3],
      [4,4,4,4,4,4,4,4,4,4,4,4]
    ];
    const chart = names.slice(0, Math.max(3, Math.min(4, names.length))).map((name, idx)=>(
      { name, color: colors[idx] || ['#5e97ff','#62d296','#ff835c','#d66cff'][idx%4], points: pointTemplates[idx].map((pos,i)=>({ lap:i+1, pos })) }
    ));
    return {
      raceId: fakeRace.id,
      race: fakeRace,
      laps: standings.flatMap((row, idx)=> Array.from({ length: row.laps || Math.max(9, 12-idx) }, (_, lapIdx)=>({ driverId: row.id, lapNo: lapIdx+1, lapMs: Math.round((row.bestMs||4300) + Math.random()*220 + lapIdx*6), ts: (lapIdx+1)*5000 + idx*50 }))),
      track,
      freeDriving: false,
      standings,
      top3: standings.slice(0,3),
      bestLap: { lapMs: bests[0], driverId: standings[0].id, carId: '' },
      chart,
      title: 'Rennergebnis',
      subtitle: `${getTrackPlainName(track)} • Discord Testlauf`
    };
  }

  async function sendDiscordTestWebhook(){
    const webhookUrl = String(state.settings?.discordWebhook || '').trim();
    if(!webhookUrl) throw new Error('Discord Webhook fehlt');
    const summary = buildDiscordFakeSummaryData();
    const blob = await renderRaceWebhookCompositeBlob(summary);
    const payload = {
      username: state.settings?.appName || 'TimTime',
      content: '',
      embeds: [{
        title: 'Discord Test',
        description: 'Fake-Daten für Webhook-Test',
        color: 5153791,
        fields: [
          { name:'Strecke', value:getTrackPlainName(summary.track), inline:true },
          { name:'Modus', value:'Rennen (Test)', inline:true },
          { name:'Podium', value: summary.standings.slice(0,3).map((s,idx)=>`${idx+1}. ${s.name} (${msToTime(s.bestMs,3)})`).join('\n') || '—', inline:false }
        ],
        image: { url: 'attachment://discord_test_summary.png' },
        footer: { text:'TimTime Discord Test' },
        timestamp: new Date().toISOString()
      }]
    };
    const extra = (state.settings?.discordUseThread) ? { thread_name: buildDiscordThreadName('Discord Test', { track:getTrackPlainName(summary.track), mode:'Discord Test', sessionName:'Discord Test', endedAt: summary.race?.endedAt || Date.now() }) } : {};
    await postDiscordWebhookWithImage(webhookUrl, payload, blob, 'discord_test_summary.png', extra);
    return true;
  }

  async function sendRaceDayWebhook(raceDayId, opts={}){
    bindShared();
    const webhookUrl = String((opts.webhookUrl ?? state.settings?.discordRaceDayWebhook) || '').trim();
    if(!webhookUrl) throw new Error('Renntag Webhook fehlt');
    const msg = buildRaceDayWebhookMessage(raceDayId);
    const useThread = opts.useThread ?? state.settings?.discordRaceDayUseThread;
    const extra = useThread ? { thread_name: (opts.threadName || msg.threadName) } : {};
    try{
      const blob = await renderRaceDayWebhookBlob(raceDayId);
      await postDiscordWebhookWithImage(webhookUrl, msg.payload, blob, 'renntag_auswertung.png', extra);
      return { queued:false, msg };
    }catch(err){
      if(opts.allowQueue !== false && shouldQueueDiscordError(err)){
        const job = await enqueueDiscordJob({
          kind:'raceday',
          targetId: raceDayId,
          webhookUrl,
          useThread: !!useThread,
          threadName: extra.thread_name || '',
          force: true,
          lastError: String(err?.message || err || '')
        });
        scheduleDiscordQueueProcessing(1500);
        throw createQueuedDiscordError(job, err);
      }
      throw err;
    }
  }

  async function sendSeasonWebhook(seasonId, opts={}){
    bindShared();
    const webhookUrl = String((opts.webhookUrl ?? state.settings?.discordSeasonWebhook) || '').trim();
    if(!webhookUrl) throw new Error('Saison Webhook fehlt');
    const msg = buildSeasonWebhookMessage(seasonId);
    const useThread = opts.useThread ?? state.settings?.discordSeasonUseThread;
    const extra = useThread ? { thread_name: (opts.threadName || msg.threadName) } : {};
    try{
      const blob = await renderSeasonWebhookBlob(seasonId);
      await postDiscordWebhookWithImage(webhookUrl, msg.payload, blob, 'saison_auswertung.png', extra);
      return { queued:false, msg };
    }catch(err){
      if(opts.allowQueue !== false && shouldQueueDiscordError(err)){
        const job = await enqueueDiscordJob({
          kind:'season',
          targetId: seasonId,
          webhookUrl,
          useThread: !!useThread,
          threadName: extra.thread_name || '',
          force: true,
          lastError: String(err?.message || err || '')
        });
        scheduleDiscordQueueProcessing(1500);
        throw createQueuedDiscordError(job, err);
      }
      throw err;
    }
  }

  async function copyTextToClipboard(txt){
    bindShared();
    const val = String(txt || '').trim();
    if(!val) throw new Error('Kein Text vorhanden');
    if(navigator.clipboard?.writeText){
      await navigator.clipboard.writeText(val);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = val;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if(!ok) throw new Error('Clipboard nicht verfügbar');
    return true;
  }

  function setDiscordPreviewText(root, selector, text){
    const node = root?.querySelector(selector);
    if(node) node.textContent = String(text || '').trim() || 'Keine Daten';
  }

  function formatDiscordPayloadPreview(payload){
    const lines = [];
    const embeds = Array.isArray(payload?.embeds) ? payload.embeds : [];
    const content = String(payload?.content || '').trim();
    if(content) lines.push(content);
    embeds.forEach((embed, idx)=>{
      if(idx) lines.push('', '-----');
      if(embed?.title) lines.push(String(embed.title));
      if(embed?.description) lines.push(String(embed.description));
      for(const field of (embed?.fields || [])){
        if(field?.name) lines.push('', `[${field.name}]`);
        if(field?.value) lines.push(String(field.value));
      }
      if(embed?.footer?.text) lines.push('', `Footer: ${embed.footer.text}`);
      if(embed?.image?.url) lines.push(`Bild: ${embed.image.url}`);
    });
    return lines.join('\n').trim();
  }

  return {
    createDiscordHttpError,
    markDiscordNetworkError,
    shouldQueueDiscordError,
    getDiscordImmediateRetryDelayMs,
    getDiscordQueueRetryDelayMs,
    createQueuedDiscordError,
    loadDiscordQueueJobs,
    putDiscordQueueJob,
    deleteDiscordQueueJob,
    enqueueDiscordJob,
    scheduleDiscordQueueProcessing,
    chunkDiscordFieldLines,
    postDiscordWebhook,
    postDiscordWebhookWithImage,
    trimDiscordFieldValue,
    buildDiscordThreadName,
    getRaceDayBestLapsByTrack,
    getRaceDayWebhookTableData,
    buildRaceDayWebhookMessage,
    buildSeasonWebhookMessage,
    setDiscordPreviewImage,
    sendDiscordSummaryForRace,
    executeDiscordQueueJob,
    processDiscordQueue,
    buildSessionDiscordPreview,
    maybeAutoSendDiscordForRace,
    buildDiscordFakeSummaryData,
    sendDiscordTestWebhook,
    sendRaceDayWebhook,
    sendSeasonWebhook,
    copyTextToClipboard,
    setDiscordPreviewText,
    formatDiscordPayloadPreview
  };
})();
