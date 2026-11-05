import React from 'react';
import { AidmateProfile } from '../../types';
import VerifiedBadge from '../ui/VerifiedBadge';
import { Star, MapPin, Wrench, ShieldCheck, Clock, CheckCircle2, Lock, X, User } from 'lucide-react';

interface ProviderProfileModalProps {
  provider: AidmateProfile;
  isPreviousAidmate?: boolean;
  onClose: () => void;
  onRequestService?: (serviceName: string) => void;
}

const ProviderProfileModal: React.FC<ProviderProfileModalProps> = ({
  provider,
  isPreviousAidmate = false,
  onClose,
  onRequestService
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2200] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-gray-900">AidMate Profile</h2>
            {isPreviousAidmate && (
              <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                Previous AidMate
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
             <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Top Profile Card */}
          <div className="flex items-start gap-4">
            <img 
              src={provider.profilePictureUrl} 
              alt={provider.name} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-md" 
            />
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-1.5">
                {provider.name}
                {provider.isVerified && <VerifiedBadge className="h-5 w-5" />}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center text-amber-500 font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 mr-0.5" />
                  {provider.overallRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">({provider.reviewCount} reviews)</span>
              </div>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                {provider.district}, {provider.state} • {provider.distance || '2 km away'}
              </p>
            </div>
          </div>

          {/* Previous Work History Badge (if previous aidmate) */}
          {isPreviousAidmate && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                You previously hired this AidMate
              </div>
              <p className="text-xs text-amber-900">
                {provider.name} successfully completed tasks for you in your area. They have an established track record with you!
              </p>
              {provider.jobs && provider.jobs.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                  <span className="text-amber-800 font-semibold truncate">
                    Last job: {provider.jobs[0].title}
                  </span>
                  <span className="text-amber-600 font-bold shrink-0">{provider.jobs[0].date}</span>
                </div>
              )}
            </div>
          )}

          {/* Bio */}
          {provider.bio && (
            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
              <p className="text-xs text-gray-700 italic leading-relaxed">"{provider.bio}"</p>
            </div>
          )}

          {/* Services & Skills */}
          <div>
            <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">Offered Services & Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {provider.services.map(service => (
                <span key={service} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">
                  {service}
                </span>
              ))}
              {provider.skills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          {/* Rating Breakdown */}
          <div>
            <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">Rating Breakdown</h4>
            <div className="grid grid-cols-5 gap-1.5 text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
              {([5, 4, 3, 2, 1] as const).map(star => (
                <div key={star} className="p-1">
                  <p className="text-base font-black text-gray-800">{provider.ratings[star]}</p>
                  <p className="text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-0.5">
                    {star} <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Lock Banner */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-gray-600">
            <Lock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-800">Direct Chat & Calls are Locked</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                In AIDO, to protect community privacy, you cannot manually pick or DM workers. Post a request for help — direct chat and calling will activate as soon as an AidMate accepts!
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex gap-2">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              if (onRequestService) {
                onRequestService(provider.services[0] || 'Need assistance');
              }
            }}
            className="flex-1 py-3 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-95"
          >
            Post Request for {provider.services[0] || 'Help'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileModal;