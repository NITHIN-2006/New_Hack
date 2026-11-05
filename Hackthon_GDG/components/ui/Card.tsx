
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const baseClasses = "bg-white overflow-hidden shadow-lg rounded-lg transition-all duration-300";
  const interactiveClasses = onClick ? "cursor-pointer hover:shadow-xl hover:-translate-y-1" : "";
  
  return (
    <div className={`${baseClasses} ${interactiveClasses} ${className}`} onClick={onClick}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
