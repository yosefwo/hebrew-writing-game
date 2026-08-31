const niqqud = [
  { name:'קמץ', spokenName:'קָמָץ', demo:'קָ', example:'דָּג', hint:'צליל אַ' },
  { name:'פתח', spokenName:'פַּתָּח', demo:'קַ', example:'בַּת', hint:'צליל אַ' },
  { name:'צירה', spokenName:'צֵירֵי', demo:'קֵ', example:'עֵץ', hint:'צליל אֵ' },
  { name:'סגול', spokenName:'סֶגּוֹל', demo:'קֶ', example:'יֶלֶד', hint:'צליל אֶ' },
  { name:'חיריק', spokenName:'חִירִיק', demo:'קִ', example:'אִישׁ', hint:'צליל אִי' },
  { name:'חולם', spokenName:'חוֹלָם', demo:'קֹ', example:'אוֹר', hint:'צליל אוֹ' },
  { name:'שורוק', spokenName:'שׁוּרוּק', demo:'קוּ', example:'סוּס', hint:'צליל אוּ' },
  { name:'קיבוץ', spokenName:'קִבּוּץ', demo:'קֻ', example:'קֻפָּה', hint:'צליל אוּ' },
  { name:'שווא', spokenName:'שְׁוָא', demo:'קְ', example:'גְּבִינָה', hint:'לפעמים נשמע ולפעמים נח' }
];

const niqqudSoundGroups = [
  { id:'a', label:'קמץ או פתח', forms:'קָ  /  קַ', variants:[letter => letter+'ָ', letter => letter+'ַ'] },
  { id:'e', label:'צירה או סגול', forms:'קֵ  /  קֶ', variants:[letter => letter+'ֵ', letter => letter+'ֶ'] },
  { id:'i', label:'חיריק', forms:'קִ', variants:[letter => letter+'ִ'] },
  { id:'o', label:'חולם', forms:'קֹ', variants:[letter => letter+'ֹ'] },
  { id:'u', label:'שורוק או קיבוץ', forms:'קוּ  /  קֻ', variants:[letter => letter+'וּ', letter => letter+'ֻ'] }
];

const niqqudPracticeLetters = [...'זלמנסרש'];

let niqqudTarget = null;
let niqqudScore = 0;

function openNiqqudLearning() {
  show('niqqudlearn');
  byId('niqqudlist').innerHTML = niqqud.map((item,index) => `<button class="niqqud-card" onclick="speakNiqqud(${index})"><strong>${item.demo}</strong>${item.spokenName}<small>${item.hint} · ${item.example}</small>🔊</button>`).join('');
}

function speakNiqqud(index) {
  const item = niqqud[index];
  say(`${item.example}. ${item.spokenName}`, .68);
}

function startNiqqudGame() {
  show('niqqudgame'); niqqudScore = 0; nextNiqqudQuestion();
}

function nextNiqqudQuestion() {
  const group = niqqudSoundGroups[Math.floor(Math.random() * niqqudSoundGroups.length)];
  const letter = niqqudPracticeLetters[Math.floor(Math.random() * niqqudPracticeLetters.length)];
  const makeSyllable = group.variants[Math.floor(Math.random() * group.variants.length)];
  niqqudTarget = { group, syllable:makeSyllable(letter) };
  byId('niqqudletter').textContent = niqqudTarget.syllable;
  byId('niqqudprompt').textContent = 'איזה ניקוד שמעתם?';
  byId('niqqudcounter').textContent = `הצלחות: ${niqqudScore} מתוך 8`;
  byId('niqqudfeedback').textContent = '';
  byId('niqqudoptions').innerHTML = shuffled(niqqudSoundGroups).map(option => `<button class="game-option niqqud-answer" onclick="checkNiqqud('${option.id}',this)"><strong>${option.forms}</strong><small>${option.label}</small></button>`).join('');
  setTimeout(repeatNiqqud, 300);
}

function repeatNiqqud() { say(`${niqqudTarget.syllable}. ${niqqudTarget.syllable}`, .62); }
function checkNiqqud(groupId, button) {
  if (groupId !== niqqudTarget.group.id) {
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
