import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Screenshot 2: Game won state
export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', background: '#EDEAD9', display: 'flex',
        flexDirection: 'column', padding: '80px 60px', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 28, color: '#7A7060', letterSpacing: '0.08em' }}>
          <span>BASE / 2026.04.30</span>
          <span>BLOCK #12,345,678</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.9 }}>
          {['CHAIN', 'MINES-', 'WEEPER.'].map(t => (
            <div key={t} style={{ fontSize: 220, fontWeight: 900, color: '#1C1510', fontFamily: 'sans-serif', letterSpacing: '-0.02em', lineHeight: 0.9, display: 'flex' }}>{t}</div>
          ))}
        </div>

        {/* Result card */}
        <div style={{
          border: '3px solid #1C1510', padding: '60px 80px', display: 'flex',
          flexDirection: 'column', gap: 24, background: '#F5F2E8',
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: 36, color: '#2D6B3D', letterSpacing: '0.1em', fontWeight: 700, display: 'flex' }}>CLEARED</div>
          <div style={{ fontFamily: 'monospace', fontSize: 100, fontWeight: 700, color: '#1C1510', letterSpacing: '-0.02em', display: 'flex' }}>01:23</div>
          <div style={{ fontFamily: 'monospace', fontSize: 32, color: '#7A7060', display: 'flex' }}>NORMAL / PUZZLE #20208</div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1, padding: '28px 0', background: 'transparent', border: '2px solid #1C1510', fontFamily: 'monospace', fontSize: 30, color: '#1C1510', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>RESET</div>
          <div style={{ flex: 1, padding: '28px 0', background: '#1C1510', border: '2px solid #1C1510', fontFamily: 'monospace', fontSize: 30, color: '#EDEAD9', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SHARE</div>
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
