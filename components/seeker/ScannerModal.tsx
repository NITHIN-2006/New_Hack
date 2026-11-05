import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import { Wrench } from 'lucide-react';

interface ScannerModalProps {
  onClose: () => void;
  onScan: (service: string, photoFile: File | null) => Promise<void>;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onClose, onScan }) => {
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [scanPhase, setScanPhase] = useState<'input' | 'radar' | 'live'>('input');
  const [scanStep, setScanStep] = useState(0); 
  const [totalNotified, setTotalNotified] = useState(12);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
      let rejectInterval: NodeJS.Timeout;
      if (scanPhase === 'live') {
          rejectInterval = setInterval(() => {
              setRejectedCount(prev => {
                  const newCount = prev + 1;
                  if (newCount >= totalNotified) {
                      setTotalNotified(t => t + Math.floor(Math.random() * 5) + 1);
                  }
                  return newCount;
              });
          }, 1200);
      }
      return () => {
          if (rejectInterval) clearInterval(rejectInterval);
      };
  }, [scanPhase, totalNotified]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerScan = (currentAmount: string) => {
    setScanPhase('radar');
    setScanStep(0);
    
    const baseService = `[₹${currentAmount.trim()}] ${service.trim()}`;
    const finalService = description.trim() ? `${baseService} - ${description.trim()}` : baseService;

    // Simulate radar scanning animation before broadcasting
    let i = 0;
    const interval = setInterval(() => {
        i++;
        setScanStep(i);
        if (i > 3) {
            clearInterval(interval);
            onScan(finalService, photoFile).then(() => {
                setScanPhase('live');
                setTotalNotified(Math.floor(Math.random() * 10) + 15);
                setRejectedCount(0);
                setShowDetails(false);
                setTipAmount(0);
            });
        }
    }, 800);
  };

  const handleStartScan = async () => {
    if (!service.trim() || !amount.trim()) return;
    triggerScan(amount);
  };

  const handleAddTip = (amt: number) => {
      const newTotal = (Number(amount) || 0) + amt;
      const newTotalStr = newTotal.toString();
      setAmount(newTotalStr);
      setTipAmount(amt);
      triggerScan(newTotalStr);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1001] p-4 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col transform transition-all duration-300 animate-scale-in">
        
        {scanPhase === 'radar' && (
            <div className="p-10 flex flex-col items-center justify-center space-y-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-200 opacity-20"></div>
                    <div className={`absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin`}></div>
                    <div className="absolute inset-4 rounded-full bg-indigo-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-indigo-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800">Scanning for AIDMATEs...</h3>
                    <p className="text-gray-500 mt-2">
                        {scanStep === 0 && 'Initializing radar...'}
                        {scanStep === 1 && 'Locating nearby providers...'}
                        {scanStep === 2 && 'Checking availability...'}
                        {scanStep >= 3 && 'Broadcasting request!'}
                    </p>
                </div>
            </div>
        )}

        {scanPhase === 'live' && (
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {rejectedCount} of {totalNotified} AIDMATEs declined
                    </h2>
                </div>

                <div className="w-full bg-blue-100 rounded-full h-4 mb-8 overflow-hidden relative">
                    <div 
                        className="absolute inset-0 bg-blue-600 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(100, Math.max(0, (rejectedCount / totalNotified) * 100))}%` }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1.5rem_1.5rem] animate-progress"></div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-2xl p-4 mb-6 bg-white shadow-sm">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                                <Wrench className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Service Details <span className="text-green-600 font-bold ml-1">₹{amount}</span></p>
                                <p className="font-bold text-gray-900 truncate max-w-[150px]">{service || "General Help"}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowDetails(!showDetails)}
                            className="px-4 py-2 border border-gray-300 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                            {showDetails ? 'Hide' : 'Details'}
                        </button>
                    </div>
                    
                    {showDetails && (
                        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-700 space-y-2 animate-scale-in">
                            <p><strong>Service:</strong> {service}</p>
                            <p><strong>Current Offer:</strong> ₹{amount}</p>
                            {description && <p><strong>Description:</strong> {description}</p>}
                            {previewUrl && (
                                <div className="mt-3">
                                    <p className="font-medium mb-1">Attached Photo:</p>
                                    <img src={previewUrl} alt="Service" className="h-24 rounded-lg border border-gray-200 object-cover" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <p className="font-bold text-gray-900 leading-tight">Increase your chances by adding extra</p>
                    </div>
                    <div className="flex gap-2 justify-between">
                        {[10, 20, 30, 40].map(amt => (
                            <button 
                                key={amt}
                                onClick={() => handleAddTip(amt)}
                                className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all ${tipAmount === amt ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 shadow-sm'}`}
                            >
                                + ₹{amt}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                    <button onClick={onClose} className="text-red-500 font-medium text-sm hover:text-red-700 px-4 py-2 rounded-full hover:bg-red-50 transition-colors">
                        Cancel Request
                    </button>
                </div>
            </div>
        )}

        {scanPhase === 'input' && (
            <>
            <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-xl">
                <h2 className="text-lg font-bold">Find Help (Scanner)</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-indigo-700">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What do you need help with?</label>
                    <input 
                        type="text" 
                        value={service} 
                        onChange={e => setService(e.target.value)} 
                        placeholder="e.g. Plumbing, Errands, Gardening..." 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-3"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offered Amount (₹)</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder="e.g. 500" 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-3"
                        min="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="Add any additional details..." 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-3 resize-none"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Add a Photo (Optional)</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 border-dashed border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors flex flex-col items-center justify-center h-32"
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="text-indigo-600 font-medium mt-1 text-sm">Tap to upload</p>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
                <Button onClick={handleStartScan} disabled={!service.trim() || !amount.trim()} className="w-full">
                    Start Scanning Nearby
                </Button>
                <p className="text-xs text-center text-gray-500 mt-3">This will notify all active AIDMATEs in your area.</p>
            </div>
            </>
        )}
      </div> 
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
        @keyframes progress-stripes {
            from { background-position: 1.5rem 0; }
            to { background-position: 0 0; }
        }
        .animate-progress {
            animation: progress-stripes 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ScannerModal;
