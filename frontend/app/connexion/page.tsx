'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const path = mode === 'register' ? '/auth/register' : '/auth/login';
      const body =
        mode === 'register' ? { firstName, lastName, email, password } : { email, password };
      const res = await api.post<{ accessToken: string }>(path, body);
      localStorage.setItem('homeease_token', res.accessToken);
      router.push('/profil');
    } catch (e: any) {
      setError(e.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4 pt-8">
      <button onClick={() => router.back()} aria-label="Retour" className="mb-6">
        <ArrowLeft size={20} />
      </button>

      <h1 className="text-xl font-semibold">{mode === 'register' ? 'Créer un compte' : 'Connexion'}</h1>
      <p className="mt-1 text-sm text-ink/60">
        {mode === 'register'
          ? 'Rejoignez HomeEase pour publier ou réserver des annonces.'
          : 'Connectez-vous à votre compte HomeEase.'}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {mode === 'register' && (
          <>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prénom"
              className="rounded-xl2 border border-border px-4 py-3 text-sm outline-none"
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nom"
              className="rounded-xl2 border border-border px-4 py-3 text-sm outline-none"
            />
          </>
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Adresse email"
          type="email"
          inputMode="email"
          className="rounded-xl2 border border-border px-4 py-3 text-sm outline-none"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          type="password"
          className="rounded-xl2 border border-border px-4 py-3 text-sm outline-none"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="rounded-full bg-primary py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Chargement...' : mode === 'register' ? "S'inscrire" : 'Se connecter'}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
        className="mt-6 w-full text-center text-sm text-primary"
      >
        {mode === 'register' ? 'Déjà un compte ? Se connecter' : "Pas encore de compte ? S'inscrire"}
      </button>
    </main>
  );
}
