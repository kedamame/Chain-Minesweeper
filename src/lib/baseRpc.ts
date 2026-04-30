const BASE_RPC = 'https://mainnet.base.org';

type RpcResponse<T> = { result: T | null; error?: { code: number; message: string } };

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(BASE_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
  const json = (await res.json()) as RpcResponse<T>;
  if (json.error) throw new Error(`RPC error ${json.error.code}: ${json.error.message}`);
  if (json.result === null || json.result === undefined) throw new Error(`RPC null result for ${method}`);
  return json.result;
}

function dateToUTCMidnightMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export async function getDailySeed(date: Date = new Date()): Promise<{ seed: string; blockNumber: number }> {
  try {
    const targetMs = dateToUTCMidnightMs(date);
    const targetSec = Math.floor(targetMs / 1000);

    const latestHex = await rpc<string>('eth_blockNumber', []);
    const latest = parseInt(latestHex, 16);

    const nowSec = Math.floor(Date.now() / 1000);
    const diffSec = nowSec - targetSec;
    const estimatedBlock = Math.max(1000, latest - Math.floor(diffSec * 2));

    const block = await rpc<{ hash: string; number: string; timestamp: string }>(
      'eth_getBlockByNumber',
      [`0x${estimatedBlock.toString(16)}`, false]
    );

    // Guard: block 1000 is a genesis-range block, treat as fallback
    const blockNum = parseInt(block.number, 16);
    if (blockNum <= 1000) throw new Error('Block estimate landed in genesis range');

    return { seed: block.hash, blockNumber: blockNum };
  } catch {
    const fallback = date.toISOString().slice(0, 10);
    return { seed: fallback, blockNumber: 0 };
  }
}
