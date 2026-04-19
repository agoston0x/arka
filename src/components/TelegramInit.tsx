'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        setHeaderColor: (color: string) => void;
        setBottomBarColor: (color: string) => void;
        MainButton: {
          setText: (text: string) => void;
          setParams: (params: { color?: string; text_color?: string; is_visible?: boolean }) => void;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
        };
        initDataUnsafe: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
          };
        };
        platform: string;
      };
    };
  }
}

export function useTelegram() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  return {
    tg,
    isTelegram: !!tg?.initDataUnsafe?.user,
    user: tg?.initDataUnsafe?.user,
  };
}

export default function TelegramInit() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();
    tg.setHeaderColor('#ffffff');

    // Style the main button in arka pink
    tg.MainButton.setParams({
      color: '#E5007D',
      text_color: '#ffffff',
    });

    // If opened inside Telegram, redirect to miniapp
    if (tg.initDataUnsafe?.user && window.location.pathname === '/') {
      window.location.replace('/miniapp');
    }
  }, []);

  return null;
}
