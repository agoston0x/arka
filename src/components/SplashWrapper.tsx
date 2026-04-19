'use client';

import { useState, useEffect } from 'react';
import ArkaSplash from './ArkaSplash';

export function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  // Signal page ready after hydration
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('arka-ready'));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {showSplash && <ArkaSplash onFinished={() => setShowSplash(false)} />}
      <div style={{ visibility: showSplash ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </>
  );
}
