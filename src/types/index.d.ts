// src/types/index.d.ts

// Interfaces para los participantes de un split
export interface Participant {
  name: string;
  amount: number;
  paid: boolean;
  paymentId: string; // Para simular un ID de transacción
}

// Interfaces para un split
export interface Split {
  id: string; // ID del documento de Firestore
  payerId: string; // ID del usuario que creó el split
  totalAmount: number;
  tipPercentage: number;
  totalWithTip: number;
  splitType: 'equal' | 'custom'; // Tipo de división
  participants: Participant[]; // Array de participantes
  createdAt: Date; // Fecha de creación
}