const kindergartenObjects = ['🍎', '🍌', '🍓', '🐶', '🐱', '🐰', '🦋', '⭐'];
const shapeData = [
  { id: 'circle', name: 'עיגול' }, { id: 'square', name: 'ריבוע' },
  { id: 'triangle', name: 'משולש' }, { id: 'rectangle', name: 'מלבן' },
  { id: 'pentagon', name: 'מחומש' }, { id: 'hexagon', name: 'משושה' }
];
const colorData = [
  { name: 'אדום', value: '#ef5350' }, { name: 'כחול', value: '#4285d4' },
  { name: 'צהוב', value: '#f5c842' }, { name: 'ירוק', value: '#43a66f' }
];

let quantityTarget = 1;
function startQuantityMatch() { show('quantitymatch'); nextQuantityMatch(); }
function nextQuantityMatch() {
  quantityTarget = 1 + Math.floor(Math.random() * 9);
  const icon = kindergartenObjects[Math.floor(Math.random() * kindergartenObjects.length)];
  const counts = shuffled([quantityTarget, ...shuffled([1,2,3,4,5,6,7,8,9].filter(n => n !== quantityTarget)).slice(0, 3)]);
  byId('quantitynumber').textContent = quantityTarget;
  byId('quantityfeedback').textContent = '';
  byId('quantityoptions').innerHTML = counts.map(count => `<button class="game-option quantity-option" onclick="checkLearningAnswer(${count === quantityTarget},this,nextQuantityMatch,'quantityfeedback')">${icon.repeat(count)}</button>`).join('');
  say(`מצא תמונה שיש בה ${quantityTarget}`);
}

let shapeAnswer = '';
function startShapesGame() { show('shapesgame'); nextShapeQuestion(); }
function nextShapeQuestion() {
  const shape = shapeData[Math.floor(Math.random() * shapeData.length)];
  const color = colorData[Math.floor(Math.random() * colorData.length)];
  shapeAnswer = `${shape.id}-${color.name}`;
  const alternatives = shuffled(shapeData.flatMap(s => colorData.map(c => ({shape:s,color:c}))).filter(x => `${x.shape.id}-${x.color.name}` !== shapeAnswer)).slice(0,3);
  const options = shuffled([{shape,color}, ...alternatives]);
  byId('shapeprompt').textContent = `מצאו ${shape.name} בצבע ${color.name}`;
  byId('shapefeedback').textContent = '';
  byId('shapeoptions').innerHTML = options.map(x => `<button class="game-option" onclick="checkLearningAnswer('${x.shape.id}-${x.color.name}'==='${shapeAnswer}',this,nextShapeQuestion,'shapefeedback')"><span class="shape ${x.shape.id}" style="--shape-color:${x.color.value}"></span>${x.shape.name} ${x.color.name}</button>`).join('');
  say(`מצא ${shape.name} בצבע ${color.name}`);
}

let sequenceMissing = 1;
function startSequenceGame() { show('sequencegame'); nextSequence(); }
function nextSequence() {
  const start = 1 + Math.floor(Math.random() * 6);
  const numbers = [start, start+1, start+2, start+3];
  const missingIndex = Math.floor(Math.random() * numbers.length);
  sequenceMissing = numbers[missingIndex];
  const options = shuffled([sequenceMissing, ...shuffled([1,2,3,4,5,6,7,8,9,10].filter(n => n !== sequenceMissing)).slice(0,3)]);
  byId('sequenceview').innerHTML = numbers.map((n,i) => `<span>${i === missingIndex ? '?' : n}</span>`).join('');
  byId('sequencefeedback').textContent = '';
  byId('sequenceoptions').innerHTML = options.map(n => `<button class="game-option" onclick="checkLearningAnswer(${n === sequenceMissing},this,nextSequence,'sequencefeedback')">${n}</button>`).join('');
  say('איזה מספר חסר ברצף?');
}

let shadowTarget = '';
function startShadowGame() { show('shadowgame'); nextShadow(); }
function nextShadow() {
  shadowTarget = kindergartenObjects[Math.floor(Math.random() * kindergartenObjects.length)];
  const choices = shuffled([shadowTarget, ...shuffled(kindergartenObjects.filter(x => x !== shadowTarget)).slice(0,3)]);
  byId('shadowpicture').textContent = shadowTarget;
  byId('shadowfeedback').textContent = '';
  byId('shadowoptions').innerHTML = choices.map(icon => `<button class="game-option shadow-option" aria-label="צל לבחירה" onclick="checkLearningAnswer('${icon}'==='${shadowTarget}',this,nextShadow,'shadowfeedback')"><span>${icon}</span></button>`).join('');
  say('מצא את הצל המתאים');
}

let oddTarget = 0;
function startOddGame() { show('oddgame'); nextOdd(); }
function nextOdd() {
  const common = kindergartenObjects[Math.floor(Math.random() * kindergartenObjects.length)];
  const odd = shuffled(kindergartenObjects.filter(x => x !== common))[0];
  oddTarget = Math.floor(Math.random() * 4);
  const items = Array(4).fill(common); items[oddTarget] = odd;
  byId('oddfeedback').textContent = '';
  byId('oddoptions').innerHTML = items.map((icon,index) => `<button onclick="checkLearningAnswer(${index === oddTarget},this,nextOdd,'oddfeedback')">${icon}</button>`).join('');
  say('מה יוצא דופן?');
}

let compareCorrectSide = 0;
function startCompareGame() { show('comparegame'); nextCompareQuestion(); }
function nextCompareQuestion() {
  const icon = kindergartenObjects[Math.floor(Math.random() * kindergartenObjects.length)];
  let first = 1 + Math.floor(Math.random() * 7);
  let second;
  do second = 1 + Math.floor(Math.random() * 7); while (second === first);
  const findMore = Math.random() < .5;
  compareCorrectSide = findMore ? (first > second ? 0 : 1) : (first < second ? 0 : 1);
  byId('compareprompt').textContent = findMore ? 'איפה יש יותר?' : 'איפה יש פחות?';
  byId('comparefeedback').textContent = '';
  byId('compareoptions').innerHTML = [first,second].map((count,index) => `<button class="compare-option" onclick="checkLearningAnswer(${index === compareCorrectSide},this,nextCompareQuestion,'comparefeedback')">${icon.repeat(count)}</button>`).join('');
  say(findMore ? 'איפה יש יותר?' : 'איפה יש פחות?');
}

const matchingPairs = [['🐶','🦴'],['🐱','🐟'],['🐰','🥕'],['🐝','🌸'],['🐵','🍌'],['🐮','🌿']];
let matchingAnswer = '';
function startMatchingGame() { show('matchinggame'); nextMatchingQuestion(); }
function nextMatchingQuestion() {
  const pair = matchingPairs[Math.floor(Math.random() * matchingPairs.length)];
  matchingAnswer = pair[1];
  const options = shuffled([matchingAnswer, ...shuffled(matchingPairs.map(item => item[1]).filter(item => item !== matchingAnswer)).slice(0,2)]);
  byId('pairtarget').textContent = pair[0];
  byId('matchingfeedback').textContent = '';
  byId('pairoptions').innerHTML = options.map(item => `<button class="pair-option" onclick="checkLearningAnswer('${item}'==='${matchingAnswer}',this,nextMatchingQuestion,'matchingfeedback')">${item}</button>`).join('');
  say('מה מתאים לתמונה?');
}

function checkLearningAnswer(correct, button, next, feedbackId) {
  if (correct) {
    const praise = praiseText();
    button.classList.add('right-pick');
    byId(feedbackId).textContent = `👏 ${praise}`;
    applause(praise);
    button.parentElement.querySelectorAll('button').forEach(b => b.disabled = true);
    setTimeout(next, 1450);
  } else {
    button.classList.add('wrong-pick');
    byId(feedbackId).textContent = retryText();
    say(retryText());
    setTimeout(() => button.classList.remove('wrong-pick'), 700);
  }
}
