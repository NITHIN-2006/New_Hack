import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AidmateProfile, Deal, UserData } from '../../types';
import { MapPin, Navigation, Star, Wrench, ShieldCheck, X, Lock, CheckCircle2, PlusCircle } from 'lucide-react';

interface DiscoverMapProps {
  userData: UserData;
  verifiedAidmates: AidmateProfile[];
  jobBroadcasts: Deal[];
  previousAidmateIds?: string[];
  onRequestService?: (serviceName: string) => void;
  onContactDeal?: (deal: Deal) => void;
}

const DiscoverMap: React.FC<DiscoverMapProps> = ({
  userData,
  verifiedAidmates,
  jobBroadcasts,
  previousAidmateIds = ['aidmate-1', 'aidmate-2'],
  onRequestService,
  onContactDeal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [filter, setFilter] = useState<'all' | 'previous' | 'aidmates' | 'requests'>('all');
  const [selectedAidmate, setSelectedAidmate] = useState<AidmateProfile | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // User coordinate default (Visakhapatnam, Andhra Pradesh)
  const userLat = 17.6868;
  const userLng = 83.2185;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [userLat, userLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: true
    });

    // Pure OpenStreetMap (Zero API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // User location marker with radar pulse
    const userIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="custom-pulse-marker" style="background-color: #4F46E5; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(79,70,229,0.7); display: flex; align-items: center; justify-content: center;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: white;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<b>You are here</b><br/>${userData.name}`);

    // Create markers layer group
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLat, userLng, userData.name]);

  // Update markers when filter or data changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Add AidMate markers
    if (filter === 'all' || filter === 'aidmates' || filter === 'previous') {
      verifiedAidmates.forEach((aidmate, idx) => {
        const isPrev = previousAidmateIds.includes(aidmate.id);
        
        // Skip if filtering by previous only and this aidmate isn't one
        if (filter === 'previous' && !isPrev) return;

        const lat = aidmate.location?.lat ? (aidmate.location.lat > 16 && aidmate.location.lat < 19 ? aidmate.location.lat : userLat + (idx === 0 ? 0.008 : idx === 1 ? -0.007 : 0.005)) : userLat + 0.006;
        const lng = aidmate.location?.lng ? (aidmate.location.lng > 81 && aidmate.location.lng < 85 ? aidmate.location.lng : userLng + (idx === 0 ? 0.006 : idx === 1 ? -0.005 : -0.008)) : userLng + 0.006;

        const serviceCode = aidmate.services[0]?.toLowerCase().includes('plumb') ? 'P' :
                            aidmate.services[0]?.toLowerCase().includes('clean') ? 'C' :
                            aidmate.services[0]?.toLowerCase().includes('electr') ? 'E' : 'W';

        const bgColor = isPrev ? '#D97706' : '#10B981'; // Gold for previous, green for others

        const aidmateIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="background-color: ${bgColor}; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px ${isPrev ? 'rgba(217,119,6,0.5)' : 'rgba(16,185,129,0.4)'}; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer;">
              <span style="font-size: 13px; font-weight: 800; color: white;">${serviceCode}</span>
              ${isPrev ? '<div style="position: absolute; top: -3px; right: -3px; width: 14px; height: 14px; background: #FBBF24; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 900; color: #78350F;">P</div>' : ''}
              <div style="position: absolute; bottom: -5px; width: 8px; height: 8px; background-color: ${bgColor}; transform: rotate(45deg); border-right: 2px solid white; border-bottom: 2px solid white;"></div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });

        const marker = L.marker([lat, lng], { icon: aidmateIcon });
        marker.on('click', () => {
          setSelectedDeal(null);
          setSelectedAidmate(aidmate);
        });

        marker.bindPopup(`
          <div style="min-width: 150px;">
            ${isPrev ? '<span style="font-size: 10px; font-weight: bold; color: #D97706; text-transform: uppercase;">Previous AidMate</span>' : ''}
            <div style="font-weight: bold; color: #111827; font-size: 14px;">${aidmate.name}</div>
            <div style="color: #059669; font-size: 12px; font-weight: 600;">Rating: ${aidmate.overallRating} / 5.0 • ${aidmate.services[0] || 'AidMate'}</div>
            <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">Tap to view profile & history</div>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 2. Add Job Broadcast markers
    if (filter === 'all' || filter === 'requests') {
      jobBroadcasts.forEach((deal, idx) => {
        const lat = deal.seekerLocation?.lat || (userLat + (idx === 0 ? -0.006 : idx === 1 ? 0.009 : -0.009));
        const lng = deal.seekerLocation?.lng || (userLng + (idx === 0 ? 0.008 : idx === 1 ? -0.008 : 0.004));

        const requestIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="background-color: #4F46E5; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(79,70,229,0.4); display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer;">
              <span style="color: white; font-size: 12px; font-weight: 800;">₹</span>
              <div style="position: absolute; bottom: -5px; width: 8px; height: 8px; background-color: #4F46E5; transform: rotate(45deg); border-right: 2px solid white; border-bottom: 2px solid white;"></div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34]
        });

        const marker = L.marker([lat, lng], { icon: requestIcon });
        marker.on('click', () => {
          setSelectedAidmate(null);
          setSelectedDeal(deal);
        });

        marker.bindPopup(`
          <div style="min-width: 140px;">
            <div style="font-weight: bold; color: #111827; font-size: 14px;">${deal.service}</div>
            <div style="color: #4F46E5; font-size: 12px; font-weight: 700;">Offer: ₹${deal.offer || '500'}</div>
            <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">Tap to accept or view</div>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [filter, verifiedAidmates, jobBroadcasts, previousAidmateIds, userLat, userLng]);

  const handleRecenter = () => {
    if (!mapRef.current) return;
    mapRef.current.setView([userLat, userLng], 14, { animate: true });
  };

  const isCurrentAidmatePrevious = selectedAidmate ? previousAidmateIds.includes(selectedAidmate.id) : false;

  return (
    <div className="relative w-full h-[calc(100vh-140px)] rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Floating Controls & Filter Pill Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-gray-100 flex items-center gap-2">
            <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              OpenStreetMap (Zero API Keys)
            </span>
          </div>

          <button
            onClick={handleRecenter}
            className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-indigo-600 active:scale-95 transition-transform"
            title="Recenter Map"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-gray-100 w-fit flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => setFilter('previous')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === 'previous' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Previous AidMates ({previousAidmateIds.length})</span>
          </button>

          <button
            onClick={() => setFilter('aidmates')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
              filter === 'aidmates' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            All AidMates ({verifiedAidmates.length})
          </button>

          <button
            onClick={() => setFilter('requests')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
              filter === 'requests' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Requests ({jobBroadcasts.length})
          </button>
        </div>
      </div>

      {/* Bottom Floating Details Drawer for Selected AidMate */}
      {selectedAidmate && (
        <div className="absolute bottom-4 left-4 right-4 z-[1001] bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-200 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <img
                src={selectedAidmate.profilePictureUrl}
                alt={selectedAidmate.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-gray-900 text-base">
                    {selectedAidmate.name}
                  </h4>
                  {selectedAidmate.isVerified && <ShieldCheck className="w-4 h-4 text-green-600" />}
                </div>
                {isCurrentAidmatePrevious && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-600" />
                    Previous AidMate (Worked with you before)
                  </span>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-1">
                  <span className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                    {selectedAidmate.overallRating}
                  </span>
                  <span>•</span>
                  <span>{selectedAidmate.distance || '1.8 km away'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedAidmate(null)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Past job details if previous */}
          {isCurrentAidmatePrevious && selectedAidmate.jobs && selectedAidmate.jobs.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 mb-3 text-xs">
              <span className="font-extrabold text-amber-900 block mb-0.5">Past Completed Work for You:</span>
              <p className="text-amber-800 font-medium">{selectedAidmate.jobs[0].title} • {selectedAidmate.jobs[0].area} ({selectedAidmate.jobs[0].date})</p>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {selectedAidmate.services.map((srv, idx) => (
              <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-indigo-100">
                {srv}
              </span>
            ))}
          </div>

          {/* Locked Notice: No direct chat/call before acceptance */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 mb-3 flex items-start gap-2.5 text-xs text-gray-600">
            <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-800">Direct Chat & Calls are Locked</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                In AIDO, calling and chatting unlock only when an AidMate accepts your task request. Post a request below to get started!
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedAidmate(null)}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                const service = selectedAidmate.services[0] || 'Need assistance';
                setSelectedAidmate(null);
                if (onRequestService) onRequestService(service);
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Request Help for {selectedAidmate.services[0] || 'Job'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Details Drawer for Selected Job Broadcast */}
      {selectedDeal && (
        <div className="absolute bottom-4 left-4 right-4 z-[1001] bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wide bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-100">
                Task Broadcast
              </span>
              <h4 className="font-extrabold text-gray-900 text-lg mt-1">{selectedDeal.service}</h4>
              <p className="text-xs text-gray-500 font-medium flex items-center mt-0.5">
                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                {selectedDeal.location || 'Visakhapatnam'} • Requested by {selectedDeal.seekerName}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block font-medium">Bounty</span>
              <span className="text-xl font-black text-indigo-600">₹{selectedDeal.offer || '500'}</span>
            </div>
          </div>

          {selectedDeal.description && (
            <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl mb-3 border border-gray-100">
              {selectedDeal.description}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDeal(null)}
              className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-3 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (onContactDeal) onContactDeal(selectedDeal);
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              Accept & Start Job
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverMap;
