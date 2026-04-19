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
        setBalance((wei / 1e18).toFixed(4));
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
    try { setUpgrading(true); await becomeHost(); } catch (e: any) { alert(e.message || 'Failed'); } finally { setUpgrading(false); }
  };

  const handleClose = () => {
    if (window.history.length > 1) router.back();
    else (window as any).Telegram?.WebApp?.close?.();
  };

  const qrPayload = JSON.stringify({
    type: 'arka', action: 'mingle-scan',
    userId: tgUser?.id?.toString() || user?.address || '',
    username: displayName, address: user?.address || '',
  });

  const shortAddr = user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : '';

  if (!isConnected) {
    return (
      <main className="flex h-screen w-full flex-col bg-white max-w-md mx-auto">
        <header className="flex items-end justify-end px-5 py-3 shrink-0">
          <button onClick={handleClose} className="text-2xl text-black/30">✕</button>
        </header>
        <div className="flex flex-col items-center px-8 pt-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-arka-pink/10 text-3xl">👤</div>
          <h2 className="mt-4 text-xl font-bold text-arka-text">Sign in to continue</h2>
          <p className="mt-2 text-center text-sm text-black/40">Connect with email to get your embedded wallet</p>
          <button onClick={openSignIn} className="mt-6 w-full max-w-xs rounded-xl bg-arka-pink py-3 text-sm font-bold text-white transition active:scale-95">
            Sign In with Email
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col bg-white max-w-md mx-auto">
      {/* Header row: avatar + info + close */}
      <header className="flex items-start justify-between px-5 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-arka-pink/10 text-2xl font-bold text-arka-pink">
            {displayName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-arka-text">{displayName}</p>
              {isProHost && <span className="rounded-full bg-arka-pink px-2 py-0.5 text-[9px] font-bold text-white">PRO ✦</span>}
            </div>
            {user?.address && (
              <button onClick={copyAddress} className="flex items-center gap-1.5 mt-1">
                <code className="text-sm text-black/40 font-mono">{shortAddr}</code>
                <span className="text-xs text-arka-pink font-bold">{copied ? '✓' : 'Copy'}</span>
              </button>
            )}
            {balance !== null && (
              <p className="text-sm text-black/40 mt-0.5"><span className="font-black text-arka-text text-lg">{balance}</span> ETH</p>
            )}
          </div>
        </div>
        <button onClick={handleClose} className="text-2xl text-black/30 mt-1">✕</button>
      </header>

      {/* QR Code — main content, centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 flex flex-col items-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-black/25 mb-3">My QR Code</p>
          <QRCodeSVG value={qrPayload} size={180} level="M" />
          <p className="mt-3 text-xs font-semibold text-arka-text">{displayName}</p>
          <p className="text-[10px] text-black/30">Scan at events for check-in & mingle</p>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-5 pt-3 shrink-0 space-y-2">
        {!isProHost && (
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full rounded-xl bg-gradient-to-r from-arka-pink to-[#7B61FF] py-3 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50"
          >
            {upgrading ? 'Processing...' : '🌟 Go Pro · 0.001 ETH'}
          </button>
        )}
        <button onClick={signOut} className="w-full rounded-xl border border-black/10 py-2.5 text-sm font-medium text-black/40">
          Sign Out
        </button>
      </div>
    </main>
  );
}
