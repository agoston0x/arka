'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArkaLogo from '@/components/ArkaLogo';
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
  const [showQR, setShowQR] = useState(false);

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

  const qrPayload = JSON.stringify({
    type: 'arka',
    action: 'mingle-scan',
    userId: tgUser?.id?.toString() || user?.address || '',
    username: displayName,
    address: user?.address || '',
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-white/90 px-5 py-4 backdrop-blur-sm border-b border-black/5">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <ArkaLogo size={24} />
        <span className="text-sm font-bold text-arka-text">Profile</span>
      </header>

      <section className="px-5 py-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-arka-pink/10 text-3xl font-bold text-arka-pink">
            {displayName[0]?.toUpperCase()}
          </div>
          <h2 className="mt-3 text-xl font-bold text-arka-text">{displayName}</h2>
          {user?.email && <p className="text-xs text-black/40">{user.email}</p>}
          {isProHost && <span className="mt-2 rounded-full bg-arka-pink px-3 py-0.5 text-[10px] font-bold text-white">PRO HOST ✦</span>}
        </div>

        {/* Not signed in with Dynamic */}
        {!isConnected && (
          <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-center ring-1 ring-black/5">
            <p className="text-sm font-semibold text-arka-text">Connect your wallet</p>
            <p className="mt-1 text-xs text-black/40">Sign in with email to get an embedded wallet</p>
            <button
              onClick={openSignIn}
              className="mt-3 w-full rounded-xl bg-arka-pink py-3 text-sm font-bold text-white transition active:scale-95"
            >
              Sign In with Email
            </button>
          </div>
        )}

        {/* Wallet */}
        {user?.address && (
          <div className="mt-6 rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
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
        <div className="mt-5">
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5 transition active:scale-[0.98]"
          >
            <p className="text-sm font-bold text-arka-text">{showQR ? 'Hide QR Code' : '📱 Show My QR Code'}</p>
            <p className="text-[10px] text-black/40">For check-in & mingle at events</p>
          </button>
          {showQR && (
            <div className="mt-3 flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <QRCodeSVG value={qrPayload} size={200} level="M" />
              <p className="mt-3 text-xs font-semibold text-arka-text">{displayName}</p>
              <p className="text-[10px] text-black/30">Scan to verify at events</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-arka-pink/10 p-3 text-center">
            <p className="text-xl font-black text-arka-pink">2</p>
            <p className="text-[9px] text-black/40">Communities</p>
          </div>
          <div className="rounded-xl bg-arka-cyan/10 p-3 text-center">
            <p className="text-xl font-black text-arka-cyan">5</p>
            <p className="text-[9px] text-black/40">Events</p>
          </div>
          <div className="rounded-xl bg-arka-green/10 p-3 text-center">
            <p className="text-xl font-black text-arka-green">2,450</p>
            <p className="text-[9px] text-black/40">Reputation</p>
          </div>
        </div>

        {/* Go Pro */}
        {!isProHost && isConnected && (
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-arka-pink to-[#7B61FF] p-5 text-white shadow-lg">
            <h3 className="text-base font-bold">🌟 Go Pro</h3>
            <p className="mt-1 text-xs opacity-90">Create your own community & host events</p>
            <p className="mt-1 text-[10px] opacity-70">0.001 ETH · one-time</p>
            <a
              href="https://arka.social"
              target="_blank"
              className="mt-3 block w-full rounded-full bg-white py-2.5 text-center text-sm font-bold text-arka-pink transition active:scale-95"
            >
              Upgrade on arka.social →
            </a>
          </div>
        )}

        <button
          onClick={signOut}
          className="mt-6 w-full rounded-xl border border-black/10 py-3 text-sm font-medium text-black/40 transition hover:bg-black/5"
        >
          Sign Out
        </button>
      </section>
    </main>
  );
}
