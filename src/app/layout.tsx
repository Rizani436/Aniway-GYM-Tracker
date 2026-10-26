import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { BottomNav } from '@/components/layout/bottom-nav';
import { RegisterSw } from '../components/pwa/register-sw';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Aniway - Gym Tracker Indonesia',
  description: 'Aplikasi pencatat latihan beban gym modern berbasis mesin & progressive overload',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Aniway', statusBarStyle: 'black-translucent' },
  icons: {
    icon: ['/icon-192.png', '/icon-512.png'],
    apple: '/apple-touch-icon.png',
  },
};

// Warna status bar mengikuti tema user (dulu hardcode gelap: di mode terang
// status bar HP tetap hitam padahal halaman putih).
export async function generateViewport(): Promise<Viewport> {
  let themeColor = '#08090a'; // gelap = default identitas app
  try {
    const user = await getAuthenticatedUser();
    if (user?.theme === 'LIGHT') themeColor = '#f7f8f8';
  } catch {
    // DB/auth tak terjangkau: pakai warna tema gelap default.
  }
  return {
    themeColor,
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tema dibaca dari preferensi user. Default gelap (sesuai identitas app).
  // getAuthenticatedUser() di-cache React, jadi tidak menambah round-trip
  // pada halaman yang juga memanggilnya.
  let themeClass = 'dark';
  try {
    const user = await getAuthenticatedUser();
    if (user?.theme === 'LIGHT') themeClass = '';
  } catch {
    // DB/auth tak terjangkau: tetap pakai tema gelap, jangan gagalkan render.
  }

  return (
    <html lang="id" className={themeClass}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--bg)] text-[var(--fg)] antialiased selection:bg-emerald-500 selection:text-zinc-950 font-sans">
        <QueryProvider>
          {children}
          <BottomNav />
        </QueryProvider>
        <RegisterSw />
      </body>
    </html>
  );
}
