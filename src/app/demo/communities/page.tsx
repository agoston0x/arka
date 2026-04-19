'use client';

import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { ArkaMiniLogo } from '@/components/ArkaLogo';
import { communities, currentUserId, memberships } from '@/lib/mock-data';

export default function CommunitiesPage() {
  const joinedSet = new Set(
    memberships.filter((entry) => entry.userId === currentUserId).map((entry) => entry.communityId),
  );

  return (
    <AppShell activeTab="explore">
      <header className="flex items-center justify-between">
        <ArkaMiniLogo />
        <h1 className="text-base font-semibold">Communities</h1>
      </header>

      <section className="space-y-3">
        {communities.map((community) => {
          const joined = joinedSet.has(community.id);
          return (
            <Link
              href={`/community/${community.id}`}
              key={community.id}
              className="block rounded-card bg-arka-card p-4 shadow-card transition hover:translate-y-[-1px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{community.name}</p>
                  <p className="text-sm text-black/65">{community.location}</p>
                </div>
                {joined ? (
                  <span className="rounded-full bg-arka-green/15 px-2 py-1 text-xs font-semibold text-arka-green">
                    ✓ Joined
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-black/70">
                <span>{community.members} members</span>
                <span>Stake: {community.stake}</span>
              </div>
            </Link>
          );
        })}
      </section>
    </AppShell>
  );
}
