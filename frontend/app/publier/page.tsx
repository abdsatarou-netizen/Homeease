'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';

const STEPS = ['Infos', 'Détails', 'Localisation', 'Photos', 'Confirmation'];

export default function PublishPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageUrlsText, setImageUrlsText] = useState('');

  const [form, setForm] = useState({
    categoryId: '',
    transactionType: 'RENT',
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    rooms: '',
    hasInternalShower: false,
    hasWifi: false,
    hasParking: false,
    isFurnished: false,
    city: '',
    commune: '',
    quarter: '',
  });

  useEffect(() => {
    api.get<Category[]>('/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const imageUrls = imageUrlsText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/properties', {
        ...form,
        price: Number(form.price),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        rooms: form.rooms ? Number(form.rooms) : undefined,
        imageUrls: imageUrls.length ? imageUrls : undefined,
      });
      router.push('/profil');
    } catch (e: any) {
      setError(e.message || 'Vous devez être connecté pour publier une annonce.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 pt-6 pb-10">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))} aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold">Publier une annonce</h1>
      </div>

      <div className="flex items-center justify-between mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                i <= step ? 'bg-primary text-white' : 'bg-muted text-ink/40'
              }`}
            >
              {i + 1}
            </span>
            <span className="mt-1 text-[10px] text-ink/50 text-center">{label}</span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-3">
          <label className="text-xs text-ink/60">Catégorie</label>
          <select
            value={form.categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
            className="rounded-xl2 border border-border px-4 py-3 text-sm"
          >
            <option value="">Sélectionner...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="text-xs text-ink/60">Type de transaction</label>
          <select
            value={form.transactionType}
            onChange={(e) => update('transactionType', e.target.value)}
            className="rounded-xl2 border border-border px-4 py-3 text-sm"
          >
            <option value="RENT">Location</option>
            <option value="SALE">Vente</option>
            <option value="SHORT_STAY">Location courte durée</option>
          </select>

          <label className="text-xs text-ink/60">Titre</label>
          <input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Ex. Chambre moderne à louer"
            className="rounded-xl2 border border-border px-4 py-3 text-sm"
          />

          <label className="text-xs text-ink/60">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={4}
            className="rounded-xl2 border border-border px-4 py-3 text-sm"
          />

          <label className="text-xs text-ink/60">Prix (FCFA)</label>
          <input
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            inputMode="numeric"
            placeholder="45000"
            className="rounded-xl2 border border-border px-4 py-3 text-sm"
          />
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.bedrooms}
              onChange={(e) => update('bedrooms', e.target.value)}
              placeholder="Chambres"
              inputMode="numeric"
              className="rounded-xl2 border border-border px-4 py-3 text-sm"
            />
            <input
              value={form.rooms}
              onChange={(e) => update('rooms', e.target.value)}
              placeholder="Pièces"
              inputMode="numeric"
              className="rounded-xl2 border border-border px-4 py-3 text-sm"
            />
          </div>
          {([
            ['hasInternalShower', 'Douche interne'],
            ['hasWifi', 'Wi-Fi'],
            ['hasParking', 'Parking'],
            ['isFurnished', 'Meublé'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between rounded-xl2 border border-border px-4 py-3 text-sm">
              {label}
              <input
                type="checkbox"
                checked={form[key] as boolean}
                onChange={(e) => update(key, e.target.checked as any)}
              />
            </label>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-3">
          <input
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="Ville (ex. Abomey-Calavi)"
            className="rounded-xl2 border border-border px-4 py-3 text-sm"
          />
          <input
            value={form.commune}
            onChange={(e) => update('commune', e.target.value)}
            placeholder="Commune"
            className="rounded-xl2 border border-border px-4 py-3 text-sm"
          />
          <input
            value={form.quarter}
            onChange={(e) => update('quarter', e.target.value)}
            placeholder="Quartier"
            className="rounded-xl2 border border-border px-4 py-3 text-sm"
          />
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink/70">
            Collez un ou plusieurs liens d'images (un lien par ligne). Vous pouvez héberger vos photos
            gratuitement sur un site comme{' '}
            <a href="https://imgur.com/upload" target="_blank" rel="noreferrer" className="text-primary underline">
              imgur.com
            </a>{' '}
            puis copier le lien direct de l'image ici.
          </p>
          <textarea
            value={imageUrlsText}
            onChange={(e) => setImageUrlsText(e.target.value)}
            rows={5}
            placeholder={'https://exemple.com/photo1.jpg\nhttps://exemple.com/photo2.jpg'}
            className="rounded-xl2 border border-border px-4 py-3 text-sm font-mono text-xs"
          />
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="h-20 w-full rounded-lg object-cover bg-muted"
                  onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.3')}
                />
              ))}
            </div>
          )}
          <p className="text-xs text-ink/50">
            L'upload direct de photos depuis votre téléphone sera disponible dans une prochaine mise à jour.
            Cette étape est optionnelle — vous pouvez publier sans image pour l'instant.
          </p>
        </div>
      )}

      {step === 4 && (
        <div className="rounded-xl2 border border-border p-4 text-sm">
          {imageUrls[0] && (
            <img src={imageUrls[0]} alt="" className="h-32 w-full rounded-lg object-cover mb-3 bg-muted" />
          )}
          <p className="font-semibold">{form.title || 'Titre de l\'annonce'}</p>
          <p className="text-primary font-bold mt-1">{form.price || '0'} FCFA</p>
          <p className="text-ink/60 mt-1">{[form.quarter, form.commune].filter(Boolean).join(', ')}</p>
          <p className="mt-2 text-ink/70">{form.description}</p>
          <p className="mt-3 text-xs text-ink/50">
            Votre annonce sera soumise à validation par l'équipe HomeEase avant publication.
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={() => (step < STEPS.length - 1 ? setStep((s) => s + 1) : submit())}
        disabled={submitting}
        className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {step < STEPS.length - 1 ? 'Suivant' : submitting ? 'Publication...' : 'Publier'}
      </button>
    </main>
  );
}
