'use client';

import { useState } from 'react';
import ArkaLogo from '@/components/ArkaLogo';

const slides = [
  {
    title: 'arka',
    subtitle: 'Real connections, real events.',
    content: 'Community engagement platform with on-chain reputation.\nBuilt on Arbitrum.',
    accent: 'pink',
  },
  {
    title: 'The Problem',
    subtitle: '',
    content: `Community platforms are passive. Discord and Telegram are noise.

No proof of attendance. No skin in the game.
Hosts have no accountability. Members have no reputation.

Online engagement ≠ real engagement.`,
    accent: 'red',
  },
  {
    title: 'The Solution',
    subtitle: 'Arka — communities that prove you showed up',
    content: `Hosts create communities with on-chain registries.
Members earn reputation by attending events IRL.
QR code matching forces real human interaction.

Everything verifiable. Everything on-chain.`,
    accent: 'cyan',
  },
  {
    title: 'How It Works',
    subtitle: '',
    content: `1. Host subscribes → creates community on-chain
2. Members join (free browse, or paid membership)
3. Host creates events with QR matching
4. At events: get a number → find your match → scan QR
5. Attendance + scans = on-chain reputation
6. Leaderboard ranks members per community`,
    accent: 'green',
  },
  {
    title: 'QR Matching',
    subtitle: 'The killer feature',
    content: `Host activates matching at an event.
Each attendee gets a random number on screen.
Find the person with your matching number.
Scan each other's QR codes.

Forces real conversations — not just badge-scanning.
Every scan is recorded on-chain.`,
    accent: 'orange',
  },
  {
    title: 'Business Model',
    subtitle: 'Two tiers, simple revenue',
    content: `User (free)
· Browse communities & events
· Attend events, earn reputation
· Create standalone events

Community Host (15 USDC/mo)
· Create & manage communities
· Charge membership fees to members
· Meeting rooms, facility management
· Coffee tabs with on-chain settlement
· Content monetization (slides, recordings)
· Encrypted event data on Arweave
· Advanced calendar, analytics`,
    accent: 'purple',
  },
  {
    title: 'On-Chain Architecture',
    subtitle: 'Arbitrum Sepolia → Mainnet',
    content: `UserProfileNFT — ERC-721, per-community reputation, badges
CommunityRegistry — events, attendance, leaderboard

Dynamic SDK — embedded wallets, email sign-in
Paymaster — gasless transactions for users
Arweave — encrypted event data persistence (premium)

Contracts deployed. Live on testnet.`,
    accent: 'cyan',
  },
  {
    title: 'Tech Stack',
    subtitle: '',
    content: `Frontend: Next.js, TypeScript, Tailwind CSS
Auth: Dynamic wallet SDK (email + wallet)
Contracts: Solidity, Foundry, Arbitrum
Storage: Arweave via Irys (encrypted)
Mini App: Telegram WebApp SDK
Payments: USDC on Arbitrum`,
    accent: 'green',
  },
  {
    title: 'Live Demo',
    subtitle: '',
    content: `Web: arka.claws.page
Telegram: @arka_telegram_bot

Contracts on Arbitrum Sepolia:
UserProfileNFT: 0xa692...bcf2
CommunityRegistry: 0xe98e...3edc

Try it now — sign in, create a community, host an event.`,
    accent: 'pink',
  },
  {
    title: 'Roadmap',
    subtitle: '',
    content: `Now: MVP + Dynamic wallet + contracts deployed
Next: Mainnet deploy, real USDC payments, paymaster
Q3: Pro features (rooms, tabs, content, Arweave)
Q4: Multi-chain, DAO governance for platform fees

Open source. Community-driven. Built to last.`,
    accent: 'orange',
  },
  {
    title: 'Thank You',
    subtitle: 'arka.claws.page',
    content: 'Real connections, real events.\n\nBuilt on Arbitrum · Powered by Dynamic',
    accent: 'pink',
  },
];

const accentColors: Record<string, string> = {
  pink: '#E5007D',
  cyan: '#00AEEF',
  green: '#8DC63F',
  orange: '#F7941D',
  red: '#ED1C24',
  purple: '#662D91',
};

export default function AboutPage() {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const color = accentColors[slide.accent] || accentColors.pink;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg">
        {/* Slide */}
        <div className="relative min-h-[420px] rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5">
          {/* Slide number */}
          <p className="text-xs text-black/25">{current + 1} / {slides.length}</p>

          {/* Logo on first/last slide */}
          {(current === 0 || current === slides.length - 1) && (
            <div className="mb-6 mt-2">
              <ArkaLogo size={48} />
            </div>
          )}

          {/* Title */}
          <h1
            className="mt-3 text-3xl font-bold"
            style={{ color: current === 0 ? '#1a1a2e' : color }}
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          {slide.subtitle && (
            <p className="mt-1 text-sm font-medium text-black/50">{slide.subtitle}</p>
          )}

          {/* Content */}
          <div className="mt-5 whitespace-pre-line text-sm leading-relaxed text-black/65">
            {slide.content}
          </div>

          {/* Accent bar */}
          <div
            className="absolute bottom-0 left-8 right-8 h-1 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-black/40 transition hover:bg-black/5 disabled:opacity-30"
          >
            ← Back
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === current ? 20 : 8,
                  backgroundColor: i === current ? color : '#ddd',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrent(Math.min(slides.length - 1, current + 1))}
            disabled={current === slides.length - 1}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:bg-black/5 disabled:opacity-30"
            style={{ color }}
          >
            Next →
          </button>
        </div>
      </div>
    </main>
  );
}
