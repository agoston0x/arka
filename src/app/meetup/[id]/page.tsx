'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ArkaMiniLogo } from '@/components/ArkaLogo';
import { BackButton } from '@/components/BackButton';
import { SectionCard } from '@/components/SectionCard';
import { useToast } from '@/components/ToastProvider';
import {
  currentUserId,
  formatDateTime,
  getCommunityById,
  getMeetupById,
  getUserById,
  isUpcomingMeetup,
} from '@/lib/mock-data';

export default function MeetupDetailPage() {
  const params = useParams<{ id: string }>();
  const meetup = getMeetupById(params.id);
  const { pushToast } = useToast();

  if (!meetup) {
    return (
      <AppShell activeTab="home">
        <BackButton />
        <p className="text-sm text-black/70">Meetup not found.</p>
      </AppShell>
    );
  }

  const community = getCommunityById(meetup.communityId);
  const attendeeNames = meetup.attendeeIds
    .map((id) => getUserById(id))
    .filter((entry): entry is NonNullable<ReturnType<typeof getUserById>> => Boolean(entry));

  const upcoming = isUpcomingMeetup(meetup.datetime);
  const attendedByCurrent = meetup.attendeeIds.includes(currentUserId);

  return (
    <AppShell activeTab="home">
      <header className="flex items-center justify-between">
        <ArkaMiniLogo />
        <BackButton />
      </header>

      <SectionCard>
        <h1 className="text-xl font-semibold">{meetup.name}</h1>
        <p className="mt-1 text-sm text-black/70">{community?.name}</p>
        <p className="mt-1 text-sm text-black/70">{formatDateTime(meetup.datetime)}</p>
        <p className="mt-1 text-sm text-black/70">{meetup.location}</p>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Attendees</h2>
          <span className="text-sm text-black/65">{attendeeNames.length} going</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {attendeeNames.map((attendee) => (
            <span key={attendee.id} className="rounded-full bg-white px-2 py-1 text-xs font-medium text-black/80">
              {attendee.username}
            </span>
          ))}
        </div>
      </SectionCard>

      {upcoming ? (
        <button
          type="button"
          onClick={() => pushToast('Check-in simulated. You are marked as attending.')}
          className="w-full rounded-[16px] bg-arka-pink px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
        >
          Check In
        </button>
      ) : (
        <SectionCard>
          <h2 className="text-lg font-semibold">Event Complete</h2>
          <p className="mt-2 text-sm text-black/70">Reputation earned: +{meetup.repReward}</p>
          <p className="mt-1 text-sm text-black/70">
            Attendance badge: {attendedByCurrent ? 'Verified Attendee' : 'No attendance badge'}
          </p>
          <button
            type="button"
            onClick={() => pushToast('Badge details copied (mock action).')}
            className="mt-3 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm font-medium transition hover:bg-black/5"
          >
            View Badge Info
          </button>
        </SectionCard>
      )}
    </AppShell>
  );
}
