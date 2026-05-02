import { ImageResponse } from 'next/og';

export const runtime = 'edge';

type Cell = 'h' | 'f' | 'r0' | 'r1' | 'r2' | 'r3';

// Illustrative board: partially cleared in-progress game
const GRID: Cell[][] = [
  ['h', 'h', 'f', 'h', 'h', 'h', 'h'],
  ['h', 'r1', 'r0', 'r0', 'r1', 'h', 'h'],
  ['h', 'r2', 'r1', 'r0', 'r1', 'f', 'h'],
  ['h', 'h', 'r2', 'r1', 'r2', 'h', 'h'],
  ['h', 'h', 'h', 'f', 'h', 'h', 'h'],
];

const NUM_COLOR: Record<string, string> = {
  r1: '#1C3A8B',
  r2: '#2D6B3D',
  r3: '#8B1C1C',
};

export async function GET() {
  const C = 44;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: '#EDEAD9', padding: 44,
        }}
      >
        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 18, color: '#7A7060', fontFamily: 'monospace',
          letterSpacing: '0.06em', marginBottom: 20,
        }}>
          <div style={{ display: 'flex' }}>BASE CHAIN</div>
          <div style={{ display: 'flex' }}>DAILY PUZZLE</div>
        </div>

        {/* Middle: title + grid */}
        <div style={{ display: 'flex', flexDirection: 'row', flexGrow: 1, alignItems: 'center' }}>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingRight: 28 }}>
            <div style={{ display: 'flex', fontSize: 88, fontWeight: 900, color: '#1C1510', fontFamily: 'sans-serif', letterSpacing: '-0.02em', lineHeight: 0.88, whiteSpace: 'nowrap' }}>
              CHAIN
            </div>
            <div style={{ display: 'flex', fontSize: 88, fontWeight: 900, color: '#1C1510', fontFamily: 'sans-serif', letterSpacing: '-0.02em', lineHeight: 0.88, whiteSpace: 'nowrap' }}>
              MINES-
            </div>
            <div style={{ display: 'flex', fontSize: 88, fontWeight: 900, color: '#1C1510', fontFamily: 'sans-serif', letterSpacing: '-0.02em', lineHeight: 0.88, whiteSpace: 'nowrap' }}>
              WEEPER.
            </div>
          </div>

          {/* Vertical divider */}
          <div style={{ width: 1, background: '#C8C4B0', display: 'flex', alignSelf: 'stretch', marginRight: 28 }} />

          {/* Grid illustration */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', borderWidth: 2, borderStyle: 'solid', borderColor: '#1C1510' }}>
              {GRID.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', flexDirection: 'row' }}>
                  {row.map((cell, ci) => (
                    <div
                      key={`${ri}-${ci}`}
                      style={{
                        width: C, height: C,
                        background: (cell === 'h' || cell === 'f') ? '#1C1510' : '#EDEAD9',
                        borderWidth: 1, borderStyle: 'solid',
                        borderColor: (cell === 'h' || cell === 'f') ? '#2A2010' : '#C8C4B0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {cell === 'f' && (
                        <div style={{ display: 'flex', width: C * 0.38, height: C * 0.38, background: '#C0392B' }} />
                      )}
                      {(cell === 'r1' || cell === 'r2' || cell === 'r3') && (
                        <div style={{ display: 'flex', fontSize: C * 0.55, fontWeight: 700, color: NUM_COLOR[cell], fontFamily: 'monospace', lineHeight: 1 }}>
                          {cell.slice(1)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', fontSize: 13, color: '#7A7060', fontFamily: 'monospace', letterSpacing: '0.08em', marginTop: 14 }}>
              REVEAL CELLS - FLAG MINES
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 18, color: '#7A7060', fontFamily: 'monospace',
          letterSpacing: '0.06em', marginTop: 20,
        }}>
          <div style={{ display: 'flex' }}>Tap to play</div>
          <div style={{ display: 'flex' }}>base.org</div>
        </div>
      </div>
    ),
    { width: 900, height: 600 }
  );
}
