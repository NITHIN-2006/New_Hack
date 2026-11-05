import React from 'react';
import { AidmateProfile } from '../../types';

interface ServiceSelectionModalProps {
  provider: AidmateProfile;
  onClose: () => void;
  onSelect: (service: string) => void;
}

const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({ provider, onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1001] p-4 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Select a Service</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
             <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-3">
            <p className="text-sm text-center text-gray-600 mb-4">What service do you need from {provider.name.split(' ')[0]}?</p>
            {provider.skills.map(skill => (
                <button 
                    key={skill}
                    onClick={() => onSelect(skill)}
                    className="w-full text-left p-3 border rounded-lg hover:bg-indigo-50 hover:border-indigo-400 transition-colors duration-200 text-gray-800"
                >
                    {skill}
                </button>
            ))}
             {(provider.skills.length === 0) && <p className="text-center text-gray-500">This provider hasn't listed any specific skills.</p>}
        </div>
      </div>
       <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ServiceSelectionModal;