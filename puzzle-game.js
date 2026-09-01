const puzzleThemes = {
  grade1: { image:'classroom-grade1.webp', title:'פאזל כיתה א׳', back:'grade1' },
  kindergarten: { image:'kindergarten.webp', title:'פאזל גן', back:'kindergarten' }
};

let puzzleTheme = puzzleThemes.kindergarten;
let puzzlePositions = [];
let puzzleColumns = 2;
let puzzleRows = 2;
let selectedPuzzleSlot = null;

function startPuzzle(themeName) {
  puzzleTheme = puzzleThemes[themeName];
  show('puzzlegame');
  byId('puzzletitle').textContent = puzzleTheme.title;
  byId('puzzleback').onclick = () => show(puzzleTheme.back);
  byId('puzzlepreview').src = puzzleTheme.image;
  byId('puzzlesetup').classList.remove('hidden');
  byId('puzzleplay').classList.add('hidden');
  byId('puzzlefeedback').textContent = '';
}

function beginPuzzle(pieceCount) {
  [puzzleColumns, puzzleRows] = pieceCount === 4 ? [2,2] : pieceCount === 6 ? [3,2] : [3,3];
  const solved = Array.from({length:pieceCount}, (_,index) => index);
  do puzzlePositions = shuffled(solved); while (puzzlePositions.every((piece,index) => piece === index));
  selectedPuzzleSlot = null;
  byId('puzzleboard').classList.remove('solved');
  byId('puzzlesetup').classList.add('hidden');
  byId('puzzleplay').classList.remove('hidden');
  byId('puzzlefeedback').textContent = '';
  renderPuzzle();
}

function renderPuzzle() {
  const board = byId('puzzleboard');
  board.style.gridTemplateColumns = `repeat(${puzzleColumns},1fr)`;
  board.style.aspectRatio = '4/3';
  board.innerHTML = puzzlePositions.map((piece,slot) => {
    const column = piece % puzzleColumns;
    const row = Math.floor(piece / puzzleColumns);
    const x = puzzleColumns === 1 ? 0 : column * 100 / (puzzleColumns - 1);
    const y = puzzleRows === 1 ? 0 : row * 100 / (puzzleRows - 1);
    return `<button class="puzzle-piece ${slot === selectedPuzzleSlot ? 'selected' : ''}" onclick="choosePuzzleSlot(${slot})" style="background-image:url('${puzzleTheme.image}');background-size:${puzzleColumns * 100}% ${puzzleRows * 100}%;background-position:${x}% ${y}%" aria-label="חלק ${slot + 1}"></button>`;
  }).join('');
}

function choosePuzzleSlot(slot) {
  if (selectedPuzzleSlot === null) {
    selectedPuzzleSlot = slot;
    renderPuzzle();
    return;
  }
  if (selectedPuzzleSlot === slot) {
    selectedPuzzleSlot = null;
    renderPuzzle();
    return;
  }
  [puzzlePositions[selectedPuzzleSlot], puzzlePositions[slot]] = [puzzlePositions[slot], puzzlePositions[selectedPuzzleSlot]];
  selectedPuzzleSlot = null;
  renderPuzzle();
  if (puzzlePositions.every((piece,index) => piece === index)) {
    const praise = `${praiseText()} השלמת את הפאזל!`;
    byId('puzzlefeedback').textContent = `🧩 ${praise}`;
    applause(praise);
    byId('puzzleboard').classList.add('solved');
    byId('puzzleboard').querySelectorAll('button').forEach(button => button.disabled = true);
  }
}
