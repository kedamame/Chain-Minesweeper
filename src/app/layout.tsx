import type { Metadata } from 'next';
import { Barlow_Condensed, Space_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/providers/AppProvider';

const display = Barlow_Condensed({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const mono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://chain-minesweeper.vercel.app';

const miniAppEmbed = {
  version: '1',
  imageUrl: `${APP_URL}/opengraph-image`,
  button: {
    title: 'Play Today',
    action: {
      type: 'launch_miniapp',
      name: 'Chain Minesweeper',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: '#EDEAD9',
    },
  },
};

export const metadata: Metadata = {
  title: 'Chain Minesweeper',
  description: 'A daily Minesweeper seeded by the Base blockchain. Same board for everyone, every day.',
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: 'Chain Minesweeper',
    description: 'Daily Minesweeper seeded by Base blockchain.',
    type: 'website',
    images: ['/og-image.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify(miniAppEmbed),
    'base:app_id': '69f56f875c5e1d49f92b495d',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
