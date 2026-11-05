import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, CheckCircle2, Phone, MessageCircle, AlertTriangle, Play, ShieldCheck } from 'lucide-react';
import { Deal } from '../../types';
import ReviewModal from '../reviews/ReviewModal';
import LiveMapTracker from './LiveMapTracker';

interface ActiveJobExecutionProps {
  job: Deal;
  role: 'seeker' | 'provider';
  onComplete: () => void;
  onRate?: (rating: number, feedback: string, fromRole: 'seeker' | 'provider', job: Deal) => void | Promise<void>;
  onChat?: () => void;
}

const ActiveJobExecution: React.FC<ActiveJobExecutionProps> = ({ job, role, onComplete, onRate, onChat }) => {
  const [status, setStatus] = useState<'navigating' | 'in-progress'>('navigating');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'in-progress') {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (val > 95) {
      setStatus('in-progress');
    }
  };

  const handleSliderEnd = () => {
    if (sliderValue <= 95) {
      setSliderValue(0);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // -------------------------------------------------------------
  // SEEKER VIEW
  // -------------------------------------------------------------
  if (role === 'seeker') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-[2000] flex flex-col font-sans overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative">
          <LiveMapTracker job={job} role="seeker" />
        </div>

        {/* Bottom Sheet */}
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-6 pt-6 pb-safe relative z-20">
           <div className="flex justify-between items-start mb-4">
              <div>
                 <h2 className="text-xl font-bold text-gray-900 mb-1">AidMate is on the way!</h2>
                 <p className="text-sm text-gray-500 font-medium">{job.service}</p>
              </div>
           </div>

           <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                 <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="font-bold text-indigo-600 text-lg">A</span>
                 </div>
                 <div>
                    <p className="font-bold text-gray-900">Your AidMate</p>
                    <div className="flex items-center text-xs text-green-600 font-bold mt-0.5">
                       <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </div>
                 </div>
              </div>
              <div className="flex space-x-2">
                 <a 
                   href={job.providerMobile ? `tel:${job.providerMobile}` : 'tel:9876543210'}
                   className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-100 hover:text-green-600 transition-colors"
                   title="Call AidMate"
                 >
                    <Phone className="w-4 h-4 text-green-600" />
                 </a>
                 <button 
                   onClick={onChat}
                   className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                   title="Chat with AidMate"
                 >
                    <MessageCircle className="w-4 h-4 text-indigo-600" />
                 </button>
              </div>
           </div>

           <button 
             onClick={() => setShowReview(true)}
             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-xl shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition-transform active:scale-95"
           >
             Mark Job as Finished & Review
           </button>
        </div>

        {showReview && (
          <ReviewModal
            role="seeker"
            targetName={job.providerName || "Your AidMate"}
            onClose={() => setShowReview(false)}
            onSubmit={async (rating, feedback) => {
              await onRate?.(rating, feedback, 'seeker', job);
              setShowReview(false);
              onComplete();
            }}
          />
        )}
        <style dangerouslySetInnerHTML={{__html: `
          .pb-safe { padding-bottom: env(safe-area-inset-bottom, 24px); }
        `}} />
      </div>
    );
  }

  // -------------------------------------------------------------
  // PROVIDER VIEW
  // -------------------------------------------------------------
  if (status === 'navigating') {
    return (
      <div className="fixed inset-0 bg-white z-[2000] flex flex-col font-sans">
        {/* Live Map Background */}
        <div className="flex-1 relative">
           <LiveMapTracker job={job} role="provider" />
           
           {/* Floating Directions Overlay */}
           <div className="absolute top-4 left-0 right-0 z-[1000] px-6 pointer-events-none">
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-4">
                 <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <Navigation className="w-5 h-5 text-indigo-600" />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900">Head to Requester</h3>
                    <p className="text-sm text-gray-500">1.2 km away • ~5 mins</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Sheet UI */}
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-6 pt-6 pb-safe relative z-20">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{job.service}</h2>
                 <p className="text-gray-500 flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location}</p>
              </div>
              <div className="text-right">
                 <p className="text-xs text-gray-500 uppercase font-bold">Offer</p>
                 <p className="text-xl font-bold text-indigo-600">₹{job.offer || '300'}</p>
              </div>
           </div>

           <div className="flex items-center space-x-4 mb-8">
              <a 
                href={job.seekerMobile ? `tel:${job.seekerMobile}` : 'tel:9876543210'}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl flex items-center justify-center transition-colors"
              >
                 <Phone className="w-5 h-5 mr-2 text-green-600" /> Call Seeker
              </a>
              <button 
                onClick={onChat}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl flex items-center justify-center transition-colors"
              >
                 <MessageCircle className="w-5 h-5 mr-2 text-indigo-600" /> Message
              </button>
           </div>

           <div className="relative h-16 bg-gray-100 rounded-full mb-4 flex items-center justify-center overflow-hidden border border-gray-200 shadow-inner">
              <span className="text-gray-500 font-bold tracking-wide relative z-0">Slide when arrived &rarr;</span>
              
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderValue} 
                onChange={handleSliderChange}
                onMouseUp={handleSliderEnd}
                onTouchEnd={handleSliderEnd}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              
              <div 
                className="absolute left-1 top-1 bottom-1 bg-indigo-600 rounded-full flex items-center justify-center z-10 transition-all duration-75 pointer-events-none shadow-md"
                style={{ width: `calc(${sliderValue}% + 3.5rem)`, minWidth: '3.5rem' }}
              >
                <div className="absolute right-3">
                  <Navigation className="w-6 h-6 text-white rotate-90" />
                </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-[2000] flex flex-col font-sans overflow-y-auto">
       <div className="bg-indigo-600 px-6 pt-12 pb-8 rounded-b-3xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
          <div className="relative z-10 text-center">
             <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Clock className="w-10 h-10 text-white" />
             </div>
             <p className="text-indigo-100 font-semibold mb-1 uppercase tracking-wider text-sm">Job In Progress</p>
             <h1 className="text-5xl font-mono font-bold text-white tracking-tight">{formatTime(elapsedSeconds)}</h1>
          </div>
       </div>

       <div className="p-6 flex-1 flex flex-col">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
             <h2 className="text-xl font-bold text-gray-900 mb-2">{job.service}</h2>
             <div className="flex items-center text-gray-500 mb-4 text-sm">
                <MapPin className="w-4 h-4 mr-1" /> {job.seekerName}'s Location
             </div>
             
             {job.description && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                   <h4 className="font-semibold text-gray-900 text-sm mb-1">Details</h4>
                   <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>
                </div>
             )}

             {job.imageUrl && (
                <div className="mb-4">
                   <img src={job.imageUrl} alt="Request" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                </div>
             )}

             <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-gray-500 font-semibold text-sm">Agreed Offer</span>
                <span className="text-2xl font-bold text-indigo-600">₹{job.offer || '300'}</span>
             </div>
          </div>

          <div className="mt-auto space-y-4">
             <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3 text-yellow-800">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">Please do not leave this screen until the job is completed. You cannot access other features right now.</p>
             </div>
             
             <button 
               onClick={() => setShowReview(true)}
               className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 rounded-xl shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition-transform active:scale-95 flex items-center justify-center"
             >
               <CheckCircle2 className="w-6 h-6 mr-2" />
               Mark as Completed
             </button>
          </div>
       </div>

       {showReview && (
         <ReviewModal
           role="provider"
           targetName={job.seekerName}
           onClose={() => setShowReview(false)}
           onSubmit={async (rating, feedback) => {
             await onRate?.(rating, feedback, 'provider', job);
             setShowReview(false);
             onComplete();
           }}
         />
       )}
       <style dangerouslySetInnerHTML={{__html: `
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 24px); }
      `}} />
    </div>
  );
};

export default ActiveJobExecution;
