import React from 'react';
import { AidmateProfile } from '../../types';
import Card from '../ui/Card';
import VerifiedBadge from '../ui/VerifiedBadge';

interface AidmatesListPageProps {
  aidmates: AidmateProfile[];
  onSelectAidmate: (aidmate: AidmateProfile) => void;
  onBack: () => void;
}

const AidmatesListPage: React.FC<AidmatesListPageProps> = ({ aidmates, onSelectAidmate, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Verified AIDMATES ({aidmates.length})</h2>
      </div>

      {aidmates.length > 0 ? (
        <div className="space-y-4">
          {aidmates.map(aidmate => (
            <Card key={aidmate.id} onClick={() => onSelectAidmate(aidmate)}>
              <div className="flex items-center space-x-4">
                <img src={aidmate.profilePictureUrl} alt={aidmate.name} className="h-16 w-16 rounded-full" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    {aidmate.name}
                    {aidmate.isVerified && <VerifiedBadge className="ml-1.5" />}
                  </h3>
                  <p className="text-sm text-gray-500">{aidmate.district}, {aidmate.state}</p>
                  <p className="text-sm text-yellow-600 font-bold">{aidmate.overallRating.toFixed(1)} / 5.0 Rating</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No verified AIDMATES found.</p>
      )}
    </div>
  );
};

export default AidmatesListPage;