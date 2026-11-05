import React, { useState, useRef, useEffect } from 'react';
import { AidmateProfile } from '../../types';
import Button from '../ui/Button';

interface PhotoUploadModalProps {
  provider: AidmateProfile;
  service: string;
  onClose: () => void;
  onSend: (photoFile: File | null) => Promise<void>;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ provider, service, onClose, onSend }) => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup the object URL to avoid memory leaks
    return () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    };
  }, [previewUrl]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSendWithPhoto = async () => {
    if (!photoFile) return;
    setIsSending(true);
    await onSend(photoFile);
  };

  const handleSkip = async () => {
    setIsSending(true);
    await onSend(null);
  };
  
  const triggerFileSelect = () => {
    if (!isSending) {
        fileInputRef.current?.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1002] p-4 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Add a Photo (Optional)</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200" disabled={isSending}>
             <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4 text-center">
            <p className="text-sm text-gray-600">
                A photo helps {provider.name.split(' ')[0]} understand the job better for <span className="font-semibold">{service}</span>.
            </p>
            <div 
                onClick={triggerFileSelect}
                className="mt-4 p-4 border-dashed border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors flex flex-col items-center justify-center h-48"
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                ) : (
                    <>
                        <UploadIcon />
                        <p className="text-indigo-600 font-medium mt-2">Tap to upload a photo</p>
                        <p className="text-xs text-gray-500">(e.g., a picture of the issue)</p>
                    </>
                )}
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            {photoFile && (
                <button onClick={triggerFileSelect} className="text-sm text-indigo-600 hover:underline">
                    Change photo
                </button>
            )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 space-y-3">
          <Button onClick={handleSendWithPhoto} disabled={!photoFile || isSending} isLoading={isSending && !!photoFile}>
            Send Request with Photo
          </Button>
           <button onClick={handleSkip} disabled={isSending} className="w-full text-center py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50">
            {isSending && !photoFile ? 'Sending...' : 'Skip & Send Request'}
          </button>
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

export default PhotoUploadModal;
