import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { WardLookupResult, Language } from '../types/civic';
import { translations } from '../i18n/translations';
import { MapPin, Navigation, Info } from 'lucide-react';

interface WardMapProps {
  areaName: string;
  wardResult: WardLookupResult | null;
  lang: Language;
  onSelectArea?: (area: string) => void;
}

// Area coordinates mapping for Ahmedabad demo zones
export const AREA_COORDINATES: Record<string, { lat: number; lng: number; ward: string; zone: string }> = {
  Navrangpura: { lat: 23.0365, lng: 72.5611, ward: 'W12', zone: 'West' },
  Stadium: { lat: 23.0421, lng: 72.5654, ward: 'W12', zone: 'West' },
  'CG Road': { lat: 23.0312, lng: 72.5583, ward: 'W12', zone: 'West' },
  Maninagar: { lat: 22.9982, lng: 72.5991, ward: 'W27', zone: 'South' },
  Kankaria: { lat: 23.0062, lng: 72.6025, ward: 'W27', zone: 'South' },
  'Jawahar Chowk': { lat: 22.9945, lng: 72.5948, ward: 'W27', zone: 'South' },
};

// Ward centers for jurisdiction visualization
const WARD_BOUNDARIES: Record<string, { center: [number, number]; radius: number; color: string; label: string }> = {
  W12: {
    center: [23.0365, 72.5611],
    radius: 1400,
    color: '#0d9488', // teal-600
    label: 'Ward W12 — Navrangpura (West Zone)',
  },
  W27: {
    center: [22.9982, 72.5991],
    radius: 1400,
    color: '#ea580c', // orange-600
    label: 'Ward W27 — Maninagar (South Zone)',
  },
};

export const WardMap: React.FC<WardMapProps> = ({
  areaName,
  wardResult,
  lang,
  onSelectArea,
}) => {
  const t = translations[lang];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const wardCircleRef = useRef<L.Circle | null>(null);

  // Normalize area lookup
  const getCoordinates = (name: string) => {
    const norm = (name || '').trim().toLowerCase();
    for (const [key, val] of Object.entries(AREA_COORDINATES)) {
      if (key.toLowerCase() === norm || norm.includes(key.toLowerCase()) || key.toLowerCase().includes(norm)) {
        return { ...val, matchedKey: key };
      }
    }
    // Default fallback to Navrangpura if not matched
    return null;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCoord = getCoordinates(areaName) || { lat: 23.0365, lng: 72.5611, ward: 'W12', zone: 'West' };

    const map = L.map(mapContainerRef.current, {
      center: [initialCoord.lat, initialCoord.lng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    // Clean OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors • AMC Mock Jurisdiction',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center, marker, and ward circle on area or ward changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const coords = getCoordinates(areaName);
    const targetWardId = wardResult?.wardId || coords?.ward || 'W12';

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Remove existing ward jurisdiction circle
    if (wardCircleRef.current) {
      wardCircleRef.current.remove();
      wardCircleRef.current = null;
    }

    // If valid area coordinates exist
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 14, { duration: 0.8 });

      // Custom pulse pin HTML
      const pinColor = targetWardId === 'W12' ? '#0f766e' : '#ea580c';
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background-color: ${pinColor}; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; font-family: monospace; white-space: nowrap; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 1px solid white;">
              📍 ${coords.matchedKey || areaName}
            </div>
            <div style="width: 14px; height: 14px; background-color: ${pinColor}; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-top: 2px;"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: rgba(15,118,110,0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; position: absolute; bottom: 0;"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #0f172a; font-size: 13px;">${coords.matchedKey || areaName}</strong><br/>
          <span style="color: #0f766e; font-weight: 600;">Ward ${coords.ward} (${coords.zone} Zone)</span><br/>
          <span style="color: #64748b; font-size: 11px;">Ahmedabad Municipal Corporation Mock Jurisdiction</span>
        </div>
      `);
      markerRef.current = marker;
    }

    // Draw Ward boundary representation
    if (WARD_BOUNDARIES[targetWardId]) {
      const wardInfo = WARD_BOUNDARIES[targetWardId];
      const circle = L.circle(wardInfo.center, {
        radius: wardInfo.radius,
        color: wardInfo.color,
        fillColor: wardInfo.color,
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6, 6',
      }).addTo(map);

      circle.bindTooltip(wardInfo.label, {
        permanent: false,
        direction: 'top',
        className: 'ward-tooltip',
      });

      wardCircleRef.current = circle;
    }
  }, [areaName, wardResult]);

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
      {/* Map Header */}
      <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-teal-700" />
          <span className="font-bold text-slate-800">
            Interactive Ward Jurisdiction Map
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
            OpenStreetMap Leaflet
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
            <span>Ward W12 (West)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span>
            <span>Ward W27 (South)</span>
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-56 sm:h-64 z-10"
        style={{ minHeight: '220px' }}
      />

      {/* Footer Info & Quick Jump */}
      <div className="px-4 py-2 bg-white border-t border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-slate-500">
          <Info className="w-3 h-3 text-teal-700" />
          Click any supported area below to focus on the map:
        </span>

        {onSelectArea && (
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.keys(AREA_COORDINATES).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onSelectArea(key)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  areaName.toLowerCase() === key.toLowerCase()
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
