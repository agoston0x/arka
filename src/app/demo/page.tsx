'use client';

import { useRouter } from 'next/navigation';
import ArkaLogo from '@/components/ArkaLogo';
import { CommunityIcon, MeetupIcon, TrophyIcon, QrIcon } from '@/components/Icons';
import { useAuth } from '@/lib/auth-context';

export default function DemoLandingPage() {
  const { user, openSignIn } = useAuth();
  const router = useRouter();

  const handleProfileClick = () => {
    if (user) {
      router.push('/demo/profile');
    } else {
      openSignIn();
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white">
      <div className="mx-4 mt-2 rounded-xl bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
        Demo Mode — Mock Data
      </div>
      <header className="flex items-center justify-between px-5 py-4">
        <ArkaLogo size={36} />
        <button onClick={handleProfileClick} className="rounded-full bg-arka-pink px-4 py-2 text-sm font-semibold text-white transition hover:bg-arka-pink/90">
          {user ? 'Profile' : 'Sign In'}
        </button>
      </header>
      <section className="fade-up px-5 pb-10 pt-12">
        <h1 className="text-4xl font-bold leading-tight text-arka-text">
          Real connections,<br /><span className="text-arka-pink">real events.</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-black/60">
          Arka brings communities together through meetups, engagement, and on-chain reputation.
        </p>
      </section>
      <section className="space-y-4 px-5 pb-10">
        {[
          { Icon: CommunityIcon, color: 'cyan', title: 'Communities', desc: 'Create and manage stake-backed communities' },
          { Icon: MeetupIcon, color: 'green', title: 'Meetups', desc: 'Events with QR check-ins and attendee matching' },
          { Icon: TrophyIcon, color: 'purple', title: 'Reputation', desc: 'Earn on-chain rep by attending events' },
          { Icon: QrIcon, color: 'orange', title: 'QR Matching', desc: 'Find your match, scan codes, connect IRL' },
        ].map(({ Icon, color, title, desc }) => (
          <div key={title} className="rounded-2xl bg-arka-card p-5">
            <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-arka-${color}/15`}>
              <Icon className={`h-5 w-5 text-arka-${color}`} />
            </div>
            <h3 className="text-lg font-semibold text-arka-text">{title}</h3>
            <p className="mt-1 text-sm text-black/55">{desc}</p>
          </div>
        ))}
      </section>
      <section className="px-5 pb-16">
        <button onClick={handleProfileClick} className="w-full rounded-2xl bg-arka-pink py-4 text-base font-bold text-white transition hover:bg-arka-pink/90">
          {user ? 'Go to Profile' : 'Get Started'}
        </button>
      </section>
    </main>
  );
}
