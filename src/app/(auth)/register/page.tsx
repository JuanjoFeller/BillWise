// src/app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card'; // Asegúrate de importar Card

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (parseInt(age) < 18) {
      setError('Debes ser mayor de 18 años para registrarte.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: email.split('@')[0]
      });

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        age: parseInt(age),
        createdAt: new Date(),
      });

      router.push('/dashboard'); // Redirige a dashboard
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md space-y-6" shadow="soft">
        <h1 className="text-3xl font-bold text-neutral-800 text-center mb-6">Registrarse</h1>

        {error && <p className="bg-danger-100 border border-danger-200 text-danger-700 p-3 rounded-lg text-sm mb-4">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            id="email"
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@ejemplo.com"
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
          />
          <Input
            id="confirmPassword"
            label="Confirmar Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="********"
          />
          <Input
            id="age"
            label="Edad"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            placeholder="Ej: 25"
            min="0"
          />
          <Button type="submit" className="w-full">
            Crear Cuenta
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-primary hover:text-primary-dark hover:underline font-medium">
            Inicia Sesión
          </a>
        </p>
      </Card>
    </div>
  );
}