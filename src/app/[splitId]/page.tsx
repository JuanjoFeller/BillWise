// src/app/[splitId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';

// Definición de tipos
interface Participant {
  name: string;
  amount: number;
  paid: boolean;
  paymentId: string;
}

interface Split {
  id: string;
  payerId: string;
  totalAmount: number;
  tipPercentage: number;
  totalWithTip: number;
  splitType: 'equal' | 'custom';
  participants: Participant[];
  createdAt: Date;
}

export default function PublicPaymentPage() {
  const params = useParams();
  const splitId = typeof params.splitId === 'string' ? params.splitId : undefined;
  const [split, setSplit] = useState<Split | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [yourName, setYourName] = useState<string>('');
  const [yourAmount, setYourAmount] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    if (!splitId) {
        setLoading(false);
        setError('ID de split no proporcionado en la URL.');
        return;
    }

    const fetchSplit = async () => {
      try {
        setLoading(true);
        const splitDocRef = doc(db, 'splits', splitId);
        const splitDocSnap = await getDoc(splitDocRef);

        if (splitDocSnap.exists()) {
          setSplit(splitDocSnap.data() as Split);
        } else {
          setError('Split no encontrado o ya expirado.');
        }
      } catch (err: any) {
        console.error("Error fetching public split:", err);
        setError('Error al cargar la información del split.');
      } finally {
        setLoading(false);
      }
    };
    fetchSplit();
  }, [splitId]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPaymentSuccess(false);

    if (!yourName.trim()) {
      setError('Por favor, ingresa tu nombre.');
      return;
    }

    if (!split) return;

    const existingParticipantIndex = split.participants.findIndex(
      (p) => p.name.toLowerCase() === yourName.toLowerCase()
    );

    let participantAmount = yourAmount;

    if (existingParticipantIndex !== -1) {
      participantAmount = split.participants[existingParticipantIndex].amount;
      if (split.participants[existingParticipantIndex].paid) {
        setError('Este participante ya ha pagado su parte.');
        return;
      }
    } else {
      if (split.splitType === 'equal' && split.participants.length > 0) {
        participantAmount = split.totalWithTip / split.participants.length;
      } else {
        setError('Por favor, ingresa tu nombre como aparece en la lista del creador, o no es un participante válido.');
        return;
      }
    }

    if (participantAmount === null || participantAmount <= 0) {
      setError('Monto de pago inválido.');
      return;
    }

    setYourAmount(participantAmount);

    setPaymentProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedParticipants = split.participants.map((p, index) => {
        if (p.name.toLowerCase() === yourName.toLowerCase() && index === existingParticipantIndex) {
          return { ...p, paid: true, paymentId: `sim-pay-${Date.now()}` };
        }
        return p;
      });

      if (existingParticipantIndex === -1 && split.splitType === 'equal') {
          updatedParticipants.push({
            name: yourName.trim(),
            amount: participantAmount,
            paid: true,
            paymentId: `sim-pay-${Date.now()}`
          });
      }

      await updateDoc(doc(db, 'splits', splitId), {
        participants: updatedParticipants,
      });

      setPaymentSuccess(true);
      setPaymentProcessing(false);
      setSplit({ ...split, participants: updatedParticipants });

    } catch (err: any) {
      console.error("Error simulating payment:", err);
      setError('Error al procesar el pago simulado. Intenta de nuevo.');
      setPaymentProcessing(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-danger font-bold">
        <p>{error}</p>
      </div>
    );
  }

  if (!split) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-600">Split no disponible.</p>
      </div>
    );
  }

  const isAlreadyPaid = yourName.trim() !== '' && split.participants.some(
    (p) => p.name.toLowerCase() === yourName.toLowerCase() && p.paid
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8" shadow="soft">
        <h1 className="text-3xl font-bold text-neutral-800 text-center mb-6">
          Paga tu parte en Billwise
        </h1>

        <div className="text-center mb-6">
          <p className="text-neutral-600 text-lg">Monto Total de la Cuenta:</p>
          <p className="text-primary-dark text-4xl font-extrabold">${split.totalWithTip.toFixed(2)}</p>
          <p className="text-neutral-500 text-sm mt-2">
            Split creado por: {split.payerId.substring(0, 8)}... (ID del pagador)
          </p>
        </div>

        {error && (
          <div className="bg-danger-100 border border-danger-200 text-danger-700 p-3 rounded-lg relative text-sm">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {paymentSuccess ? (
          <div className="text-center bg-success-100 border border-success-200 text-success-700 p-6 rounded-lg shadow-soft">
            <p className="font-bold text-2xl mb-2">¡Pago Realizado con Éxito!</p>
            <p className="text-success-dark text-lg">Tu pago de **<span className="font-bold">${yourAmount?.toFixed(2) || '0.00'}</span>** ha sido registrado.</p>
            <p className="text-neutral-600 text-sm mt-4">Gracias por usar Billwise.</p>
            <Button
              onClick={() => {
                setPaymentSuccess(false);
                setYourName('');
                setYourAmount(null);
                setError('');
              }}
              className="mt-6 w-full"
            >
              Realizar otro pago (opcional)
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-4">
            <Input
              id="yourName"
              label="¿Cuál es tu nombre?"
              type="text"
              value={yourName}
              onChange={(e) => {
                setYourName(e.target.value);
                const matchedParticipant = split.participants.find(
                  p => p.name.toLowerCase() === e.target.value.toLowerCase()
                );
                if (matchedParticipant) {
                  setYourAmount(matchedParticipant.amount);
                } else {
                  setYourAmount(null);
                  if (split.splitType === 'equal' && split.participants.length > 0) {
                     setYourAmount(split.totalWithTip / split.participants.length);
                  }
                }
              }}
              placeholder="Ej: Juan Pérez"
              required
            />

            {yourAmount !== null && yourAmount > 0 && (
              <div className="text-center bg-primary-100 border border-primary-200 p-4 rounded-lg shadow-soft">
                <p className="text-neutral-700 text-lg">Tu parte a pagar:</p>
                <p className="text-primary-dark text-3xl font-bold">${yourAmount.toFixed(2)}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={paymentProcessing || isAlreadyPaid}>
              {paymentProcessing ? 'Procesando Pago...' : (isAlreadyPaid ? 'Ya Pagaste' : 'Pagar Ahora (Simulado)')}
            </Button>

            <p className="text-center text-sm text-neutral-500 mt-4">
              *Este es un pago simulado. En una versión futura, se integraría con pasarelas de pago reales.*
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}