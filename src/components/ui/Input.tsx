// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-neutral-700 text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          block w-full
          px-4 py-2
          border border-neutral-300 rounded-lg shadow-soft
          text-neutral-800 placeholder-neutral-400
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          transition-colors duration-200
          ${className || ''}
        `}
        {...props}
      />
    </div>
  );
};

export default Input;