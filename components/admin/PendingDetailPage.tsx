
import React, { useState } from 'react';
import { PendingAidmate } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface PendingDetailPageProps {
  aidmate: PendingAidmate;
  onBack: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

const PendingDetailPage: React.FC<PendingDetailPageProps> = ({ aidmate, onBack, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  
  const handleRejectClick = () => {
    if (rejectionReason.trim()) {
      onReject(aidmate.id, rejectionReason);
    }
  };

  const DocumentViewer: React.FC<{title: string, url?: string}> = ({title, url}) => (
    <div className="p-3 bg-gray-50 border rounded-md">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        {url ? 
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">View Document</a>
            : <p className="text-xs text-gray-400">Not provided</p>
        }
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Review Application</h2>
      </div>

      <Card>
        <div className="flex items-start space-x-4">
          <img src={aidmate.profilePictureUrl} alt={aidmate.name} className="h-24 w-24 rounded-full" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900">{aidmate.name}</h3>
            <p className="text-gray-600"><strong>Mobile:</strong> {aidmate.mobile}</p>
            <p className="text-gray-600"><strong>Type:</strong> <span className="capitalize">{aidmate.providerType}</span></p>
            <p className="text-sm text-gray-500"><strong>Submitted:</strong> {aidmate.submissionDate}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Submitted Documents</h3>
        <div className="grid grid-cols-2 gap-4">
            <DocumentViewer title="Aadhaar (Front)" url={aidmate.documents.aadhaarFrontUrl} />
            <DocumentViewer title="Aadhaar (Back)" url={aidmate.documents.aadhaarBackUrl} />
            <DocumentViewer title="Live Selfie Video" url={aidmate.documents.selfieVideoUrl} />
            <DocumentViewer title="Certificate" url={aidmate.documents.certificateUrl} />
            <DocumentViewer title="Bank Passbook" url={aidmate.documents.bankPassbookUrl} />
        </div>
      </Card>

      {!isRejecting ? (
         <div className="flex gap-4">
          <Button onClick={() => onApprove(aidmate.id)} className="bg-green-600 hover:bg-green-700">Approve</Button>
          <Button onClick={() => setIsRejecting(true)} className="bg-red-600 hover:bg-red-700">Reject</Button>
        </div>
      ) : (
        <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Rejection Reason</h3>
            <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Provide a clear reason for rejection..."
            />
            <div className="flex gap-4 mt-4">
                <Button onClick={handleRejectClick} disabled={!rejectionReason.trim()} className="bg-red-600 hover:bg-red-700">Confirm Reject</Button>
                <Button onClick={() => setIsRejecting(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800">Cancel</Button>
            </div>
        </Card>
      )}
    </div>
  );
};

export default PendingDetailPage;
