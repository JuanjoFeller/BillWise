// src/app/layout.tsx
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ¡CORRECCIÓN AQUÍ! Asegúrate de que <body> empiece justo después de <html>
    <html lang="es" className="font-sans bg-red-500 text-neutral-800"><body> {/* Eliminamos el salto de línea y el espacio */}
        {children}
      </body>
    </html>
  );
}