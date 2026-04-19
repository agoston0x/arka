'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import ArkaLogo from '@/components/ArkaLogo';

export default function QRPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setIsTelegram(true);
      tg.ready();
      tg.expand();
      const uid = tg.initDataUnsafe.user.id.toString();
      setUserId(uid);
      
      // Generate QR data
      const data = JSON.stringify({
        type: 'arka',
        action: 'verify',
        userId: uid,
        eventId: eventId,
      });
      setQrData(data);
    } else {
      setIsTelegram(false);
      router.replace('/');
    }
  }, [router, eventId]);

  if (isTelegram === null) return null;
  if (isTelegram === false) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-white px-5 py-6">
      <header className="fixed left-0 right-0 top-0 mx-auto flex max-w-md items-center justify-between bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <ArkaLogo size={24} />
          <span className="text-sm font-bold text-arka-text">arka</span>
        </div>
        <button
          onClick={() => router.back()}
          className="text-xs text-black/40"
        >
          Back
        </button>
      </header>

      <div className="mt-16 text-center">
        <h1 className="mb-2 text-xl font-bold text-arka-text">Your QR Code</h1>
        <p className="mb-8 text-sm text-black/40">Let others scan this to verify with you</p>

        <div className="mb-8 inline-block rounded-2xl bg-white p-8 shadow-lg ring-1 ring-black/5">
          {qrData && (
            <QRCodeSVG
              value={qrData}
              size={256}
              level="H"
              includeMargin={false}
            />
          )}
        </div>

        <p className="text-xs text-black/30">User ID: {userId}</p>
      </div>
    </main>
  );
}
