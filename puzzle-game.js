const puzzleThemes = {
  grade1: { image:'classroom-grade1.webp', title:'פאזל כיתה א׳', back:'grade1' },
  kindergarten: { image:'kindergarten.webp', title:'פאזל גן', back:'kindergarten' }
};

const puzzlePictureGroups = [
  ['ראש השנה',['rosh-hashanah-1.webp','rosh-hashanah-2.webp']],
  ['סוכות',['sukkot-1.webp','sukkot-2.webp']],
  ['שמחת תורה',['simchat-torah-1.webp','simchat-torah-2.webp']],
  ['חנוכה',['hanukkah-1.webp','hanukkah-2.webp']],
  ['ט״ו בשבט',['tu-bishvat-1.webp','tu-bishvat-2.webp']],
  ['פורים',['purim-1.webp','purim-2.webp']],
  ['פסח',['passover-1.webp','passover-2.webp']],
  ['ל״ג בעומר',['lag-baomer-1.webp','lag-baomer-2.webp']],
  ['שבועות',['shavuot-1.webp','shavuot-2.webp']],
  ['יום העצמאות',['independence-1.webp','independence-2.webp']],
  ['יום ירושלים',['jerusalem-day-1.webp','jerusalem-day-2.webp']],
  ['י״ז בתמוז',['17-tammuz-1.webp','17-tammuz-2.webp']],
  ['תשעה באב',['tisha-bav-1.webp','tisha-bav-2.webp']],
  ['נטילת ידיים',['handwashing-girl.webp','handwashing-boy.webp']],
  ['קריאת שמע על המיטה',['bedtime-shema-boy.webp','bedtime-shema-girl.webp']],
  ['נותנים ומשתפים',['sharing-firetruck.webp','sharing-doll.webp']],
  ['שבת',['shabbat-candles-girl.webp','shabbat-kiddush-boy.webp','shabbat-table-kids-v3.webp']],
  ['מסדרים צעצועים',['tidying-toys-kids.webp']]
].map(([title,files])=>({title,images:files.map(file=>`assets/puzzles/${file}?v=14`)}));

let puzzleTheme = puzzleThemes.kindergarten;
let puzzleColumns = 2;
let puzzleRows = 2;
let puzzleEdges = [];
let placedPuzzlePieces = new Set();
let selectedPuzzlePiece = null;
let draggedPuzzle = null;
let lastPuzzleBoardWidth = 0;
let puzzleResizeTimer = null;

function startPuzzle(themeName) {
  document.body.classList.remove('puzzle-playing');
  puzzleTheme = {...puzzleThemes[themeName],image:puzzlePictureGroups[0].images[0]};
  show('puzzlegame');
  byId('puzzletitle').textContent = puzzleTheme.title;
  byId('puzzleback').onclick = () => { document.body.classList.remove('puzzle-playing'); show(puzzleTheme.back); };
  byId('puzzlepreview').src = puzzleTheme.image;
  renderPuzzlePictureChoices();
  byId('puzzlesetup').classList.remove('hidden');
  byId('puzzleplay').classList.add('hidden');
  byId('puzzlefeedback').textContent = '';
}

function renderPuzzlePictureChoices() {
  byId('puzzlethemes').innerHTML=puzzlePictureGroups.map(group=>`<section class="puzzle-picture-group"><h4>${group.title}</h4><div>${group.images.map((image,index)=>`<button class="puzzle-picture-choice ${image===puzzleTheme.image?'selected':''}" onclick="choosePuzzleImage('${image}',this)" aria-label="${group.title}, תמונה ${index+1}"><img src="${image}" loading="lazy" alt="${group.title}, תמונה ${index+1}"></button>`).join('')}</div></section>`).join('');
}

function choosePuzzleImage(image,button) {
  puzzleTheme.image=image;
  byId('puzzlepreview').src=image;
  document.querySelectorAll('.puzzle-picture-choice').forEach(choice=>choice.classList.remove('selected'));
  button.classList.add('selected');
  const sizes=document.querySelector('#puzzlesetup .puzzle-sizes');
  setTimeout(()=>sizes?.scrollIntoView({block:'end',behavior:'smooth'}),80);
}

function beginPuzzle(pieceCount,button) {
  document.querySelectorAll('.puzzle-sizes button').forEach(choice=>choice.classList.toggle('selected',choice===button));
  setTimeout(()=>launchPuzzle(pieceCount),180);
}

function launchPuzzle(pieceCount) {
  const layouts={4:[2,2],6:[3,2],9:[3,3],12:[4,3],16:[4,4]};
  [puzzleColumns,puzzleRows]=layouts[pieceCount]||layouts[4];
  puzzleEdges = createPuzzleEdges();
  placedPuzzlePieces = new Set();
  selectedPuzzlePiece = null;
  byId('puzzleboard').classList.remove('solved');
  byId('puzzlesetup').classList.add('hidden');
  byId('puzzleplay').classList.remove('hidden');
  document.body.classList.add('puzzle-playing');
  byId('puzzlefeedback').textContent = 'גררו כל חלק אל המקום המתאים בתמונה';
  requestAnimationFrame(renderPuzzle);
}

function createPuzzleEdges() {
  const pieces = Array.from({length:puzzleColumns*puzzleRows},()=>({top:0,right:0,bottom:0,left:0}));
  const randomEdge=()=>{
    const direction=Math.random()<.5?-1:1;
    const depth=.78+Math.random()*.38;
    const offset=-.075+Math.random()*.15;
    const radius=1;
    return {direction,depth,offset,radius};
  };
  const opposite=edge=>({...edge,direction:-edge.direction,offset:-edge.offset});
  for (let row=0; row<puzzleRows; row++) for (let col=0; col<puzzleColumns; col++) {
    const index=row*puzzleColumns+col;
    if(col<puzzleColumns-1){const edge=randomEdge();pieces[index].right=edge;pieces[index+1].left=opposite(edge)}
    if(row<puzzleRows-1){const edge=randomEdge();pieces[index].bottom=edge;pieces[index+puzzleColumns].top=opposite(edge)}
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
  board.innerHTML=`<div class="puzzle-guide" style="background-image:url('${puzzleTheme.image}')"></div><div class="puzzle-slot-shapes"></div><div class="puzzle-slots"></div><div class="puzzle-placed"></div>`;
  const slots=board.querySelector('.puzzle-slots');
  slots.style.gridTemplateColumns=`repeat(${puzzleColumns},1fr)`;
  slots.innerHTML=Array.from({length:puzzleColumns*puzzleRows},(_,i)=>`<button class="puzzle-slot" data-slot="${i}" aria-label="מקום לחלק ${i+1}"></button>`).join('');
  slots.querySelectorAll('.puzzle-slot').forEach(slot=>slot.addEventListener('click',()=>tryPlacePuzzle(Number(slot.dataset.slot))));
  tray.innerHTML='';
  tray.dataset.columns=puzzleColumns;
  tray.style.gridTemplateColumns=`repeat(${puzzleColumns},minmax(0,1fr))`;
  const image=new Image();
  let piecesBuilt=false;
  const buildPieces=()=>{
    if (piecesBuilt) return;
    piecesBuilt=true;
    const boardWidth=board.clientWidth,boardHeight=board.clientHeight;
    lastPuzzleBoardWidth=boardWidth;
    const cellWidth=boardWidth/puzzleColumns,cellHeight=boardHeight/puzzleRows;
    const shapes=board.querySelector('.puzzle-slot-shapes');
    Array.from({length:puzzleColumns*puzzleRows},(_,index)=>index).forEach(index=>shapes.appendChild(makePuzzleSlotCanvas(index,cellWidth,cellHeight)));
    shuffled(Array.from({length:puzzleColumns*puzzleRows},(_,i)=>i)).forEach(index=>{
      const canvas=makePuzzleCanvas(index,image,cellWidth,cellHeight,boardWidth,boardHeight);
      if (placedPuzzlePieces.has(index)) positionPlacedPuzzle(canvas,index,board);
      else tray.appendChild(canvas);
    });
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
  const direction=Math.sign(length),size=Math.abs(length);
  if(!edge){ctx.lineTo(x+length,y);return}
  const center=.5+edge.offset,start=center-.13*edge.radius,end=center+.13*edge.radius;
  const neck=.065*edge.radius,peak=y+outward*edge.direction*tab*edge.depth;
  ctx.lineTo(x+direction*size*start,y);
  ctx.bezierCurveTo(x+direction*size*(center-neck),y,x+direction*size*(center-neck),y+(peak-y)*.28,x+direction*size*(center-neck),y+(peak-y)*.38);
  ctx.bezierCurveTo(x+direction*size*(center-.15*edge.radius),y+(peak-y)*.55,x+direction*size*(center-.13*edge.radius),peak,x+direction*size*center,peak);
  ctx.bezierCurveTo(x+direction*size*(center+.13*edge.radius),peak,x+direction*size*(center+.15*edge.radius),y+(peak-y)*.55,x+direction*size*(center+neck),y+(peak-y)*.38);
  ctx.bezierCurveTo(x+direction*size*(center+neck),y+(peak-y)*.28,x+direction*size*(center+neck),y,x+direction*size*end,y);
  ctx.lineTo(x+length,y);
}

function puzzleVertical(ctx,x,y,length,tab,edge,outward) {
  const direction=Math.sign(length),size=Math.abs(length);
  if(!edge){ctx.lineTo(x,y+length);return}
  const center=.5+edge.offset,start=center-.13*edge.radius,end=center+.13*edge.radius;
  const neck=.065*edge.radius,peak=x+outward*edge.direction*tab*edge.depth;
  ctx.lineTo(x,y+direction*size*start);
  ctx.bezierCurveTo(x,y+direction*size*(center-neck),x+(peak-x)*.28,y+direction*size*(center-neck),x+(peak-x)*.38,y+direction*size*(center-neck));
  ctx.bezierCurveTo(x+(peak-x)*.55,y+direction*size*(center-.15*edge.radius),peak,y+direction*size*(center-.13*edge.radius),peak,y+direction*size*center);
  ctx.bezierCurveTo(peak,y+direction*size*(center+.13*edge.radius),x+(peak-x)*.55,y+direction*size*(center+.15*edge.radius),x+(peak-x)*.38,y+direction*size*(center+neck));
  ctx.bezierCurveTo(x+(peak-x)*.28,y+direction*size*(center+neck),x,y+direction*size*(center+neck),x,y+direction*size*end);
  ctx.lineTo(x,y+length);
}

function makePuzzleSlotCanvas(index,cellWidth,cellHeight) {
  const tab=Math.min(cellWidth,cellHeight)*.27,canvas=document.createElement('canvas'),scale=Math.min(window.devicePixelRatio||1,2);
  const logicalWidth=cellWidth+tab*2,logicalHeight=cellHeight+tab*2,col=index%puzzleColumns,row=Math.floor(index/puzzleColumns);
  canvas.width=Math.ceil(logicalWidth*scale); canvas.height=Math.ceil(logicalHeight*scale);
  canvas.style.width=`${logicalWidth}px`; canvas.style.height=`${logicalHeight}px`;
  canvas.style.left=`${col*cellWidth-tab}px`; canvas.style.top=`${row*cellHeight-tab}px`;
  const ctx=canvas.getContext('2d'); ctx.scale(scale,scale);
  tracePuzzlePiece(ctx,cellWidth,cellHeight,tab,puzzleEdges[index]);
  ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fill();
  tracePuzzlePiece(ctx,cellWidth,cellHeight,tab,puzzleEdges[index]);
  ctx.lineWidth=2.25; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='rgba(38,52,75,.62)'; ctx.stroke();
  return canvas;
}

function makePuzzleCanvas(index,image,cellWidth,cellHeight,boardWidth,boardHeight) {
  const tab=Math.min(cellWidth,cellHeight)*.27,canvas=document.createElement('canvas'),scale=Math.min(window.devicePixelRatio||1,2);
  const logicalWidth=cellWidth+tab*2,logicalHeight=cellHeight+tab*2;
  canvas.width=Math.ceil(logicalWidth*scale); canvas.height=Math.ceil(logicalHeight*scale);
  canvas.dataset.logicalWidth=logicalWidth; canvas.dataset.logicalHeight=logicalHeight;
  canvas.style.width=puzzleColumns===2?'72%':puzzleColumns===3?'64%':'56%'; canvas.style.height='auto';
  canvas.className='jigsaw-piece'; canvas.dataset.piece=index; canvas.dataset.tab=tab; canvas.tabIndex=0;
  canvas.setAttribute('role','button'); canvas.setAttribute('aria-label',`חלק ${index+1}. גררו למקום המתאים`);
  const ctx=canvas.getContext('2d'); ctx.scale(scale,scale);
  tracePuzzlePiece(ctx,cellWidth,cellHeight,tab,puzzleEdges[index]); ctx.save(); ctx.clip();
  const col=index%puzzleColumns,row=Math.floor(index/puzzleColumns);
  ctx.drawImage(image,tab-col*cellWidth,tab-row*cellHeight,boardWidth,boardHeight); ctx.restore();
  tracePuzzlePiece(ctx,cellWidth,cellHeight,tab,puzzleEdges[index]); ctx.lineWidth=2.25; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#26344b'; ctx.stroke();
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
  source.classList.add('drag-source');
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
  const drag=draggedPuzzle; drag.source.removeEventListener('pointermove',movePuzzleDrag); draggedPuzzle=null;
  if(!drag.moved){drag.ghost.remove();drag.source.classList.remove('drag-source');selectPuzzlePiece(Number(drag.source.dataset.piece),drag.source);return}
  const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.puzzle-slot');
  const piece=Number(drag.source.dataset.piece),slot=target?Number(target.dataset.slot):-1;
  if(target&&piece===slot){drag.ghost.remove();drag.source.classList.remove('drag-source');placePuzzlePiece(piece,slot,drag.source);return}
  selectedPuzzlePiece=null;
  document.querySelectorAll('.jigsaw-piece.selected').forEach(item=>item.classList.remove('selected'));
  say(retryText());
  returnPuzzlePiece(drag);
}

function returnPuzzlePiece(drag) {
  const rect=drag.source.getBoundingClientRect();
  const animation=drag.ghost.animate([
    {left:drag.ghost.style.left,top:drag.ghost.style.top,transform:'scale(1.05)'},
    {left:`${rect.left}px`,top:`${rect.top}px`,transform:'scale(1)'}
  ],{duration:340,easing:'cubic-bezier(.2,.8,.2,1)'});
  animation.onfinish=()=>{drag.ghost.remove();drag.source.classList.remove('drag-source')};
}

function cancelPuzzleDrag(){if(!draggedPuzzle)return;draggedPuzzle.source.removeEventListener('pointermove',movePuzzleDrag);draggedPuzzle.source.classList.remove('drag-source');draggedPuzzle.ghost.remove();draggedPuzzle=null}

function selectPuzzlePiece(index,canvas){document.querySelectorAll('.jigsaw-piece.selected').forEach(piece=>piece.classList.remove('selected'));selectedPuzzlePiece=selectedPuzzlePiece===index?null:index;if(selectedPuzzlePiece!==null)canvas.classList.add('selected')}
function tryPlacePuzzle(slot){if(selectedPuzzlePiece===null)return;const source=byId('puzzletray').querySelector(`[data-piece="${selectedPuzzlePiece}"]`);placePuzzlePiece(selectedPuzzlePiece,slot,source)}

function placePuzzlePiece(piece,slot,canvas) {
  if(piece!==slot||!canvas){selectedPuzzlePiece=null;document.querySelectorAll('.jigsaw-piece.selected').forEach(item=>item.classList.remove('selected'));say(retryText());return false}
  const board=byId('puzzleboard');
  positionPlacedPuzzle(canvas,piece,board); placedPuzzlePieces.add(piece); selectedPuzzlePiece=null;
  const praise=praiseText(); byId('puzzlefeedback').textContent=`👏 ${praise}`; say(praise);
  if(placedPuzzlePieces.size===puzzleColumns*puzzleRows){const message=`${praiseText()} השלמת את הפאזל!`;byId('puzzlefeedback').textContent=`🧩 ${message}`;board.classList.add('solved');applause(message)}
  return true;
}

function positionPlacedPuzzle(canvas,piece,board) {
  const cellWidth=board.clientWidth/puzzleColumns,cellHeight=board.clientHeight/puzzleRows,tab=Number(canvas.dataset.tab);
  const col=piece%puzzleColumns,row=Math.floor(piece/puzzleColumns);
  canvas.className='jigsaw-piece placed';
  canvas.style.width=`${canvas.dataset.logicalWidth}px`; canvas.style.height=`${canvas.dataset.logicalHeight}px`;
  canvas.style.left=`${col*cellWidth-tab}px`; canvas.style.top=`${row*cellHeight-tab}px`; canvas.tabIndex=-1;
  const slotShape=board.querySelector('.puzzle-slot-shapes')?.children[piece];
  if(slotShape)slotShape.style.visibility='hidden';
  board.querySelector('.puzzle-placed').appendChild(canvas);
}

window.addEventListener('resize',()=>{
  clearTimeout(puzzleResizeTimer);
  puzzleResizeTimer=setTimeout(()=>{
    const play=byId('puzzleplay'),board=byId('puzzleboard');
    if (!play || play.classList.contains('hidden') || !board) return;
    if (Math.abs(board.clientWidth-lastPuzzleBoardWidth)>16) renderPuzzle();
  },180);
});

window.addEventListener('popstate',()=>setTimeout(()=>{
  if (byId('puzzlegame')?.classList.contains('hidden')) document.body.classList.remove('puzzle-playing');
},0));
