'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+229');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function requestOtp() {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/otp/request', { phone });
      setStep('otp');
    } catch (e: any) {
      setError(e.message || "Impossible d'envoyer le code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ accessToken: string }>('/auth/otp/verify', { phone, code });
      localStorage.setItem('homeease_token', res.accessToken);
      router.push('/profil');
    } catch (e: any) {
      setError(e.message || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4 pt-8">
      <button onClick={() => router.back()} aria-label="Retour" className="mb-6">
        <ArrowLeft size={20} />
      </button>

      <h1 className="text-xl font-semibold">Connexion</h1>
      <p className="mt-1 text-sm text-ink/60">
        {step === 'phone'
          ? 'Entrez votre numéro de téléphone pour recevoir un code de connexion.'
          : `Entrez le code envoyé au ${phone}.`}
      </p>

      {step === 'phone' ? (
        <div className="mt-6 flex flex-col gap-3">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+229 XX XX XX XX"
            className="rounded-xl2 border border-border px-4 py-3 text-sm outline-none"
          />
          <button
            onClick={requestOtp}
            disabled={loading}
            className="rounded-full bg-primary py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Envoi...' : 'Recevoir le code'}
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code à 6 chiffres"
            inputMode="numeric"
            className="rounded-xl2 border border-border px-4 py-3 text-sm outline-none tracking-widest text-center"
          />
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="rounded-full bg-primary py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Valider'}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </main>
  );
}
