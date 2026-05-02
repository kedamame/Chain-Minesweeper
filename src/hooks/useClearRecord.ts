'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useConnect, useSendTransaction, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { encodeRecordClear, CONTRACT_ADDRESS } from '@/lib/attribution';
import { MINESWEEPER_ABI } from '@/lib/contract';

export type RecordStatus = 'idle' | 'connecting' | 'pending' | 'success' | 'error' | 'already_recorded';

export function useClearRecord(isDaily: boolean) {
  const { address, isConnected } = useAccount();
  const { connect, error: connectError } = useConnect();
  const { sendTransaction } = useSendTransaction();
  const [status, setStatus] = useState<RecordStatus>('idle');
  const pendingRef = useRef(false);

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

  useEffect(() => {
    if (isDaily && hasClearedTodayData === true) {
      setStatus('already_recorded');
    }
  }, [isDaily, hasClearedTodayData]);

  // Auto-send after wallet connects (triggered by clicking RECORD while not connected)
  useEffect(() => {
    if (!isConnected || !pendingRef.current) return;
    pendingRef.current = false;

    if (isDaily && hasClearedTodayData === true) {
      setStatus('already_recorded');
      return;
    }

    setStatus('pending');
    sendTransaction(
      { to: CONTRACT_ADDRESS, data: encodeRecordClear(isDaily) },
      {
        onSuccess: () => { setStatus('success'); refetchDaily(); refetchTotal(); },
        onError: () => setStatus('error'),
      },
    );
  }, [isConnected, isDaily, hasClearedTodayData, sendTransaction, refetchDaily, refetchTotal]);

  // Connection rejected → reset to error
  useEffect(() => {
    if (connectError && pendingRef.current) {
      pendingRef.current = false;
      setStatus('error');
    }
  }, [connectError]);

  const recordClear = () => {
    if (CONTRACT_ADDRESS === '0x') return;

    if (!isConnected) {
      pendingRef.current = true;
      setStatus('connecting');
      connect({ connector: injected() });
      return;
    }

    if (isDaily && hasClearedTodayData === true) {
      setStatus('already_recorded');
      return;
    }

    setStatus('pending');
    sendTransaction(
      { to: CONTRACT_ADDRESS, data: encodeRecordClear(isDaily) },
      {
        onSuccess: () => { setStatus('success'); refetchDaily(); refetchTotal(); },
        onError: () => setStatus('error'),
      },
    );
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
