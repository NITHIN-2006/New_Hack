import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Clock, IndianRupee, X, Image as ImageIcon, Map, Check, Sparkles } from 'lucide-react';
import { analyzeProblemImage } from '../../services/api';

interface CreateRequestModalProps {
  onClose: () => void;
  onSubmit: (service: string, offer: string, description?: string, imageUrl?: string) => void;
}

const NEIGHBORHOODS = [
  { name: 'Gajuwaka, Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'MVP Colony, Visakhapatnam', lat: 17.7423, lng: 83.3371 },
  { name: 'Siripuram, Visakhapatnam', lat: 17.7215, lng: 83.3155 },
  { name: 'Madhapur, Hyderabad', lat: 17.4483, lng: 78.3915 },
  { name: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
];

const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ onClose, onSubmit }) => {
  const [service, setService] = useState('');
  const [location, setLocation] = useState('Gajuwaka, Visakhapatnam');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({ lat: 17.6868, lng: 83.2185 });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [time, setTime] = useState('Now');
  const [offer, setOffer] = useState('');
  const [description, setDescription] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisError, setImageAnalysisError] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const imageAnalysisRequestRef = useRef(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageAnalysisError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageAnalysisError('Choose an image smaller than 5 MB.');
      return;
    }

    const requestId = ++imageAnalysisRequestRef.current;
    setImageAnalysisError('');
    setIsAnalyzingImage(true);
    setImageUrl('');
    setDescription(currentDescription => aiDescription
      ? currentDescription.replace(aiDescription, '').trim()
      : currentDescription);
    setAiDescription('');
    const reader = new FileReader();
    reader.onload = async () => {
      if (requestId !== imageAnalysisRequestRef.current) return;
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setImageUrl(dataUrl);
      if (!dataUrl) {
        setImageAnalysisError('Unable to read this image. Please try another file.');
        setIsAnalyzingImage(false);
        return;
      }

      try {
        const generatedDescription = await analyzeProblemImage({ imageDataUrl: dataUrl, service });
        if (requestId !== imageAnalysisRequestRef.current) return;
        setDescription(currentDescription => {
          const userDescription = aiDescription
            ? currentDescription.replace(aiDescription, '').trim()
            : currentDescription.trim();
          return [userDescription, generatedDescription].filter(Boolean).join('\n\n');
        });
        setAiDescription(generatedDescription);
      } catch (error) {
        if (requestId === imageAnalysisRequestRef.current) {
          setImageAnalysisError(error instanceof Error ? error.message : 'Unable to analyze this photo.');
        }
      } finally {
        if (requestId === imageAnalysisRequestRef.current) setIsAnalyzingImage(false);
      }
    };
    reader.onerror = () => {
      if (requestId !== imageAnalysisRequestRef.current) return;
      setImageAnalysisError('Unable to read this image. Please try another file.');
      setIsAnalyzingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImageAgain = async () => {
    if (!imageUrl) return;
    const requestId = ++imageAnalysisRequestRef.current;
    setIsAnalyzingImage(true);
    setImageAnalysisError('');
    try {
      const generatedDescription = await analyzeProblemImage({ imageDataUrl: imageUrl, service });
      if (requestId !== imageAnalysisRequestRef.current) return;
      setDescription(currentDescription => {
        const userDescription = aiDescription
          ? currentDescription.replace(aiDescription, '').trim()
          : currentDescription.trim();
        return [userDescription, generatedDescription].filter(Boolean).join('\n\n');
      });
      setAiDescription(generatedDescription);
    } catch (error) {
      if (requestId === imageAnalysisRequestRef.current) {
        setImageAnalysisError(error instanceof Error ? error.message : 'Unable to analyze this photo.');
      }
    } finally {
      if (requestId === imageAnalysisRequestRef.current) setIsAnalyzingImage(false);
    }
  };

  // Initialize mini Leaflet map picker when toggled
  useEffect(() => {
    if (!showMapPicker || !mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [selectedCoords.lat, selectedCoords.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="background-color: #4F46E5; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(79,70,229,0.5); display: flex; align-items: center; justify-content: center; position: relative;">
          <div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -5px; width: 8px; height: 8px; background-color: #4F46E5; transform: rotate(45deg); border-right: 2px solid white; border-bottom: 2px solid white;"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const marker = L.marker([selectedCoords.lat, selectedCoords.lng], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setSelectedCoords({ lat: pos.lat, lng: pos.lng });
      setLocation(`Pinned Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setSelectedCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      setLocation(`Selected on Map (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`);
    });

    markerRef.current = marker;
    mapRef.current = map;

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
  }, [showMapPicker]);

  const selectNeighborhood = (hood: typeof NEIGHBORHOODS[0]) => {
    setLocation(hood.name);
    setSelectedCoords({ lat: hood.lat, lng: hood.lng });
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([hood.lat, hood.lng]);
      mapRef.current.setView([hood.lat, hood.lng], 14, { animate: true });
    }
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setSelectedCoords({ lat: latitude, lng: longitude });
          setLocation(`My GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          if (mapRef.current && markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
            mapRef.current.setView([latitude, longitude], 15, { animate: true });
          }
        },
        () => {
          // Fallback
          setLocation('Visakhapatnam, Andhra Pradesh');
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (service && offer && !isAnalyzingImage) {
      onSubmit(service, offer, description, imageUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-end z-[1100] animate-in fade-in duration-200 sm:items-center sm:justify-center p-0 sm:p-4">
      <div className="bg-white w-full rounded-t-3xl sm:rounded-3xl sm:max-w-lg p-6 animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Post a Request</h2>
            <p className="text-xs text-gray-500">Notifies active AIDMATEs in your area</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">What needs to be done? *</label>
            <textarea 
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. Need someone to fix my leaking kitchen tap immediately."
              className="w-full border border-gray-200 rounded-2xl p-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm shadow-sm"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">Additional Details (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify tools needed, urgency, or any specific instructions..."
              className="w-full border border-gray-200 rounded-2xl p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm shadow-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">Attach Photo (Optional)</label>
            <div className="flex items-center border border-gray-200 rounded-2xl p-2 bg-gray-50 text-gray-600">
               <label className="flex items-center justify-center w-full py-2 cursor-pointer hover:bg-gray-100 rounded-xl transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                  <span className="text-sm font-semibold">{imageUrl ? 'Photo Attached (Tap to change)' : 'Upload Issue Photo'}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
               </label>
            </div>
            {imageUrl && (
              <div className="mt-2 relative">
                <img src={imageUrl} alt="Attachment preview" className="w-full h-28 object-cover rounded-xl border border-gray-200" />
                <button 
                  type="button" 
                  onClick={() => {
                    imageAnalysisRequestRef.current += 1;
                    setImageUrl('');
                    setImageAnalysisError('');
                    setIsAnalyzingImage(false);
                    setDescription(currentDescription => aiDescription
                      ? currentDescription.replace(aiDescription, '').trim()
                      : currentDescription);
                    setAiDescription('');
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {isAnalyzingImage && (
              <p className="mt-2 flex items-center gap-2 text-xs font-medium text-indigo-700" role="status">
                <Sparkles className="h-4 w-4 animate-pulse" />
                Gemini is analyzing the photo…
              </p>
            )}
            {imageAnalysisError && (
              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-red-700" role="alert">
                <span>{imageAnalysisError}</span>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => void handleAnalyzeImageAgain()}
                    disabled={isAnalyzingImage}
                    className="shrink-0 font-bold text-indigo-700 underline disabled:opacity-50"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Location with Leaflet OpenStreetMap Pinning */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-gray-800">Job Location *</label>
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Map className="w-3.5 h-3.5" />
                {showMapPicker ? 'Hide Leaflet Map' : 'Pick on Leaflet Map'}
              </button>
            </div>

            <div className="flex items-center border border-gray-200 rounded-2xl p-3 bg-gray-50 text-gray-600 focus-within:ring-2 focus-within:ring-indigo-500">
              <MapPin className="w-5 h-5 text-indigo-500 mr-2 shrink-0" />
              <input 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent w-full focus:outline-none text-gray-800 text-sm font-medium"
                required
              />
            </div>

            {/* Quick area chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {NEIGHBORHOODS.slice(0, 3).map((hood, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectNeighborhood(hood)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    location === hood.name
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {hood.name.split(',')[0]}
                </button>
              ))}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="text-[11px] px-2.5 py-1 rounded-lg border bg-indigo-50 text-indigo-700 border-indigo-100 font-bold hover:bg-indigo-100 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" /> Use GPS
              </button>
            </div>

            {/* Interactive Leaflet Map Picker */}
            {showMapPicker && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 shadow-sm animate-in fade-in duration-200">
                <div className="bg-gray-100 px-3 py-1.5 text-[11px] text-gray-600 flex justify-between items-center border-b border-gray-200">
                  <span className="font-semibold">Tap on the map or drag the pin to set location</span>
                  <span className="text-[10px] text-indigo-600 font-bold">OpenStreetMap</span>
                </div>
                <div ref={mapContainerRef} className="w-full h-44" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
             <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">When?</label>
                <div className="flex items-center border border-gray-200 rounded-2xl p-3 bg-gray-50 text-gray-600 text-sm font-medium">
                  <Clock className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                  <select 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent w-full focus:outline-none text-gray-800 appearance-none cursor-pointer"
                  >
                    <option>Now (Urgent)</option>
                    <option>Today, 5:00 PM</option>
                    <option>Tomorrow Morning</option>
                    <option>Weekend</option>
                  </select>
                </div>
             </div>

             <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">Your Offer (Bounty) *</label>
                <div className="flex items-center border border-gray-200 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-indigo-500 bg-white">
                  <IndianRupee className="w-4 h-4 text-indigo-600 mr-1 shrink-0" />
                  <input 
                    type="number"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    placeholder="500"
                    className="bg-transparent w-full focus:outline-none text-gray-900 font-extrabold text-base"
                    required
                  />
                </div>
             </div>
          </div>

          <button 
            type="submit"
            disabled={!service || !offer || isAnalyzingImage}
            className="w-full mt-2 bg-indigo-600 text-white font-extrabold text-base py-4 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_8px_20px_rgba(79,70,229,0.3)] active:scale-95"
          >
            Broadcast Request to Nearby AIDMATEs
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal;
