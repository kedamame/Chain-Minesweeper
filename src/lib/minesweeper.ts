export type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
};

export type Board = CellState[][];
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';
export type Difficulty = 'easy' | 'normal' | 'hard';

export const DIFFICULTIES: Record<Difficulty, { rows: number; cols: number; mines: number; label: string }> = {
  easy:   { rows: 9,  cols: 9,  mines: 10, label: 'EASY'   },
  normal: { rows: 12, cols: 12, mines: 25, label: 'NORMAL' },
  hard:   { rows: 16, cols: 16, mines: 40, label: 'HARD'   },
};

// Mulberry32 PRNG seeded by a hex string
function makeRng(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  let state = h >>> 0;
  return () => {
    state |= 0;
    state = state + 0x6D2B79F5 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function generateBoard(seed: string, difficulty: Difficulty): Board {
  const { rows, cols, mines } = DIFFICULTIES[difficulty];
  const rng = makeRng(seed + difficulty);

  const board: Board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    }))
  );

  // Place mines with Fisher-Yates shuffle on a flat array of positions
  const positions = Array.from({ length: rows * cols }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  for (let i = 0; i < mines; i++) {
    const pos = positions[i];
    board[Math.floor(pos / cols)][pos % cols].isMine = true;
  }

  // Calculate neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;
      let count = 0;
      for (const [dr, dc] of NEIGHBORS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) count++;
      }
      board[r][c].neighborCount = count;
    }
  }

  return board;
}

const NEIGHBORS = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
];

export function revealCell(board: Board, row: number, col: number): Board {
  const rows = board.length;
  const cols = board[0].length;
  const cell = board[row][col];
  if (cell.isRevealed || cell.isFlagged) return board;

  const next = board.map(r => r.map(c => ({ ...c })));
  const stack = [[row, col]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const cur = next[r][c];
    if (cur.isRevealed || cur.isFlagged) continue;
    cur.isRevealed = true;
    if (cur.neighborCount === 0 && !cur.isMine) {
      for (const [dr, dc] of NEIGHBORS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !next[nr][nc].isRevealed) {
          stack.push([nr, nc]);
        }
      }
    }
  }

  return next;
}

export function revealAllMines(board: Board): Board {
  return board.map(row =>
    row.map(cell => cell.isMine ? { ...cell, isRevealed: true } : { ...cell })
  );
}

export function toggleFlag(board: Board, row: number, col: number): Board {
  const cell = board[row][col];
  if (cell.isRevealed) return board;
  return board.map((r, ri) =>
    r.map((c, ci) =>
      ri === row && ci === col ? { ...c, isFlagged: !c.isFlagged } : c
    )
  );
}

export function checkWin(board: Board): boolean {
  return board.every(row =>
    row.every(cell => cell.isMine ? !cell.isRevealed : cell.isRevealed)
  );
}

export function countFlags(board: Board): number {
  return board.flat().filter(c => c.isFlagged).length;
}

export function buildShareGrid(board: Board): string {
  return board.map(row =>
    row.map(cell => {
      if (!cell.isRevealed) return cell.isFlagged ? '🚩' : '⬛';
      if (cell.isMine) return '💥';
      return '🟫';
    }).join('')
  ).join('\n');
}
