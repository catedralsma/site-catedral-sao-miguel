import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  title
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] hover:from-[var(--color-primary-to)] hover:to-[var(--color-primary-from)] text-[var(--color-button-text)] shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-[var(--color-secondary-from)] to-[var(--color-secondary-to)] hover:from-[var(--color-secondary-to)] hover:to-[var(--color-secondary-from)] text-[var(--color-button-text)] shadow-lg hover:shadow-xl',
    outline: 'border-2 border-[var(--color-primary-from)] text-[var(--color-primary-from)] hover:bg-[var(--color-primary-from)] hover:text-[var(--color-button-text)]'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-2.5 text-base min-h-[44px]',
    lg: 'px-8 py-3 text-lg min-h-[48px]'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} touch-manipulation ${className}`}
      title={title}
    >
      {children}
    </motion.button>
  );
};
