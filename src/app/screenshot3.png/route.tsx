import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Screenshot 3: Share card preview
export async function GET() {
  const shareText = `Chain Minesweeper
2026.04.30 / NORMAL
CLEARED in 01:23
Block #12,345,678 - base`;

  const emojiGrid = [
    '🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫',
    '🟫🟫⬛⬛⬛🟫🟫🟫⬛🟫🟫🟫',
    '🟫🟫⬛🟫⬛🟫🟫🟫⬛🟫🟫🟫',
    '🟫🟫⬛⬛⬛🟫🟫🟫🟫🟫🟫🟫',
    '🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫',
  ];

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', background: '#EDEAD9', display: 'flex',
        flexDirection: 'column', padding: '80px 60px', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 28, color: '#7A7060', letterSpacing: '0.08em' }}>
          <span>BASE / 2026.04.30</span>
          <span>SHARE RESULT</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.9 }}>
          {['CHAIN', 'MINES-', 'WEEPER.'].map(t => (
            <div key={t} style={{ fontSize: 220, fontWeight: 900, color: '#1C1510', fontFamily: 'sans-serif', letterSpacing: '-0.02em', lineHeight: 0.9, display: 'flex' }}>{t}</div>
          ))}
        </div>

        {/* Share preview card */}
        <div style={{
          border: '2px solid #1C1510', padding: '48px', display: 'flex',
          flexDirection: 'column', gap: 20, background: '#F5F2E8',
        }}>
          <pre style={{ fontFamily: 'monospace', fontSize: 34, color: '#1C1510', lineHeight: 1.5, whiteSpace: 'pre', display: 'flex', flexDirection: 'column' }}>
            {shareText}
          </pre>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {emojiGrid.map((row, i) => (
              <div key={i} style={{ fontFamily: 'monospace', fontSize: 42, letterSpacing: 2, display: 'flex' }}>{row}</div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 28, color: '#7A7060' }}>
          <span>CHAIN MINESWEEPER</span>
          <span>BASE L2</span>
        </div>
      </div>
    ),
    { width: 1284, height: 2778 }
  );
}
