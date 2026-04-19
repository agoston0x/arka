import './globals.css';
import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ToastProvider';
import { SplashWrapper } from '@/components/SplashWrapper';
import { Providers } from '@/components/Providers';
import TelegramInit from '@/components/TelegramInit';

export const metadata: Metadata = {
  title: 'Arka',
  description: 'Community events, engagement & reputation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" defer></script>
      </head>
      <body>
        <Providers>
          <ToastProvider>
            <TelegramInit />
          <SplashWrapper>{children}</SplashWrapper>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
