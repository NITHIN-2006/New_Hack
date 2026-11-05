import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Deal } from '../../types';
import { Navigation, MapPin } from 'lucide-react';

interface LiveMapTrackerProps {
  job: Deal;
  role: 'seeker' | 'provider';
}

const LiveMapTracker: React.FC<LiveMapTrackerProps> = ({ job, role }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const providerMarkerRef = useRef<L.Marker | null>(null);
  const seekerMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const initialProviderLat = job.providerLocation?.lat || job.seekerLocation.lat - 0.009;
  const initialProviderLng = job.providerLocation?.lng || job.seekerLocation.lng - 0.009;

  const [providerLat, setProviderLat] = useState(initialProviderLat);
  const [providerLng, setProviderLng] = useState(initialProviderLng);
  const [distanceKm, setDistanceKm] = useState<string>('1.2');
  const [etaMinutes, setEtaMinutes] = useState<number>(4);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    });

    // Pure Open-Source OpenStreetMap tiles (Zero API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Seeker Custom Leaflet Marker
    const seekerIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="background-color: #4F46E5; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(79,70,229,0.4); display: flex; align-items: center; justify-content: center; position: relative;">
          <span style="color: white; font-size: 14px; font-weight: bold;">S</span>
          <div style="position: absolute; bottom: -6px; width: 10px; height: 10px; background-color: #4F46E5; transform: rotate(45deg); border-right: 2px solid white; border-bottom: 2px solid white;"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    });

    // Provider Custom Leaflet Marker (with pulse)
    const providerIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="custom-pulse-marker" style="background-color: #10B981; width: 38px; height: 38px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center; position: relative;">
          <span style="color: white; font-size: 14px; font-weight: bold;">P</span>
          <div style="position: absolute; bottom: -6px; width: 10px; height: 10px; background-color: #10B981; transform: rotate(45deg); border-right: 2px solid white; border-bottom: 2px solid white;"></div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38]
    });

    const seekerLatLng = L.latLng(job.seekerLocation.lat, job.seekerLocation.lng);
    const providerLatLng = L.latLng(initialProviderLat, initialProviderLng);

    const sMarker = L.marker(seekerLatLng, { icon: seekerIcon })
      .addTo(map)
      .bindPopup(`<b>${job.seekerName}</b><br/>${job.service}<br/><i>${job.location}</i>`);

    const pMarker = L.marker(providerLatLng, { icon: providerIcon })
      .addTo(map)
      .bindPopup(`<b>AidMate</b><br/>En route`);

    const polyline = L.polyline([providerLatLng, seekerLatLng], {
      color: '#4F46E5',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.85
    }).addTo(map);

    seekerMarkerRef.current = sMarker;
    providerMarkerRef.current = pMarker;
    polylineRef.current = polyline;
    mapRef.current = map;

    // Fit both markers inside view
    map.fitBounds(L.latLngBounds([seekerLatLng, providerLatLng]).pad(0.35));

    // Invalidate size to guarantee smooth rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [job.seekerLocation, job.seekerName, job.service, job.location]);

  // Simulate movement towards seeker
  useEffect(() => {
    const interval = setInterval(() => {
      setProviderLat(prevLat => {
        const diffLat = job.seekerLocation.lat - prevLat;
        return prevLat + diffLat * 0.08;
      });
      setProviderLng(prevLng => {
        const diffLng = job.seekerLocation.lng - prevLng;
        return prevLng + diffLng * 0.08;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [job.seekerLocation]);

  // Update Leaflet marker and polyline coordinates smoothly
  useEffect(() => {
    if (!mapRef.current || !providerMarkerRef.current || !polylineRef.current) return;

    const newProviderLatLng = L.latLng(providerLat, providerLng);
    const seekerLatLng = L.latLng(job.seekerLocation.lat, job.seekerLocation.lng);

    providerMarkerRef.current.setLatLng(newProviderLatLng);
    polylineRef.current.setLatLngs([newProviderLatLng, seekerLatLng]);

    const distMeters = newProviderLatLng.distanceTo(seekerLatLng);
    const km = (distMeters / 1000).toFixed(1);
    setDistanceKm(km);
    setEtaMinutes(Math.max(1, Math.round(Number(km) * 3)));
  }, [providerLat, providerLng, job.seekerLocation]);

  const handleRecenter = () => {
    if (!mapRef.current) return;
    const sLatLng = L.latLng(job.seekerLocation.lat, job.seekerLocation.lng);
    const pLatLng = L.latLng(providerLat, providerLng);
    mapRef.current.fitBounds(L.latLngBounds([sLatLng, pLatLng]).pad(0.35));
  };

  return (
    <div className="w-full h-full relative z-0 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />

      {/* Top Floating ETA & Status Card */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-gray-100 pointer-events-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                Live OpenStreetMap
              </span>
              <span className="text-xs text-gray-400 font-medium">{distanceKm} km away</span>
            </div>
            <div className="text-sm font-extrabold text-gray-900 mt-0.5">
              Estimated arrival: ~{etaMinutes} min
            </div>
          </div>
        </div>

        {/* Recenter button */}
        <button
          onClick={handleRecenter}
          className="bg-white/95 backdrop-blur-md w-11 h-11 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-indigo-600 pointer-events-auto transition-transform active:scale-95"
          title="Recenter Map"
        >
          <MapPin className="w-5 h-5" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-gray-100 flex items-center gap-3 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-[#4F46E5] border border-white shadow-sm flex items-center justify-center text-[8px] text-white font-bold">
            S
          </div>
          <span className="text-gray-700">Seeker</span>
        </div>
        <div className="w-px h-3 bg-gray-200"></div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-[#10B981] border border-white shadow-sm flex items-center justify-center text-[8px] text-white font-bold">
            P
          </div>
          <span className="text-gray-700">AidMate</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMapTracker;
