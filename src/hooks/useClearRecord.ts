'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  useAccount, useConnect, useSendTransaction,
  useReadContract, useChainId,
} from 'wagmi';
import type { Connector } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { encodeRecordClear, CONTRACT_ADDRESS } from '@/lib/attribution';
import { MINESWEEPER_ABI } from '@/lib/contract';

const BASE_CHAIN_HEX = '0x2105'; // 8453

type EthProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

// Use the connector's own provider (not window.ethereum) for EIP-6963 wallets like Rabby
async function switchConnectorToBase(connector: Connector): Promise<void> {
  const provider = await connector.getProvider() as EthProvider;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_CHAIN_HEX }],
    });
  } catch (err: unknown) {
    // Chain not registered in wallet yet — add it first
    if ((err as { code?: number }).code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: BASE_CHAIN_HEX,
          chainName: 'Base',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org'],
        }],
      });
    } else {
      throw err;
    }
  }
}

export type RecordStatus = 'idle' | 'connecting' | 'pending' | 'success' | 'error' | 'already_recorded';

export function useClearRecord(isDaily: boolean) {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
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

  const executeRecord = useCallback(async () => {
    if (isDaily && hasClearedTodayData === true) {
      setStatus('already_recorded');
      return;
    }

    if (chainId !== base.id) {
      if (!connector) { setStatus('error'); return; }
      setStatus('connecting');
      try {
        await switchConnectorToBase(connector);
      } catch {
        setStatus('error');
        return;
      }
    }

    setStatus('pending');
    sendTransaction(
      { to: CONTRACT_ADDRESS, data: encodeRecordClear(isDaily) },
      {
        onSuccess: () => { setStatus('success'); refetchDaily(); refetchTotal(); },
        onError: () => setStatus('error'),
      },
    );
  }, [chainId, connector, isDaily, hasClearedTodayData, sendTransaction, refetchDaily, refetchTotal]);

  // Auto-execute after wallet connects
  useEffect(() => {
    if (!isConnected || !pendingRef.current) return;
    pendingRef.current = false;
    executeRecord();
  }, [isConnected, executeRecord]);

  // Connection rejected → reset
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

    executeRecord();
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
