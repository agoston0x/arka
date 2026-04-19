'use client';

import { useState } from 'react';
import ArkaSplash from './ArkaSplash';

export function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <ArkaSplash onFinished={() => setShowSplash(false)} />}
      {children}
    </>
  );
}
