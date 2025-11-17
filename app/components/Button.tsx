'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const baseStyles = `
    px-5 py-3 rounded-full font-medium text-base
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantStyles = {
    primary: `
      bg-blue-600 text-white
      hover:bg-blue-700
      active:bg-blue-800
    `,
    secondary: `
      border border-gray-300 text-gray-900
      hover:bg-gray-50
      active:bg-gray-100
      dark:border-white/15 dark:text-white
      dark:hover:bg-white/5
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

