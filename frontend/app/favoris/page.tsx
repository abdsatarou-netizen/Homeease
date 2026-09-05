'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Property } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';
import BottomNav from '@/components/BottomNav';

type FavoriteRow = { id: string; property: Property };

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<FavoriteRow[]>('/favorites')
      .then(setFavorites)
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="px-4 pt-6">
      <h1 className="text-lg font-semibold mb-4">Mes favoris</h1>

      {loading ? (
        <p className="text-sm text-ink/50">Chargement...</p>
      ) : favorites.length === 0 ? (
        <p className="text-sm text-ink/50">
          Vous n'avez pas encore de favoris. Ajoutez des annonces en tapant sur le cœur.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {favorites.map((f) => (
            <PropertyCard key={f.id} property={f.property} />
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
