// src/app/(main)/layout.tsx
import Header from '@/components/layout/Header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {/* Ajustamos el padding-top para dejar más espacio al header fijo. */}
      {/* Si el header es de 64px (h-16), pt-16 o pt-20 suele ser bueno. Probemos pt-24 para estar seguros. */}
      <main className="pt-24">
        {children}
      </main>
    </>
  );
}