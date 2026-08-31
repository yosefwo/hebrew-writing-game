const niqqudChainRows = letters.map(letter => ({
  title: `האות ${letter}׳`,
  items: buildPointedLetterRow(letter)
}));

function buildPointedLetterRow(letter) {
  const extraPoint = 'בגדכפת'.includes(letter) ? 'ּ' : letter === 'ש' ? 'ׁ' : '';
  const withVowel = vowel => `${letter}${vowel}${extraPoint}`;
  return [
    withVowel('ָ'), withVowel('ַ'), withVowel('ֵ'),
    withVowel('ֶ'), withVowel('ִ'), withVowel('ֹ'),
    `${letter}${extraPoint}וּ`, withVowel('ֻ'), withVowel('ְ')
  ];
}

let niqqudChain = [];
let niqqudChainMode = false;

function startNiqqudChainGame() {
  show('niqqudchaingame');
  niqqudChain = [];
  niqqudChainMode = false;
  renderNiqqudTables();
  renderNiqqudChain();
  updateNiqqudChainMode();
}

function renderNiqqudTables() {
  byId('niqqudtables').innerHTML = niqqudChainRows.map(row => `
    <section class="niqqud-table-row">
      <h3>${row.title}</h3>
      <div class="niqqud-syllable-grid">
        ${row.items.map(item => `<button onclick="chooseNiqqudSyllable('${item}')">${item}</button>`).join('')}
      </div>
    </section>
  `).join('');
}

function chooseNiqqudSyllable(syllable) {
  say(`${syllable}. ${syllable}`, .62);
  if (!niqqudChainMode) return;
  if (niqqudChain.length >= 6) {
    byId('niqqudchainfeedback').textContent = 'אפשר להוסיף עד 6 אותיות';
    return;
  }
  niqqudChain.push(syllable);
  byId('niqqudchainfeedback').textContent = '';
  renderNiqqudChain();
}

function toggleNiqqudChainMode() {
  niqqudChainMode = !niqqudChainMode;
  updateNiqqudChainMode();
  say(niqqudChainMode ? 'מצב שרשרת הופעל' : 'מצב שרשרת הופסק');
}

function updateNiqqudChainMode() {
  const button = byId('niqqudchainbutton');
  button.classList.toggle('active', niqqudChainMode);
  button.setAttribute('aria-pressed', String(niqqudChainMode));
  byId('niqqudchainmode').textContent = niqqudChainMode ? 'לחצו על אותיות כדי להוסיף לשרשרת' : 'לחצו על השרשרת כדי להתחיל לחבר';
}

function renderNiqqudChain() {
  byId('niqqudchainline').innerHTML = Array.from({length:6}, (_,index) =>
    `<span class="${index < niqqudChain.length ? 'filled' : ''}">${niqqudChain[index] || '·'}</span>`
  ).join('');
}

function playNiqqudChain() {
  if (!niqqudChain.length) {
    byId('niqqudchainfeedback').textContent = 'השרשרת עדיין ריקה';
    say('השרשרת עדיין ריקה');
    return;
  }
  byId('niqqudchainfeedback').textContent = '';
  say(niqqudChain.join('. '), .58);
}

function clearNiqqudChain() {
  niqqudChain = [];
  byId('niqqudchainfeedback').textContent = '';
  renderNiqqudChain();
}
