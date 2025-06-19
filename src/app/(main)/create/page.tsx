// src/app/(main)/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';

// Componente para una tarjeta de ítem/participante
const ParticipantInput = ({ index, value, onChange, onRemove }: any) => (
  <div className="flex items-center gap-2 mb-2">
    <Input
      id={`participant-${index}`}
      type="text"
      placeholder={`Nombre del participante ${index + 1}`}
      value={value.name}
      onChange={(e) => onChange(index, 'name', e.target.value)}
      className="flex-grow"
    />
    <Input
      id={`amount-${index}`}
      type="number"
      placeholder="Monto"
      value={value.amount}
      onChange={(e) => onChange(index, 'amount', parseFloat(e.target.value))}
      className="w-24 text-right"
    />
    <Button variant="secondary" onClick={() => onRemove(index)} className="px-3 py-2">
      X
    </Button>
  </div>
);


export default function CreateSplitPage() {
  const [user, loadingUser] = useAuthState(auth);
  const router = useRouter();

  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [tipPercentage, setTipPercentage] = useState<number | ''>('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [participants, setParticipants] = useState<{ name: string; amount: number }[]>([{ name: '', amount: 0 }]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const calculateAmounts = () => {
    const amount = typeof totalAmount === 'number' ? totalAmount : 0;
    const tip = typeof tipPercentage === 'number' ? (amount * tipPercentage / 100) : 0;
    const totalWithTip = amount + tip;

    if (splitType === 'equal') {
      const perPerson = participants.length > 0 ? totalWithTip / participants.length : 0;
      return { totalWithTip, perPerson, tip, assignedSum: 0 };
    } else {
      const assignedSum = participants.reduce((sum, p) => sum + p.amount, 0);
      return { totalWithTip, perPerson: null, tip, assignedSum };
    }
  };

  const { totalWithTip, perPerson, tip, assignedSum } = calculateAmounts();

  const handleAddParticipant = () => {
    setParticipants([...participants, { name: '', amount: 0 }]);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleParticipantChange = (index: number, field: 'name' | 'amount', value: string | number) => {
    const newParticipants = [...participants];
    if (field === 'name') {
      newParticipants[index].name = value as string;
    } else {
      newParticipants[index].amount = value as number;
    }
    setParticipants(newParticipants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      setError('Por favor, ingresa un monto total válido.');
      setLoading(false);
      return;
    }

    if (splitType === 'custom') {
      if (Math.abs(assignedSum - totalWithTip) > 0.01) {
        setError(`La suma de los montos asignados (<span class="math-inline">\{assignedSum\.toFixed\(2\)\}\) no coincide con el total \(</span>{totalWithTip.toFixed(2)}).`);
        setLoading(false);
        return;
      }
      if (participants.some(p => p.name.trim() === '' || p.amount <= 0)) {
        setError('Por favor, asegúrate de que todos los participantes tengan un nombre y un monto válido.');
        setLoading(false);
        return;
      }
    } else if (splitType === 'equal') {
      if (participants.length === 0 || totalAmount <= 0) {
         setError('Debes añadir al menos un participante y el monto total debe ser mayor a 0.');
         setLoading(false);
         return;
      }
       if (perPerson === null || isNaN(perPerson) || !isFinite(perPerson)) {
         setError('No se pudo calcular el monto por persona. Revisa el monto total y el número de participantes.');
         setLoading(false);
         return;
       }
    }

    try {
      const participantsToSave = participants.map(p => ({
        name: p.name,
        amount: splitType === 'equal' ? (perPerson || 0) : p.amount,
        paid: false,
        paymentId: '',
      }));

      const newSplitDocRef = await addDoc(collection(db, 'splits'), {
        payerId: user?.uid,
        totalAmount: totalAmount,
        tipPercentage: tipPercentage,
        totalWithTip: totalWithTip,
        splitType: splitType,
        participants: participantsToSave,
        createdAt: new Date(),
      });

      router.push(`/track/${newSplitDocRef.id}`);

    } catch (err: any) {
      console.error("Error creating split:", err);
      setError('Hubo un error al crear la división. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <Card className="max-w-xl w-full space-y-8" shadow="medium">
        <h2 className="text-3xl font-bold text-neutral-800 text-center mb-8">Crear Nueva División</h2>

        {error && (
          <div className="bg-danger-100 border border-danger-200 text-danger-700 p-3 rounded-lg relative text-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="totalAmount"
            label="Monto Total de la Cuenta"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(parseFloat(e.target.value) || '')}
            placeholder="Ej: 150.00"
            required
            min="0"
            step="0.01"
          />

          <Input
            id="tipPercentage"
            label="Propina (%)"
            type="number"
            value={tipPercentage}
            onChange={(e) => setTipPercentage(parseFloat(e.target.value) || '')}
            placeholder="Ej: 10 (opcional)"
            min="0"
            step="0.1"
          />

          <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => {
                setSplitType('equal');
                setParticipants([{ name: '', amount: 0 }]);
              }}
              className={`
                flex-1 px-4 py-2 text-center rounded-md font-medium transition-colors duration-200
                ${splitType === 'equal'
                  ? 'bg-white shadow-soft text-primary-dark'
                  : 'text-neutral-700 hover:bg-neutral-200'
                }
              `}
            >
              Dividir en Partes Iguales
            </button>
            <button
              type="button"
              onClick={() => {
                setSplitType('custom');
                setParticipants([{ name: '', amount: 0 }]);
              }}
              className={`
                flex-1 px-4 py-2 text-center rounded-md font-medium transition-colors duration-200
                ${splitType === 'custom'
                  ? 'bg-white shadow-soft text-primary-dark'
                  : 'text-neutral-700 hover:bg-neutral-200'
                }
              `}
            >
              Dividir por Consumo
            </button>
          </div>

          {splitType === 'equal' && (
            <div className="mt-4 border border-neutral-200 p-4 rounded-lg bg-neutral-50">
              <label className="block text-neutral-700 text-sm font-medium mb-2">
                Número de Personas (excluyendo al pagador)
              </label>
              <Input
                id="numParticipants"
                type="number"
                value={participants.length}
                onChange={(e) => {
                  const num = parseInt(e.target.value);
                  if (!isNaN(num) && num >= 0) {
                    setParticipants(Array(num).fill({ name: '', amount: 0 }));
                  } else {
                    setParticipants([]);
                  }
                }}
                min="0"
                placeholder="Ej: 3"
              />
              {participants.length > 0 && (
                <p className="text-neutral-600 text-sm mt-2 font-semibold">
                  Monto por persona: <span className="font-bold text-neutral-800">${perPerson !== null ? perPerson.toFixed(2) : '0.00'}</span>
                </p>
              )}
            </div>
          )}

          {splitType === 'custom' && (
            <div className="mt-4 border border-neutral-200 p-4 rounded-lg bg-neutral-50">
              <h3 className="text-lg font-semibold text-neutral-700 mb-3">Asignar montos por persona</h3>
              {participants.map((participant, index) => (
                <ParticipantInput
                  key={index}
                  index={index}
                  value={participant}
                  onChange={handleParticipantChange}
                  onRemove={handleRemoveParticipant}
                />
              ))}
              <Button type="button" onClick={handleAddParticipant} variant="secondary" className="w-full mt-4">
                + Añadir Participante
              </Button>
              <div className="mt-4 text-right space-y-1">
                <p className="text-sm text-neutral-600">Total asignado: <span className="font-bold text-neutral-800">${assignedSum !== null ? assignedSum.toFixed(2) : '0.00'}</span></p>
                <p className="text-sm text-neutral-600">Total de la cuenta: <span className="font-bold text-neutral-800">${totalWithTip !== null ? totalWithTip.toFixed(2) : '0.00'}</span></p>
                {totalWithTip !== null && assignedSum !== null && Math.abs(totalWithTip - assignedSum) > 0.01 && (
                  <p className="text-danger-700 text-sm font-medium">
                    Diferencia: <span className="font-bold">${(totalWithTip - assignedSum).toFixed(2)}</span> (debe ser 0)
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 border-t border-neutral-200 pt-6">
            <h3 className="text-xl font-bold text-neutral-800 mb-2">Resumen</h3>
            <div className="flex justify-between text-neutral-700 text-lg mb-1">
              <span>Monto Base:</span>
              <span><span className="font-bold text-neutral-800">${(typeof totalAmount === 'number' ? totalAmount : 0).toFixed(2)}</span></span>
            </div>
            <div className="flex justify-between text-neutral-700 text-lg mb-1">
              <span>Propina ({tipPercentage || 0}%):</span>
              <span><span className="font-bold text-neutral-800">${tip.toFixed(2)}</span></span>
            </div>
            <div className="flex justify-between text-neutral-800 font-bold text-xl mb-4">
              <span>Total con Propina:</span>
              <span><span className="font-bold text-neutral-800">${totalWithTip.toFixed(2)}</span></span>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Generando Split...' : 'Generar Link de Cobro'}
          </Button>
        </form>
      </Card>
    </div>
  );
}