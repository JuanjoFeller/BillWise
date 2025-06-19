// src/components/ui/Card.tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  shadow?: 'soft' | 'medium';
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, shadow = 'soft', className, ...props }) => {
  const shadowClass = shadow === 'medium' ? 'shadow-medium' : 'shadow-soft';

  return (
    <div
      className={`bg-white p-8 rounded-lg ${shadowClass} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;