'use client';
import { useRouter } from 'next/navigation';
import ArkaLogo from '@/components/ArkaLogo';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isProHost, signOut } = useAuth();
  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
  const displayName = tgUser?.first_name || user?.username?.replace('@', '') || 'User';

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-white/90 px-5 py-4 backdrop-blur-sm">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <ArkaLogo size={24} />
        <span className="text-sm font-bold text-arka-text">Profile</span>
      </header>
      <section className="px-5 py-6">
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-arka-pink/10 text-3xl font-bold text-arka-pink">
            {displayName[0]?.toUpperCase()}
          </div>
          <h2 className="mt-3 text-xl font-bold text-arka-text">{displayName}</h2>
          {user?.email && <p className="text-xs text-black/40">{user.email}</p>}
          {isProHost && <span className="mt-1 rounded-full bg-arka-pink px-3 py-0.5 text-[10px] font-bold text-white">PRO HOST</span>}
        </div>

        {user?.address && (
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-[10px] text-black/30 mb-1">Wallet Address</p>
            <p className="text-xs font-mono text-arka-text break-all">{user.address}</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3">
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

        <button
          onClick={signOut}
          className="mt-8 w-full rounded-xl border border-black/10 py-3 text-sm font-medium text-black/40 transition hover:bg-black/5"
        >
          Sign Out
        </button>
      </section>
    </main>
  );
}
