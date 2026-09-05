'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, SlidersHorizontal, Search as SearchIcon, ChevronRight, Home, Building2, BedDouble, Trees, Store, Car, Sofa, Palmtree } from 'lucide-react';
import { api } from '@/lib/api';
import { Property, Category } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';
import BottomNav from '@/components/BottomNav';

const CATEGORY_ICONS: Record<string, any> = {
  maison: Home,
  appartement: Building2,
  chambre: BedDouble,
  parcelle: Trees,
  'local-commercial': Store,
  bureau: Store,
  voiture: Car,
  meuble: Sofa,
  tourisme: Palmtree,
};

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ items: Property[] }>('/properties?sort=recent&limit=6').catch(() => ({ items: [] })),
      api.get<Category[]>('/categories').catch(() => []),
    ]).then(([props, cats]) => {
      setProperties(props.items || []);
      setCategories(cats || []);
      setLoading(false);
    });
  }, []);

  return (
    <main>
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-2">
        <div>
          <p className="flex items-center gap-1 text-primary text-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" /> Abomey-Calavi
          </p>
          <p className="text-lg font-semibold">Bonjour 👋</p>
        </div>
        <button aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Bell size={18} />
        </button>
      </header>

      <p className="px-4 text-ink/60 text-sm mb-3">Que cherchez-vous aujourd'hui ?</p>

      {/* Barre de recherche */}
      <div className="px-4 flex gap-2">
        <Link
          href="/search"
          className="flex flex-1 items-center gap-2 rounded-full border border-border bg-muted px-4 py-3 text-sm text-ink/50"
        >
          <SearchIcon size={16} />
          Rechercher un bien, une ville...
        </Link>
        <Link
          href="/search"
          aria-label="Filtres"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white"
        >
          <SlidersHorizontal size={18} />
        </Link>
      </div>

      {/* Catégories */}
      <div className="grid grid-cols-4 gap-3 px-4 mt-5">
        {categories.slice(0, 8).map((cat) => {
          const Icon = CATEGORY_ICONS[cat.slug] || Home;
          return (
            <Link
              key={cat.id}
              href={`/search?categorySlug=${cat.slug}`}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Icon size={20} className="text-ink" />
              </span>
              <span className="text-[11px] text-ink/70 text-center leading-tight">{cat.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Annonces recommandées */}
      <section className="px-4 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Annonces recommandées</h2>
          <Link href="/search" className="flex items-center text-xs text-primary">
            Voir tout <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-ink/50">Chargement...</p>
        ) : properties.length === 0 ? (
          <p className="text-sm text-ink/50">
            Aucune annonce disponible pour le moment. Revenez bientôt !
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}
