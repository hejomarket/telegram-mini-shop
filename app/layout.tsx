import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '../lib/cart';
import { TelegramProvider } from '../providers/TelegramProvider';

export const metadata: Metadata = {
  title: 'SOIA Protein Shop',
  description: 'Mobile-first storefront for SOIA plant-based protein snacks.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#123b2a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {React.createElement(TelegramProvider, null, React.createElement(CartProvider, null, children))}
      </body>
    </html>
  );
}
