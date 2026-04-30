'use client';

import { useRef, useCallback } from 'react';
import { CellState } from '@/lib/minesweeper';

const NUMBER_COLORS: Record<number, string> = {
  1: '#1C3A8B',
  2: '#2D6B3D',
  3: '#8B1C1C',
  4: '#1C1C6B',
  5: '#6B1C1C',
  6: '#1C6B6B',
  7: '#1C1510',
  8: '#555050',
};

type Props = {
  cell: CellState;
  row: number;
  col: number;
  cellSize: number;
  onReveal: (r: number, c: number) => void;
  onFlag: (r: number, c: number) => void;
  gameOver: boolean;
};

export function GameCell({ cell, row, col, cellSize, onReveal, onFlag, gameOver }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);

  const handleClick = useCallback(() => {
    if (longPressedRef.current) { longPressedRef.current = false; return; }
    if (!gameOver) onReveal(row, col);
  }, [gameOver, onReveal, row, col]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!gameOver) onFlag(row, col);
  }, [gameOver, onFlag, row, col]);

  const handleTouchStart = useCallback(() => {
    if (gameOver) return;
    longPressedRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      onFlag(row, col);
    }, 400);
  }, [gameOver, onFlag, row, col]);

  const cancelLongPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const size = cellSize;
  const fontSize = size * 0.55;

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: gameOver ? 'default' : 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    flexShrink: 0,
    transition: 'background 0.1s',
    boxSizing: 'border-box',
  };

  if (!cell.isRevealed) {
    return (
      <div
        style={{ ...baseStyle, background: '#1C1510', border: '1px solid #EDEAD9' }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
      >
        {cell.isFlagged && (
          <span style={{ fontSize: fontSize * 0.8, lineHeight: 1 }}>🚩</span>
        )}
      </div>
    );
  }

  if (cell.isMine) {
    return (
      <div style={{ ...baseStyle, background: '#3D0A0A', border: '1px solid #EDEAD9' }}>
        <span style={{ fontSize: fontSize * 0.85, lineHeight: 1 }}>💥</span>
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, background: '#EDEAD9', border: '1px solid #C8C4B0' }}>
      {cell.neighborCount > 0 && (
        <span style={{
          fontSize,
          fontWeight: 700,
          lineHeight: 1,
          color: NUMBER_COLORS[cell.neighborCount] ?? '#1C1510',
          fontFamily: 'var(--font-mono)',
        }}>
          {cell.neighborCount}
        </span>
      )}
    </div>
  );
}
