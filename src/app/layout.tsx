import './globals.css';
import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ToastProvider';
import { SplashWrapper } from '@/components/SplashWrapper';
import { Providers } from '@/components/Providers';
import TelegramInit from '@/components/TelegramInit';
import ParticlesBg from '@/components/ParticlesBg';

export const metadata: Metadata = {
  title: 'arka',
  description: 'Community events, engagement & reputation',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script src="https://telegram.org/js/telegram-web-app.js" defer></script>
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <ToastProvider>
            <TelegramInit />
            <ParticlesBg />
            <div className="relative z-10">
              <SplashWrapper>{children}</SplashWrapper>
            </div>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
