'use client';
import { useRouter } from 'next/navigation';
import ArkaLogo from '@/components/ArkaLogo';

const leaderboard = [
  { rank: 1, name: 'alex.eth', rep: 3200, medal: '🥇' },
  { rank: 2, name: 'sarah.arb', rep: 2800, medal: '🥈' },
  { rank: 3, name: 'You', rep: 2450, medal: '🥉', highlight: true },
  { rank: 4, name: 'danny.dev', rep: 2100, medal: '' },
  { rank: 5, name: 'maria.eth', rep: 1950, medal: '' },
  { rank: 6, name: 'jake.base', rep: 1800, medal: '' },
  { rank: 7, name: 'nina.arb', rep: 1650, medal: '' },
  { rank: 8, name: 'tom.eth', rep: 1400, medal: '' },
];

export default function LeaderboardPage() {
  const router = useRouter();
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-white/90 px-5 py-4 backdrop-blur-sm">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <ArkaLogo size={24} />
        <span className="text-sm font-bold text-arka-text">Leaderboard</span>
      </header>
      <section className="px-5 pb-10">
        {leaderboard.map((r) => (
          <div key={r.rank} className={`flex items-center justify-between rounded-xl px-4 py-3 mb-2 ${r.highlight ? 'bg-arka-pink/10 ring-1 ring-arka-pink/20' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-black ${r.rank === 1 ? 'text-yellow-500' : r.rank === 2 ? 'text-gray-400' : r.rank === 3 ? 'text-amber-600' : 'text-black/20'}`}>#{r.rank}</span>
              <div>
                <p className={`text-sm font-semibold ${r.highlight ? 'text-arka-pink' : 'text-arka-text'}`}>{r.medal} {r.name}</p>
              </div>
            </div>
            <span className={`text-sm font-bold ${r.highlight ? 'text-arka-pink' : 'text-arka-green'}`}>{r.rep}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
