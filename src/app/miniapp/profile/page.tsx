'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { QRCodeSVG } from 'qrcode.react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isProHost, isConnected, openSignIn, signOut, becomeHost } = useAuth();
  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
  const displayName = tgUser?.first_name || user?.username?.replace('@', '') || 'User';
  const [balance, setBalance] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!user?.address || !user.address.startsWith('0x')) return;
    const fetchBalance = async () => {
      try {
        const resp = await fetch('https://sepolia-rollup.arbitrum.io/rpc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBalance', params: [user.address, 'latest'], id: 1 }),
        });
        const data = await resp.json();
        const wei = parseInt(data.result, 16);
        setBalance((wei / 1e18).toFixed(6));
      } catch { setBalance(null); }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [user?.address]);

  const copyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      await becomeHost();
    } catch (e: any) {
      alert(e.message || 'Failed');
    } finally {
      setUpgrading(false);
    }
  };

  const handleClose = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (window.history.length > 1) {
      router.back();
    } else if (tg?.close) {
      tg.close();
    }
  };

  const qrPayload = JSON.stringify({
    type: 'arka',
    action: 'mingle-scan',
    userId: tgUser?.id?.toString() || user?.address || '',
    username: displayName,
    address: user?.address || '',
  });

  // Not signed in
  if (!isConnected) {
    return (
      <main className="flex h-screen w-full flex-col bg-white max-w-md mx-auto">
        <header className="flex items-center justify-between px-5 py-4 border-b border-black/5 shrink-0">
          <span className="text-base font-bold text-arka-text">Profile</span>
          <button onClick={handleClose} className="text-sm text-black/40 font-medium">✕ Close</button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-arka-pink/10 text-3xl">👤</div>
          <h2 className="mt-4 text-xl font-bold text-arka-text">Sign in to continue</h2>
          <p className="mt-2 text-center text-sm text-black/40">Connect with email to get your embedded wallet</p>
          <button
            onClick={openSignIn}
            className="mt-6 w-full max-w-xs rounded-xl bg-arka-pink py-3 text-sm font-bold text-white transition active:scale-95"
          >
            Sign In with Email
          </button>
        </div>
      </main>
    );
  }

  // Signed in
  return (
    <main className="flex h-screen w-full flex-col bg-white max-w-md mx-auto">
      <header className="flex items-center justify-between px-5 py-4 border-b border-black/5 shrink-0">
        <span className="text-base font-bold text-arka-text">Profile</span>
        <button onClick={handleClose} className="text-sm text-black/40 font-medium">✕ Close</button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Name */}
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-arka-pink/10 text-2xl font-bold text-arka-pink">
            {displayName[0]?.toUpperCase()}
          </div>
          <h2 className="mt-2 text-lg font-bold text-arka-text">{displayName}</h2>
          {user?.email && <p className="text-xs text-black/40">{user.email}</p>}
          {isProHost && <span className="mt-1 rounded-full bg-arka-pink px-3 py-0.5 text-[10px] font-bold text-white">PRO HOST ✦</span>}
        </div>

        {/* Wallet */}
        {user?.address && (
          <div className="mt-5 rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/30">Wallet</p>
              <p className="text-[10px] text-black/20">Arbitrum Sepolia</p>
            </div>
            <button onClick={copyAddress} className="flex items-center gap-2 w-full text-left">
              <code className="text-[11px] text-arka-text break-all font-mono">{user.address}</code>
              <span className="text-[10px] text-arka-pink font-bold shrink-0">{copied ? '✓ Copied' : 'Copy'}</span>
            </button>
            {balance !== null && (
              <div className="mt-3 pt-3 border-t border-black/5">
                <p className="text-[10px] text-black/30">Balance</p>
                <p className="text-lg font-black text-arka-text">{balance} <span className="text-sm text-black/30">ETH</span></p>
              </div>
            )}
          </div>
        )}

        {/* QR Code */}
        <div className="mt-5 flex flex-col items-center rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/30 mb-3">My QR Code</p>
          <QRCodeSVG value={qrPayload} size={180} level="M" />
          <p className="mt-3 text-xs font-semibold text-arka-text">{displayName}</p>
          <p className="text-[10px] text-black/30">Scan at events for check-in & mingle</p>
        </div>

        {/* Go Pro */}
        {!isProHost && (
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-arka-pink to-[#7B61FF] p-5 text-white shadow-lg">
            <h3 className="text-base font-bold">🌟 Go Pro</h3>
            <p className="mt-1 text-xs opacity-90">Create your own community & host events</p>
            <p className="mt-1 text-[10px] opacity-70">0.001 ETH · one-time</p>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="mt-3 w-full rounded-full bg-white py-2.5 text-sm font-bold text-arka-pink transition active:scale-95 disabled:opacity-50"
            >
              {upgrading ? 'Processing...' : 'Upgrade Now'}
            </button>
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={signOut}
          className="mt-5 w-full rounded-xl border border-black/10 py-3 text-sm font-medium text-black/40 transition hover:bg-black/5"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
