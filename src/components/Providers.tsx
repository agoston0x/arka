'use client';

import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { AuthProvider } from '@/lib/auth-context';

const cssOverrides = `
  .dynamic-widget-inline-controls {
    background: #ffffff !important;
  }
  .dynamic-widget-modal {
    font-family: system-ui, -apple-system, sans-serif !important;
  }
  /* Primary button — arka pink */
  .button--primary,
  .dynamic-widget-inline-controls .button--primary,
  [data-testid="dynamic-modal-container"] .button--primary {
    background-color: #E5007D !important;
    border-color: #E5007D !important;
    border-radius: 9999px !important;
    font-weight: 600 !important;
  }
  .button--primary:hover {
    background-color: #cc006e !important;
    border-color: #cc006e !important;
  }
  /* Links */
  a, .link {
    color: #E5007D !important;
  }
  /* Input focus */
  input:focus {
    border-color: #E5007D !important;
    box-shadow: 0 0 0 1px #E5007D !important;
  }
  /* Modal border radius */
  .dynamic-modal-card,
  [data-testid="dynamic-modal-container"] > div {
    border-radius: 20px !important;
  }
  /* Header styling */
  .dynamic-widget-modal__header {
    font-weight: 700 !important;
  }
  /* Accent colors */
  .badge--primary,
  .tag--primary {
    background-color: #E5007D20 !important;
    color: #E5007D !important;
  }
  /* Hide wallet options — email only */
  .wallet-list,
  .dynamic-widget-modal__wallet-list,
  [data-testid="wallet-list"],
  .dynamic-widget-modal .wallet-list-item,
  .wallet-list__scroll-container,
  .dynamic-footer,
  .social-redirect-view__footer {
    display: none !important;
  }
`;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: '76dc2f04-191e-4a8c-8ff9-22b6799cc796',
        walletConnectors: [EthereumWalletConnectors],
        cssOverrides,
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </DynamicContextProvider>
  );
}
