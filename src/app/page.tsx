// billwise-app-new/src/app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStatus from '@/hooks/useAuthStatus'; // Asegúrate de que useAuthStatus esté copiado en hooks/
// Importa Button y Spinner si aún no lo están y los usas en este archivo
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function HomePage() {
  const { currentUser, loading } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        router.push('/dashboard'); // Redirige a dashboard
      } else {
        router.push('/login'); // Redirige a login
      }
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 flex-col">
      <h1 className="text-4xl font-bold text-neutral-800 mb-4">Bienvenido a Billwise</h1>
      <p className="text-lg text-neutral-600 mb-8">Redirigiendo...</p>
      {currentUser && (
        <Button onClick={() => auth.signOut()} variant="secondary">
          Cerrar Sesión
        </Button>
      )}
    </div>
  );
}