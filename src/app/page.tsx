'use client';

import { useRouter } from 'next/navigation';
import ArkaLogo from '@/components/ArkaLogo';
import { CommunityIcon, MeetupIcon, TrophyIcon, QrIcon } from '@/components/Icons';
import { useAuth } from '@/lib/auth-context';

export default function LandingPage() {
  const { user, openSignIn } = useAuth();
  const router = useRouter();

  const handleProfileClick = () => {
    if (user) {
      router.push('/profile');
    } else {
      openSignIn();
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <ArkaLogo size={36} />
        <button
          onClick={handleProfileClick}
          className="rounded-full bg-arka-pink px-4 py-2 text-sm font-semibold text-white transition hover:bg-arka-pink/90"
        >
          {user ? 'Profile' : 'Sign In'}
        </button>
      </header>

      {/* Hero */}
      <section className="fade-up px-5 pb-10 pt-12">
        <h1 className="text-4xl font-bold leading-tight text-arka-text">
          Real connections,<br />
          <span className="text-arka-pink">real events.</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-black/60">
          Arka brings communities together through meetups, engagement, and on-chain reputation. 
          Stake to create a community, earn rep by showing up, rise on the leaderboard.
        </p>
      </section>

      {/* Feature cards */}
      <section className="space-y-4 px-5 pb-10">
        <div className="rounded-2xl bg-arka-card p-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-arka-cyan/15">
            <CommunityIcon className="h-5 w-5 text-arka-cyan" />
          </div>
          <h3 className="text-lg font-semibold text-arka-text">Communities</h3>
          <p className="mt-1 text-sm text-black/55">
            Hosts stake tokens to create communities. Join the ones that matter to you.
          </p>
        </div>

        <div className="rounded-2xl bg-arka-card p-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-arka-green/15">
            <MeetupIcon className="h-5 w-5 text-arka-green" />
          </div>
          <h3 className="text-lg font-semibold text-arka-text">Meetups</h3>
          <p className="mt-1 text-sm text-black/55">
            Events with QR check-ins, attendee matching, and real engagement — not just clicks.
          </p>
        </div>

        <div className="rounded-2xl bg-arka-card p-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-arka-purple/15">
            <TrophyIcon className="h-5 w-5 text-arka-purple" />
          </div>
          <h3 className="text-lg font-semibold text-arka-text">Reputation</h3>
          <p className="mt-1 text-sm text-black/55">
            Earn on-chain reputation by attending events. Climb the leaderboard. Get recognized.
          </p>
        </div>

        <div className="rounded-2xl bg-arka-card p-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-arka-orange/15">
            <QrIcon className="h-5 w-5 text-arka-orange" />
          </div>
          <h3 className="text-lg font-semibold text-arka-text">QR Matching</h3>
          <p className="mt-1 text-sm text-black/55">
            Find your match number at events. Scan each other's codes. Real connections, IRL.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-16">
        <button
          onClick={handleProfileClick}
          className="w-full rounded-2xl bg-arka-pink py-4 text-base font-bold text-white transition hover:bg-arka-pink/90"
        >
          {user ? 'Go to Profile' : 'Get Started'}
        </button>
        <p className="mt-3 text-center text-xs text-black/35">
          Built on Arbitrum · Powered by Dynamic
        </p>
      </section>
    </main>
  );
}
