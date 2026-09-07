'use client';

import { useEffect, useState } from 'react';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { api, formatPrice } from '@/lib/api';
import AdminNav from '@/components/AdminNav';

type PendingProperty = {
  id: string;
  title: string;
  price: string | number;
  currency: string;
  images: { url: string }[];
  owner: { phone?: string; profile?: { firstName?: string; lastName?: string } };
};

export default function AdminPropertiesPage() {
  const { checking } = useAdminGuard();
  const [properties, setProperties] = useState<PendingProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .get<PendingProperty[]>('/properties/admin/pending')
      .then(setProperties)
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!checking) load();
  }, [checking]);

  async function decide(id: string, action: 'approve' | 'reject') {
    setBusyId(id);
    try {
      await api.patch(`/properties/${id}/${action}`);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      alert(e.message || 'Action impossible.');
    } finally {
      setBusyId(null);
    }
  }

  if (checking) return <p className="p-6 text-sm text-ink/50">Vérification des droits...</p>;

  return (
    <main className="pb-10">
      <header className="px-4 pt-6 pb-3">
        <h1 className="text-lg font-semibold">Annonces à valider</h1>
        <p className="text-sm text-ink/60">Approuvez ou refusez les nouvelles annonces avant publication.</p>
      </header>

      <AdminNav />

      <div className="px-4 mt-4 flex flex-col gap-3">
        {loading && <p className="text-sm text-ink/50">Chargement...</p>}
        {!loading && properties.length === 0 && (
          <p className="text-sm text-ink/50">Aucune annonce en attente de validation.</p>
        )}
        {properties.map((p) => (
          <div key={p.id} className="flex gap-3 rounded-xl2 border border-border p-3">
            <img
              src={p.images?.[0]?.url || 'https://placehold.co/200x150'}
              alt={p.title}
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold line-clamp-1">{p.title}</p>
              <p className="text-sm text-primary font-bold">{formatPrice(p.price, p.currency)}</p>
              <p className="text-xs text-ink/50">
                {p.owner?.profile?.firstName || p.owner?.phone || 'Propriétaire'}{' '}
                {p.owner?.profile?.lastName || ''}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  disabled={busyId === p.id}
                  onClick={() => decide(p.id, 'approve')}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                >
                  Approuver
                </button>
                <button
                  disabled={busyId === p.id}
                  onClick={() => decide(p.id, 'reject')}
                  className="rounded-full border border-red-400 px-3 py-1 text-xs font-medium text-red-600 disabled:opacity-50"
                >
                  Refuser
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
