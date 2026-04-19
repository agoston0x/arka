export function CommunityIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function MeetupIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M17 11a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

export function TrophyIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />
      <path d="M18 9h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3" />
      <path d="M6 4h12v6a6 6 0 0 1-12 0V4z" />
      <path d="M9 20h6" />
      <path d="M12 16v4" />
    </svg>
  );
}

export function QrIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" />
      <path d="M18 14h3v3" />
      <path d="M14 18h3v3" />
      <path d="M18 18h3v3" />
    </svg>
  );
}

export function LocationIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function HostIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

export function GoldMedal({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <circle cx="10" cy="10" r="8" fill="#FFD700" stroke="#DAA520" strokeWidth="1.5" />
      <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#8B6914">1</text>
    </svg>
  );
}

export function SilverMedal({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <circle cx="10" cy="10" r="8" fill="#C0C0C0" stroke="#A9A9A9" strokeWidth="1.5" />
      <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#696969">2</text>
    </svg>
  );
}

export function BronzeMedal({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <circle cx="10" cy="10" r="8" fill="#CD7F32" stroke="#A0522D" strokeWidth="1.5" />
      <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#5C3317">3</text>
    </svg>
  );
}

export function RankBadge({ rank, className = 'w-5 h-5' }: { rank: number; className?: string }) {
  if (rank === 1) return <GoldMedal className={className} />;
  if (rank === 2) return <SilverMedal className={className} />;
  if (rank === 3) return <BronzeMedal className={className} />;
  return <span className="w-6 text-center text-xs font-bold text-black/40">#{rank}</span>;
}
