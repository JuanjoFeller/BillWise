// src/app/(main)/track/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
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

export default function TrackSplitPage() {
  const [user, loadingUser] = useAuthState(auth);
  const router = useRouter();
  const params = useParams();
  const splitId = typeof params.id === 'string' ? params.id : undefined;

  const [split, setSplit] = useState<Split | null>(null);
  const [loadingSplit, setLoadingSplit] = useState(true);
  const [error, setError] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push('/login');
      return;
    }

    if (!splitId || !user) {
        setLoadingSplit(false);
        if (!splitId) setError('ID de split no proporcionado en la URL.');
        return;
    }

    const fetchSplit = async () => {
      try {
        setLoadingSplit(true);
        const splitDocRef = doc(db, 'splits', splitId);
        const splitDocSnap = await getDoc(splitDocRef);

        if (splitDocSnap.exists()) {
          const data = splitDocSnap.data() as Split;
          if (data.payerId === user.uid) {
            setSplit(data);
          } else {
            setError('No tienes permiso para ver este split.');
          }
        } else {
          setError('Split no encontrado.');
        }
      } catch (err: any) {
        console.error("Error fetching split:", err);
        setError('Error al cargar la información del split.');
      } finally {
        setLoadingSplit(false);
      }
    };
    fetchSplit();
  }, [splitId, user, loadingUser, router]);


  if (loadingUser || loadingSplit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 pt-20">
        <Spinner />
      </div>
    );
  }

  if (!user || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-danger font-bold">
        <p>{error || 'Acceso denegado o split no encontrado.'}</p>
      </div>
    );
  }

  if (!split) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-600">Split no disponible después de la carga.</p>
      </div>
    );
  }

  const publicSplitLink = `<span class="math-inline">\{window\.location\.origin\}/</span>{splitId}`;

  const copyToClipboard = (text: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const generateWhatsAppMessage = () => {
    let message = `¡Hola! Soy el pagador de la cuenta. Tu parte en Billwise es:\n\n`;
    split?.participants.forEach(p => {
      message += `- ${p.name}: $${p.amount.toFixed(2)} ${p.paid ? '(¡Pagado!)' : ''}\n`;
    });
    message += `\nPaga tu parte en este link: ${publicSplitLink}\n\n¡Gracias!`;
    return encodeURIComponent(message);
  };

  const handleResendLink = async (index: number) => {
    if (!split) return;

    const updatedParticipants = split.participants.map((p, i) =>
      i === index ? { ...p, paid: !p.paid } : p
    );

    try {
      await updateDoc(doc(db, 'splits', splitId), {
        participants: updatedParticipants,
      });
      setSplit({ ...split, participants: updatedParticipants });
      alert('Simulación: Estado de pago actualizado. En una app real, se reenviaría el link.');
    } catch (err) {
      console.error("Error updating participant status:", err);
      setError('Error al actualizar el estado de pago del participante.');
    }
  };


  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <Card className="max-w-2xl w-full space-y-8" shadow="medium">
        <h1 className="text-3xl font-bold text-neutral-800 text-center mb-8">
          Seguimiento de tu Split
        </h1>

        {/* Resumen del Split */}
        <div className="border-b pb-4 mb-4 border-neutral-200">
          <p className="text-neutral-600 text-sm">ID del Split: <span className="font-mono text-neutral-500 text-xs">{splitId}</span></p>
          <p className="text-xl font-semibold mt-2 text-neutral-800">Monto Total: <span className="font-bold">${split.totalAmount.toFixed(2)}</span></p>
          <p className="text-neutral-600">Propina ({split.tipPercentage}%): <span className="font-bold">${(split.totalWithTip - split.totalAmount).toFixed(2)}</span></p>
          <p className="text-neutral-800 text-2xl font-bold">Total con Propina: <span className="font-bold">${split.totalWithTip.toFixed(2)}</span></p>
          <p className="text-neutral-700 mt-2">Tipo de división: <span className="font-medium">{split.splitType === 'equal' ? 'Partes Iguales' : 'Por Consumo'}</span></p>
        </div>

        {/* Link de Cobro */}
        <div className="bg-neutral-50 p-4 rounded-lg flex flex-col items-center border border-neutral-200 shadow-soft">
          <p className="text-lg font-semibold text-neutral-700 mb-2">Link de Cobro para Compartir:</p>
          <Input
            id="split-link"
            type="text"
            value={publicSplitLink}
            readOnly
            className="w-full text-center text-primary-dark font-mono mb-4 cursor-pointer focus:outline-none"
            onClick={() => copyToClipboard(publicSplitLink, setCopiedLink)}
            title="Haz click para copiar"
          />
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full">
            <Button
              onClick={() => copyToClipboard(publicSplitLink, setCopiedLink)}
              className="flex-1"
              variant="secondary"
            >
              {copiedLink ? '¡Copiado!' : 'Copiar Link'}
            </Button>
            <a
              href={`https://wa.me/?text=${generateWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center space-x-2"
              onClick={() => { setCopiedWhatsApp(true); setTimeout(() => setCopiedWhatsApp(false), 2000); }}
            >
              <img src="/whatsapp-icon.svg" alt="WhatsApp" className="h-5 w-5 mr-2" />
              {copiedWhatsApp ? '¡Mensaje Listo!' : 'Compartir por WhatsApp'}
            </a>
          </div>
        </div>

        {/* Seguimiento de Pagos */}
        <h3 className="text-2xl font-bold text-neutral-800 mt-8 mb-4">Estado de Pagos:</h3>
        <div className="space-y-4">
          {split.participants.map((participant, index) => (
            <div
              key={index}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg shadow-soft border ${participant.paid ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200'}`}
            >
              <div className="mb-2 sm:mb-0">
                <p className="font-semibold text-neutral-800 text-lg">{participant.name}</p>
                <p className="text-neutral-600 text-md">${participant.amount.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-4">
                {participant.paid ? (
                  <span className="text-success-700 font-bold text-sm sm:text-base">¡Pagado!</span>
                ) : (
                  <span className="text-danger-700 font-bold text-sm sm:text-base">Pendiente</span>
                )}
                <Button
                  onClick={() => handleResendLink(index)}
                  variant="secondary"
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm"
                >
                  {participant.paid ? 'Marcar Pendiente' : 'Marcar Pagado'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}