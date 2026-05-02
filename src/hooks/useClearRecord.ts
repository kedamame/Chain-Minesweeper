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

async function switchConnectorToBase(connector: Connector): Promise<void> {
  const provider = await connector.getProvider() as EthProvider;
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_CHAIN_HEX }],
    });
  } catch (err: unknown) {
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
  const pendingConnectRef = useRef(false); // waiting for wallet to connect
  const pendingTxRef = useRef(false);      // waiting for chain to switch to Base

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

  // Send the transaction (called only when already on Base)
  const doSend = useCallback(() => {
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
  }, [isDaily, hasClearedTodayData, sendTransaction, refetchDaily, refetchTotal]);

  // Request chain switch; transaction will fire via the chainId useEffect below
  const doSwitchChain = useCallback((conn: Connector) => {
    pendingTxRef.current = true;
    setStatus('connecting');
    switchConnectorToBase(conn).catch(() => {
      pendingTxRef.current = false;
      setStatus('error');
    });
  }, []);

  // After chainId updates to Base in wagmi state → send the pending transaction
  useEffect(() => {
    if (chainId !== base.id || !pendingTxRef.current) return;
    pendingTxRef.current = false;
    doSend();
  }, [chainId, doSend]);

  // After wallet connects → switch chain if needed, or send directly
  useEffect(() => {
    if (!isConnected || !pendingConnectRef.current) return;
    pendingConnectRef.current = false;
    if (chainId === base.id) {
      doSend();
    } else if (connector) {
      doSwitchChain(connector);
    }
  }, [isConnected, chainId, connector, doSend, doSwitchChain]);

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

    if (chainId !== base.id) {
      if (!connector) { setStatus('error'); return; }
      doSwitchChain(connector);
      return;
    }

    doSend();
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
