import React from 'react';
import { PendingAidmate } from '../../types';
import Card from '../ui/Card';

interface PendingListPageProps {
  pendingAidmates: PendingAidmate[];
  onSelectPending: (aidmate: PendingAidmate) => void;
  onBack: () => void;
}

const PendingListPage: React.FC<PendingListPageProps> = ({ pendingAidmates, onSelectPending, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Pending Applications ({pendingAidmates.length})</h2>
      </div>

      {pendingAidmates.length > 0 ? (
        <div className="space-y-4">
          {pendingAidmates.map(aidmate => (
            <Card key={aidmate.id} onClick={() => onSelectPending(aidmate)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img src={aidmate.profilePictureUrl} alt={aidmate.name} className="h-16 w-16 rounded-full" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{aidmate.name}</h3>
                    <p className="text-sm text-gray-500">Mobile: {aidmate.mobile}</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Submitted:</p>
                    <p className="text-sm font-medium text-gray-700">{aidmate.submissionDate}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No pending applications.</p>
      )}
    </div>
  );
};

export default PendingListPage;
