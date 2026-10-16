import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { BottomNav } from '@/components/layout/bottom-nav';
import { RegisterSw } from '../components/pwa/register-sw';

export const metadata: Metadata = {
  title: 'Aniway - Gym Tracker Indonesia',
  description: 'Aplikasi pencatat latihan beban gym modern berbasis mesin & progressive overload',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#08090a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#08090a] text-[#f7f8f8] antialiased selection:bg-emerald-500 selection:text-zinc-950 font-sans">
        <QueryProvider>
          {children}
          <BottomNav />
        </QueryProvider>
        <RegisterSw />
      </body>
    </html>
  );
}
