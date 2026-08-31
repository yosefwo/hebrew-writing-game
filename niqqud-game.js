const niqqud = [
  { name:'קמץ', spokenName:'קָמָץ', symbol:'אָ', example:'דָּג', hint:'צליל אַ' },
  { name:'פתח', spokenName:'פַּתָּח', symbol:'אַ', example:'בַּת', hint:'צליל אַ' },
  { name:'צירה', spokenName:'צֵירֵי', symbol:'אֵ', example:'עֵץ', hint:'צליל אֵ' },
  { name:'סגול', spokenName:'סֶגּוֹל', symbol:'אֶ', example:'יֶלֶד', hint:'צליל אֶ' },
  { name:'חיריק', spokenName:'חִירִיק', symbol:'אִ', example:'אִישׁ', hint:'צליל אִי' },
  { name:'חולם', spokenName:'חוֹלָם', symbol:'אֹ', example:'אוֹר', hint:'צליל אוֹ' },
  { name:'שורוק', spokenName:'שׁוּרוּק', symbol:'אוּ', example:'סוּס', hint:'צליל אוּ' },
  { name:'קיבוץ', spokenName:'קִבּוּץ', symbol:'אֻ', example:'כֻּלָּם', hint:'צליל אוּ' },
  { name:'שווא', spokenName:'שְׁוָא', symbol:'אְ', example:'גְּבִינָה', hint:'לפעמים נשמע ולפעמים נח' }
];

let niqqudTarget = null;
let niqqudScore = 0;

function openNiqqudLearning() {
  show('niqqudlearn');
  byId('niqqudlist').innerHTML = niqqud.map((item,index) => `<button class="niqqud-card" onclick="speakNiqqud(${index})"><strong>${item.symbol}</strong>${item.spokenName}<small>${item.hint} · ${item.example}</small>🔊</button>`).join('');
}

function speakNiqqud(index) {
  const item = niqqud[index];
  say(`${item.spokenName}. ${item.example}`, .68);
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
  byId('niqqudoptions').innerHTML = options.map(item => `<button class="game-option niqqud-answer" onclick="checkNiqqud('${item.name}',this)">${item.symbol}<small>${item.spokenName}</small></button>`).join('');
  setTimeout(repeatNiqqud, 300);
}

function repeatNiqqud() { say(`${niqqudTarget.spokenName}. ${niqqudTarget.example}`, .68); }
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
