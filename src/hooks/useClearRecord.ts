'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount, useConnect, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { encodeRecordClear, CONTRACT_ADDRESS } from '@/lib/attribution';
import { MINESWEEPER_ABI } from '@/lib/contract';
import { base } from 'wagmi/chains';

const BASE_CHAIN_HEX = '0x2105'; // 8453

type EthProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const BASE_CHAIN_PARAMS = {
  chainId: BASE_CHAIN_HEX,
  chainName: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
};

export type RecordStatus = 'idle' | 'connecting' | 'pending' | 'success' | 'error' | 'already_recorded';

export function useClearRecord(isDaily: boolean) {
  const { address, isConnected, connector } = useAccount();
  const { connect, error: connectError } = useConnect();
  const [status, setStatus] = useState<RecordStatus>('idle');
  const pendingConnectRef = useRef(false);

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

  // All chain/tx logic goes directly through the provider — no wagmi chain state involved
  const executeRecord = useCallback(async () => {
    if (!connector || !address) { setStatus('error'); return; }
    if (isDaily && hasClearedTodayData === true) { setStatus('already_recorded'); return; }

    setStatus('connecting');

    try {
      const provider = await connector.getProvider() as EthProvider;

      // Check actual chain directly from the provider
      const chainHex = await provider.request({ method: 'eth_chainId' }) as string;
      const currentChainId = parseInt(chainHex, 16);

      if (currentChainId !== base.id) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_CHAIN_HEX }],
          });
        } catch (err: unknown) {
          // Chain not registered in wallet → add it first
          if ((err as { code?: number }).code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [BASE_CHAIN_PARAMS],
            });
          } else {
            throw err;
          }
        }
      }

      // Send transaction directly through the provider (bypasses wagmi chain state)
      setStatus('pending');
      await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: address, to: CONTRACT_ADDRESS, data: encodeRecordClear(isDaily) }],
      });

      setStatus('success');
      refetchDaily();
      refetchTotal();
    } catch {
      setStatus('error');
    }
  }, [connector, address, isDaily, hasClearedTodayData, refetchDaily, refetchTotal]);

  // Auto-execute after wallet connects
  useEffect(() => {
    if (!isConnected || !pendingConnectRef.current) return;
    pendingConnectRef.current = false;
    executeRecord();
  }, [isConnected, executeRecord]);

  // Connection rejected → reset
  useEffect(() => {
    if (connectError && pendingConnectRef.current) {
      pendingConnectRef.current = false;
      setStatus('error');
    }
  }, [connectError]);

  const recordClear = () => {
    if (CONTRACT_ADDRESS === '0x') return;

    if (!isConnected) {
      pendingConnectRef.current = true;
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
