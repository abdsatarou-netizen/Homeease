'use client';

import { useEffect, useState } from 'react';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { api } from '@/lib/api';
import AdminNav from '@/components/AdminNav';
import { Users, Home, Clock, Calendar, Wallet, Flag } from 'lucide-react';

type Dashboard = {
  users: number;
  owners: number;
  properties: number;
  pendingProperties: number;
  bookings: number;
  totalRevenue: number;
  pendingReports: number;
};

export default function AdminDashboardPage() {
  const { checking } = useAdminGuard();
  const [stats, setStats] = useState<Dashboard | null>(null);

  useEffect(() => {
    if (checking) return;
    api.get<Dashboard>('/admin/dashboard').then(setStats).catch(() => setStats(null));
  }, [checking]);

  if (checking) return <p className="p-6 text-sm text-ink/50">Vérification des droits...</p>;

  const cards = stats
    ? [
        { label: 'Utilisateurs', value: stats.users, icon: Users },
        { label: 'Propriétaires', value: stats.owners, icon: Users },
        { label: 'Annonces publiées', value: stats.properties, icon: Home },
        { label: 'En attente de validation', value: stats.pendingProperties, icon: Clock, highlight: true },
        { label: 'Réservations', value: stats.bookings, icon: Calendar },
        { label: 'Revenus (paiements réussis)', value: `${stats.totalRevenue} FCFA`, icon: Wallet },
        { label: 'Signalements en attente', value: stats.pendingReports, icon: Flag, highlight: true },
      ]
    : [];

  return (
    <main className="pb-10">
      <header className="px-4 pt-6 pb-3">
        <h1 className="text-lg font-semibold">Administration HomeEase</h1>
        <p className="text-sm text-ink/60">Vue d'ensemble de la plateforme.</p>
      </header>

      <AdminNav />

      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {!stats && <p className="col-span-2 text-sm text-ink/50">Chargement...</p>}
        {cards.map(({ label, value, icon: Icon, highlight }) => (
          <div
            key={label}
            className={`rounded-xl2 border p-4 ${highlight ? 'border-primary bg-primary-light' : 'border-border'}`}
          >
            <Icon size={18} className={highlight ? 'text-primary' : 'text-ink/50'} />
            <p className="mt-2 text-xl font-bold">{value}</p>
            <p className="text-xs text-ink/60">{label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
