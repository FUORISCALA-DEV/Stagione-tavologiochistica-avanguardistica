(() => {
  const canvas = document.getElementById('wheel');
  const ctx = canvas.getContext('2d');
  const input = document.getElementById('gameInput');
  const addBtn = document.getElementById('addBtn');
  const spinBtn = document.getElementById('spinBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const clearBtn = document.getElementById('clearBtn');
  const list = document.getElementById('gameList');
  const result = document.getElementById('result');
  const count = document.getElementById('count');
  const hub = document.getElementById('hub');
  const pointer = document.getElementById('pointer');

  const winOverlay = document.getElementById('winOverlay');
  const winPopup = document.getElementById('winPopup');
  const winName = document.getElementById('winName');
  const closeWin = document.getElementById('closeWin');
  const removeWin = document.getElementById('removeWin');
  const confetti = document.getElementById('confetti');

  const setupOverlay = document.getElementById('setupOverlay');
  const player1Input = document.getElementById('player1Input');
  const player2Input = document.getElementById('player2Input');
  const startSession = document.getElementById('startSession');
  const playerBadge = document.getElementById('playerBadge');

  const winnerOverlay = document.getElementById('winnerOverlay');
  const winnerGameLabel = document.getElementById('winnerGameLabel');
  const winnerP1 = document.getElementById('winnerP1');
  const winnerP2 = document.getElementById('winnerP2');

  const historyList = document.getElementById('historyList');
  const historyEmpty = document.getElementById('historyEmpty');
  const scoreboard = document.getElementById('scoreboard');
  const endTournamentBtn = document.getElementById('endTournamentBtn');
  const currentTournamentNote = document.getElementById('currentTournamentNote');
  const tournamentSeasonScore = document.getElementById('tournamentSeasonScore');
  const tournamentOverlay = document.getElementById('tournamentOverlay');
  const tournamentCoin = document.getElementById('tournamentCoin');
  const tournamentModalTitle = document.getElementById('tournamentModalTitle');
  const tournamentModalText = document.getElementById('tournamentModalText');
  const tournamentChoice = document.getElementById('tournamentChoice');
  const tournamentP1 = document.getElementById('tournamentP1');
  const tournamentP2 = document.getElementById('tournamentP2');
  const closeTournamentModal = document.getElementById('closeTournamentModal');

  const grandTableaux = document.getElementById('grandTableaux');
  const splashStage = document.getElementById('splashStage');
  const portalStage = document.getElementById('portalStage');
  const enterVanguard = document.getElementById('enterVanguard');
  let introAdvanced = false;
  const royalWheelOath = document.getElementById('royalWheelOath');

  const screens = [...document.querySelectorAll('.app-screen')];
  const navButtons = [...document.querySelectorAll('.app-nav [data-screen]')];
  const sessionBadge = document.getElementById('sessionBadge');
  const newPanel = document.getElementById('newPanel');
  const newTournamentBtn = document.getElementById('newTournamentBtn');
  const continueBtn = document.getElementById('continueBtn');
  const newP1 = document.getElementById('newP1');
  const newP2 = document.getElementById('newP2');
  const newStart = document.getElementById('newStart');
  const newEnd = document.getElementById('newEnd');
  const newAward = document.getElementById('newAward');
  const endLater = document.getElementById('endLater');
  const awardLater = document.getElementById('awardLater');
  const createTournament = document.getElementById('createTournament');
  let seasonStart = '', seasonEnd = '', seasonAward = '';

  const palette = [
    '#c99a3d','#345995','#8b2e2e','#547a5a','#7e5aa6',
    '#c46a3b','#3f7f87','#9e7b34','#6c7a93','#99516c',
    '#4f6b3d','#a15f43','#586fa8','#875a8e','#b08047'
  ];

  // Nessun gioco preinserito.
  let games = [];          // [{id,name,color}]
  let slices = [];         // due riferimenti per ogni gioco
  let rotation = 0;
  let spinning = false;
  let lastWinnerId = null;
  let nextId = 1;
  let player1 = '';
  let player2 = '';
  let pendingGame = null;
  const history = [];
  let finishedTournaments = [];
  let currentTournamentId = 1;
  let pendingTournamentTie = null;

  // Punti di ingresso scelti sull'analisi di Royal Wheel Oath.
  // Il risultato della Ruota arriva esattamente sul drop scelto.
  const wheelDropPoints = [33.05, 55.10, 102.80, 117.50, 128.45, 209.25];
  const wheelSpinDuration = 4200; // ms
  let audioReturnTimer = null;
  let audioFadeFrame = null;



  const STORAGE_KEY = 'torneoTavologiochisticoAvanguardistico.v1';
  const PRINTABLE_RULES = 'assets/docs/document_01.pdf';
  const PRINTABLE_TABLE = 'assets/docs/document_02.pdf';
  const EXAMPLE_TABLE = 'assets/docs/document_03.pdf';

  function dataUriToBlobUrl(uri) {
    const parts = uri.split(',');
    const mime = parts[0].match(/data:([^;]+)/)[1];
    const bytes = atob(parts[1]);
    const arr = new Uint8Array(bytes.length);
    for (let i=0;i<bytes.length;i++) arr[i]=bytes.charCodeAt(i);
    return URL.createObjectURL(new Blob([arr], {type:mime}));
  }

  function goScreen(name) {
    screens.forEach(el => el.classList.toggle('active', el.id === 'screen-' + name));
    navButtons.forEach(b => b.classList.toggle('active', b.dataset.screen === name));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function formatDate(v) { if(!v) return 'Da stabilire'; const [y,m,d]=v.split('-'); return `${d}/${m}/${y}`; }
  function updateSeasonUI() {
    sessionBadge.innerHTML = player1 && player2 ? `<b>${escapeHtml(player1)}</b> vs <b>${escapeHtml(player2)}</b> · ${formatDate(seasonStart)}` : 'Nessuna stagione attiva';
    playerBadge.textContent = player1 && player2 ? `${player1}  VS  ${player2}` : '';
    const map={regP1:player1||'—',regP2:player2||'—',regStart:formatDate(seasonStart),regEnd:formatDate(seasonEnd),regAward:formatDate(seasonAward)};
    Object.entries(map).forEach(([id,val])=>{const el=document.getElementById(id);if(el)el.textContent=val;});
    renderScoreboard();
  }
  function saveState() {
    if(!player1 || !player2) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({player1,player2,seasonStart,seasonEnd,seasonAward,games,history,nextId,finishedTournaments,currentTournamentId}));
    updateSeasonUI();
  }
  function loadState() {
    try { const st=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'); if(!st) return false;
      player1=st.player1||''; player2=st.player2||''; seasonStart=st.seasonStart||''; seasonEnd=st.seasonEnd||''; seasonAward=st.seasonAward||'';
      games=Array.isArray(st.games)?st.games:[];
      const loadedHistory=Array.isArray(st.history)?st.history:[];
      history.splice(0,history.length,...loadedHistory.map((e,i)=>({...e,tournamentId:e.tournamentId||1,id:e.id||(`legacy-${i}-${Date.now()}`)})));
      finishedTournaments=Array.isArray(st.finishedTournaments)?st.finishedTournaments:[];
      currentTournamentId=Number(st.currentTournamentId)||1;
      if(!st.currentTournamentId && finishedTournaments.length) currentTournamentId=Math.max(...finishedTournaments.map(t=>Number(t.id)||0))+1;
      nextId=st.nextId||1;
      rebuildSlices(); rotation=0; updateSeasonUI(); renderHistory(); renderAll(); return !!(player1&&player2);
    } catch(e) { return false; }
  }
  function resetSeasonForNewTournament() {
    localStorage.removeItem(STORAGE_KEY);
    player1=''; player2=''; seasonStart=''; seasonEnd=''; seasonAward='';
    games=[]; slices=[]; rotation=0; nextId=1;
    history.splice(0, history.length);
    finishedTournaments=[]; currentTournamentId=1; pendingTournamentTie=null;
    pendingGame=null; lastWinnerId=null; spinning=false;
    royalWheelOath.pause(); royalWheelOath.currentTime=0; royalWheelOath.volume=0;
    grandTableaux.pause(); grandTableaux.currentTime=0; grandTableaux.volume=0;
    renderHistory(); renderAll(); updateSeasonUI();
    result.textContent = "Inserisci almeno un gioco e procedi all'estrazione.";
  }

  function hasUnfinishedSeason() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return !!(saved && saved.player1 && saved.player2);
    } catch(e) {
      return !!(player1 && player2);
    }
  }

  function downloadData(data,name) { const a=document.createElement('a'); a.href=data; a.download=name; document.body.appendChild(a); a.click(); a.remove(); }

  function cancelAudioAutomation() {
    if (audioReturnTimer) {
      clearTimeout(audioReturnTimer);
      audioReturnTimer = null;
    }
    if (audioFadeFrame) {
      cancelAnimationFrame(audioFadeFrame);
      audioFadeFrame = null;
    }
  }

  function fadeVolume(audio, from, to, duration, done) {
    const start = performance.now();
    audio.volume = Math.max(0, Math.min(1, from));

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t * t * (3 - 2 * t);
      audio.volume = from + (to - from) * eased;

      if (t < 1) {
        audioFadeFrame = requestAnimationFrame(step);
      } else {
        audio.volume = to;
        audioFadeFrame = null;
        if (done) done();
      }
    }
    audioFadeFrame = requestAnimationFrame(step);
  }

  async function beginIntroTheme() {
    grandTableaux.loop = true;
    grandTableaux.volume = 0;
    try {
      await grandTableaux.play();
      fadeVolume(grandTableaux, 0, 0.62, 900);
    } catch (err) {
      console.warn('Grand Tableaux non avviata dalla splash:', err);
    }
  }

  function advanceSplash() {
    if (introAdvanced) return;
    introAdvanced = true;

    // La schermata FUORISCALA resta completamente silenziosa.
    splashStage.classList.add('exiting');
    setTimeout(() => {
      splashStage.classList.add('hidden');
      portalStage.classList.add('show');

      // Grand Tableaux parte solo DOPO la splash FUORISCALA,
      // quando compare la schermata del Torneo.
      beginIntroTheme();
    }, 390);
  }

  function enterApplication() {
    portalStage.classList.remove('show');
    portalStage.classList.add('hidden');
    document.body.classList.remove('intro-locked');
    goScreen('home');
  }

  // Splash FUORISCALA: animazione a zoom guidata via requestAnimationFrame,
  // identica a quella di Racing Dynasty (nessuna keyframe CSS complessa:
  // controllo totale fotogramma per fotogramma per evitare sfarfallii).
  function initStudioSplashLogo() {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const logo = document.getElementById('splashLogoImg');
    if (logo && !reduced) {
      const duration = 900;
      function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
      const overshootPeak = 3.6;
      function tick(now, startTime) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const scale = t < 0.5
          ? 0.3 + (overshootPeak - 0.3) * easeInOutCubic(t / 0.5)
          : overshootPeak - (overshootPeak - 1) * easeInOutCubic((t - 0.5) / 0.5);
        const opacity = Math.min(1, elapsed / 180);
        logo.style.transform = `scale(${scale.toFixed(4)})`;
        logo.style.opacity = String(opacity);
        if (t < 1) requestAnimationFrame(now2 => tick(now2, startTime));
      }
      setTimeout(() => {
        requestAnimationFrame(now => tick(now, now));
      }, 100);
    } else if (logo) {
      logo.style.opacity = '1';
      logo.style.transform = 'scale(1)';
    }

    setTimeout(() => {
      const hint = document.getElementById('splashSkipHint');
      if (hint && !introAdvanced) hint.classList.add('splash-hint-blink');
    }, 5000);
  }
  initStudioSplashLogo();

  splashStage.addEventListener('click', advanceSplash);
  splashStage.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advanceSplash(); }
  });
  enterVanguard.addEventListener('click', enterApplication);

  async function startTournamentTheme() {
    cancelAudioAutomation();
    grandTableaux.loop = true;
    grandTableaux.volume = 0;
    try {
      await grandTableaux.play();
      fadeVolume(grandTableaux, 0, 0.62, 900);
    } catch (err) {
      console.warn('Grand Tableaux non avviata:', err);
    }
  }

  async function startWheelMusic() {
    cancelAudioAutomation();

    const drop = wheelDropPoints[Math.floor(Math.random() * wheelDropPoints.length)];
    const leadSeconds = wheelSpinDuration / 1000;
    const startAt = Math.max(0, drop - leadSeconds);

    try {
      royalWheelOath.pause();
      royalWheelOath.currentTime = startAt;
      royalWheelOath.volume = 0;

      // Entrata abbastanza netta, ma non istantanea.
      const grandStart = grandTableaux.volume;
      fadeVolume(grandTableaux, grandStart, 0.06, 520);

      await royalWheelOath.play();
      fadeVolume(royalWheelOath, 0, 0.92, 520);
    } catch (err) {
      console.warn('Royal Wheel Oath non avviata:', err);
    }
  }

  function scheduleTournamentThemeReturn() {
    cancelAudioAutomation();

    // Royal Wheel Oath rimane presente ancora circa 5,5 secondi
    // dopo GIOCHIAMO, poi esce con un fade più morbido.
    audioReturnTimer = setTimeout(() => {
      audioReturnTimer = null;

      const royalStart = royalWheelOath.volume;
      const grandStart = grandTableaux.volume;

      // Il tema principale rientra più dolcemente di quanto sia uscito.
      fadeVolume(grandTableaux, grandStart, 0.62, 2800);
      setTimeout(() => {
        fadeVolume(royalWheelOath, royalStart, 0, 3200, () => {
          royalWheelOath.pause();
        });
      }, 150);
    }, 5500);
  }

  function startPlayers() {
    const p1 = player1Input.value.trim();
    const p2 = player2Input.value.trim();
    if (!p1 || !p2) {
      if (!p1) player1Input.focus();
      else player2Input.focus();
      return;
    }
    if (p1.toLowerCase() === p2.toLowerCase()) {
      player2Input.focus();
      return;
    }
    player1 = p1;
    player2 = p2;
    playerBadge.textContent = `${player1}  VS  ${player2}`;
    renderScoreboard();
    setupOverlay.classList.add('hidden');
    saveState();
    startTournamentTheme();
    input.focus();
  }

  function tournamentEntries(tournamentId) {
    return history.filter(entry => Number(entry.tournamentId || 1) === Number(tournamentId));
  }

  function tournamentScore(tournamentId) {
    const rows = tournamentEntries(tournamentId);
    return {
      p1: rows.filter(e => e.winner === player1).length,
      p2: rows.filter(e => e.winner === player2).length,
      total: rows.length
    };
  }

  function tournamentIsClosed(id) {
    return finishedTournaments.some(t => Number(t.id) === Number(id));
  }

  function renderTournamentSeasonScore() {
    if (!player1 || !player2) {
      tournamentSeasonScore.textContent = '—';
      return;
    }
    const p1 = finishedTournaments.filter(t => t.winner === player1).length;
    const p2 = finishedTournaments.filter(t => t.winner === player2).length;
    tournamentSeasonScore.innerHTML = `${escapeHtml(player1)} <strong>${p1}-${p2}</strong> ${escapeHtml(player2)}`;
  }

  function renderScoreboard() {
    const score = tournamentScore(currentTournamentId);
    if (!player1 || !player2) {
      scoreboard.textContent = '';
      return;
    }
    scoreboard.innerHTML = `${escapeHtml(player1)} <span class="score-number">${score.p1}-${score.p2}</span> ${escapeHtml(player2)}`;
    currentTournamentNote.textContent = `Torneo ${currentTournamentId} in corso · ${score.total} ${score.total === 1 ? 'partita registrata' : 'partite registrate'}`;
    renderTournamentSeasonScore();
  }

  function updateHistoryEntry(entryId, field, value) {
    const entry = history.find(e => String(e.id) === String(entryId));
    if (!entry || tournamentIsClosed(entry.tournamentId)) return;
    if (field === 'game') entry.game = value.trim() || entry.game;
    if (field === 'winner' && (value === player1 || value === player2)) entry.winner = value;
    renderHistory();
    saveState();
  }

  function deleteHistoryEntry(entryId) {
    const idx = history.findIndex(e => String(e.id) === String(entryId));
    if (idx < 0 || tournamentIsClosed(history[idx].tournamentId)) return;
    history.splice(idx, 1);
    renderHistory();
    saveState();
  }

  function removeTournamentEnd(tournamentId) {
    const id = Number(tournamentId);
    const latestClosed = finishedTournaments.length ? Math.max(...finishedTournaments.map(t => Number(t.id))) : 0;
    if (id !== latestClosed) {
      window.alert('Per riaprire questo Torneo devi prima rimuovere i Fine Torneo successivi.');
      return;
    }

    const nextTournamentEntries = history.filter(e => Number(e.tournamentId) > id);
    if (nextTournamentEntries.length) {
      window.alert('Il Torneo successivo contiene già delle partite. Eliminale prima di riaprire questo Torneo.');
      return;
    }

    finishedTournaments = finishedTournaments.filter(t => Number(t.id) !== id);
    currentTournamentId = id;
    renderHistory();
    saveState();
  }

  function renderHistory() {
    renderScoreboard();
    historyList.innerHTML = '';

    const ids = new Set(history.map(e => Number(e.tournamentId || 1)));
    finishedTournaments.forEach(t => ids.add(Number(t.id)));
    ids.add(Number(currentTournamentId));
    const orderedIds = [...ids].sort((a,b) => a-b);

    const anyRows = history.length > 0;
    historyEmpty.style.display = anyRows ? 'none' : 'block';

    orderedIds.forEach(tid => {
      const rows = tournamentEntries(tid);
      const finish = finishedTournaments.find(t => Number(t.id) === tid);
      if (!rows.length && !finish && tid !== currentTournamentId) return;

      const group = document.createElement('div');
      group.className = 'tournament-group';

      const title = document.createElement('div');
      title.className = 'tournament-group-title';
      title.textContent = finish ? `TORNEO ${tid} · CONCLUSO` : `TORNEO ${tid} · IN CORSO`;
      group.appendChild(title);

      rows.forEach(entry => {
        const frozen = !!finish;
        const row = document.createElement('div');
        row.className = `history-item ${frozen ? 'frozen' : 'editable'}`;

        if (frozen) {
          row.textContent = `${entry.game} - Vinto da ${entry.winner}`;
        } else {
          const gameInput = document.createElement('input');
          gameInput.className = 'history-edit-input';
          gameInput.value = entry.game;
          gameInput.title = 'Nome gioco modificabile finché il Torneo non viene chiuso';
          gameInput.addEventListener('change', () => updateHistoryEntry(entry.id, 'game', gameInput.value));

          const winnerSelect = document.createElement('select');
          winnerSelect.className = 'history-winner-select';
          [player1, player2].forEach(name => {
            const op = document.createElement('option');
            op.value = name;
            op.textContent = `Vinto da ${name}`;
            op.selected = entry.winner === name;
            winnerSelect.appendChild(op);
          });
          winnerSelect.addEventListener('change', () => updateHistoryEntry(entry.id, 'winner', winnerSelect.value));

          const del = document.createElement('button');
          del.className = 'danger history-delete';
          del.textContent = '×';
          del.title = 'Elimina questa partita';
          del.addEventListener('click', () => deleteHistoryEntry(entry.id));

          row.append(gameInput, winnerSelect, del);
        }
        group.appendChild(row);
      });

      if (finish) {
        const marker = document.createElement('div');
        marker.className = 'tournament-finish';

        const copy = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = `FINE TORNEO ${tid} · VINCE ${finish.winner}`;
        const detail = document.createElement('span');
        detail.textContent = `${player1} ${finish.p1wins}-${finish.p2wins} ${player2}${finish.tiebreak ? ' · spareggio con lancio della moneta' : ''}`;
        copy.append(strong, detail);

        const remove = document.createElement('button');
        remove.className = 'danger';
        remove.textContent = 'RIMUOVI FINE TORNEO';
        remove.addEventListener('click', () => removeTournamentEnd(tid));

        marker.append(copy, remove);
        group.appendChild(marker);
      }

      historyList.appendChild(group);
    });

    renderTournamentSeasonScore();
  }

  function askWinner(game) {
    pendingGame = game;
    winnerGameLabel.textContent = `Partita: ${game.name}`;
    winnerP1.textContent = player1;
    winnerP2.textContent = player2;
    winnerOverlay.classList.remove('hidden');
    winnerP1.focus();
  }

  function registerWinner(winnerName) {
    if (!pendingGame) return;

    history.push({
      id: `g-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      game: pendingGame.name,
      winner: winnerName,
      tournamentId: currentTournamentId
    });
    renderHistory();

    const id = pendingGame.id;
    games = games.filter(g => g.id !== id);
    pendingGame = null;
    winnerOverlay.classList.add('hidden');

    rebuildSlices();
    rotation = 0;
    result.textContent = games.length >= 2
      ? `Risultato registrato. Il gioco è stato rimosso e la Ruota è pronta per la prossima estrazione.`
      : games.length === 1
        ? `Risultato registrato. Rimane un solo gioco: premi GIRA LA RUOTA per disputarlo.`
        : `Risultato registrato. Tutti i giochi sono stati disputati.`;
    renderAll();
    saveState();
  }

  function showTournamentResult(title, message, coin='🏆') {
    tournamentCoin.textContent = coin;
    tournamentModalTitle.textContent = title;
    tournamentModalText.innerHTML = message;
    tournamentChoice.classList.add('hidden');
    tournamentOverlay.classList.remove('hidden');
  }

  function closeTournamentWithWinner(winner, tiebreak=false) {
    const score = tournamentScore(currentTournamentId);
    finishedTournaments.push({
      id: currentTournamentId,
      winner,
      p1wins: score.p1,
      p2wins: score.p2,
      tiebreak,
      closedAt: Date.now()
    });
    const closedId = currentTournamentId;
    currentTournamentId += 1;
    pendingTournamentTie = null;
    renderHistory();
    saveState();
    showTournamentResult(
      `TORNEO ${closedId} ASSEGNATO`,
      `<b>${escapeHtml(winner)}</b> è ufficialmente il vincitore del Torneo.<br><br>${escapeHtml(player1)} ${score.p1}-${score.p2} ${escapeHtml(player2)}${tiebreak ? '<br><small>Decisione ottenuta tramite lancio della moneta.</small>' : ''}`,
      '🏆'
    );
  }

  function endCurrentTournament() {
    const score = tournamentScore(currentTournamentId);
    if (!score.total) {
      window.alert('Non ci sono partite registrate nel Torneo corrente.');
      return;
    }

    if (score.p1 > score.p2) {
      closeTournamentWithWinner(player1, false);
      return;
    }
    if (score.p2 > score.p1) {
      closeTournamentWithWinner(player2, false);
      return;
    }

    pendingTournamentTie = { id: currentTournamentId, p1: score.p1, p2: score.p2 };
    tournamentCoin.textContent = '🪙';
    tournamentModalTitle.textContent = `PARITÀ ${score.p1}-${score.p2}`;
    tournamentModalText.innerHTML = `Il Torneo non può chiudersi in parità.<br><b>Lanciate una moneta</b> per stabilire il vincitore e poi indicate qui sotto chi ha vinto lo spareggio.`;
    tournamentP1.textContent = player1;
    tournamentP2.textContent = player2;
    tournamentChoice.classList.remove('hidden');
    tournamentOverlay.classList.remove('hidden');
  }

  function randomColor() {
    const used = new Set(games.map(g => g.color));
    const free = palette.filter(c => !used.has(c));
    return (free.length ? free : palette)[games.length % (free.length || palette.length)];
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Crea esattamente due spicchi per gioco.
  // La costruzione in due metà garantisce che all'interno di ogni metà
  // non ci siano duplicati consecutivi; i due soli confini vengono verificati.
  function rebuildSlices() {
    if (!games.length) {
      slices = [];
      return;
    }

    if (games.length === 1) {
      // Con un solo nome è matematicamente impossibile evitare due uguali vicini.
      // Mostriamo comunque i due spicchi richiesti; la ruota resta non avviabile.
      slices = [games[0], games[0]];
      return;
    }

    let first, second, attempts = 0;
    do {
      first = shuffleArray(games);
      second = shuffleArray(games);
      attempts++;
    } while (
      attempts < 500 &&
      (first[first.length - 1].id === second[0].id ||
       second[second.length - 1].id === first[0].id)
    );

    // Fallback deterministico, nel caso estremamente improbabile di 500 tentativi falliti.
    if (first[first.length - 1].id === second[0].id ||
        second[second.length - 1].id === first[0].id) {
      second = first.slice(1).concat(first[0]);
    }

    slices = first.concat(second);
  }

  function addGame() {
    const name = input.value.trim();
    if (!name || spinning) return;

    games.push({
      id: nextId++,
      name,
      color: randomColor()
    });

    input.value = '';
    rebuildSlices();  // rimescolamento automatico a ogni inserimento
    rotation = 0;
    result.textContent = games.length >= 2
      ? 'Ruota aggiornata. Gli spicchi sono stati rimescolati automaticamente.'
      : 'Inserisci almeno un altro gioco.';
    renderAll();
    saveState();
    input.focus();
  }

  function removeGameById(id) {
    if (spinning) return;
    games = games.filter(g => g.id !== id);
    rebuildSlices();
    rotation = 0;
    result.textContent = games.length >= 2
      ? 'Gioco rimosso. La Ruota è stata rimescolata.'
      : games.length === 1
        ? 'Rimane un solo gioco: premi GIRA LA RUOTA.'
        : "Inserisci almeno un gioco e procedi all'estrazione.";
    renderAll();
    saveState();
  }

  function renderList() {
    list.innerHTML = '';

    games.forEach(g => {
      const row = document.createElement('div');
      row.className = 'item';

      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.background = g.color;

      const name = document.createElement('div');
      name.textContent = g.name;

      const btn = document.createElement('button');
      btn.className = 'danger';
      btn.textContent = 'Rimuovi';
      btn.addEventListener('click', () => removeGameById(g.id));

      row.append(sw, name, btn);
      list.append(row);
    });

    count.textContent = `${games.length} ${games.length === 1 ? 'gioco' : 'giochi'} · ${slices.length} spicchi`;
    spinBtn.disabled = games.length < 1 || spinning;
    shuffleBtn.disabled = games.length < 2 || spinning;
  }

  function drawWheel() {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.45;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    if (!slices.length) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#17233a';
      ctx.fill();
      ctx.lineWidth = 18;
      ctx.strokeStyle = '#c99a3d';
      ctx.stroke();
      ctx.restore();
      return;
    }

    const slice = Math.PI * 2 / slices.length;

    for (let i = 0; i < slices.length; i++) {
      const entry = slices[i];
      const a0 = i * slice - slice / 2;
      const a1 = a0 + slice;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, a0, a1);
      ctx.closePath();
      ctx.fillStyle = entry.color;
      ctx.fill();

      ctx.lineWidth = 5;
      ctx.strokeStyle = '#0d1729';
      ctx.stroke();

      // Nome parallelo al raggio, una sola riga, dimensione adattiva.
      ctx.save();
      const mid = a0 + slice / 2;
      ctx.rotate(mid);

      const innerTextR = r * 0.25;
      const outerTextR = r * 0.86;
      const textCenterR = (innerTextR + outerTextR) / 2;
      const maxTextW = outerTextR - innerTextR;
      const txt = entry.name;

      const lengthBased = Math.max(13, Math.min(45, 51 - txt.length * 1.28));
      const wedgeThickness = Math.max(14, 2 * textCenterR * Math.sin(slice / 2) * 0.70);
      let fs = Math.min(lengthBased, wedgeThickness * 0.48);

      ctx.font = `800 ${fs}px Arial`;
      while (ctx.measureText(txt).width > maxTextW && fs > 10) {
        fs -= 1;
        ctx.font = `800 ${fs}px Arial`;
      }

      // Il nome è un vero e proprio adesivo applicato allo spicchio:
      // ruota insieme alla Ruota e NON viene mai raddrizzato rispetto allo schermo.
      // Risulta quindi naturalmente orizzontale/leggibile solo quando passa
      // sul lato destro, in corrispondenza della freccia.
      ctx.translate(textCenterR, 0);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f4ead3';
      ctx.strokeStyle = 'rgba(13,23,41,.88)';
      ctx.lineWidth = Math.max(3, fs * 0.17);
      ctx.strokeText(txt, 0, 0);
      ctx.fillText(txt, 0, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#c99a3d';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = '#0d1729';
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#c99a3d';
    ctx.stroke();

    ctx.restore();
  }

  function pointerIndex() {
    if (!slices.length) return -1;
    const slice = Math.PI * 2 / slices.length;
    let local = (-rotation) % (Math.PI * 2);
    if (local < 0) local += Math.PI * 2;
    return Math.floor(((local + slice / 2) % (Math.PI * 2)) / slice) % slices.length;
  }

  function updatePointer() {
    const idx = pointerIndex();
    const color = idx >= 0 ? slices[idx].color : '#f4ead3';
    pointer.style.borderRightColor = color;
    pointer.style.filter = `drop-shadow(0 3px 4px rgba(0,0,0,.4)) drop-shadow(0 0 9px ${color})`;
  }

  function hexToRgb(hex) {
    const v = hex.replace('#', '');
    return {
      r: parseInt(v.substring(0, 2), 16),
      g: parseInt(v.substring(2, 4), 16),
      b: parseInt(v.substring(4, 6), 16)
    };
  }

  function brighter(hex, amount = 60) {
    const {r,g,b} = hexToRgb(hex);
    return `rgb(${Math.min(255,r+amount)},${Math.min(255,g+amount)},${Math.min(255,b+amount)})`;
  }

  function darker(hex, amount = 45) {
    const {r,g,b} = hexToRgb(hex);
    return `rgb(${Math.max(0,r-amount)},${Math.max(0,g-amount)},${Math.max(0,b-amount)})`;
  }

  function makeConfetti(color) {
    confetti.innerHTML = '';
    const colors = [color, brighter(color,80), darker(color,35), '#f4ead3'];

    for (let i = 0; i < 46; i++) {
      const piece = document.createElement('i');
      piece.className = 'confetti-piece';
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 230;

      piece.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      piece.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      piece.style.setProperty('--rot', `${Math.round(Math.random() * 900 - 450)}deg`);
      piece.style.setProperty('--piece', colors[i % colors.length]);
      piece.style.animationDelay = `${Math.random() * 110}ms`;
      piece.style.width = `${6 + Math.random() * 7}px`;
      piece.style.height = `${10 + Math.random() * 13}px`;
      confetti.appendChild(piece);
    }
  }

  function showWinner(entry) {
    lastWinnerId = entry.id;
    winName.textContent = entry.name;
    winPopup.style.setProperty('--win', entry.color);
    makeConfetti(entry.color);
    winOverlay.classList.add('show');
    winOverlay.setAttribute('aria-hidden', 'false');
    closeWin.focus();
  }

  function hideWinner() {
    winOverlay.classList.remove('show');
    winOverlay.setAttribute('aria-hidden', 'true');
    lastWinnerId = null;
  }

  function renderAll() {
    renderList();
    drawWheel();
    updatePointer();
  }

  function spin() {
    if (spinning || games.length < 1) return;

    spinning = true;
    renderList();
    result.innerHTML = "La Federazione sta procedendo all'estrazione…";
    startWheelMusic();

    const start = performance.now();
    const startRot = rotation;
    const extraTurns = 6 + Math.random() * 4;
    const randomStop = games.length === 1 ? 0 : Math.random() * Math.PI * 2;
    const target = startRot + extraTurns * Math.PI * 2 + randomStop;
    const duration = wheelSpinDuration;

    const ease = t => 1 - Math.pow(1 - t, 3);

    function animate(now) {
      const t = Math.min(1, (now - start) / duration);
      rotation = startRot + (target - startRot) * ease(t);

      drawWheel();
      updatePointer();

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        rotation %= Math.PI * 2;
        spinning = false;
        renderList();
        updatePointer();

        const winner = games.length === 1
          ? games[0]
          : slices[pointerIndex()];

        result.innerHTML = `Gioco ufficialmente estratto:<strong>${escapeHtml(winner.name)}</strong>`;
        showWinner(winner);
      }
    }

    requestAnimationFrame(animate);
  }

  function shuffleWheel() {
    if (spinning || games.length < 2) return;
    rebuildSlices();
    rotation = 0;
    result.textContent = 'Spicchi rimescolati.';
    renderAll();
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[s]));
  }

  navButtons.forEach(b => b.addEventListener('click', () => goScreen(b.dataset.screen)));
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => goScreen(b.dataset.go)));
  newTournamentBtn.addEventListener('click', () => {
    const opening = newPanel.classList.contains('hidden');
    if (!opening) {
      newPanel.classList.add('hidden');
      return;
    }

    if (hasUnfinishedSeason()) {
      const ok = window.confirm(
        'C’è già una Stagione Tavologiochistica non conclusa salvata su questo dispositivo.\n\n' +
        'Iniziando un nuovo Torneo cancellerai la stagione precedente, compresi giochi, storico e punteggio.\n\n' +
        'Sei sicuro di voler procedere?'
      );
      if (!ok) return;
      resetSeasonForNewTournament();
    }

    newP1.value=''; newP2.value=''; newStart.value=''; newEnd.value=''; newAward.value='';
    endLater.checked=false; awardLater.checked=false; newEnd.disabled=false; newAward.disabled=false;
    newPanel.classList.remove('hidden');
    newP1.focus();
  });
  endLater.addEventListener('change',()=>{newEnd.disabled=endLater.checked;if(endLater.checked)newEnd.value='';});
  awardLater.addEventListener('change',()=>{newAward.disabled=awardLater.checked;if(awardLater.checked)newAward.value='';});
  createTournament.addEventListener('click',()=>{
    const a=newP1.value.trim(), b=newP2.value.trim(); if(!a||!b||a.toLowerCase()===b.toLowerCase()||!newStart.value) return;
    player1=a; player2=b; seasonStart=newStart.value; seasonEnd=endLater.checked?'':newEnd.value; seasonAward=awardLater.checked?'':newAward.value;
    games=[]; slices=[]; history.length=0; finishedTournaments=[]; currentTournamentId=1; pendingTournamentTie=null; nextId=1; rotation=0; saveState(); renderHistory(); renderAll(); startTournamentTheme(); goScreen('wheel');
  });
  continueBtn.addEventListener('click',()=>{ if(loadState()){startTournamentTheme();goScreen('wheel')} else {newPanel.classList.remove('hidden');newP1.focus();} });
  document.getElementById('downloadRules').addEventListener('click',()=>downloadData(PRINTABLE_RULES,'Regolamento_Tavologiochistico_Avanguardistico_LIBRETTO.pdf'));
  document.getElementById('downloadRules2').addEventListener('click',()=>downloadData(PRINTABLE_RULES,'Regolamento_Tavologiochistico_Avanguardistico_LIBRETTO.pdf'));
  document.getElementById('downloadTable').addEventListener('click',()=>downloadData(PRINTABLE_TABLE,'Tabella_Parametristica_VUOTA_DA_STAMPARE.pdf'));
  document.getElementById('downloadTableExample').addEventListener('click',()=>downloadData(EXAMPLE_TABLE,'Tabella_Parametristica_ESEMPIO_COMPILATO.pdf'));

  startSession.addEventListener('click', startPlayers);
  player1Input.addEventListener('keydown', e => {
    if (e.key === 'Enter') player2Input.focus();
  });
  player2Input.addEventListener('keydown', e => {
    if (e.key === 'Enter') startPlayers();
  });

  endTournamentBtn.addEventListener('click', endCurrentTournament);
  tournamentP1.addEventListener('click', () => {
    if (pendingTournamentTie) closeTournamentWithWinner(player1, true);
  });
  tournamentP2.addEventListener('click', () => {
    if (pendingTournamentTie) closeTournamentWithWinner(player2, true);
  });
  closeTournamentModal.addEventListener('click', () => {
    tournamentOverlay.classList.add('hidden');
    if (pendingTournamentTie) {
      pendingTournamentTie = null;
      tournamentChoice.classList.add('hidden');
    }
  });
  tournamentOverlay.addEventListener('click', e => {
    if (e.target === tournamentOverlay && !pendingTournamentTie) tournamentOverlay.classList.add('hidden');
  });

  winnerP1.addEventListener('click', () => registerWinner(player1));
  winnerP2.addEventListener('click', () => registerWinner(player2));

  addBtn.addEventListener('click', addGame);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') addGame();
  });

  spinBtn.addEventListener('click', spin);
  hub.addEventListener('click', spin);
  hub.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      spin();
    }
  });

  shuffleBtn.addEventListener('click', shuffleWheel);

  clearBtn.addEventListener('click', () => {
    if (spinning) return;
    games = [];
    slices = [];
    rotation = 0;
    renderHistory();
    royalWheelOath.pause();
    royalWheelOath.volume = 0;
    grandTableaux.volume = 0.62;
    if (player1 && player2 && grandTableaux.paused) grandTableaux.play().catch(() => {});
    result.textContent = "Inserisci almeno un gioco e procedi all'estrazione.";
    renderAll();
    saveState();
  });

  closeWin.addEventListener('click', hideWinner);

  // "GIOCHIAMO" chiude l'esito della Ruota e apre il verbale della partita.
  // Il gioco viene rimosso soltanto dopo aver registrato il vincitore.
  removeWin.addEventListener('click', () => {
    if (lastWinnerId == null) {
      hideWinner();
      return;
    }

    const selected = games.find(g => g.id === lastWinnerId);
    hideWinner();
    scheduleTournamentThemeReturn();
    if (selected) askWinner(selected);
  });

  winOverlay.addEventListener('click', e => {
    if (e.target === winOverlay) hideWinner();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && winOverlay.classList.contains('show')) {
      hideWinner();
    }
  });

  loadState();
  updateSeasonUI();

  // --- CALCOLATORE AWARDS ---
  const calcIds = ['cpLog','cpStr','cpTat','cpDue','cpFor','cpPia','cpGes','cpLet'];
  calcIds.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    for (let v=1; v<=5; v++) {
      const op = document.createElement('option');
      op.value = String(v);
      op.textContent = String(v);
      if (v === 3) op.selected = true;
      sel.appendChild(op);
    }
  });

  function calcVal(id) {
    return Number(document.getElementById(id)?.value || 3);
  }

  function fmtAward(n) {
    return n.toFixed(1).replace('.', ',');
  }

  function updateAwardCalculator() {
    const log = calcVal('cpLog');
    const str = calcVal('cpStr');
    const tat = calcVal('cpTat');
    const due = calcVal('cpDue');
    const fort = calcVal('cpFor');
    const pia = calcVal('cpPia');
    const ges = calcVal('cpGes');
    const lett = calcVal('cpLet');

    const strategico = str*0.40 + pia*0.30 + ges*0.20 + log*0.10;
    const tattico = tat*0.50 + log*0.30 + ges*0.20;
    const duellistico = due*0.50 + lett*0.30 + tat*0.20;
    const culistico = fort;

    document.getElementById('crStrat').textContent = fmtAward(strategico);
    document.getElementById('crTatt').textContent = fmtAward(tattico);
    document.getElementById('crDuel').textContent = fmtAward(duellistico);
    document.getElementById('crCulo').textContent = fmtAward(culistico);

    const game = (document.getElementById('calcGame').value || 'Nome gioco').trim();
    const cards = document.getElementById('calcCards').value;
    const time = (document.getElementById('calcTime').value || '—').trim();
    const row = [
      game, cards, log, str, tat, due, fort, pia, ges, lett, time,
      fmtAward(strategico), fmtAward(tattico), fmtAward(duellistico), fmtAward(culistico)
    ].join(' | ');
    document.getElementById('calcRowPreview').textContent = row;
  }

  [...calcIds,'calcGame','calcCards','calcTime'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateAwardCalculator);
    document.getElementById(id)?.addEventListener('change', updateAwardCalculator);
  });

  document.getElementById('resetCalculator')?.addEventListener('click', () => {
    document.getElementById('calcGame').value = '';
    document.getElementById('calcCards').value = 'NO';
    document.getElementById('calcTime').value = '';
    calcIds.forEach(id => document.getElementById(id).value = '3');
    updateAwardCalculator();
  });

  document.getElementById('copyCalcRow')?.addEventListener('click', async () => {
    const row = document.getElementById('calcRowPreview').textContent;
    const btn = document.getElementById('copyCalcRow');
    try {
      await navigator.clipboard.writeText(row);
      const old = btn.textContent;
      btn.textContent = 'COPIATA';
      setTimeout(() => btn.textContent = old, 1300);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = row;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  });

  updateAwardCalculator();


  // AUDIO_BACKGROUND_VISIBILITY_GUARD
  // Ferma immediatamente la musica quando la pagina/app non e' in primo piano.
  // Quando torna visibile riprende solo le tracce che stavano suonando.
  let audioSuspendedByBackground = false;
  let grandWasPlaying = false;
  let royalWasPlaying = false;

  function suspendAudioForBackground() {
    if (audioSuspendedByBackground) return;
    audioSuspendedByBackground = true;
    grandWasPlaying = !grandTableaux.paused && !grandTableaux.ended;
    royalWasPlaying = !royalWheelOath.paused && !royalWheelOath.ended;
    grandTableaux.pause();
    royalWheelOath.pause();
  }

  function resumeAudioFromBackground() {
    if (!audioSuspendedByBackground || document.hidden) return;
    audioSuspendedByBackground = false;

    if (grandWasPlaying) grandTableaux.play().catch(() => {});
    if (royalWasPlaying) royalWheelOath.play().catch(() => {});

    grandWasPlaying = false;
    royalWasPlaying = false;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspendAudioForBackground();
    else resumeAudioFromBackground();
  });
  window.addEventListener('pagehide', suspendAudioForBackground);
  window.addEventListener('pageshow', () => {
    if (!document.hidden) resumeAudioFromBackground();
  });
  window.addEventListener('blur', suspendAudioForBackground);
  window.addEventListener('focus', () => {
    if (!document.hidden) resumeAudioFromBackground();
  });

  renderHistory();
  renderAll();
})();