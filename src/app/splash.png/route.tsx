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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[[1,0,1],[0,1,0],[1,0,1]].map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 6 }}>
              {row.map((filled, ci) => (
                <div
                  key={ci}
                  style={{
                    width: 44,
                    height: 44,
                    background: filled ? '#1C1510' : 'transparent',
                    border: filled ? 'none' : '2px solid #1C1510',
                    display: 'flex',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 200, height: 200 }
  );
}
