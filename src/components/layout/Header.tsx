// src/components/layout/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Button from '@/components/ui/Button';

const Header: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isPublicRoute = pathname?.startsWith('/login') ||
                        pathname?.startsWith('/register') ||
                        (!user && pathname?.match(/^\/[a-zA-Z0-9]{20}$/));

  if (isPublicRoute) {
    return null;
  }

  return (
  // Header - ELIMINA TODAS LAS CLASES TEMPORALMENTE AQUÍ
  <header className="p-4 flex justify-between items-center fixed w-full z-20 top-0">
    {/* Logo y nombre de la app */}
    <Link href="/dashboard" className="flex items-center space-x-2">
      {/* Quitemos la imagen y solo dejemos el texto para esta prueba */}
      <span className="text-3xl font-extrabold">B</span>
      <span className="text-2xl font-bold">illwise</span>
    </Link>

    {/* Navegación y acciones */}
    <nav className="flex items-center space-x-4">
      {user && (
        <>
          {/* Botones - por ahora, solo texto plano */}
          <span>Nuevo Gasto</span>
          {pathname !== '/dashboard' && (
            <span>Mis Splits</span>
          )}
          <span>Cerrar Sesión</span>
        </>
      )}
    </nav>
  </header>
);
};

export default Header;