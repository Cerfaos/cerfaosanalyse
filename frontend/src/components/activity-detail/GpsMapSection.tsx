/**
 * Section carte GPS avec tracé de l'activité — Style A Glass
 */

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import type { GpsPoint } from "../../types/activity";

interface GpsMapSectionProps {
  gpsData: GpsPoint[];
  formatDistance: (m: number) => string;
  activityDistance: number;
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
      });
    }
  }, [positions, map]);

  return null;
}

export default function GpsMapSection({
  gpsData,
  formatDistance,
  activityDistance,
}: GpsMapSectionProps) {
  return (
    <div
      className="relative rounded-2xl border border-white/[0.08] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15,21,32,0.85) 0%, rgba(15,21,32,0.65) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748b]">
            Tracé GPS
          </span>
        </div>
        <span className="text-xs font-bold text-[#475569] bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
          {gpsData.length} points
        </span>
      </div>

      {/* Map sans bordure interne */}
      <div className="h-80">
        <MapContainer
          center={[gpsData[0].lat, gpsData[0].lon]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds positions={gpsData.map((point) => [point.lat, point.lon])} />
          <Polyline
            positions={gpsData.map((point) => [point.lat, point.lon])}
            color="#000000"
            weight={8}
            opacity={0.3}
          />
          <Polyline
            positions={gpsData.map((point) => [point.lat, point.lon])}
            color="#f8712f"
            weight={5}
            opacity={0.9}
          />
        </MapContainer>
      </div>

      {/* Footer */}
      <div className="relative px-6 py-3">
        {/* Gradient line top */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/20 to-transparent" />
        <div className="flex items-center gap-2 text-xs text-[#475569]">
          <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
          Distance totale :{" "}
          <span className="font-bold text-white font-mono">
            {formatDistance(activityDistance)}
          </span>
        </div>
      </div>
    </div>
  );
}
