const niqqud = [
  { name:'קמץ', symbol:'אָ', sound:'אַ', example:'אָב', hint:'צליל אַ' },
  { name:'פתח', symbol:'אַ', sound:'אַ', example:'אַבָּא', hint:'צליל אַ' },
  { name:'צירה', symbol:'אֵ', sound:'אֵ', example:'אֵם', hint:'צליל אֵ' },
  { name:'סגול', symbol:'אֶ', sound:'אֶ', example:'אֶרֶץ', hint:'צליל אֶ' },
  { name:'חיריק', symbol:'אִ', sound:'אִי', example:'אִישׁ', hint:'צליל אִי' },
  { name:'חולם', symbol:'אֹ', sound:'אוֹ', example:'אוֹר', hint:'צליל אוֹ' },
  { name:'שורוק', symbol:'אוּ', sound:'אוּ', example:'סוּס', hint:'צליל אוּ' },
  { name:'קובוץ', symbol:'אֻ', sound:'אוּ', example:'שֻׁלְחָן', hint:'צליל אוּ' },
  { name:'שווא', symbol:'אְ', sound:'שווא', example:'שְׁמָרִים', hint:'שווא' }
];

let niqqudTarget = null;
let niqqudScore = 0;

function openNiqqudLearning() {
  show('niqqudlearn');
  byId('niqqudlist').innerHTML = niqqud.map((item,index) => `<button class="niqqud-card" onclick="speakNiqqud(${index})"><strong>${item.symbol}</strong>${item.name}<small>${item.hint} · ${item.example}</small>🔊</button>`).join('');
}

function speakNiqqud(index) {
  const item = niqqud[index];
  say(`${item.name}. ${item.sound}. כמו במילה ${item.example}`, .72);
}

function startNiqqudGame() {
  show('niqqudgame'); niqqudScore = 0; nextNiqqudQuestion();
}

function nextNiqqudQuestion() {
  niqqudTarget = niqqud[Math.floor(Math.random() * niqqud.length)];
  const options = shuffled([niqqudTarget, ...shuffled(niqqud.filter(x => x !== niqqudTarget)).slice(0,3)]);
  byId('niqqudprompt').textContent = `הקשיבו ובחרו את הניקוד המתאים`;
  byId('niqqudcounter').textContent = `הצלחות: ${niqqudScore} מתוך 8`;
  byId('niqqudfeedback').textContent = '';
  byId('niqqudoptions').innerHTML = options.map(item => `<button class="game-option niqqud-answer" onclick="checkNiqqud('${item.name}',this)">${item.symbol}<small>${item.name}</small></button>`).join('');
  setTimeout(repeatNiqqud, 300);
}

function repeatNiqqud() { say(`${niqqudTarget.name}. ${niqqudTarget.sound}`, .72); }
function checkNiqqud(name, button) {
  if (name !== niqqudTarget.name) {
    button.classList.add('wrong-pick'); byId('niqqudfeedback').textContent = retryText(); say(retryText());
    setTimeout(() => button.classList.remove('wrong-pick'), 700); return;
  }
  niqqudScore++; const praise = praiseText(); button.classList.add('right-pick');
  byId('niqqudfeedback').textContent = `👏 ${praise}`;
  document.querySelectorAll('#niqqudoptions button').forEach(b => b.disabled = true);
  if (niqqudScore >= 8) {
    const message = `${praiseText()} סיימת את שלב הניקוד!`;
    byId('niqqudfeedback').textContent = `🏆 ${message}`; applause(message);
    setTimeout(() => { niqqudScore = 0; nextNiqqudQuestion(); }, 2600);
  } else { applause(praise); setTimeout(nextNiqqudQuestion, 1450); }
}
