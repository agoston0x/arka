'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ArkaMiniLogo } from '@/components/ArkaLogo';
import { BackButton } from '@/components/BackButton';
import { SectionCard } from '@/components/SectionCard';
import { useToast } from '@/components/ToastProvider';
import {
  formatDate,
  formatDateTime,
  getCommunityById,
  getMeetupsForCommunity,
  getMembershipForUser,
  isUpcomingMeetup,
} from '@/lib/mock-data';

export default function CommunityDetailPage() {
  const params = useParams<{ id: string }>();
  const community = getCommunityById(params.id);
  const { pushToast } = useToast();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joined, setJoined] = useState(false);

  if (!community) {
    return (
      <AppShell activeTab="explore">
        <BackButton />
        <p className="text-sm text-black/70">Community not found.</p>
      </AppShell>
    );
  }

  const position = getMembershipForUser(community.id);
  const isMember = !!position || joined;
  const events = getMeetupsForCommunity(community.id).sort(
    (a, b) => +new Date(a.datetime) - +new Date(b.datetime),
  );
  const upcoming = events.filter((event) => isUpcomingMeetup(event.datetime));
  const past = events.filter((event) => !isUpcomingMeetup(event.datetime)).reverse();

  return (
    <AppShell activeTab="explore">
      <header className="flex items-center justify-between">
        <ArkaMiniLogo />
        <BackButton />
      </header>

      <SectionCard>
        <h1 className="text-xl font-semibold">{community.name}</h1>
        <p className="mt-1 text-sm text-black/55">{community.description}</p>
        <div className="mt-3 flex items-center gap-3 text-sm text-black/70">
          <span>{community.members} members</span>
          <span>·</span>
          <span>{community.location}</span>
        </div>
        <p className="mt-1 text-xs text-black/40">Created {formatDate(community.createdAt)} · Staked {community.stake}</p>
      </SectionCard>

      {/* Membership */}
      {!isMember ? (
        <SectionCard>
          <h2 className="font-semibold">Join this community</h2>
          <p className="mt-1 text-sm text-black/55">Browse events for free or become a member for full access.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => { setJoined(true); pushToast('Joined as free member!'); }}
              className="rounded-xl border border-black/10 py-3 text-sm font-semibold text-arka-text transition hover:bg-black/5"
            >
              Free Tier
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="rounded-xl bg-arka-pink py-3 text-sm font-semibold text-white transition hover:bg-arka-pink/90"
            >
              Member · {community.membershipFee}
            </button>
          </div>
          <div className="mt-3 space-y-1 text-xs text-black/40">
            <p>Free: browse events, view leaderboard</p>
            <p>Member: attend events, QR matching, earn rep, vote on polls</p>
          </div>
        </SectionCard>
      ) : (
        <SectionCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Your Position</h2>
              <span className="mt-1 inline-block rounded-full bg-arka-pink/10 px-2 py-0.5 text-xs font-semibold text-arka-pink">
                {position?.tier === 'member' || joined ? 'Member' : 'Free'}
              </span>
            </div>
            <Link
              href={`/community/${community.id}/leaderboard`}
              className="rounded-xl bg-arka-pink px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Leaderboard
            </Link>
          </div>
          {position ? (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-white px-2 py-2">
                <p className="text-black/60">Rank</p>
                <p className="font-semibold">#{position.rank}</p>
              </div>
              <div className="rounded-xl bg-white px-2 py-2">
                <p className="text-black/60">Rep</p>
                <p className="font-semibold">{position.rep}</p>
              </div>
              <div className="rounded-xl bg-white px-2 py-2">
                <p className="text-black/60">Badges</p>
                <p className="font-semibold">{position.badges.length}</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-black/50">Welcome! Attend events to earn reputation.</p>
          )}
        </SectionCard>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        {upcoming.length === 0 && <p className="text-sm text-black/40">No upcoming events</p>}
        {upcoming.map((event) => (
          <Link
            href={`/meetup/${event.id}`}
            key={event.id}
            className="block rounded-card bg-arka-card p-4 shadow-card transition hover:translate-y-[-1px]"
          >
            <p className="font-semibold">{event.name}</p>
            <p className="mt-1 text-sm text-black/70">{formatDateTime(event.datetime)}</p>
          </Link>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Past Events</h2>
        {past.map((event) => (
          <Link
            href={`/meetup/${event.id}`}
            key={event.id}
            className="block rounded-card bg-arka-card p-4 shadow-card transition hover:translate-y-[-1px]"
          >
            <p className="font-semibold">{event.name}</p>
            <p className="mt-1 text-sm text-black/70">{formatDateTime(event.datetime)}</p>
          </Link>
        ))}
      </section>

      {showJoinModal && (
        <MembershipModal
          fee={community.membershipFee || '2 USDC/mo'}
          communityName={community.name}
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            setShowJoinModal(false);
            setJoined(true);
            pushToast(`Joined ${community.name} as a member!`);
          }}
        />
      )}
    </AppShell>
  );
}

function MembershipModal({ fee, communityName, onClose, onSuccess }: {
  fee: string;
  communityName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [paying, setPaying] = useState(false);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-arka-text">Join {communityName}</h2>
        <p className="mt-1 text-sm text-black/50">Full membership — paid to community host</p>

        <div className="mt-5 rounded-xl bg-arka-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Member Tier</p>
              <p className="text-xs text-black/50">Attend events, QR matching, earn rep, polls</p>
            </div>
            <p className="text-lg font-bold text-arka-pink">{fee}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-black/55">
          <div className="flex items-center gap-2">
            <span className="text-arka-green">✓</span> Attend all meetups & events
          </div>
          <div className="flex items-center gap-2">
            <span className="text-arka-green">✓</span> QR code matching at events
          </div>
          <div className="flex items-center gap-2">
            <span className="text-arka-green">✓</span> Earn on-chain reputation
          </div>
          <div className="flex items-center gap-2">
            <span className="text-arka-green">✓</span> Vote on community polls
          </div>
          <div className="flex items-center gap-2">
            <span className="text-arka-green">✓</span> Appear on leaderboard
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={paying}
          className="mt-5 w-full rounded-xl bg-arka-pink py-3 text-sm font-semibold text-white transition hover:bg-arka-pink/90 disabled:opacity-50"
        >
          {paying ? 'Processing...' : `Pay ${fee}`}
        </button>
        <p className="mt-2 text-center text-xs text-black/30">Payment goes directly to the community host</p>
      </div>
    </div>
  );
}
