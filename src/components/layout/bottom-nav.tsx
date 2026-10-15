'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Home, PlayCircle, History, Dumbbell, User } from 'lucide-react';
import { prefetchHomeData } from '@/hooks/use-home-data';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/workout', label: 'Workout', icon: PlayCircle },
  { href: '/riwayat', label: 'Riwayat', icon: History },
  { href: '/latihan', label: 'Latihan', icon: Dumbbell },
  { href: '/profil', label: 'Profil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  // Guard sekali jalan: onTouchStart sudah prefetch → skip onClick yang mengikuti.
  const touchHandled = useRef(false);

  const prefetchHome = () => void prefetchHomeData(queryClient);

  // Sembunyikan bottom nav saat di halaman login atau mode workout aktif
  if (pathname.startsWith('/login') || pathname.startsWith('/workout')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[env(safe-area-inset-bottom,12px)] pt-1 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-[#0f1011]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-2xl px-2 py-1.5 grid grid-cols-5 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            const homeHandlers =
              item.href === '/'
                ? {
                    onTouchStart: () => {
                      touchHandled.current = true;
                      prefetchHome();
                    },
                    onClick: () => {
                      if (touchHandled.current) {
                        touchHandled.current = false;
                        return;
                      }
                      prefetchHome();
                    },
                  }
                : {};

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                {...homeHandlers}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1 w-5 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                )}
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 tracking-tight transition-colors ${
                    isActive ? 'text-emerald-300 font-semibold' : 'text-zinc-400'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
