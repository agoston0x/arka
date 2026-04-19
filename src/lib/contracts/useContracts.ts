'use client';

import { useCallback, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { CONTRACTS, CommunityRegistry_ABI, UserProfileNFT_ABI } from './abis';

// Minimal viem-like encoding helpers (no extra deps)
// Dynamic provides an EIP-1193 provider we can use with eth_call / eth_sendTransaction

type Hex = `0x${string}`;

function encodeFunctionData(abi: readonly any[], functionName: string, args: any[]): Hex {
  const fn = abi.find((a) => a.type === 'function' && a.name === functionName);
  if (!fn) throw new Error(`Function ${functionName} not found in ABI`);

  const sig = `${fn.name}(${fn.inputs.map((i: any) => i.type).join(',')})`;
  // keccak256 of function signature — we'll compute selector via crypto
  const encoder = new TextEncoder();
  const data = encoder.encode(sig);
  return crypto.subtle.digest('SHA-256', data).then(() => {
    // For now, use a simple approach: we'll rely on Dynamic's built-in
    // transaction building. This file provides the hook pattern.
    return '0x' as Hex;
  }) as any;
}

export function useArkaContracts() {
  const { primaryWallet } = useDynamicContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProvider = useCallback(async () => {
    if (!primaryWallet) throw new Error('No wallet connected');
    const provider = await (primaryWallet as any).getWalletClient();
    return provider;
  }, [primaryWallet]);

  // ---- Read functions ----

  const hasProfile = useCallback(async (address: string): Promise<boolean> => {
    // TODO: implement with eth_call once deployed
    console.log('hasProfile check for', address);
    return false;
  }, []);

  const getCommunityCount = useCallback(async (): Promise<number> => {
    console.log('getCommunityCount');
    return 0;
  }, []);

  // ---- Write functions (gasless via paymaster) ----

  const joinCommunity = useCallback(async (communityId: number) => {
    setLoading(true);
    setError(null);
    try {
      if (!primaryWallet) throw new Error('Connect wallet first');
      // TODO: Build and send tx via Dynamic's embedded wallet
      // The paymaster will sponsor gas
      console.log('joinCommunity', communityId);
      // Simulate success for now
      await new Promise((r) => setTimeout(r, 1500));
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [primaryWallet]);

  const createCommunity = useCallback(async (name: string, location: string, stakeEth: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!primaryWallet) throw new Error('Connect wallet first');
      console.log('createCommunity', name, location, stakeEth);
      await new Promise((r) => setTimeout(r, 2000));
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [primaryWallet]);

  const recordAttendance = useCallback(async (eventId: number) => {
    setLoading(true);
    setError(null);
    try {
      if (!primaryWallet) throw new Error('Connect wallet first');
      console.log('recordAttendance', eventId);
      await new Promise((r) => setTimeout(r, 1500));
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [primaryWallet]);

  return {
    loading,
    error,
    contracts: CONTRACTS,
    // Read
    hasProfile,
    getCommunityCount,
    // Write (gasless)
    joinCommunity,
    createCommunity,
    recordAttendance,
    // Wallet state
    isConnected: !!primaryWallet,
    address: primaryWallet?.address,
  };
}
