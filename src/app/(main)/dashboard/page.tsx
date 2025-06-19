// src/app/(main)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// Definición de tipos (si no las tienes en src/types/index.d.ts, déjalas aquí)
interface Participant {
  name: string; amount: number; paid: boolean; paymentId: string;
}
interface Split {
  id: string; payerId: string; totalAmount: number; tipPercentage: number; totalWithTip: number;
  splitType: 'equal' | 'custom'; participants: Participant[]; createdAt: Date;
}

// SummaryCard (para las tarjetas superiores)
const SummaryCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
  <Card className="flex flex-col items-start p-4 bg-white border border-neutral-200 rounded-lg shadow-soft flex-1 min-w-[150px]">
    <div className="text-primary-dark mb-2">{icon}</div> {/* <-- ¡Aplicamos color a los iconos! */}
    <p className="text-neutral-600 text-sm">{title}</p>
    <p className="text-neutral-800 text-2xl font-bold">{value}</p>
  </Card>
);

// ExpenseListItem (para cada split en la lista) - Aseguramos colores en estados y avatares
const ExpenseListItem = ({ split }: { split: Split }) => {
  const router = useRouter();
  const totalPaid = split.participants.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
  const totalPending = split.totalWithTip - totalPaid;

  const formattedDate = new Date(split.createdAt.toDate()).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <Card className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-neutral-200 rounded-lg shadow-soft mb-4">
      <div className="flex-1 mb-4 md:mb-0">
        <h3 className="text-lg font-semibold text-neutral-800 mb-1">
            <span className="font-bold text-primary-dark">${split.totalAmount.toFixed(2)}</span> - {split.splitType === 'equal' ? 'Partes Iguales' : 'Por Consumo'}
        </h3>
        <p className="text-neutral-600 text-sm mb-2">{split.participants.length} personas · {formattedDate}</p>
        {/* Avatares de participantes - Aseguramos el estilo */}
        <div className="flex -space-x-2 overflow-hidden mb-2">
            {split.participants.slice(0, 3).map((p, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-dark text-xs font-medium border-2 border-white">
                    {p.name.charAt(0).toUpperCase()}
                </div>
            ))}
            {split.participants.length > 3 && (
                 <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 text-xs font-medium border-2 border-white">
                    +{split.participants.length - 3}
                </div>
            )}
        </div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <p className={`font-bold text-lg ${totalPending > 0 ? 'text-danger-700' : 'text-success-700'}`}> {/* <-- ¡Colores para Pendiente/Completado! */}
          {totalPending > 0 ? `Pendiente: $${totalPending.toFixed(2)}` : '¡Completado!'}
        </p>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => router.push(`/track/${split.id}`)} className="text-sm px-3 py-1.5">
            Ver
          </Button>
          <Button variant="primary" onClick={() => {
              const publicSplitLink = `${window.location.origin}/${split.id}`;
              navigator.clipboard.writeText(publicSplitLink);
              alert('Link copiado: ' + publicSplitLink);
          }} className="text-sm px-3 py-1.5">
            Compartir
          </Button>
        </div>
      </div>
    </Card>
  );
};


export default function DashboardPage() {
  // ... tu código

  return (
  <div className="min-h-screen bg-neutral-50 pt-24 p-4">
    {/* Sección Hero - ELIMINA TODAS LAS CLASES TEMPORALMENTE AQUÍ */}
    <div className="text-center py-12 px-6 mb-8"> {/* <-- CLASES ELIMINADAS TEMPORALMENTE */}
      <h1 className="text-4xl font-extrabold mb-4">Divide gastos sin complicaciones</h1>
      <p className="text-lg opacity-90 max-w-2xl mx-auto">
        Crea, divide y cobra de manera automática. Genera enlaces personalizados
        para cada participante y olvídate de perseguir pagos.
      </p>
    </div>

    {/* ... Resto del dashboard ... */}
  </div>
);
}