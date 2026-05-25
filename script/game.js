let board = Array(9).fill(null);
let current = 'X';
let gameOver = false;
let scores = { X: 0, O: 0, D: 0 };
let mode = 'pvp';

const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function setMode(m) {
  mode = m;
  document.getElementById('btn-pvp').className = 'mode-btn' + (m === 'pvp' ? ' active' : '');
  document.getElementById('btn-ai').className  = 'mode-btn' + (m === 'ai'  ? ' active' : '');
  reset();
}

function checkWinner(b) {
  for (const [a, c, d] of wins) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line: [a, c, d] };
  }
  if (b.every(v => v)) return { winner: 'draw', line: [] };
  return null;
}

function play(i) {
  if (gameOver || board[i]) return;
  board[i] = current;
  render();
  const result = checkWinner(board);
  if (result) { endGame(result); return; }
  current = current === 'X' ? 'O' : 'X';
  document.getElementById('status').textContent = current + "'s turn";
  if (mode === 'ai' && current === 'O' && !gameOver) setTimeout(aiMove, 350);
}

function aiMove() {
  let best = -Infinity, move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const s = minimax(board, 0, false);
      board[i] = null;
      if (s > best) { best = s; move = i; }
    }
  }
  if (move !== -1) {
    board[move] = 'O';
    render();
    const result = checkWinner(board);
    if (result) { endGame(result); return; }
    current = 'X';
    document.getElementById('status').textContent = "X's turn";
  }
}

function minimax(b, depth, isMax) {
  const r = checkWinner(b);
  if (r) {
    if (r.winner === 'O') return 10 - depth;
    if (r.winner === 'X') return depth - 10;
    return 0;
  }
  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) { b[i] = 'O'; best = Math.max(best, minimax(b, depth + 1, false)); b[i] = null; }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) { b[i] = 'X'; best = Math.min(best, minimax(b, depth + 1, true)); b[i] = null; }
    }
    return best;
  }
}

function render(winLine) {
  for (let i = 0; i < 9; i++) {
    const cell = document.getElementById('c' + i);
    cell.textContent = board[i] || '';
    cell.className = 'cell' +
      (board[i] === 'X' ? ' x-mark taken' : board[i] === 'O' ? ' o-mark taken' : '');
    if (winLine && winLine.includes(i)) cell.classList.add('win-cell');
  }
}

function endGame(result) {
  gameOver = true;

  if (result.winner === 'draw') {
    document.getElementById('status').textContent = "It's a draw!";
    scores.D++;
    document.getElementById('score-d').textContent = scores.D;
    // Save draw (only in vs CPU mode, X is the human)
    if (mode === 'ai' && typeof saveResult === 'function') saveResult('draw');
  } else {
    document.getElementById('status').textContent = result.winner + ' wins! 🎉';
    scores[result.winner]++;
    document.getElementById('score-' + result.winner.toLowerCase()).textContent = scores[result.winner];
    render(result.line);
    // In vs CPU: X = human, O = CPU
    if (mode === 'ai' && typeof saveResult === 'function') {
      saveResult(result.winner === 'X' ? 'win' : 'loss');
    }
  }
}

function reset() {
  board = Array(9).fill(null);
  current = 'X';
  gameOver = false;
  render();
  document.getElementById('status').textContent = "X's turn";
}
