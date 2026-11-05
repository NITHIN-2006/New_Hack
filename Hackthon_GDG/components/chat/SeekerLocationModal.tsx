import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface SeekerLocationModalProps {
  seekerLocation: { lat: number; lng: number };
  providerLocation: { lat: number; lng: number };
  onClose: () => void;
}

const SeekerLocationModal: React.FC<SeekerLocationModalProps> = ({ seekerLocation, providerLocation, onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up any existing map instance on this element
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const seekerLatLng = L.latLng(seekerLocation.lat, seekerLocation.lng);
    const providerLatLng = L.latLng(providerLocation.lat, providerLocation.lng);
    
    // Initialize Leaflet map
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true
    });
    
    // OpenStreetMap free tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Icons using Leaflet divIcon
    const seekerIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full shadow-lg border-2 border-white text-white font-bold text-xs">
          S
          <div class="absolute -bottom-1 w-2 h-2 bg-blue-600 rotate-45"></div>
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const providerIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full shadow-lg border-2 border-white text-white font-bold text-xs custom-pulse-marker">
          P
          <div class="absolute -bottom-1 w-2 h-2 bg-indigo-600 rotate-45"></div>
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    // Add markers and polyline
    L.marker(seekerLatLng, { icon: seekerIcon }).addTo(map).bindPopup("<strong>Seeker's Location</strong><br/>Pickup / Job Point");
    L.marker(providerLatLng, { icon: providerIcon }).addTo(map).bindPopup("<strong>Your Location</strong><br/>AidMate Current Position");
    
    const latlngs = [seekerLatLng, providerLatLng];
    const polyline = L.polyline(latlngs, {
      color: '#4F46E5',
      weight: 4,
      opacity: 0.8,
      dashArray: '6, 8'
    }).addTo(map);
    
    map.fitBounds(polyline.getBounds().pad(0.25));

    // Calculate distance
    const distInMeters = seekerLatLng.distanceTo(providerLatLng);
    const distInKm = (distInMeters / 1000).toFixed(2);
    setDistance(`${distInKm} km`);

    mapInstance.current = map;

    // Trigger size invalidation to avoid grey map tiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [seekerLocation, providerLocation]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1002] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[75vh] flex flex-col overflow-hidden border border-gray-100">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
              <span>OpenStreetMap Location</span>
            </h2>
            <p className="text-xs text-gray-500">Powered by Leaflet Open-Source Maps</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
             <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>
        
        <div className="relative flex-grow w-full h-full">
          {distance && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-semibold z-[1000] border border-gray-100 flex items-center gap-2">
              <span className="text-gray-500 text-xs uppercase tracking-wide">Distance:</span>
              <span className="font-extrabold text-indigo-600">{distance}</span>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full"></div>
        </div>
      </div>
    </div>
  );
};

export default SeekerLocationModal;