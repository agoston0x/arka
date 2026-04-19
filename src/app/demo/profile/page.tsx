'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import ArkaLogo, { ArkaMiniLogo } from '@/components/ArkaLogo';
import { SectionCard } from '@/components/SectionCard';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ToastProvider';
import { HostIcon, RankBadge } from '@/components/Icons';
import {
  communities,
  currentUserId,
  memberships,
  meetups,
  formatDate,
  formatDateTime,
  getCommunityById,
  isUpcomingMeetup,
  truncateAddress,
  getCommunityLeaderboard,
} from '@/lib/mock-data';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { pushToast } = useToast();
  const [expandedCommunity, setExpandedCommunity] = useState<string | null>(null);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  if (!user) {
    router.replace('/');
    return null;
  }

  const joined = memberships.filter((entry) => entry.userId === currentUserId);
  const joinedCommunityIds = new Set(joined.map((entry) => entry.communityId));

  const upcoming = meetups
    .filter((event) => joinedCommunityIds.has(event.communityId) && isUpcomingMeetup(event.datetime))
    .sort((a, b) => +new Date(a.datetime) - +new Date(b.datetime))
    .slice(0, 4);

  return (
    <AppShell activeTab="home">
      <header className="flex items-center justify-between">
        <ArkaMiniLogo size={36} />
        <button
          onClick={() => setShowUserInfo(!showUserInfo)}
          className="text-sm font-semibold text-arka-pink"
        >
          {user.username}
        </button>
      </header>

      {/* User card — only visible when username tapped */}
      {showUserInfo && (
        <SectionCard>
          <p className="text-sm text-black/70">Wallet</p>
          <p className="mt-1 text-lg font-semibold">{truncateAddress(user.address)}</p>
          <div className="mt-3 flex items-center justify-between text-sm text-black/70">
            <span>Member since {formatDate(user.memberSince)}</span>
            <span className="rounded-full bg-arka-pink/10 px-2 py-1 text-xs font-semibold text-arka-pink">
              {user.nftBadge}
            </span>
          </div>
          <button
            onClick={signOut}
            className="mt-3 w-full rounded-xl border border-black/10 py-2 text-sm text-black/50 transition hover:bg-black/5"
          >
            Sign Out
          </button>
        </SectionCard>
      )}

      {/* Host section */}
      <SectionCard>
        {user.isHost ? (
          <Link
            href="/dashboard"
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
              <HostIcon className="h-4 w-4 text-arka-pink" />
              <p className="font-semibold text-arka-pink">Host Dashboard</p>
            </div>
              <p className="mt-1 text-sm text-black/55">Manage your community</p>
            </div>
            <span className="text-black/30">→</span>
          </Link>
        ) : (
          <button
            onClick={() => setShowHostModal(true)}
            className="w-full text-left"
          >
            <p className="font-semibold text-arka-text">Become a Host</p>
            <p className="mt-1 text-sm text-black/55">
              Stake 5 USDC for 30 days to create your own community
            </p>
            <span className="mt-2 inline-block rounded-full bg-arka-pink/10 px-3 py-1 text-xs font-semibold text-arka-pink">
              Start Hosting →
            </span>
          </button>
        )}
      </SectionCard>

      {/* Communities */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">My Communities</h2>
        {joined.map((entry) => {
          const community = communities.find((item) => item.id === entry.communityId);
          if (!community) return null;
          const isExpanded = expandedCommunity === community.id;
          const leaderboard = isExpanded ? getCommunityLeaderboard(community.id) : [];

          return (
            <div key={community.id} className="rounded-card bg-arka-card shadow-card overflow-hidden">
              <button
                onClick={() => setExpandedCommunity(isExpanded ? null : community.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{community.name}</p>
                  <span className="text-xs text-black/40">{isExpanded ? '▲' : '▼'}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-black/60">
                  <span>{community.members} members</span>
                  <span>Your rep: {entry.rep} · #{entry.rank}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-black/5 px-4 pb-4 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-black/40">Leaderboard</p>
                  <div className="space-y-2">
                    {leaderboard.slice(0, 10).map((row, i) => (
                      <div
                        key={row.user.id}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                          row.user.id === currentUserId
                            ? 'bg-arka-pink/10 font-semibold text-arka-pink'
                            : 'text-black/70'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <RankBadge rank={row.rank} />
                          <span>{row.user.username}</span>
                        </div>
                        <span>{row.rep} rep</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/community/${community.id}`}
                    className="mt-3 block text-center text-xs font-semibold text-arka-pink"
                  >
                    View Community →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Upcoming meetups */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Upcoming Meetups</h2>
        {upcoming.length === 0 && (
          <p className="text-sm text-black/40">No upcoming meetups</p>
        )}
        {upcoming.map((event) => {
          const community = getCommunityById(event.communityId);
          return (
            <Link
              href={`/meetup/${event.id}`}
              key={event.id}
              className="block rounded-card bg-arka-card p-4 shadow-card transition hover:translate-y-[-1px]"
            >
              <p className="font-semibold">{event.name}</p>
              <p className="mt-1 text-sm text-black/70">{community?.name}</p>
              <p className="mt-1 text-sm text-black/65">{formatDateTime(event.datetime)}</p>
            </Link>
          );
        })}
      </section>

      {/* Host Modal */}
      {showHostModal && (
        <HostModal
          onClose={() => setShowHostModal(false)}
          onSuccess={() => {
            setShowHostModal(false);
            pushToast('Community created! You are now a host.');
          }}
        />
      )}
    </AppShell>
  );
}

function HostModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { becomeHost } = useAuth();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [staked, setStaked] = useState(false);
  const [staking, setStaking] = useState(false);

  const handleStake = () => {
    setStaking(true);
    setTimeout(() => {
      setStaked(true);
      setStaking(false);
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !desc.trim() || !staked) return;
    try {
      await becomeHost();
      onSuccess();
    } catch (err) {
      console.error('Failed to become host:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-1 text-xl font-bold text-arka-text">Create Community</h2>
        <p className="mb-5 text-sm text-black/50">Stake 5 USDC for 30 days to start hosting</p>

        <div className="space-y-4">
          {/* Stake step */}
          <div className={`rounded-xl border p-4 ${staked ? 'border-green-300 bg-green-50' : 'border-black/10 bg-arka-card'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Stake 5 USDC</p>
                <p className="text-xs text-black/50">Locked for 30 days, refundable after</p>
              </div>
              {staked ? (
                <span className="text-sm font-semibold text-green-600">✓ Staked</span>
              ) : (
                <button
                  onClick={handleStake}
                  disabled={staking}
                  className="rounded-full bg-arka-pink px-4 py-2 text-xs font-semibold text-white transition hover:bg-arka-pink/90 disabled:opacity-50"
                >
                  {staking ? 'Staking...' : 'Stake'}
                </button>
              )}
            </div>
          </div>

          {/* Community info */}
          <div>
            <label className="mb-1 block text-sm font-medium text-black/70">Community Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ETH Budapest"
              className="w-full rounded-xl border border-black/10 bg-arka-card px-4 py-3 text-sm outline-none focus:border-arka-pink focus:ring-1 focus:ring-arka-pink"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black/70">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's your community about?"
              rows={3}
              className="w-full rounded-xl border border-black/10 bg-arka-card px-4 py-3 text-sm outline-none focus:border-arka-pink focus:ring-1 focus:ring-arka-pink resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !desc.trim() || !staked}
            className="w-full rounded-xl bg-arka-pink py-3 text-sm font-semibold text-white transition hover:bg-arka-pink/90 disabled:opacity-40"
          >
            Create Community
          </button>
        </div>
      </div>
    </div>
  );
}
