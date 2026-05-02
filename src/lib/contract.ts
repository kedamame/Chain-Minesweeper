export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '0x') as `0x${string}`;

export const MINESWEEPER_ABI = [
  {
    name: 'recordClear',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'isDaily', type: 'bool' }],
    outputs: [],
  },
  {
    name: 'totalClears',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'hasClearedToday',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;
