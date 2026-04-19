'use client';

import { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';

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
  openSignIn: () => void;
  signOut: () => void;
  becomeHost: (communityName: string, description: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setShowAuthFlow, handleLogOut, primaryWallet, user: dynamicUser } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();

  const user = useMemo(() => {
    if (!isLoggedIn || !dynamicUser) return null;
    const addr = primaryWallet?.address || '0x0000...0000';
    const email = dynamicUser.email || '';
    const name = dynamicUser.alias || dynamicUser.username || email.split('@')[0] || 'anon';
    return {
      email,
      username: `@${name}`,
      address: addr,
      memberSince: new Date().toISOString().split('T')[0],
      nftBadge: 'Genesis Explorer',
      isHost: false,
    };
  }, [isLoggedIn, dynamicUser, primaryWallet]);

  const openSignIn = useCallback(() => {
    setShowAuthFlow(true);
  }, [setShowAuthFlow]);

  const signOut = useCallback(() => {
    handleLogOut();
  }, [handleLogOut]);

  const becomeHost = useCallback((_name: string, _desc: string) => {
    // In real app, this would call the contract. For now, mock.
  }, []);

  const value = useMemo(
    () => ({ user, isConnected: isLoggedIn, openSignIn, signOut, becomeHost }),
    [user, isLoggedIn, openSignIn, signOut, becomeHost]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
