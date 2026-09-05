'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, Heart, User } from 'lucide-react';

const items = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/search', label: 'Rechercher', icon: Search },
  { href: '/publier', label: 'Publier', icon: Plus, isCta: true },
  { href: '/favoris', label: 'Favoris', icon: Heart },
  { href: '/profil', label: 'Profil', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-surface border-t border-border">
      <ul className="flex items-center justify-between px-4 py-2">
        {items.map(({ href, label, icon: Icon, isCta }) => {
          const active = pathname === href;
          if (isCta) {
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md -mt-2"
                >
                  <Icon size={22} />
                </Link>
              </li>
            );
          }
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 px-2 py-1 text-xs ${
                  active ? 'text-primary' : 'text-ink/50'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
