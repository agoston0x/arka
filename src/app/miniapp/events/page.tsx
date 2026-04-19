'use client';
import { useRouter } from 'next/navigation';
import ArkaLogo from '@/components/ArkaLogo';

const events = [
  { name: 'ETH Budapest Kickoff', date: 'Mar 15', attendees: 34, rep: '+80', status: 'attended' },
  { name: 'Arbitrum Builders Call', date: 'Mar 22', attendees: 56, rep: '+120', status: 'attended' },
  { name: 'Web3 Nomads Lisbon', date: 'Apr 2', attendees: 22, rep: '+60', status: 'attended' },
  { name: 'DeFi Deep Dive', date: 'Apr 10', attendees: 41, rep: '+90', status: 'attended' },
  { name: 'ETH Budapest Demo Day', date: 'Apr 16', attendees: 67, rep: '+100', status: 'attended' },
];

export default function EventsPage() {
  const router = useRouter();
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-white/90 px-5 py-4 backdrop-blur-sm border-b border-black/5">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <ArkaLogo size={24} />
        <span className="text-sm font-bold text-arka-text">Events Attended</span>
      </header>
      <section className="px-5 py-4 space-y-3">
        {events.map((e) => (
          <div key={e.name} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-arka-text">{e.name}</p>
                <p className="text-[10px] text-black/40">{e.date} · {e.attendees} attendees</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-arka-green">{e.rep}</span>
                <p className="text-[9px] text-black/30">rep earned</p>
              </div>
            </div>
          </div>
        ))}
        <div className="pt-2 text-center">
          <p className="text-xs text-black/30">Total: <span className="font-bold text-arka-green">+450 rep</span> from 5 events</p>
        </div>
      </section>
    </main>
  );
}
