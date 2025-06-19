// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'google';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className,
  ...props
}) => {
  let baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  let variantStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles = 'bg-primary hover:bg-primary-dark text-white focus:ring-primary-light';
      break;
    case 'secondary':
      variantStyles = 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800 focus:ring-neutral-400';
      break;
    case 'google':
      variantStyles = 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 flex items-center justify-center space-x-2 focus:ring-primary-light';
      break;
    default:
      variantStyles = 'bg-primary hover:bg-primary-dark text-white focus:ring-primary-light';
  }

  const disabledStyles = props.disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className || ''}`}
      {...props}
    >
      {variant === 'google' && (
        <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;