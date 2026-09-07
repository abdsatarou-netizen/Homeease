'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Bell, Settings, LogOut, FileText, Calendar, MessageCircle, Wallet, Star, HelpCircle, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import BottomNav from '@/components/BottomNav';

type Me = {
  id: string;
  phone?: string;
  email?: string;
  role: string;
  isProVerified: boolean;
  profile?: { firstName?: string; lastName?: string; avatarUrl?: string };
};

const LINKS = [
  { href: '/profil/annonces', label: 'Mes annonces', icon: FileText },
  { href: '/profil/reservations', label: 'Mes réservations', icon: Calendar },
  { href: '/profil/messages', label: 'Messages', icon: MessageCircle },
  { href: '/profil/portefeuille', label: 'Portefeuille', icon: Wallet },
  { href: '/profil/avis', label: 'Avis reçus', icon: Star },
  { href: '/profil/parametres', label: 'Paramètres', icon: Settings },
  { href: '/profil/aide', label: 'Aide & Support', icon: HelpCircle },
];

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('homeease_token') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<Me>('/users/me')
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem('homeease_token');
    setMe(null);
  }

  if (loading) return <p className="p-6 text-sm text-ink/60">Chargement...</p>;

  if (!me) {
    return (
      <main className="px-4 pt-10 text-center">
        <p className="text-sm text-ink/60 mb-4">Connectez-vous pour accéder à votre espace HomeEase.</p>
        <button
          onClick={() => router.push('/connexion')}
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white"
        >
          Se connecter
        </button>
        <BottomNav />
      </main>
    );
  }

  const name = [me.profile?.firstName, me.profile?.lastName].filter(Boolean).join(' ') || me.email || me.phone || 'Utilisateur';

  return (
    <main>
      <div className="bg-ink px-4 pb-8 pt-8 text-white rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button aria-label="Paramètres" onClick={() => router.push('/profil/parametres')}>
            <Settings size={18} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-lg font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{name}</p>
            {me.isProVerified && <p className="text-xs text-primary-light">Propriétaire vérifié ✓</p>}
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-1">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="flex items-center justify-between rounded-xl2 px-3 py-3 text-sm hover:bg-muted"
          >
            <span className="flex items-center gap-3">
              <Icon size={17} className="text-ink/60" />
              {label}
            </span>
            <ChevronRight size={16} className="text-ink/30" />
          </button>
        ))}

        {(me.role === 'ADMIN' || me.role === 'SUPER_ADMIN') && (
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center justify-between rounded-xl2 px-3 py-3 text-sm hover:bg-muted text-primary"
          >
            <span className="flex items-center gap-3">
              <ShieldCheck size={17} />
              Administration
            </span>
            <ChevronRight size={16} className="text-ink/30" />
          </button>
        )}

        <button onClick={logout} className="flex items-center gap-3 px-3 py-3 text-sm text-red-600 mt-2">
          <LogOut size={17} /> Se déconnecter
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
