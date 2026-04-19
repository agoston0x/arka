'use client';

import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-black/75 transition hover:bg-black/5"
    >
      <span aria-hidden>←</span>
      Back
    </button>
  );
}
