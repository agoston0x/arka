'use client';

import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { AuthProvider } from '@/lib/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: '76dc2f04-191e-4a8c-8ff9-22b6799cc796',
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </DynamicContextProvider>
  );
}
