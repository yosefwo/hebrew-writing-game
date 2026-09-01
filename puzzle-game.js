const puzzleThemes = {
  grade1: { image:'classroom-grade1.webp', title:'פאזל כיתה א׳', back:'grade1' },
  kindergarten: { image:'kindergarten.webp', title:'פאזל גן', back:'kindergarten' }
};

let puzzleTheme = puzzleThemes.kindergarten;
let puzzleColumns = 2;
let puzzleRows = 2;
let puzzleEdges = [];
let placedPuzzlePieces = new Set();
let selectedPuzzlePiece = null;
let draggedPuzzle = null;

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
  puzzleEdges = createPuzzleEdges();
  placedPuzzlePieces = new Set();
  selectedPuzzlePiece = null;
  byId('puzzleboard').classList.remove('solved');
  byId('puzzlesetup').classList.add('hidden');
  byId('puzzleplay').classList.remove('hidden');
  byId('puzzlefeedback').textContent = 'גררו כל חלק אל המקום המתאים בתמונה';
  requestAnimationFrame(renderPuzzle);
}

function createPuzzleEdges() {
  const pieces = Array.from({length:puzzleColumns*puzzleRows},()=>({top:0,right:0,bottom:0,left:0}));
  for (let row=0; row<puzzleRows; row++) for (let col=0; col<puzzleColumns; col++) {
    const index = row*puzzleColumns+col;
    if (col<puzzleColumns-1) { const edge=Math.random()<.5?-1:1; pieces[index].right=edge; pieces[index+1].left=-edge; }
    if (row<puzzleRows-1) { const edge=Math.random()<.5?-1:1; pieces[index].bottom=edge; pieces[index+puzzleColumns].top=-edge; }
  }
  return pieces;
}

function renderPuzzle() {
  const board=byId('puzzleboard');
  let tray=byId('puzzletray');
  if (!tray) {
    tray=document.createElement('div');
    tray.id='puzzletray';
    tray.className='puzzle-tray';
    tray.setAttribute('aria-label','חלקי הפאזל');
    board.insertAdjacentElement('afterend',tray);
  }
  board.innerHTML=`<div class="puzzle-guide" style="background-image:url('${puzzleTheme.image}')"></div><div class="puzzle-slots"></div><div class="puzzle-placed"></div>`;
  const slots=board.querySelector('.puzzle-slots');
  slots.style.gridTemplateColumns=`repeat(${puzzleColumns},1fr)`;
  slots.innerHTML=Array.from({length:puzzleColumns*puzzleRows},(_,i)=>`<button class="puzzle-slot" data-slot="${i}" aria-label="מקום לחלק ${i+1}"></button>`).join('');
  slots.querySelectorAll('.puzzle-slot').forEach(slot=>slot.addEventListener('click',()=>tryPlacePuzzle(Number(slot.dataset.slot))));
  tray.innerHTML='';
  const image=new Image();
  let piecesBuilt=false;
  const buildPieces=()=>{
    if (piecesBuilt) return;
    piecesBuilt=true;
    const boardWidth=board.clientWidth,boardHeight=boardWidth*3/4;
    board.style.height=`${boardHeight}px`;
    const cellWidth=boardWidth/puzzleColumns,cellHeight=boardHeight/puzzleRows;
    shuffled(Array.from({length:puzzleColumns*puzzleRows},(_,i)=>i)).forEach(index=>tray.appendChild(makePuzzleCanvas(index,image,cellWidth,cellHeight,boardWidth,boardHeight)));
  };
  image.onload=buildPieces;
  image.onerror=()=>{byId('puzzlefeedback').textContent='לא הצלחנו לטעון את התמונה. נסו לבחור פאזל מחדש.'};
  image.src=puzzleTheme.image;
  if (image.complete && image.naturalWidth) buildPieces();
}

function tracePuzzlePiece(ctx,w,h,tab,edges) {
  const m=tab;
  ctx.beginPath(); ctx.moveTo(m,m);
  puzzleHorizontal(ctx,m,m,w,tab,edges.top,-1);
  puzzleVertical(ctx,m+w,m,h,tab,edges.right,1);
  puzzleHorizontal(ctx,m+w,m+h,-w,tab,edges.bottom,1);
  puzzleVertical(ctx,m,m+h,-h,tab,edges.left,-1);
  ctx.closePath();
}

function puzzleHorizontal(ctx,x,y,length,tab,edge,outward) {
  ctx.lineTo(x+length*.34,y);
  if(edge){const peak=y+outward*edge*tab;ctx.bezierCurveTo(x+length*.38,y,x+length*.37,peak,x+length*.5,peak);ctx.bezierCurveTo(x+length*.63,peak,x+length*.62,y,x+length*.66,y)}
  ctx.lineTo(x+length,y);
}

function puzzleVertical(ctx,x,y,length,tab,edge,outward) {
  ctx.lineTo(x,y+length*.34);
  if(edge){const peak=x+outward*edge*tab;ctx.bezierCurveTo(x,y+length*.38,peak,y+length*.37,peak,y+length*.5);ctx.bezierCurveTo(peak,y+length*.63,x,y+length*.62,x,y+length*.66)}
  ctx.lineTo(x,y+length);
}

function makePuzzleCanvas(index,image,cellWidth,cellHeight,boardWidth,boardHeight) {
  const tab=Math.min(cellWidth,cellHeight)*.18,canvas=document.createElement('canvas'),scale=Math.min(window.devicePixelRatio||1,2);
  const logicalWidth=cellWidth+tab*2,logicalHeight=cellHeight+tab*2;
  canvas.width=Math.ceil(logicalWidth*scale); canvas.height=Math.ceil(logicalHeight*scale);
  canvas.dataset.logicalWidth=logicalWidth; canvas.dataset.logicalHeight=logicalHeight;
  canvas.style.width=puzzleColumns===2?'46%':'31%'; canvas.style.height='auto';
  canvas.className='jigsaw-piece'; canvas.dataset.piece=index; canvas.dataset.tab=tab; canvas.tabIndex=0;
  canvas.setAttribute('role','button'); canvas.setAttribute('aria-label',`חלק ${index+1}. גררו למקום המתאים`);
  const ctx=canvas.getContext('2d'); ctx.scale(scale,scale);
  tracePuzzlePiece(ctx,cellWidth,cellHeight,tab,puzzleEdges[index]); ctx.save(); ctx.clip();
  const col=index%puzzleColumns,row=Math.floor(index/puzzleColumns);
  ctx.drawImage(image,tab-col*cellWidth,tab-row*cellHeight,boardWidth,boardHeight); ctx.restore();
  tracePuzzlePiece(ctx,cellWidth,cellHeight,tab,puzzleEdges[index]); ctx.lineWidth=3; ctx.strokeStyle='#26344b'; ctx.stroke();
  canvas.addEventListener('pointerdown',startPuzzleDrag);
  canvas.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')selectPuzzlePiece(index,canvas)});
  return canvas;
}

function startPuzzleDrag(event) {
  if(placedPuzzlePieces.has(Number(event.currentTarget.dataset.piece)))return;
  event.preventDefault(); const source=event.currentTarget; source.setPointerCapture(event.pointerId);
  const rect=source.getBoundingClientRect(),ghost=source.cloneNode(true),ghostContext=ghost.getContext('2d');
  ghostContext.drawImage(source,0,0);
  ghost.className='jigsaw-piece puzzle-dragging'; ghost.style.width=`${rect.width}px`; ghost.style.height=`${rect.height}px`; document.body.appendChild(ghost);
  draggedPuzzle={source,ghost,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top,moved:false};
  movePuzzleGhost(event.clientX,event.clientY);
  source.addEventListener('pointermove',movePuzzleDrag); source.addEventListener('pointerup',finishPuzzleDrag,{once:true}); source.addEventListener('pointercancel',cancelPuzzleDrag,{once:true});
}

function movePuzzleDrag(event) {
  if(!draggedPuzzle||event.pointerId!==draggedPuzzle.pointerId)return; event.preventDefault();
  if(Math.hypot(event.clientX-draggedPuzzle.startX,event.clientY-draggedPuzzle.startY)>8)draggedPuzzle.moved=true;
  movePuzzleGhost(event.clientX,event.clientY);
}

function movePuzzleGhost(x,y){draggedPuzzle.ghost.style.left=`${x-draggedPuzzle.offsetX}px`;draggedPuzzle.ghost.style.top=`${y-draggedPuzzle.offsetY}px`}

function finishPuzzleDrag(event) {
  if(!draggedPuzzle||event.pointerId!==draggedPuzzle.pointerId)return;
  const drag=draggedPuzzle; drag.source.removeEventListener('pointermove',movePuzzleDrag); drag.ghost.remove(); draggedPuzzle=null;
  if(!drag.moved){selectPuzzlePiece(Number(drag.source.dataset.piece),drag.source);return}
  const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.puzzle-slot');
  if(!target||!placePuzzlePiece(Number(drag.source.dataset.piece),Number(target.dataset.slot),drag.source))drag.source.animate([{transform:'translateX(0)'},{transform:'translateX(-9px)'},{transform:'translateX(9px)'},{transform:'translateX(0)'}],{duration:260});
}

function cancelPuzzleDrag(){if(!draggedPuzzle)return;draggedPuzzle.source.removeEventListener('pointermove',movePuzzleDrag);draggedPuzzle.ghost.remove();draggedPuzzle=null}

function selectPuzzlePiece(index,canvas){document.querySelectorAll('.jigsaw-piece.selected').forEach(piece=>piece.classList.remove('selected'));selectedPuzzlePiece=selectedPuzzlePiece===index?null:index;if(selectedPuzzlePiece!==null)canvas.classList.add('selected')}
function tryPlacePuzzle(slot){if(selectedPuzzlePiece===null)return;const source=byId('puzzletray').querySelector(`[data-piece="${selectedPuzzlePiece}"]`);placePuzzlePiece(selectedPuzzlePiece,slot,source)}

function placePuzzlePiece(piece,slot,canvas) {
  if(piece!==slot||!canvas){say(retryText());return false}
  const board=byId('puzzleboard'),cellWidth=board.clientWidth/puzzleColumns,cellHeight=board.clientHeight/puzzleRows,tab=Number(canvas.dataset.tab);
  const col=piece%puzzleColumns,row=Math.floor(piece/puzzleColumns);
  canvas.className='jigsaw-piece placed'; canvas.style.width=`${canvas.dataset.logicalWidth}px`; canvas.style.height=`${canvas.dataset.logicalHeight}px`; canvas.style.left=`${col*cellWidth-tab}px`; canvas.style.top=`${row*cellHeight-tab}px`; canvas.tabIndex=-1;
  board.querySelector('.puzzle-placed').appendChild(canvas); placedPuzzlePieces.add(piece); selectedPuzzlePiece=null;
  const praise=praiseText(); byId('puzzlefeedback').textContent=`👏 ${praise}`; say(praise);
  if(placedPuzzlePieces.size===puzzleColumns*puzzleRows){const message=`${praiseText()} השלמת את הפאזל!`;byId('puzzlefeedback').textContent=`🧩 ${message}`;board.classList.add('solved');applause(message)}
  return true;
}
