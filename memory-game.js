const openMemorySetup = (() => {
  const animals = [
    ['🐶', 'כלב'], ['🐱', 'חתול'], ['🐭', 'עכבר'], ['🐹', 'אוגר'], ['🐰', 'ארנב'],
    ['🦊', 'שועל'], ['🐻', 'דוב'], ['🐼', 'פנדה'], ['🐨', 'קואלה'], ['🐯', 'נמר'],
    ['🦁', 'אריה'], ['🐮', 'פרה'], ['🐵', 'קוף'], ['🐔', 'תרנגולת'], ['🦆', 'ברווז'],
    ['🐸', 'צפרדע'], ['🐢', 'צב'], ['🐘', 'פיל'], ['🦒', 'ג׳ירפה'], ['🦓', 'זברה']
  ];
  const pictures = [
    ['🦁', 'אַרְיֵה'], ['🍌', 'בָּנָנָה'], ['🥕', 'גֶּזֶר'], ['🐟', 'דָּג'],
    ['⛰️', 'הַר'], ['🌹', 'וֶרֶד'], ['🦓', 'זֶבְּרָה'], ['🐱', 'חָתוּל'],
    ['📱', 'טֵלֵפוֹן'], ['🌙', 'יָרֵחַ'], ['⚽', 'כַּדּוּר'], ['🍞', 'לֶחֶם'],
    ['🔑', 'מַפְתֵּחַ'], ['🕯️', 'נֵר'], ['📚', 'סְפָרִים'], ['🍇', 'עֲנָבִים'],
    ['🐘', 'פִּיל'], ['🐢', 'צָב'], ['🐵', 'קוֹף'], ['🚆', 'רַכֶּבֶת'],
    ['☀️', 'שֶׁמֶשׁ'], ['🍎', 'תַּפּוּחַ']
  ];
  // A full holam or shuruk uses a vav to carry the opening vowel.
  const firstLetter = word => word.match(/^[א-ת]\p{M}*(?:ו[ֹּ])?/u)[0];
  const identical = (face, label = face) => [{ face, label }, { face, label }];
  const games = {
    animals: ['זיכרון חיות', 'מצאו שתי חיות זהות.', animals.map(([face, name]) => identical(face, name))],
    numbers: ['זיכרון מספרים', 'מצאו שני מספרים זהים.', Array.from({ length: 20 }, (_, i) => identical(String(i + 1)))],
    pictures: ['זיכרון אות ותמונה', 'התאימו כל תמונה לאות הראשונה של המילה.', pictures.map(([face, name]) => [
      { face: firstLetter(name), label: firstLetter(name) },
      { face, label: name, word: name }
    ])],
    letters: ['זיכרון אותיות', 'מצאו שתי אותיות עם אותו ניקוד.', pictures.map(([, name]) => identical(firstLetter(name)))]
  };

  const setup = byId('memorysetup');
  const round = byId('memoryround');
  const grid = byId('memorygrid');
  const feedback = byId('memoryfeedback');
  const scores = byId('memoryscores');
  const turn = byId('memoryturn');
  const playerCount = byId('memoryplayers');
  const guest = byId('memoryguest');
  const settings = byId('memorysettings');
  const again = byId('memoryagain');
  let mode = 'pictures';
  let players = [];
  let active = 0;
  let opened = [];
  let pairCount = 0;
  let closeTimer;
  let announcement = '';

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function updateTurn(prefix = '', audible = true) {
    announcement = 'התור של ' + players[active].name;
    turn.textContent = announcement;
    renderScores();
    if (audible) say(prefix + announcement);
  }

  function renderScores(finished = false) {
    scores.replaceChildren(...players.map((player, index) => {
      const badge = document.createElement('span');
      badge.className = 'memory-score';
      badge.classList.toggle('active', !finished && index === active);
      badge.textContent = player.name + ' · ' + player.score + ' זוגות';
      return badge;
    }));
  }

  function setCard(button, card, state) {
    button.classList.toggle('open', state === 'open');
    button.classList.toggle('done', state === 'done');
    button.disabled = state === 'done';
    button.replaceChildren();
    button.setAttribute('aria-label', state === 'closed' ? 'קלף סגור ' + card.position : card.label);
    if (state === 'closed') return;
    const face = document.createElement('span');
    face.textContent = card.face;
    button.append(face);
    if (card.word) {
      const word = document.createElement('small');
      word.textContent = card.word;
      button.append(word);
    }
  }

  function pick(button, card) {
    if (opened.length === 2 || button.classList.contains('open') || button.disabled) return;
    setCard(button, card, 'open');
    opened.push({ button, card });
    if (opened.length < 2) {
      feedback.textContent = '';
      return;
    }

    if (opened[0].card.pair === card.pair) {
      opened.forEach(entry => setCard(entry.button, entry.card, 'done'));
      opened = [];
      players[active].score++;
      if (players.reduce((total, player) => total + player.score, 0) === pairCount) {
        renderScores(true);
        const [first, second] = players;
        announcement = second
          ? first.score === second.score ? 'תיקו! כל הכבוד לשניכם!' : 'ניצחון ל' + (first.score > second.score ? first.name : second.name) + '!'
          : 'כל הכבוד, ' + first.name + '! מצאת את כל הזוגות!';
        turn.textContent = 'המשחק הסתיים';
        feedback.textContent = announcement;
        again.classList.remove('hidden');
        again.focus({ preventScroll: true });
        applause(announcement);
      } else {
        feedback.textContent = 'מצאתם זוג!';
        grid.querySelector('button:not(:disabled)').focus({ preventScroll: true });
        updateTurn('מצאתם זוג! ');
      }
      return;
    }

    feedback.textContent = 'אין התאמה';
    closeTimer = setTimeout(() => {
      opened.forEach(entry => setCard(entry.button, entry.card, 'closed'));
      opened = [];
      active = (active + 1) % players.length;
      updateTurn('', currentScreen === 'memory');
    }, 1050);
  }

  function start() {
    clearTimeout(closeTimer);
    opened = [];
    active = 0;
    players = [{ name: getProfile()?.name || 'שחקן 1', score: 0 }];
    if (playerCount.value === '2') players.push({ name: guest.value.trim() || 'שחקן 2', score: 0 });
    pairCount = Number(byId('memorypairs').value);
    const pairs = shuffle(games[mode][2]).slice(0, pairCount);
    const deck = shuffle(pairs.flatMap((cards, pair) => cards.map(card => ({ ...card, pair }))));
    grid.classList.toggle('memory-grid-wide', pairCount >= 10);
    grid.replaceChildren(...deck.map((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'memory-card';
      card.position = index + 1;
      setCard(button, card, 'closed');
      button.addEventListener('click', () => pick(button, card));
      return button;
    }));
    feedback.textContent = '';
    setup.classList.add('hidden');
    again.classList.add('hidden');
    round.classList.remove('hidden');
    settings.classList.remove('hidden');
    grid.firstElementChild.focus({ preventScroll: true });
    updateTurn();
  }

  function open(nextMode = mode) {
    clearTimeout(closeTimer);
    mode = nextMode;
    opened = [];
    grid.replaceChildren();
    byId('memorytitle').textContent = games[mode][0];
    byId('memoryinstructions').textContent = games[mode][1];
    settings.classList.add('hidden');
    round.classList.add('hidden');
    setup.classList.remove('hidden');
    show('memory');
  }

  playerCount.addEventListener('change', () => {
    byId('memoryguestlabel').classList.toggle('hidden', playerCount.value !== '2');
  });
  setup.addEventListener('submit', event => {
    event.preventDefault();
    start();
  });
  settings.addEventListener('click', () => open());
  again.addEventListener('click', start);
  byId('memoryrepeat').addEventListener('click', () => say(announcement));
  byId('memoryback').addEventListener('click', () => show(['animals', 'numbers'].includes(mode) ? 'kindergarten' : 'grade1'));

  return open;
})();
