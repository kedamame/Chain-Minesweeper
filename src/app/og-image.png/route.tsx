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
          padding: 60,
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#7A7060', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
          <span>BASE CHAIN</span>
          <span>DAILY PUZZLE</span>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.88 }}>
          {['CHAIN', 'MINES-', 'WEEPER.'].map(line => (
            <div key={line} style={{
              fontSize: 160,
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

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#7A7060', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
          <span>Seeded by Base blockchain</span>
          <span>One board. Every day.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
