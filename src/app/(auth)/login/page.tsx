// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card'; // Asegúrate de importar Card

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard'); // Redirige a dashboard
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard'); // Redirige a dashboard
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md space-y-6" shadow="soft">
        <h1 className="text-3xl font-bold text-neutral-800 text-center mb-6">Iniciar Sesión</h1>

        {error && <p className="bg-danger-100 border border-danger-200 text-danger-700 p-3 rounded-lg text-sm mb-4">{error}</p>}

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
          <Button type="submit" className="w-full">
            Iniciar Sesión
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-neutral-500">O</span>
          </div>
        </div>

        <Button
          variant="google"
          onClick={handleGoogleLogin}
          className="w-full"
        >
          Continuar con Google
        </Button>

        <p className="text-center text-sm text-neutral-600 mt-6">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="text-primary hover:text-primary-dark hover:underline font-medium">
            Regístrate aquí
          </a>
        </p>
      </Card>
    </div>
  );
}