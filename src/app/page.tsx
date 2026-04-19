'use client';

import { useRouter } from 'next/navigation';
import ArkaLogo from '@/components/ArkaLogo';
import { CommunityIcon, MeetupIcon, TrophyIcon, QrIcon } from '@/components/Icons';
import { useAuth } from '@/lib/auth-context';

export default function LandingPage() {
  const { user, openSignIn } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push('/profile');
    } else {
      openSignIn();
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <ArkaLogo size={36} />
        <button
          onClick={handleGetStarted}
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
          Create communities, host meetups, earn on-chain reputation.
          Everything runs on Arbitrum — transparent, verifiable, yours.
        </p>
      </section>

      {/* Feature cards */}
      <section className="space-y-4 px-5 pb-10">
        <div className="rounded-2xl bg-white/80 p-5 shadow-card backdrop-blur-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-arka-cyan/15">
            <CommunityIcon className="h-5 w-5 text-arka-cyan" />
          </div>
          <h3 className="text-lg font-semibold text-arka-text">Communities</h3>
          <p className="mt-1 text-sm text-black/55">
            Host a community. Manage members, events, and resources — all on-chain.
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 p-5 shadow-card backdrop-blur-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-arka-green/15">
            <MeetupIcon className="h-5 w-5 text-arka-green" />
          </div>
          <h3 className="text-lg font-semibold text-arka-text">Meetups</h3>
          <p className="mt-1 text-sm text-black/55">
            Anyone can start an event. QR check-ins and matching make it real.
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 p-5 shadow-card backdrop-blur-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-arka-purple/15">
            <TrophyIcon className="h-5 w-5 text-arka-purple" />
          </div>
          <h3 className="text-lg font-semibold text-arka-text">Reputation</h3>
          <p className="mt-1 text-sm text-black/55">
            Show up. Scan. Earn rep. Your on-chain profile grows with every event.
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 p-5 shadow-card backdrop-blur-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-arka-orange/15">
            <QrIcon className="h-5 w-5 text-arka-orange" />
          </div>
          <h3 className="text-lg font-semibold text-arka-text">QR Matching</h3>
          <p className="mt-1 text-sm text-black/55">
            Find your match at events. Scan each other's codes. Real connections, IRL.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-16">
        <button
          onClick={handleGetStarted}
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
