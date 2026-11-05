import React, { useState } from 'react';

const AvailabilityToggle: React.FC = () => {
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <div 
        className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${isAvailable ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}
        style={{borderWidth: '1px'}}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
            <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg ${isAvailable ? 'bg-green-200' : 'bg-red-200'}`}>
                <svg className={`h-6 w-6 ${isAvailable ? 'text-green-700' : 'text-red-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {isAvailable ? 
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path> : 
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    }
                </svg>
            </div>
            <div className="ml-4">
              <h3 className={`text-lg font-bold ${isAvailable ? 'text-green-800' : 'text-red-800'}`}>
                {isAvailable ? 'Available for Jobs' : 'Unavailable'}
              </h3>
              <p className={`text-sm ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                {isAvailable ? 'You can receive new job requests' : 'You won\'t appear in searches'}
              </p>
            </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAvailable(!isAvailable)}
          className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 ease-in-out ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span
            className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${
              isAvailable ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default AvailabilityToggle;