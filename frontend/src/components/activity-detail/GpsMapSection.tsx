/**
 * Section carte GPS avec tracé de l'activité
 */

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import { GlassCard } from "../ui/GlassCard";
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
    <GlassCard
      className="animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: "550ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-2xl border border-[var(--accent-primary)]/20">
            📍
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-primary)] font-semibold">
              Parcours
            </p>
            <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
              Tracé GPS
            </h3>
          </div>
        </div>
        <span className="text-sm text-[var(--text-tertiary)] bg-[var(--surface-hover)] px-3 py-1 rounded-full">
          {gpsData.length} points
        </span>
      </div>

      <div className="h-96 rounded-xl overflow-hidden border-2 border-[var(--border-default)] hover:border-[var(--accent-primary)]/30 hover:shadow-[0_0_30px_rgba(248,113,47,0.15)] transition-all duration-300">
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

      <div className="flex items-center gap-2 mt-4 text-sm text-[var(--text-tertiary)]">
        <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
        Distance totale:{" "}
        <span className="font-semibold text-[var(--text-secondary)]">
          {formatDistance(activityDistance)}
        </span>
      </div>
    </GlassCard>
  );
}
