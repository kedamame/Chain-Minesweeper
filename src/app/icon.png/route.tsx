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
          alignItems: 'center',
          justifyContent: 'center',
          background: '#EDEAD9',
        }}
      >
        {/* 3x3 minesweeper grid as icon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[
            ['#1C1510', '#EDEAD9', '#1C1510'],
            ['#EDEAD9', '#1C1510', '#EDEAD9'],
            ['#1C1510', '#EDEAD9', '#1C1510'],
          ].map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 24 }}>
              {row.map((bg, ci) => (
                <div
                  key={ci}
                  style={{
                    width: 220,
                    height: 220,
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {ri === 1 && ci === 1 && (
                    <div style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: '#EDEAD9',
                      display: 'flex',
                    }} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1024, height: 1024 }
  );
}
