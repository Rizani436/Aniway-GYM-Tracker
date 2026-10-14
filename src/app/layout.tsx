import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { BottomNav } from '@/components/layout/bottom-nav';

export const metadata: Metadata = {
  title: 'Aniway - Gym Tracker Indonesia',
  description: 'Aplikasi pencatat latihan beban gym berbasis mesin',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500 selection:text-zinc-950">
        <QueryProvider>
          {children}
          <BottomNav />
        </QueryProvider>
      </body>
    </html>
  );
}
