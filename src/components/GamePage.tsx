'use client';

import { useState } from 'react';
import { MinesweeperGame } from './MinesweeperGame';
import { useFarcasterMiniApp, composeCast } from '@/lib/farcaster';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://chain-minesweeper.vercel.app';

type Props = {
  seed: string;
  blockNumber: number;
  date: string;
};

export function GamePage({ seed, blockNumber, date }: Props) {
  const { isInMiniApp, isLoading, sdk } = useFarcasterMiniApp();
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShareResult = async (text: string) => {
    setShareMsg(text);
    if (isInMiniApp && sdk) {
      await composeCast(sdk, text, APP_URL);
    }
  };

  const handleCopy = () => {
    if (!shareMsg) return;
    navigator.clipboard.writeText(shareMsg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Format date for display: 2026.04.30
  const displayDate = date.replace(/-/g, '.');

  // Day number since Unix epoch (for puzzle number)
  const puzzleNum = Math.floor(new Date(date).getTime() / 86_400_000);

  const blockLabel = blockNumber > 0
    ? `#${blockNumber.toLocaleString()}`
    : 'OFFLINE';

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#EDEAD9',
      color: '#1C1510',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 8px',
      maxWidth: 480,
      margin: '0 auto',
    }}>

      {/* Top metadata bar — Actuel Image style */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.08em',
        color: '#7A7060',
        borderBottom: '1px solid #C8C4B0',
      }}>
        <span>BASE / {displayDate}</span>
        <span>BLOCK {blockLabel}</span>
      </div>

      {/* Title — ultra-condensed display font */}
      <div style={{ padding: '8px 0 4px', lineHeight: 0.88 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(56px, 18vw, 88px)',
          letterSpacing: '-0.02em',
          color: '#1C1510',
          textTransform: 'uppercase',
          lineHeight: 0.9,
        }}>
          Chain
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(56px, 18vw, 88px)',
          letterSpacing: '-0.02em',
          color: '#1C1510',
          textTransform: 'uppercase',
          lineHeight: 0.9,
        }}>
          Mines-
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(56px, 18vw, 88px)',
          letterSpacing: '-0.02em',
          color: '#1C1510',
          textTransform: 'uppercase',
          lineHeight: 0.9,
        }}>
          weeper.
        </div>
      </div>

      {/* Puzzle number subtitle */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: '#7A7060',
        letterSpacing: '0.1em',
        marginBottom: 16,
        paddingTop: 4,
      }}>
        PUZZLE #{puzzleNum}
      </div>

      {/* Game */}
      {isLoading ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#7A7060',
          letterSpacing: '0.1em',
        }}>
          LOADING...
        </div>
      ) : (
        <MinesweeperGame
          seed={seed}
          blockNumber={blockNumber}
          date={date}
          isInMiniApp={isInMiniApp}
          onShareResult={handleShareResult}
        />
      )}

      {/* Share preview (non-Farcaster fallback) */}
      {shareMsg && !isInMiniApp && (
        <div style={{
          marginTop: 16,
          padding: 12,
          border: '1px solid #1C1510',
          background: '#F5F2E8',
        }}>
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: '#1C1510',
            marginBottom: 8,
          }}>
            {shareMsg}
          </pre>
          <button
            onClick={handleCopy}
            style={{
              padding: '6px 14px',
              background: '#1C1510',
              color: '#EDEAD9',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
            }}
          >
            {copied ? 'COPIED!' : 'COPY'}
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 16,
        paddingBottom: 12,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: '#7A7060',
        letterSpacing: '0.08em',
        borderTop: '1px solid #C8C4B0',
      }}>
        <span>CHAIN MINESWEEPER</span>
        <span>BASE L2</span>
      </div>
    </div>
  );
}
