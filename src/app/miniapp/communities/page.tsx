'use client';
import { useRouter } from 'next/navigation';
import ArkaLogo from '@/components/ArkaLogo';

const communities = [
  { name: 'ETH Budapest', members: 48, events: 12, fee: '2 USDC/mo' },
  { name: 'Arbitrum Builders', members: 127, events: 34, fee: '5 USDC/mo' },
  { name: 'Web3 Nomads', members: 89, events: 8, fee: null },
];

export default function CommunitiesPage() {
  const router = useRouter();
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-white/90 px-5 py-4 backdrop-blur-sm">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <ArkaLogo size={24} />
        <span className="text-sm font-bold text-arka-text">Communities</span>
      </header>
      <section className="space-y-3 px-5 py-4">
        {communities.map((c) => (
          <div key={c.name} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-arka-text">{c.name}</h3>
              {c.fee ? (
                <span className="rounded-full bg-arka-cyan/10 px-2 py-0.5 text-[10px] font-semibold text-arka-cyan">{c.fee}</span>
              ) : (
                <span className="rounded-full bg-arka-green/10 px-2 py-0.5 text-[10px] font-semibold text-arka-green">Free</span>
              )}
            </div>
            <p className="mt-1 text-xs text-black/40">{c.members} members · {c.events} events</p>
            <button className="mt-3 w-full rounded-lg bg-arka-pink/10 py-2 text-xs font-semibold text-arka-pink transition active:scale-95">
              View Community
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
