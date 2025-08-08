

const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const turnLabel = document.getElementById('turnLabel');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const restartBtn = document.getElementById('restartBtn');
const newGameBtn = document.getElementById('newGameBtn');

let board = Array(9).fill(null);
let turn = 'X'; 
let running = true;
let scores = { X:0, O:0 };

let cells = [];


const audioCtx = (typeof AudioContext !== 'undefined') ? new AudioContext() : null;

function playTone(freq, type='square', duration=0.12, when=0){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = 0.0001;
  o.connect(g);
  g.connect(audioCtx.destination);
  const t = audioCtx.currentTime + when;
  g.gain.exponentialRampToValueAtTime(0.15, t + 0.01);
  o.start(t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  o.stop(t + duration + 0.02);
}


function playCoin(){
  if(!audioCtx) return;
  playTone(880,'square',0.08);
  playTone(1100,'square',0.06,0.06);
}


function playWin(){
  if(!audioCtx) return;
  playTone(660,'sine',0.16);
  playTone(880,'sine',0.16,0.12);
  playTone(1100,'sine',0.16,0.26);
}


function playTie(){
  if(!audioCtx) return;
  playTone(220,'triangle',0.28);
}

function createBoard(){
  boardEl.innerHTML = '';
  cells = [];
  for(let i=0;i<9;i++){
    const c = document.createElement('button');
    c.className = 'cell';
    c.dataset.index = i;
    c.setAttribute('aria-label', `Cell ${i+1}`);
    c.addEventListener('click', onCellClick);
    boardEl.appendChild(c);
    cells.push(c);
  }
}

function onCellClick(e){
  const idx = Number(e.currentTarget.dataset.index);
  if(!running || board[idx]) return;
  makeMove(idx, turn);
}

function makeMove(idx, player){
  board[idx] = player;
  const el = cells[idx];

 
  const mark = document.createElement('div');
  mark.className = 'mark ' + (player === 'X' ? 'mario' : 'luigi');
  mark.textContent = player === 'X' ? 'M' : 'L';
  el.appendChild(mark);

 
  spawnCoinBurst(el);

 
  if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  playCoin();

  const winnerInfo = checkWin();
  if(winnerInfo){
    running = false;
    showWin(winnerInfo);
    return;
  }
  if(board.every(Boolean)){
    running = false;
    statusEl.textContent = 'Tie!';
    playTie();
    return;
  }

  
  turn = (turn === 'X') ? 'O' : 'X';
  updateStatus();
}


function spawnCoinBurst(container){
  for(let i=0;i<6;i++){
    const p = document.createElement('div');
    p.className = 'coin-burst';
    container.appendChild(p);
   
    const dx = (Math.random()*100 - 50);
    const dy = -(Math.random()*80 + 40);
    p.style.left = (50 + (Math.random()*20-10)) + '%';
    p.style.top = '65%';
    p.style.transform = `translate(${dx}px, ${dy}px) scale(1)`;
    
    setTimeout(()=> {
      p.remove();
    }, 700);
  }
}


function checkWin(){
  for(const combo of WIN_COMBOS){
    const [a,b,c] = combo;
    if(board[a] && board[a] === board[b] && board[a] === board[c]){
      return { winner: board[a], combo };
    }
  }
  return null;
}


function showWin({ winner, combo }){

  combo.forEach(i => {
    const el = cells[i];
    el.classList.add('win');
  });

  scores[winner]++;
  updateScores();


  statusEl.textContent = (winner === 'X') ? 'Winner: Mario!' : 'Winner: Luigi!';
  playWin();
}


function updateStatus(){
  turnLabel.textContent = (turn === 'X') ? 'Mario' : 'Luigi';
  statusEl.querySelector && statusEl.querySelector('strong') && (statusEl.querySelector('strong').textContent = (turn === 'X') ? 'Mario' : 'Luigi');
  statusEl.textContent = 'Turn: ';
  const b = document.createElement('strong');
  b.id = 'turnLabel';
  b.textContent = (turn === 'X') ? 'Mario' : 'Luigi';
  statusEl.appendChild(b);
}

function updateScores(){
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
}


function restartRound(){
  board.fill(null);
  running = true;
  turn = 'X';
  updateStatus();
  cells.forEach(c => {
    c.className = 'cell';
    c.innerHTML = '';
  });
}


function newGame(){
  scores = { X:0, O:0 };
  updateScores();
  restartRound();
}


window.addEventListener('keydown', (e) => {
  const k = e.key;
  if(k >= '1' && k <= '9'){
    const idx = Number(k) - 1;
    if(running && !board[idx]) makeMove(idx, turn);
  } else if(k === 'm' || k === 'M' || k === 'r' || k === 'R'){
    restartRound();
  } else if(k === 'n' || k === 'N'){
    newGame();
  }
});


restartBtn.addEventListener('click', restartRound);
newGameBtn.addEventListener('click', newGame);


createBoard();
updateStatus();
updateScores();
