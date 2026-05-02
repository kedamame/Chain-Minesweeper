'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Board,
  Difficulty,
  GameStatus,
  DIFFICULTIES,
  generateBoard,
  revealCell,
  revealAllMines,
  toggleFlag,
  checkWin,
  countFlags,
  buildShareGrid,
} from '@/lib/minesweeper';
import { GameCell } from './GameCell';
import { useClearRecord } from '@/hooks/useClearRecord';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://chain-minesweeper.vercel.app';

type Props = {
  seed: string;
  blockNumber: number;
  date: string;
  mode: 'daily' | 'random';
  isInMiniApp: boolean;
  onShareResult: (text: string, ogUrl: string) => void;
  onNewRandom?: () => void;
};

export function MinesweeperGame({ seed, blockNumber, date, mode, isInMiniApp: _isInMiniApp, onShareResult, onNewRandom }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [board, setBoard] = useState<Board>([]);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(28);

  // Refs to keep latest values accessible inside setBoard callbacks without stale closure
  const statusRef = useRef<GameStatus>('idle');
  const startTimeRef = useRef<number | null>(null);

  const { recordClear, status: recordStatus, address, isContractDeployed } = useClearRecord(mode === 'daily');

  const { rows, cols, mines } = DIFFICULTIES[difficulty];
  const flagCount = countFlags(board);
  const remaining = mines - flagCount;

  // Responsive cell size
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth - 16;
      const h = window.innerHeight * 0.55;
      const byW = Math.floor(w / cols);
      const byH = Math.floor(h / rows);
      setCellSize(Math.max(18, Math.min(36, byW, byH)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [rows, cols]);

  const startGame = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    statusRef.current = 'idle';
    startTimeRef.current = null;
    setBoard(generateBoard(seed, difficulty));
    setStatus('idle');
    setElapsed(0);
    setFinalTime(null);
  }, [seed, difficulty]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  // Timer driven from startTimeRef so elapsed is always fresh
  useEffect(() => {
    if (status === 'playing' && startTimeRef.current !== null) {
      const origin = startTimeRef.current;
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - origin) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const handleReveal = useCallback((r: number, c: number) => {
    setBoard(prev => {
      const cell = prev[r]?.[c];
      if (!cell || cell.isRevealed || cell.isFlagged) return prev;
      if (statusRef.current === 'won' || statusRef.current === 'lost') return prev;

      let next = revealCell(prev, r, c);
      const now = Date.now();

      if (statusRef.current === 'idle') {
        statusRef.current = 'playing';
        startTimeRef.current = now;
        setStatus('playing');
      }

      if (next[r][c].isMine) {
        next = revealAllMines(next);
        statusRef.current = 'lost';
        const t = startTimeRef.current ? Math.floor((now - startTimeRef.current) / 1000) : 0;
        setStatus('lost');
        setFinalTime(t);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return next;
      }

      if (checkWin(next)) {
        statusRef.current = 'won';
        const t = startTimeRef.current ? Math.floor((now - startTimeRef.current) / 1000) : 0;
        setStatus('won');
        setFinalTime(t);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      return next;
    });
  }, []);

  const handleFlag = useCallback((r: number, c: number) => {
    setBoard(prev => toggleFlag(prev, r, c));
  }, []);

  const handleShare = () => {
    const diff = DIFFICULTIES[difficulty].label;
    const timeStr = formatTime(finalTime ?? elapsed);
    const result = status === 'won' ? `CLEARED in ${timeStr}` : 'FAILED';
    const grid = buildShareGrid(board);
    const modeLabel = mode === 'daily'
      ? (blockNumber > 0 ? `Block #${blockNumber.toLocaleString()}` : date)
      : 'RANDOM';
    const text = `Chain Minesweeper\n${date} / ${diff}\n${result}\n${modeLabel} - base\n\n${grid}`;
    const resultCode = status === 'won' ? 'CLEARED' : 'FAILED';
    const ogUrl = `${APP_URL}/og?date=${encodeURIComponent(date)}&diff=${encodeURIComponent(diff.toUpperCase())}&result=${resultCode}&time=${encodeURIComponent(timeStr)}&block=${blockNumber > 0 ? blockNumber : ''}&addr=${address ?? ''}`;
    onShareResult(text, ogUrl);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const displayTime = status === 'won' || status === 'lost'
    ? formatTime(finalTime ?? elapsed)
    : formatTime(elapsed);

  const gameOver = status === 'won' || status === 'lost';
  const gridWidth = cellSize * cols;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: '100%' }}>

      {/* Difficulty selector */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 16,
        border: '1px solid #1C1510',
        overflow: 'hidden',
      }}>
        {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            style={{
              padding: '6px 14px',
              background: difficulty === d ? '#1C1510' : 'transparent',
              color: difficulty === d ? '#EDEAD9' : '#1C1510',
              border: 'none',
              borderRight: d !== 'hard' ? '1px solid #1C1510' : 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
            }}
          >
            {DIFFICULTIES[d].label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: gridWidth,
        marginBottom: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: '#1C1510',
        letterSpacing: '0.05em',
      }}>
        <span>🚩 {remaining < 0 ? 0 : remaining}</span>
        <span style={{
          color: status === 'won' ? '#2D6B3D' : status === 'lost' ? '#8B1C1C' : '#1C1510',
          fontWeight: 700,
        }}>
          {status === 'won' ? 'CLEARED' : status === 'lost' ? 'BOOM' : displayTime}
        </span>
        <span style={{ visibility: gameOver ? 'hidden' : 'visible' }}>{displayTime}</span>
      </div>

      {/* Game grid */}
      <div
        ref={containerRef}
        style={{ width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            border: '2px solid #1C1510',
            gap: 0,
          }}
          onContextMenu={e => e.preventDefault()}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <GameCell
                key={`${r}-${c}`}
                cell={cell}
                row={r}
                col={c}
                cellSize={cellSize}
                onReveal={handleReveal}
                onFlag={handleFlag}
                gameOver={gameOver}
              />
            ))
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button
          onClick={startGame}
          style={{
            padding: '8px 20px',
            background: 'transparent',
            color: '#1C1510',
            border: '1px solid #1C1510',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
          }}
        >
          RESET
        </button>
        {gameOver && mode === 'random' && onNewRandom && (
          <button
            onClick={onNewRandom}
            style={{
              padding: '8px 20px',
              background: 'transparent',
              color: '#1C1510',
              border: '1px solid #1C1510',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
            }}
          >
            NEXT
          </button>
        )}
        {status === 'won' && isContractDeployed && (
          <button
            onClick={recordStatus === 'idle' || recordStatus === 'error' ? recordClear : undefined}
            disabled={recordStatus === 'pending' || recordStatus === 'connecting' || recordStatus === 'success' || recordStatus === 'already_recorded'}
            style={{
              padding: '8px 20px',
              background: recordStatus === 'success' || recordStatus === 'already_recorded' ? '#2D6B3D' : 'transparent',
              color: recordStatus === 'success' || recordStatus === 'already_recorded' ? '#EDEAD9' : '#1C1510',
              border: '1px solid #1C1510',
              cursor: recordStatus === 'pending' || recordStatus === 'connecting' || recordStatus === 'success' || recordStatus === 'already_recorded' ? 'default' : 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              opacity: recordStatus === 'pending' || recordStatus === 'connecting' ? 0.6 : 1,
            }}
          >
            {recordStatus === 'connecting' ? 'CONNECTING...'
              : recordStatus === 'pending' ? 'RECORDING...'
              : recordStatus === 'success' ? 'RECORDED!'
              : recordStatus === 'already_recorded' ? 'RECORDED'
              : 'RECORD'}
          </button>
        )}
        {gameOver && (
          <button
            onClick={handleShare}
            style={{
              padding: '8px 20px',
              background: '#1C1510',
              color: '#EDEAD9',
              border: '1px solid #1C1510',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
            }}
          >
            SHARE
          </button>
        )}
      </div>

      {/* Instructions */}
      {status === 'idle' && (
        <p style={{
          marginTop: 12,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: '#7A7060',
          letterSpacing: '0.05em',
          textAlign: 'center',
        }}>
          CLICK to reveal  ·  LONG PRESS / RIGHT CLICK to flag
        </p>
      )}
    </div>
  );
}
