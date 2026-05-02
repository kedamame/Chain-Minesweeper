import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { encodeFunctionData } from 'viem';
import { MINESWEEPER_ABI } from '@/lib/contract';

export const runtime = 'nodejs';
export const maxDuration = 15;

const BASE_RPC = 'https://mainnet.base.org';

async function getTotalClears(addr: string): Promise<number | null> {
  if (!addr || addr === '0x' || !addr.startsWith('0x')) return null;
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress || contractAddress === '0x') return null;

  try {
    const callData = encodeFunctionData({
      abi: MINESWEEPER_ABI,
      functionName: 'totalClears',
      args: [addr as `0x${string}`],
    });
    const res = await fetch(BASE_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'eth_call',
        params: [{ to: contractAddress, data: callData }, 'latest'],
      }),
      cache: 'no-store',
    });
    const json = await res.json() as { result?: string };
    if (!json.result || json.result === '0x') return 0;
    return parseInt(json.result, 16);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  const difficulty = (searchParams.get('diff') ?? 'NORMAL').toUpperCase();
  const result = searchParams.get('result') ?? 'PLAYED'; // CLEARED / FAILED / PLAYED
  const time = searchParams.get('time') ?? '';
  const block = searchParams.get('block') ?? '';
  const addr = searchParams.get('addr') ?? '';

  const totalClears = await getTotalClears(addr);

  const displayDate = date.replace(/-/g, '.');
  const isWon = result === 'CLEARED';
  const isLost = result === 'FAILED';
  const resultColor = isWon ? '#2D6B3D' : isLost ? '#8B1C1C' : '#1C1510';

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', background: '#EDEAD9',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px 56px',
      }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#7A7060', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
          <span>BASE / {displayDate}</span>
          {block ? <span>BLOCK #{block}</span> : <span>BASE L2</span>}
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.88 }}>
          {['CHAIN', 'MINES-', 'WEEPER.'].map(line => (
            <div key={line} style={{
              fontSize: 148,
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

        {/* Result */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 12,
          border: '2px solid #1C1510', padding: '32px 40px', background: '#F5F2E8',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 40, fontWeight: 700, color: resultColor, letterSpacing: '0.06em' }}>
              {result}
            </span>
            {time && (
              <span style={{ fontFamily: 'monospace', fontSize: 72, fontWeight: 700, color: '#1C1510', letterSpacing: '-0.02em' }}>
                {time}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 24, color: '#7A7060', letterSpacing: '0.05em', display: 'flex' }}>
              {difficulty} - Seeded by Base blockchain
            </div>
            {totalClears !== null && (
              <div style={{ fontFamily: 'monospace', fontSize: 22, color: '#1C1510', letterSpacing: '0.05em', display: 'flex' }}>
                {totalClears} CLEARS ON-CHAIN
              </div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#7A7060', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
          <span>CHAIN MINESWEEPER</span>
          <span>One board. Every day.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
