'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  const baseBtn: React.CSSProperties = {
    padding: '4px 8px',
    border: '1px solid #1C1510',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '0.08em',
    whiteSpace: 'nowrap',
  };

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        title="Click to disconnect"
        style={{ ...baseBtn, background: '#1C1510', color: '#EDEAD9' }}
      >
        {shortAddr(address)}
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        style={{
          ...baseBtn,
          background: 'transparent',
          color: isPending ? '#7A7060' : '#1C1510',
          borderColor: isPending ? '#C8C4B0' : '#1C1510',
        }}
      >
        {isPending ? 'CONNECTING...' : 'CONNECT'}
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: '#EDEAD9',
            border: '1px solid #1C1510',
            zIndex: 50,
            minWidth: 150,
          }}>
            {connectors.map((connector, i) => (
              <button
                key={connector.id}
                onClick={() => { connect({ connector }); setOpen(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  color: '#1C1510',
                  border: 'none',
                  borderTop: i > 0 ? '1px solid #C8C4B0' : 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  textAlign: 'left',
                }}
              >
                {connector.name.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
