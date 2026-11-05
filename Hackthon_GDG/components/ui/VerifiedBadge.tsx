import React from 'react';

const VerifiedBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={`inline-block h-5 w-5 ${className}`} 
      viewBox="0 0 20 20" 
      fill="currentColor"
    >
      <path 
        fillRule="evenodd" 
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a.75.75 0 00-1.06-1.06l-3.894 3.893-1.48-1.48a.75.75 0 10-1.06 1.061l2.014 2.015a.75.75 0 001.06 0l4.42-4.42z" 
        clipRule="evenodd"
        className="text-blue-500"
      />
    </svg>
  );
};

export default VerifiedBadge;
