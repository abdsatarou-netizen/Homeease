'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type Me = { id: string; email?: string; role: string; profile?: { firstName?: string; lastName?: string } };

export function useAdminGuard() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('homeease_token') : null;
    if (!token) {
      router.replace('/connexion');
      return;
    }
    api
      .get<Me>('/users/me')
      .then((user) => {
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
          router.replace('/');
          return;
        }
        setMe(user);
      })
      .catch(() => router.replace('/connexion'))
      .finally(() => setChecking(false));
  }, [router]);

  return { me, checking };
}
