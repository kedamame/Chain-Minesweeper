import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#EDEAD9',
          padding: 48,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: '#7A7060', fontFamily: 'monospace' }}>
          <span>BASE CHAIN</span>
          <span>DAILY PUZZLE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.88 }}>
          {['CHAIN', 'MINES-', 'WEEPER.'].map(line => (
            <div key={line} style={{
              fontSize: 120,
              fontWeight: 900,
              color: '#1C1510',
              fontFamily: 'sans-serif',
              letterSpacing: '-0.02em',
              lineHeight: 0.88,
              display: 'flex',
            }}>
              {line}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: '#7A7060', fontFamily: 'monospace' }}>
          <span>Tap to play</span>
          <span>base.org</span>
        </div>
      </div>
    ),
    { width: 900, height: 600 }
  );
}
