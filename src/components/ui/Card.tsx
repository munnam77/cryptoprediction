import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-gray-800 rounded-lg shadow-lg p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
