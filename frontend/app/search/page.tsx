'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import { Property, SearchResult } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';
import BottomNav from '@/components/BottomNav';

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-ink/50">Chargement...</p>}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get('query') || '');
  const [city, setCity] = useState(params.get('city') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  const runSearch = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (query) qs.set('query', query);
    if (city) qs.set('city', city);
    if (minPrice) qs.set('minPrice', minPrice);
    if (maxPrice) qs.set('maxPrice', maxPrice);
    const categorySlug = params.get('categorySlug');
    if (categorySlug) qs.set('categorySlug', categorySlug);

    api
      .get<SearchResult>(`/properties?${qs.toString()}`)
      .then(setResults)
      .catch(() => setResults({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 }))
      .finally(() => setLoading(false));
  }, [query, city, minPrice, maxPrice, params]);

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main>
      <header className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button onClick={() => router.back()} aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold">Résultats</h1>
      </header>

      <div className="px-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2.5">
          <SearchIcon size={16} className="text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Chambre, appartement, maison..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex gap-2">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ville / Commune"
            className="flex-1 rounded-full border border-border px-4 py-2 text-sm outline-none"
          />
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            <SlidersHorizontal size={14} /> Filtres
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2 rounded-xl2 border border-border p-3">
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Prix min"
              inputMode="numeric"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Prix max"
              inputMode="numeric"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                setShowFilters(false);
                runSearch();
              }}
              className="col-span-2 rounded-lg bg-primary py-2 text-sm font-medium text-white"
            >
              Appliquer les filtres
            </button>
          </div>
        )}
      </div>

      <p className="px-4 mt-4 mb-2 text-sm text-ink/60">
        {loading ? 'Recherche en cours...' : `${results?.total ?? 0} annonces trouvées`}
      </p>

      <div className="px-4 flex flex-col gap-3">
        {(results?.items || []).map((p: Property) => (
          <div key={p.id} className="flex gap-3 rounded-xl2 border border-border p-2">
            <PropertyCard property={p} wide />
          </div>
        ))}
        {!loading && results?.items.length === 0 && (
          <p className="text-sm text-ink/50 text-center py-10">
            Aucune annonce ne correspond à votre recherche pour le moment.
          </p>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
