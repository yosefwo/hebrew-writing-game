let mathAnswer = 0;

function startMathGame() {
  show('mathgame');
  nextMathQuestion();
}

function nextMathQuestion() {
  const addition = Math.random() < .5;
  let first;
  let second;

  if (addition) {
    first = Math.floor(Math.random() * 11);
    second = Math.floor(Math.random() * (11 - first));
    mathAnswer = first + second;
  } else {
    first = Math.floor(Math.random() * 11);
    second = Math.floor(Math.random() * (first + 1));
    mathAnswer = first - second;
  }

  const sign = addition ? '+' : '−';
  const candidates = shuffled([
    mathAnswer,
    ...shuffled([0,1,2,3,4,5,6,7,8,9,10].filter(number => number !== mathAnswer)).slice(0, 3)
  ]);

  byId('mathquestion').textContent = `${first} ${sign} ${second} = ?`;
  byId('mathfeedback').textContent = '';
  byId('mathoptions').innerHTML = candidates.map(number =>
    `<button class="game-option" onclick="checkLearningAnswer(${number === mathAnswer},this,nextMathQuestion,'mathfeedback')">${number}</button>`
  ).join('');
  say(`כמה זה ${first} ${addition ? 'ועוד' : 'פחות'} ${second}?`);
}
