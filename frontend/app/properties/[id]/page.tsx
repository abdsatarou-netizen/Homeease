'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Heart, MapPin, BedDouble, ShowerHead, Car as CarIcon, Wifi } from 'lucide-react';
import { api, formatPrice } from '@/lib/api';
import { Property } from '@/lib/types';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<Property>(`/properties/${id}`)
      .then(setProperty)
      .catch(() => setError("Cette annonce n'a pas pu être chargée."));
  }, [id]);

  async function requestViewing() {
    try {
      await api.post('/viewing-requests', {
        propertyId: id,
        requestedDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      });
      alert('Votre demande de visite a été envoyée au propriétaire.');
    } catch (e: any) {
      alert(e.message || "Vous devez être connecté pour demander une visite.");
    }
  }

  async function book() {
    try {
      await api.post('/bookings', { propertyId: id, startDate: new Date().toISOString() });
      alert('Votre réservation a été enregistrée.');
    } catch (e: any) {
      alert(e.message || 'Vous devez être connecté pour réserver.');
    }
  }

  if (error) return <p className="p-6 text-sm text-ink/60">{error}</p>;
  if (!property) return <p className="p-6 text-sm text-ink/60">Chargement...</p>;

  const images = property.images?.length ? property.images : [{ id: '0', url: 'https://placehold.co/800x600' }];
  const location = [property.location?.quarter, property.location?.commune].filter(Boolean).join(', ');

  return (
    <main className="pb-28">
      {/* Galerie */}
      <div className="relative">
        <img src={images[activeImage].url} alt={property.title} className="h-72 w-full object-cover" />
        <button
          onClick={() => router.back()}
          aria-label="Retour"
          className="absolute left-3 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/90"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="absolute right-3 top-6 flex gap-2">
          <button aria-label="Partager" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
            <Share2 size={16} />
          </button>
          <button aria-label="Favori" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
            <Heart size={16} />
          </button>
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white">
            {activeImage + 1}/{images.length}
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-lg font-semibold">{property.title}</h1>
        <p className="mt-1 text-xl font-bold text-primary">
          {formatPrice(property.price, property.currency)}
          {property.transactionType === 'RENT' && <span className="text-sm font-normal text-ink/50"> / mois</span>}
        </p>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink/60">
          <MapPin size={14} /> {location || property.location?.city}
        </p>

        {/* Caractéristiques */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {property.bedrooms != null && (
            <div className="rounded-xl2 bg-muted py-2">
              <BedDouble size={16} className="mx-auto mb-1" />
              <p className="text-[11px]">{property.bedrooms} Chambre(s)</p>
            </div>
          )}
          {property.hasInternalShower && (
            <div className="rounded-xl2 bg-muted py-2">
              <ShowerHead size={16} className="mx-auto mb-1" />
              <p className="text-[11px]">Douche interne</p>
            </div>
          )}
          {property.hasParking && (
            <div className="rounded-xl2 bg-muted py-2">
              <CarIcon size={16} className="mx-auto mb-1" />
              <p className="text-[11px]">Parking</p>
            </div>
          )}
          {property.hasWifi && (
            <div className="rounded-xl2 bg-muted py-2">
              <Wifi size={16} className="mx-auto mb-1" />
              <p className="text-[11px]">Wi-Fi</p>
            </div>
          )}
        </div>

        <h2 className="mt-5 text-sm font-semibold">Description</h2>
        <p className="mt-1 text-sm text-ink/70 leading-relaxed">{property.description}</p>

        <h2 className="mt-5 text-sm font-semibold">Propriétaire</h2>
        <div className="mt-2 flex items-center justify-between rounded-xl2 border border-border p-3">
          <div>
            <p className="text-sm font-medium">
              {property.owner?.profile?.firstName || 'Propriétaire'} {property.owner?.profile?.lastName || ''}
            </p>
            {property.owner?.isProVerified && (
              <p className="text-xs text-primary">Propriétaire vérifié ✓</p>
            )}
          </div>
          <button className="rounded-full border border-primary px-4 py-1.5 text-xs font-medium text-primary">
            Contacter
          </button>
        </div>
      </div>

      {/* Actions fixes en bas */}
      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md flex gap-3 border-t border-border bg-surface p-3">
        <button
          onClick={requestViewing}
          className="flex-1 rounded-full border border-primary py-3 text-sm font-medium text-primary"
        >
          Demander une visite
        </button>
        <button onClick={book} className="flex-1 rounded-full bg-primary py-3 text-sm font-medium text-white">
          Réserver
        </button>
      </div>
    </main>
  );
}
