'use client';

import { useState, useCallback } from 'react';
import { MinesweeperGame } from './MinesweeperGame';
import { WalletButton } from './WalletButton';
import { useFarcasterMiniApp, composeCast } from '@/lib/farcaster';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://chain-minesweeper.vercel.app';

type Mode = 'daily' | 'random';

function makeRandomSeed(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

type Props = {
  seed: string;
  blockNumber: number;
  date: string;
};

export function GamePage({ seed: dailySeed, blockNumber, date }: Props) {
  const { isInMiniApp, isLoading, sdk } = useFarcasterMiniApp();
  const [mode, setMode] = useState<Mode>('daily');
  const [randomSeed, setRandomSeed] = useState<string>(makeRandomSeed);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentSeed = mode === 'daily' ? dailySeed : randomSeed;

  const handleNewRandom = useCallback(() => {
    setRandomSeed(makeRandomSeed());
    setShareMsg(null);
  }, []);

  const handleModeSwitch = useCallback((next: Mode) => {
    setMode(next);
    setShareMsg(null);
    if (next === 'random') setRandomSeed(makeRandomSeed());
  }, []);

  const handleShareResult = async (text: string, ogUrl: string) => {
    setShareMsg(text);
    if (isInMiniApp && sdk) {
      await composeCast(sdk, text, ogUrl);
    }
  };

  const handleCopy = () => {
    if (!shareMsg) return;
    navigator.clipboard.writeText(shareMsg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const displayDate = date.replace(/-/g, '.');
  const puzzleNum = Math.floor(new Date(date).getTime() / 86_400_000);
  const blockLabel = blockNumber > 0 ? `#${blockNumber.toLocaleString()}` : 'OFFLINE';

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

      {/* Top metadata bar */}
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
        <span>{mode === 'daily' ? `BLOCK ${blockLabel}` : 'RANDOM MODE'}</span>
        <WalletButton />
      </div>

      {/* Title */}
      <div style={{ padding: '8px 0 4px', lineHeight: 0.88 }}>
        {['Chain', 'Mines-', 'weeper.'].map(line => (
          <div key={line} style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 'clamp(56px, 18vw, 88px)',
            letterSpacing: '-0.02em',
            color: '#1C1510',
            textTransform: 'uppercase',
            lineHeight: 0.9,
          }}>
            {line}
          </div>
        ))}
      </div>

      {/* Mode switcher + puzzle info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingTop: 4,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: '#7A7060',
          letterSpacing: '0.1em',
        }}>
          {mode === 'daily' ? `PUZZLE #${puzzleNum}` : 'FREE PLAY'}
        </div>

        {/* DAILY / RANDOM toggle */}
        <div style={{
          display: 'flex',
          border: '1px solid #1C1510',
          overflow: 'hidden',
        }}>
          {(['daily', 'random'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => handleModeSwitch(m)}
              style={{
                padding: '4px 10px',
                background: mode === m ? '#1C1510' : 'transparent',
                color: mode === m ? '#EDEAD9' : '#1C1510',
                border: 'none',
                borderRight: m === 'daily' ? '1px solid #1C1510' : 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.1em',
              }}
            >
              {m === 'daily' ? 'DAILY' : 'RANDOM'}
            </button>
          ))}
        </div>
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
          key={currentSeed}
          seed={currentSeed}
          blockNumber={mode === 'daily' ? blockNumber : 0}
          date={date}
          mode={mode}
          isInMiniApp={isInMiniApp}
          onShareResult={handleShareResult}
          onNewRandom={mode === 'random' ? handleNewRandom : undefined}
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
