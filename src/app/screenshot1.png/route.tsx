import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Screenshot 1: Main game screen
export async function GET() {
  const cells = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => {
      if ((r + c) % 3 === 0) return 'revealed';
      if (r === 2 && c === 4) return 'mine';
      return 'hidden';
    })
  );

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          {cells.map((row, r) => (
            <div key={r} style={{ display: 'flex', gap: 4 }}>
              {row.map((type, c) => (
                <div key={c} style={{
                  width: 80, height: 80,
                  background: type === 'hidden' ? '#1C1510' : type === 'mine' ? '#3D0A0A' : '#EDEAD9',
                  border: '2px solid ' + (type === 'revealed' ? '#C8C4B0' : '#EDEAD9'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {type === 'mine' && <span style={{ fontSize: 44 }}>💥</span>}
                  {type === 'revealed' && (r + c) % 5 !== 0 && <span style={{ fontSize: 44, fontWeight: 700, color: '#1C3A8B', fontFamily: 'monospace' }}>2</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 28, color: '#7A7060' }}>
          <span>PUZZLE #20208</span>
          <span>BASE L2</span>
        </div>
      </div>
    ),
    { width: 1284, height: 2778 }
  );
}
