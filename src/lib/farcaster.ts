'use client';

import { useEffect, useRef, useState } from 'react';

export type FarcasterUser = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
};

export type FarcasterState = {
  isInMiniApp: boolean;
  isLoading: boolean;
  user: FarcasterUser | null;
  sdk: unknown;
};

export function useFarcasterMiniApp(): FarcasterState {
  const [state, setState] = useState<FarcasterState>({
    isInMiniApp: false,
    isLoading: true,
    user: null,
    sdk: null,
  });
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    import('@farcaster/miniapp-sdk')
      .then(async ({ sdk }) => {
        const isMiniApp = await sdk.isInMiniApp();
        if (!isMiniApp) {
          setState({ isInMiniApp: false, isLoading: false, user: null, sdk: null });
          return;
        }

        sdk.actions.ready();

        try {
          const ethProvider = await sdk.wallet.getEthereumProvider();
          if (ethProvider && typeof window !== 'undefined') {
            (window as unknown as Record<string, unknown>).ethereum = ethProvider;
          }
        } catch { /* no wallet */ }

        let user: FarcasterUser | null = null;
        try {
          const context = await sdk.context;
          const u = (context?.user as Record<string, unknown> | undefined);
          if (u) {
            user = {
              fid: u.fid as number,
              username: u.username as string | undefined,
              displayName: u.displayName as string | undefined,
              pfpUrl: u.pfpUrl as string | undefined,
            };
          }
        } catch { /* no context */ }

        setState({ isInMiniApp: true, isLoading: false, user, sdk });
      })
      .catch(() => {
        setState({ isInMiniApp: false, isLoading: false, user: null, sdk: null });
      });
  }, []);

  return state;
}

export async function composeCast(sdk: unknown, text: string, appUrl: string) {
  try {
    const s = sdk as { actions: { composeCast: (opts: unknown) => Promise<void> } };
    await s.actions.composeCast({
      text,
      embeds: [appUrl],
    });
  } catch { /* fallback: clipboard */ }
}
