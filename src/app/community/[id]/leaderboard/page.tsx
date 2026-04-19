'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { BackButton } from '@/components/BackButton';
import { ArkaMiniLogo } from '@/components/ArkaLogo';
import { currentUserId, getCommunityById, getCommunityLeaderboard } from '@/lib/mock-data';

const medalBg = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function LeaderboardPage() {
  const params = useParams<{ id: string }>();
  const community = getCommunityById(params.id);

  if (!community) {
    return (
      <AppShell activeTab="explore">
        <BackButton />
        <p className="text-sm text-black/70">Community not found.</p>
      </AppShell>
    );
  }

  const leaderboard = getCommunityLeaderboard(community.id);

  return (
    <AppShell activeTab="explore">
      <header className="flex items-center justify-between">
        <ArkaMiniLogo />
        <BackButton />
      </header>

      <h1 className="text-xl font-semibold">{community.name} Leaderboard</h1>

      <section className="space-y-2">
        {leaderboard.map((entry, index) => {
          const isCurrent = entry.user.id === currentUserId;
          return (
            <div
              key={entry.user.id}
              className={`flex items-center justify-between rounded-card p-4 shadow-card ${
                isCurrent ? 'border border-arka-pink bg-arka-pink/10' : 'bg-arka-card'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                  style={{ background: index < 3 ? medalBg[index] : '#e9e9e9' }}
                >
                  {entry.rank}
                </span>
                <span className={`font-semibold ${isCurrent ? 'text-arka-pink' : ''}`}>{entry.user.username}</span>
              </div>
              <span className="text-sm font-medium text-black/75">{entry.rep} rep</span>
            </div>
          );
        })}
      </section>
    </AppShell>
  );
}
