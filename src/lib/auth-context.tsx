'use client';

import { createContext, useContext, useMemo, useCallback, ReactNode, useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { checkIsProHost, subscribeWithDynamic } from './arka-pro';

type AuthContextType = {
  user: {
    email: string;
    username: string;
    address: string;
    memberSince: string;
    nftBadge: string;
    isHost: boolean;
    hostedCommunityId?: string;
  } | null;
  isConnected: boolean;
  isProHost: boolean;
  primaryWallet: any;
  openSignIn: () => void;
  signOut: () => void;
  becomeHost: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setShowAuthFlow, handleLogOut, primaryWallet, user: dynamicUser } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const [isProHost, setIsProHost] = useState(false);

  const user = useMemo(() => {
    if (!isLoggedIn || !dynamicUser) return null;
    const addr = primaryWallet?.address || '';
    const email = dynamicUser.email || '';
    const name = dynamicUser.alias || dynamicUser.username || email.split('@')[0] || 'anon';
    return {
      email,
      username: `@${name}`,
      address: addr,
      memberSince: new Date().toISOString().split('T')[0],
      nftBadge: 'Genesis Explorer',
      isHost: isProHost,
    };
  }, [isLoggedIn, dynamicUser, primaryWallet, isProHost]);

  // Check pro host status when address changes
  useEffect(() => {
    if (primaryWallet?.address) {
      checkIsProHost(primaryWallet.address).then(setIsProHost);
    } else {
      setIsProHost(false);
    }
  }, [primaryWallet?.address]);

  const openSignIn = useCallback(() => {
    setShowAuthFlow(true);
  }, [setShowAuthFlow]);

  const signOut = useCallback(() => {
    handleLogOut();
  }, [handleLogOut]);

  const becomeHost = useCallback(async () => {
    const result = await subscribeWithDynamic(primaryWallet);
    if (result.success) {
      // Refresh pro status
      if (primaryWallet?.address) {
        const isPro = await checkIsProHost(primaryWallet.address);
        setIsProHost(isPro);
      }
    } else {
      throw new Error(result.error || 'Subscription failed');
    }
  }, [primaryWallet]);

  const value = useMemo(
    () => ({ user, isConnected: isLoggedIn, isProHost, primaryWallet, openSignIn, signOut, becomeHost }),
    [user, isLoggedIn, isProHost, primaryWallet, openSignIn, signOut, becomeHost]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
