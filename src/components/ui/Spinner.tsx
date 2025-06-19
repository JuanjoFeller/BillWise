// src/components/ui/Spinner.tsx
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div
        className="w-8 h-8 border-4 border-t-4 border-primary-500 border-solid rounded-full animate-spin border-neutral-200"
        role="status"
      >
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  );
};

export default Spinner;