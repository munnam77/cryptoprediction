import React from 'react';
import { transitions } from '../../styles/theme';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
  icon,
  type = 'button',
}) => {
  const baseStyles = `
    relative
    inline-flex
    items-center
    justify-center
    font-medium
    rounded-lg
    transition-all
    duration-200
    ease-in-out
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    focus:ring-offset-gray-900
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles = {
    primary: `
      bg-gradient-to-r
      from-indigo-600
      to-indigo-500
      text-white
      hover:from-indigo-500
      hover:to-indigo-400
      active:from-indigo-700
      active:to-indigo-600
      focus:ring-indigo-500
    `,
    secondary: `
      bg-gradient-to-r
      from-purple-600
      to-purple-500
      text-white
      hover:from-purple-500
      hover:to-purple-400
      active:from-purple-700
      active:to-purple-600
      focus:ring-purple-500
    `,
    ghost: `
      bg-gray-800/30
      text-gray-100
      hover:bg-gray-700/50
      active:bg-gray-900/70
      focus:ring-gray-500
      backdrop-blur-sm
    `,
    danger: `
      bg-gradient-to-r
      from-red-600
      to-red-500
      text-white
      hover:from-red-500
      hover:to-red-400
      active:from-red-700
      active:to-red-600
      focus:ring-red-500
    `,
    outline: `
      bg-transparent
      border
      border-gray-600
      text-gray-300
      hover:bg-gray-700
      hover:border-gray-500
      active:bg-gray-800
      focus:ring-gray-500
    `,
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  const Loader = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      type={type}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${widthStyles}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        transform: 'translateZ(0)',
        transition: transitions.fast,
      }}
    >
      {isLoading && <Loader />}
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
      
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 overflow-hidden rounded-lg">
        <span className="absolute inset-0 transform transition-transform duration-500 ease-out hover:scale-105" />
      </span>
      
      {/* Gradient overlay */}
      <span className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
};