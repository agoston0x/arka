'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import ArkaLogo from '@/components/ArkaLogo';

const API_URL = 'https://arka-api.claws.page';

export default function ScanPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const mode = searchParams.get('mode') || 'verify'; // checkin | verify | mingle
  
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setIsTelegram(true);
      tg.ready();
      tg.expand();
      setUserId(tg.initDataUnsafe.user.id.toString());
    } else {
      setIsTelegram(false);
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          onScanSuccess,
          () => {} // ignore errors during scanning
        );

        setScanning(true);
      } catch (err: any) {
        console.error('Scanner error:', err);
        setError(err.message || 'Failed to start camera');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [userId]);

  const onScanSuccess = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      
      if (data.type !== 'arka') {
        setError('Invalid QR code');
        return;
      }

      if (data.eventId !== eventId) {
        setError('QR code is for a different event');
        return;
      }

      // Stop scanner
      if (scannerRef.current) {
        await scannerRef.current.stop();
        setScanning(false);
      }

      // Process based on mode
      if (mode === 'checkin') {
        // Check-in by scanning host QR
        const res = await fetch(`${API_URL}/events/${eventId}/checkin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (res.ok) {
          alert('✅ Checked in successfully!');
          router.back();
        } else {
          const err = await res.json();
          setError(err.error || 'Check-in failed');
        }
      } else if (mode === 'verify') {
        // Verify with another attendee
        const res = await fetch(`${API_URL}/events/${eventId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, verifiedById: data.userId }),
        });

        if (res.ok) {
          alert('🤝 Verification successful!');
          router.back();
        } else {
          const err = await res.json();
          setError(err.error || 'Verification failed');
        }
      } else if (mode === 'mingle') {
        // Scan mingle partner
        const res = await fetch(`${API_URL}/events/${eventId}/mingle/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, scannedId: data.userId }),
        });

        if (res.ok) {
          // Success! Show confetti animation
          alert('🎉 Match found! You earned reputation!');
          router.back();
        } else {
          const err = await res.json();
          setError(err.error || 'Mingle scan failed');
        }
      }
    } catch (err: any) {
      console.error('Scan processing error:', err);
      setError('Invalid QR code format');
    }
  };

  if (isTelegram === null) return null;
  if (isTelegram === false) return null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-black px-5 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArkaLogo size={24} />
          <span className="text-sm font-bold text-white">arka</span>
        </div>
        <button
          onClick={() => router.back()}
          className="text-xs text-white/60"
        >
          Cancel
        </button>
      </header>

      <div className="text-center text-white">
        <h1 className="mb-2 text-xl font-bold">
          {mode === 'checkin' && 'Scan Host QR to Check In'}
          {mode === 'verify' && 'Scan Attendee QR to Verify'}
          {mode === 'mingle' && 'Scan Your Mingle Match'}
        </h1>
        <p className="mb-8 text-sm text-white/60">
          {mode === 'checkin' && 'Point your camera at the host&apos;s QR code'}
          {mode === 'verify' && 'Point your camera at another attendee&apos;s QR code'}
          {mode === 'mingle' && 'Find and scan your partner&apos;s QR code'}
        </p>
      </div>

      {/* Scanner container */}
      <div className="relative mx-auto mb-6 w-full max-w-sm overflow-hidden rounded-2xl">
        <div id="qr-reader" className="w-full"></div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/20 p-4 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      {!scanning && !error && (
        <div className="text-center text-sm text-white/40">
          Initializing camera...
        </div>
      )}
    </main>
  );
}
