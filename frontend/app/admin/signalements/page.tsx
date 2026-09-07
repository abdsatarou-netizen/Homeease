'use client';

import { useEffect, useState } from 'react';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { api } from '@/lib/api';
import AdminNav from '@/components/AdminNav';

type Report = {
  id: string;
  reason: string;
  details?: string;
  status: string;
  author?: { phone?: string; email?: string };
  property?: { title?: string };
  createdAt: string;
};

export default function AdminReportsPage() {
  const { checking } = useAdminGuard();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .get<Report[]>('/admin/reports?status=PENDING')
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!checking) load();
  }, [checking]);

  async function resolve(id: string, status: 'RESOLVED' | 'DISMISSED') {
    setBusyId(id);
    try {
      await api.patch(`/admin/reports/${id}`, { status });
      setReports((prev) => prev.filter((r) => r.id !== id));
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
        <h1 className="text-lg font-semibold">Signalements</h1>
        <p className="text-sm text-ink/60">Fausses annonces, arnaques, comportements abusifs.</p>
      </header>

      <AdminNav />

      <div className="px-4 mt-4 flex flex-col gap-3">
        {loading && <p className="text-sm text-ink/50">Chargement...</p>}
        {!loading && reports.length === 0 && (
          <p className="text-sm text-ink/50">Aucun signalement en attente.</p>
        )}
        {reports.map((r) => (
          <div key={r.id} className="rounded-xl2 border border-border p-3">
            <p className="text-sm font-semibold">{r.reason}</p>
            {r.property?.title && <p className="text-xs text-ink/50">Annonce : {r.property.title}</p>}
            {r.details && <p className="mt-1 text-sm text-ink/70">{r.details}</p>}
            <p className="mt-1 text-xs text-ink/40">
              Signalé par {r.author?.email || r.author?.phone || 'un utilisateur'}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                disabled={busyId === r.id}
                onClick={() => resolve(r.id, 'RESOLVED')}
                className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                Marquer résolu
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => resolve(r.id, 'DISMISSED')}
                className="rounded-full border border-border px-3 py-1 text-xs text-ink/60 disabled:opacity-50"
              >
                Ignorer
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
