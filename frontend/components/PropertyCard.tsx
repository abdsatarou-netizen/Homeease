'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Property } from '@/lib/types';
import { formatPrice } from '@/lib/api';

export default function PropertyCard({ property, wide = false }: { property: Property; wide?: boolean }) {
  const image = property.images?.[0]?.url || 'https://placehold.co/400x300?text=HomeEase';
  const location = [property.location?.quarter, property.location?.commune || property.location?.city]
    .filter(Boolean)
    .join(', ');

  return (
    <Link
      href={`/properties/${property.id}`}
      className={`block rounded-xl2 border border-border overflow-hidden bg-surface ${wide ? '' : 'w-full'}`}
    >
      <div className="relative">
        <img src={image} alt={property.title} className="h-36 w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 text-[11px] font-medium text-white">
          {property.transactionType === 'RENT' ? 'À louer' : property.transactionType === 'SALE' ? 'À vendre' : 'Court séjour'}
        </span>
        <button
          aria-label="Ajouter aux favoris"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90"
        >
          <Heart size={15} />
        </button>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold leading-snug line-clamp-1">{property.title}</p>
        <p className="text-xs text-ink/60">{location}</p>
        <p className="mt-1 text-sm font-bold text-primary">
          {formatPrice(property.price, property.currency)}
          {property.transactionType === 'RENT' && <span className="text-ink/50 font-normal text-xs"> / mois</span>}
        </p>
      </div>
    </Link>
  );
}
