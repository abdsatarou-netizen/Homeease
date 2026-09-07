'use client';

import { useEffect, useState } from 'react';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { api } from '@/lib/api';
import AdminNav from '@/components/AdminNav';

type UserRow = {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  isSuspended: boolean;
  isBanned: boolean;
  profile?: { firstName?: string; lastName?: string };
};

export default function AdminUsersPage() {
  const { checking } = useAdminGuard();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    api
      .get<UserRow[]>(`/users${qs}`)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!checking) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  async function toggle(id: string, action: 'suspend' | 'restore' | 'ban') {
    setBusyId(id);
    try {
      await api.patch(`/users/${id}/${action}`);
      load();
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
        <h1 className="text-lg font-semibold">Utilisateurs</h1>
        <p className="text-sm text-ink/60">Gérer les comptes clients, propriétaires et agents.</p>
      </header>

      <AdminNav />

      <div className="px-4 mt-4">
        <div className="flex gap-2 mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Rechercher par email ou téléphone..."
            className="flex-1 rounded-full border border-border px-4 py-2 text-sm outline-none"
          />
          <button onClick={load} className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white">
            Chercher
          </button>
        </div>

        {loading && <p className="text-sm text-ink/50">Chargement...</p>}
        {!loading && users.length === 0 && <p className="text-sm text-ink/50">Aucun utilisateur trouvé.</p>}

        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <div key={u.id} className="rounded-xl2 border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {u.profile?.firstName || ''} {u.profile?.lastName || ''}{' '}
                    {!u.profile?.firstName && (u.email || u.phone)}
                  </p>
                  <p className="text-xs text-ink/50">
                    {u.email || u.phone} · {u.role}
                  </p>
                </div>
                {u.isBanned && <span className="text-xs text-red-600 font-medium">Banni</span>}
                {u.isSuspended && !u.isBanned && (
                  <span className="text-xs text-amber-600 font-medium">Suspendu</span>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                {!u.isSuspended ? (
                  <button
                    disabled={busyId === u.id}
                    onClick={() => toggle(u.id, 'suspend')}
                    className="rounded-full border border-amber-400 px-3 py-1 text-xs text-amber-700 disabled:opacity-50"
                  >
                    Suspendre
                  </button>
                ) : (
                  <button
                    disabled={busyId === u.id}
                    onClick={() => toggle(u.id, 'restore')}
                    className="rounded-full border border-primary px-3 py-1 text-xs text-primary disabled:opacity-50"
                  >
                    Réactiver
                  </button>
                )}
                {!u.isBanned && (
                  <button
                    disabled={busyId === u.id}
                    onClick={() => toggle(u.id, 'ban')}
                    className="rounded-full border border-red-400 px-3 py-1 text-xs text-red-600 disabled:opacity-50"
                  >
                    Bannir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
