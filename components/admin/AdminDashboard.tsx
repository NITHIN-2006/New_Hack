import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PendingListPage from './PendingListPage';
import PendingDetailPage from './PendingDetailPage';
import AidmatesListPage from './AidmatesListPage';
import AidmateDetailPage from './AidmateDetailPage';
import { PendingAidmate, AidmateProfile } from '../../types';

type AdminView = 'dashboard' | 'pending-list' | 'pending-detail' | 'aidmates-list' | 'aidmate-detail';

interface AdminDashboardProps {
  pendingAidmates: PendingAidmate[];
  verifiedAidmates: AidmateProfile[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onLogout: () => void;
}

const PendingIcon = () => (
  <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const VerifiedIcon = () => (
  <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ pendingAidmates, verifiedAidmates, onApprove, onReject, onLogout }) => {
  const [view, setView] = useState<AdminView>('dashboard');
  const [selectedPending, setSelectedPending] = useState<PendingAidmate | null>(null);
  const [selectedAidmate, setSelectedAidmate] = useState<AidmateProfile | null>(null);

  const handleSelectPending = (aidmate: PendingAidmate) => {
    setSelectedPending(aidmate);
    setView('pending-detail');
  };

  const handleSelectAidmate = (aidmate: AidmateProfile) => {
    setSelectedAidmate(aidmate);
    setView('aidmate-detail');
  };
  
  const handleApproveAndGoBack = (id: string) => {
    onApprove(id);
    setView('pending-list');
  };

  const handleRejectAndGoBack = (id: string, reason: string) => {
    onReject(id, reason);
    setView('pending-list');
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-8 max-w-md mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
            </div>
            <div className="space-y-4">
              <Card onClick={() => setView('pending-list')} className="!p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-5xl font-bold text-indigo-600">{pendingAidmates.length}</p>
                        <p className="mt-2 text-md text-gray-700">Pending Applications</p>
                    </div>
                    <div className="bg-indigo-100 p-4 rounded-full">
                        <PendingIcon />
                    </div>
                </div>
              </Card>
              <Card onClick={() => setView('aidmates-list')} className="!p-6">
                 <div className="flex justify-between items-center">
                    <div>
                        <p className="text-5xl font-bold text-green-600">{verifiedAidmates.length}</p>
                        <p className="mt-2 text-md text-gray-700">Verified AIDMATES</p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-full">
                        <VerifiedIcon />
                    </div>
                </div>
              </Card>
            </div>
            <div className="pt-4">
              <Button onClick={onLogout}>Logout</Button>
            </div>
          </div>
        );
      case 'pending-list':
        return <PendingListPage pendingAidmates={pendingAidmates} onSelectPending={handleSelectPending} onBack={() => setView('dashboard')} />;
      case 'pending-detail':
        return selectedPending && <PendingDetailPage aidmate={selectedPending} onBack={() => setView('pending-list')} onApprove={handleApproveAndGoBack} onReject={handleRejectAndGoBack} />;
      case 'aidmates-list':
        return <AidmatesListPage aidmates={verifiedAidmates} onSelectAidmate={handleSelectAidmate} onBack={() => setView('dashboard')} />;
      case 'aidmate-detail':
        return selectedAidmate && <AidmateDetailPage aidmate={selectedAidmate} onBack={() => setView('aidmates-list')} />;
      default:
        return null;
    }
  };

  return <div>{renderContent()}</div>;
};

export default AdminDashboard;