'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/annonces', label: 'Annonces' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs' },
  { href: '/admin/signalements', label: 'Signalements' },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-4 pb-3 pt-1 border-b border-border">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
              active ? 'bg-ink text-white' : 'bg-muted text-ink/60'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
