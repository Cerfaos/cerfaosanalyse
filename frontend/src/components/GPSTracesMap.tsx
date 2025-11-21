import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import api from "../services/api";

interface GPSPoint {
  lat: number;
  lng: number;
}

interface ActivityTrace {
  id: number;
  type: string;
  date: string;
  distance: number;
  duration: number;
  points: GPSPoint[];
  color: string;
}

interface MapBoundsProps {
  traces: ActivityTrace[];
}

// Composant pour ajuster les limites de la carte
function MapBounds({ traces }: MapBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (traces.length === 0) return;

    const allPoints = traces.flatMap((t) => t.points);
    if (allPoints.length === 0) return;

    const bounds = allPoints.reduce(
      (acc, point) => ({
        minLat: Math.min(acc.minLat, point.lat),
        maxLat: Math.max(acc.maxLat, point.lat),
        minLng: Math.min(acc.minLng, point.lng),
        maxLng: Math.max(acc.maxLng, point.lng),
      }),
      { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }
    );

    map.fitBounds(
      [
        [bounds.minLat, bounds.minLng],
        [bounds.maxLat, bounds.maxLng],
      ],
      { padding: [50, 50] }
    );
  }, [traces, map]);

  return null;
}

const activityColors: Record<string, string> = {
  Cyclisme: "#3B82F6",
  Course: "#F97316",
  Marche: "#22C55E",
  Randonnée: "#A855F7",
  VTT: "#14B8A6",
  Natation: "#06B6D4",
  default: "#6B7280",
};

export default function GPSTracesMap() {
  const [traces, setTraces] = useState<ActivityTrace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "Cyclisme",
    "Course",
    "Marche",
    "Randonnée",
    "VTT",
  ]);
  const [limit, setLimit] = useState(-1);
  const [hoveredTrace, setHoveredTrace] = useState<number | null>(null);

  const [availableTypes, setAvailableTypes] = useState<string[]>([
    "Cyclisme",
    "Course",
    "Marche",
    "Randonnée",
    "VTT",
  ]);

  useEffect(() => {
    fetchTraces();
  }, [limit]); // Retirer selectedTypes des dépendances pour éviter boucle infinie

  const fetchTraces = async () => {
    try {
      setLoading(true);
      const limitParam = limit === -1 ? 3000 : limit;
      console.log(`🚀 Fetching traces with limit: ${limitParam}`);
      const response = await api.get(`/api/activities?limit=${limitParam}`);
      const activities = response.data.data.data || [];

      console.log(`📊 Total activités reçues: ${activities.length}`);

      // Extraire tous les types disponibles
      const types = Array.from(
        new Set(activities.map((a: any) => a.type))
      ) as string[];

      // Mettre à jour les types disponibles si de nouveaux sont trouvés
      setAvailableTypes((prev) => {
        const newTypes = types.filter((t) => !prev.includes(t));
        if (newTypes.length > 0) {
          return [...prev, ...newTypes];
        }
        return prev;
      });

      // Sélectionner automatiquement les nouveaux types
      setSelectedTypes((prev) => {
        const newTypes = types.filter((t) => !prev.includes(t));
        if (newTypes.length > 0) {
          return [...prev, ...newTypes];
        }
        return prev;
      });

      // Filtrer par type et utiliser les vraies données GPS
      const tracesData: ActivityTrace[] = activities
        .filter((a: any) => selectedTypes.includes(a.type))
        .map((activity: any) => {
          // Utiliser les vraies données GPS si disponibles
          let points: GPSPoint[] = [];
          // let hasRealGPS = false;

          if (activity.gpsData) {
            try {
              // Parser les données GPS (peuvent être string JSON ou objet)
              const gpsData =
                typeof activity.gpsData === "string"
                  ? JSON.parse(activity.gpsData)
                  : activity.gpsData;

              if (Array.isArray(gpsData) && gpsData.length > 0) {
                points = gpsData.map((point: any) => ({
                  lat: point.lat,
                  lng: point.lng || point.lon, // Supporter les deux formats: lng (standard) et lon (GPX)
                }));
                // hasRealGPS = true;
                console.log(
                  `✅ Activité ${activity.id} (${activity.type}): ${points.length} points GPS réels`
                );
              }
            } catch (e) {
              console.warn(
                `⚠️ Erreur parsing GPS pour activité ${activity.id}:`,
                e
              );
            }
          }

          // Fallback: simuler si pas de données GPS réelles
          if (points.length === 0) {
            points = generateSimulatedTrace(activity);
            if (points.length > 0) {
              console.log(
                `🔵 Activité ${activity.id} (${activity.type}): ${points.length} points GPS simulés`
              );
            }
          }

          return {
            id: activity.id,
            type: activity.type,
            date: activity.date,
            distance: activity.distance || 0,
            duration: activity.duration || 0,
            points,
            color: activityColors[activity.type] || activityColors.default,
          };
        })
        .filter((t: ActivityTrace) => t.points.length > 0);

      console.log(`🗺️ Traces affichées: ${tracesData.length}`);
      setTraces(tracesData);
    } catch (error) {
      console.error("Erreur lors du chargement des traces:", error);
    } finally {
      setLoading(false);
    }
  };

  // Simuler une trace GPS (en production, utiliser les vraies coordonnées)
  const generateSimulatedTrace = (activity: any): GPSPoint[] => {
    if (!activity.distance || activity.distance < 100) return [];

    // Centre approximatif (à remplacer par les vraies coordonnées)
    const baseLat = 48.8566 + (Math.random() - 0.5) * 0.1;
    const baseLng = 2.3522 + (Math.random() - 0.5) * 0.1;

    const numPoints = Math.min(
      50,
      Math.max(10, Math.floor(activity.distance / 500))
    );
    const points: GPSPoint[] = [];

    // Générer un parcours aléatoire mais cohérent
    let currentLat = baseLat;
    let currentLng = baseLng;
    const distancePerPoint = activity.distance / numPoints / 111000; // Conversion approximative en degrés

    for (let i = 0; i < numPoints; i++) {
      points.push({ lat: currentLat, lng: currentLng });

      // Direction aléatoire mais avec une tendance
      const angle = (Math.PI * 2 * i) / numPoints + (Math.random() - 0.5) * 0.5;
      currentLat += Math.sin(angle) * distancePerPoint * 0.8;
      currentLng += Math.cos(angle) * distancePerPoint * 1.2;
    }

    // Fermer la boucle pour certains types d'activités
    if (["Cyclisme", "Course", "Marche"].includes(activity.type)) {
      points.push(points[0]);
    }

    return points;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, "0")}`;
    }
    return `${minutes}min`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      const newTypes = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];

      // Re-filtrer les traces localement sans refaire l'appel API
      // Note: Cela nécessite que fetchTraces stocke toutes les activités brutes quelque part
      // Pour l'instant, on va simplement déclencher un re-render des traces filtrées
      // Mais comme fetchTraces dépendait de selectedTypes, on doit changer la logique
      return newTypes;
    });
  };

  // Effet pour mettre à jour les traces affichées quand selectedTypes change
  // sans refaire l'appel API (optimisation future possible)
  useEffect(() => {
    if (traces.length > 0) {
      fetchTraces();
    }
  }, [selectedTypes]);

  if (loading && traces.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        Chargement de la carte...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {availableTypes.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${
                selectedTypes.includes(type)
                  ? "text-white"
                  : "bg-bg-gray-100 dark:bg-dark-border text-text-secondary hover:bg-bg-gray-200"
              }`}
              style={{
                backgroundColor: selectedTypes.includes(type)
                  ? activityColors[type]
                  : undefined,
              }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activityColors[type] }}
              />
              {type}
            </button>
          ))}
        </div>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-3 py-1.5 rounded border border-border-base dark:border-dark-border bg-white dark:bg-dark-surface text-sm"
        >
          <option value={10}>10 dernières</option>
          <option value={20}>20 dernières</option>
          <option value={50}>50 dernières</option>
          <option value={100}>100 dernières</option>
          <option value={-1}>Tout afficher</option>
        </select>
      </div>

      {/* Carte */}
      <div className="relative h-[500px] rounded-xl overflow-hidden border border-border-base dark:border-dark-border">
        {traces.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-bg-gray-50 dark:bg-dark-bg">
            <div className="text-center text-text-muted">
              <p className="text-lg mb-2">Aucune trace GPS disponible</p>
              <p className="text-sm">
                Sélectionnez des types d'activités ou augmentez la limite
              </p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[48.8566, 2.3522]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapBounds traces={traces} />

            {traces.map((trace) => (
              <Polyline
                key={trace.id}
                positions={trace.points.map((p) => [p.lat, p.lng])}
                color={trace.color}
                weight={hoveredTrace === trace.id ? 5 : 3}
                opacity={
                  hoveredTrace === null || hoveredTrace === trace.id ? 0.8 : 0.3
                }
                eventHandlers={{
                  mouseover: () => setHoveredTrace(trace.id),
                  mouseout: () => setHoveredTrace(null),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">{trace.type}</div>
                    <div>{formatDate(trace.date)}</div>
                    <div>{(trace.distance / 1000).toFixed(1)} km</div>
                    <div>{formatDuration(trace.duration)}</div>
                  </div>
                </Popup>
              </Polyline>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-bg-gray-50 dark:bg-dark-border/50 rounded-lg">
          <div className="text-xs text-text-muted mb-1">
            Activités affichées
          </div>
          <div className="font-semibold text-lg">{traces.length}</div>
        </div>
        <div className="text-center p-3 bg-bg-gray-50 dark:bg-dark-border/50 rounded-lg">
          <div className="text-xs text-text-muted mb-1">Distance totale</div>
          <div className="font-semibold text-lg">
            {Math.round(traces.reduce((sum, t) => sum + t.distance, 0) / 1000)}{" "}
            km
          </div>
        </div>
        <div className="text-center p-3 bg-bg-gray-50 dark:bg-dark-border/50 rounded-lg">
          <div className="text-xs text-text-muted mb-1">Durée totale</div>
          <div className="font-semibold text-lg">
            {formatDuration(traces.reduce((sum, t) => sum + t.duration, 0))}
          </div>
        </div>
        <div className="text-center p-3 bg-bg-gray-50 dark:bg-dark-border/50 rounded-lg">
          <div className="text-xs text-text-muted mb-1">Types sélectionnés</div>
          <div className="font-semibold text-lg">{selectedTypes.length}</div>
        </div>
      </div>

      {/* Liste des traces */}
      {traces.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text-muted">
            Traces affichées
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {traces.slice(0, 10).map((trace) => (
              <div
                key={trace.id}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  hoveredTrace === trace.id
                    ? "border-brand bg-brand/5"
                    : "border-border-base dark:border-dark-border hover:border-brand/50"
                }`}
                onMouseEnter={() => setHoveredTrace(trace.id)}
                onMouseLeave={() => setHoveredTrace(null)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: trace.color }}
                  />
                  <span className="text-xs font-medium truncate">
                    {trace.type}
                  </span>
                </div>
                <div className="text-xs text-text-muted">
                  {formatDate(trace.date)} •{" "}
                  {(trace.distance / 1000).toFixed(1)} km
                </div>
              </div>
            ))}
            {traces.length > 10 && (
              <div className="p-2 rounded border border-border-base dark:border-dark-border flex items-center justify-center">
                <span className="text-xs text-text-muted">
                  +{traces.length - 10} autres
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
