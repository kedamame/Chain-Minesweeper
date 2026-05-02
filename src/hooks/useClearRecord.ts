'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useSendTransaction, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { encodeRecordClear, CONTRACT_ADDRESS } from '@/lib/attribution';
import { MINESWEEPER_ABI } from '@/lib/contract';

export type RecordStatus = 'idle' | 'connecting' | 'pending' | 'success' | 'error' | 'already_recorded';

export function useClearRecord(isDaily: boolean) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { sendTransaction } = useSendTransaction();
  const [status, setStatus] = useState<RecordStatus>('idle');

  const { data: hasClearedTodayData, refetch: refetchDaily } = useReadContract(
    isDaily && isConnected && address && CONTRACT_ADDRESS !== '0x'
      ? {
          address: CONTRACT_ADDRESS,
          abi: MINESWEEPER_ABI,
          functionName: 'hasClearedToday',
          args: [address],
        }
      : undefined,
  );

  const { data: totalClears, refetch: refetchTotal } = useReadContract(
    isConnected && address && CONTRACT_ADDRESS !== '0x'
      ? {
          address: CONTRACT_ADDRESS,
          abi: MINESWEEPER_ABI,
          functionName: 'totalClears',
          args: [address],
        }
      : undefined,
  );

  // Sync already-recorded state for daily mode
  useEffect(() => {
    if (isDaily && hasClearedTodayData === true) {
      setStatus('already_recorded');
    }
  }, [isDaily, hasClearedTodayData]);

  const recordClear = async () => {
    if (CONTRACT_ADDRESS === '0x') return;

    if (!isConnected) {
      setStatus('connecting');
      try {
        connect({ connector: injected() });
      } catch {
        setStatus('error');
      }
      return;
    }

    if (isDaily && hasClearedTodayData === true) {
      setStatus('already_recorded');
      return;
    }

    setStatus('pending');
    try {
      const data = encodeRecordClear(isDaily);
      sendTransaction(
        { to: CONTRACT_ADDRESS, data },
        {
          onSuccess: () => {
            setStatus('success');
            refetchDaily();
            refetchTotal();
          },
          onError: () => setStatus('error'),
        },
      );
    } catch {
      setStatus('error');
    }
  };

  return {
    address,
    isConnected,
    recordClear,
    status,
    totalClears: totalClears as bigint | undefined,
    isContractDeployed: CONTRACT_ADDRESS !== '0x',
  };
}
