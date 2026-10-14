'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlayCircle, History, Dumbbell, User } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/workout', label: 'Workout', icon: PlayCircle },
  { href: '/riwayat', label: 'Riwayat', icon: History },
  { href: '/latihan', label: 'Latihan', icon: Dumbbell },
  { href: '/profil', label: 'Profil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith('/login')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
