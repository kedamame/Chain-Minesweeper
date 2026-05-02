import { Attribution } from 'ox/erc8021';
import { encodeFunctionData, concatHex } from 'viem';
import { MINESWEEPER_ABI, CONTRACT_ADDRESS } from './contract';

const BUILDER_CODE = 'bc_35fw2go9';

export function encodeRecordClear(isDaily: boolean): `0x${string}` {
  const callData = encodeFunctionData({
    abi: MINESWEEPER_ABI,
    functionName: 'recordClear',
    args: [isDaily],
  });
  const suffix = Attribution.toDataSuffix({ codes: [BUILDER_CODE] });
  return concatHex([callData, suffix]);
}

export { CONTRACT_ADDRESS };
