import { parseWeatherData, getWindDirection, getWeatherIconUrl } from "../../utils/weatherUtils";

interface WeatherCardProps {
  weatherJson: string | null;
  avgTemperature?: number | null;
  maxTemperature?: number | null;
}

// Icônes SVG inline pour chaque métrique
function WindIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5c-3.04 0-5.5-2.24-5.5-5 0-3.08 3.76-8.5 5.5-11 1.74 2.5 5.5 7.92 5.5 11 0 2.76-2.46 5-5.5 5z" />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5" />
    </svg>
  );
}

function ThermometerIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
    </svg>
  );
}

export default function WeatherCard({ weatherJson, avgTemperature, maxTemperature }: WeatherCardProps) {
  const weather = parseWeatherData(weatherJson);

  if (!weather && !avgTemperature) return null;

  // Cas : uniquement température capteur
  if (!weather) {
    return (
      <div className="rounded-xl border border-white/[0.06] overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(15,21,32,0.8) 0%, rgba(12,16,23,0.9) 100%)" }}>
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <ThermometerIcon />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">Température capteur</p>
              <p className="text-2xl font-black font-mono tabular-nums text-cyan-400 leading-none mt-0.5">
                {avgTemperature}°C
              </p>
            </div>
            {maxTemperature && (
              <span className="ml-auto text-xs font-mono font-bold text-[#475569] bg-white/[0.04] px-2.5 py-1 rounded-lg">
                Max {maxTemperature}°C
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(15,21,32,0.8) 0%, rgba(12,16,23,0.9) 100%)" }}>
      {/* Zone principale : icône + température */}
      <div className="flex items-center gap-4 px-5 pt-5 pb-4">
        <div className="relative flex-shrink-0">
          <img
            src={getWeatherIconUrl(weather.icon)}
            alt={weather.description}
            className="w-14 h-14 drop-shadow-[0_2px_8px_rgba(248,113,47,0.2)]"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tabular-nums text-white leading-none">
              {Math.round(weather.temperature)}°
            </span>
            <span className="text-sm font-mono text-[#475569]">
              ressenti {Math.round(weather.feelsLike)}°
            </span>
          </div>
          <p className="text-xs text-[#64748b] capitalize mt-1 truncate">
            {weather.description}
          </p>
        </div>
      </div>

      {/* Séparateur */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Grille de métriques avec icônes */}
      <div className="p-5 pt-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Vent */}
          <MetricCell
            icon={<WindIcon />}
            iconColor="text-blue-400"
            iconBg="bg-blue-500/10"
            label="Vent"
            value={`${weather.windSpeed} km/h`}
            sub={getWindDirection(weather.windDirection)}
          />

          {/* Humidité */}
          <MetricCell
            icon={<DropletIcon />}
            iconColor="text-sky-400"
            iconBg="bg-sky-500/10"
            label="Humidité"
            value={`${weather.humidity}%`}
          />

          {/* Pression */}
          <MetricCell
            icon={<GaugeIcon />}
            iconColor="text-violet-400"
            iconBg="bg-violet-500/10"
            label="Pression"
            value={`${weather.pressure} hPa`}
          />

          {/* Capteur ou espace vide */}
          {avgTemperature ? (
            <MetricCell
              icon={<ThermometerIcon />}
              iconColor="text-cyan-400"
              iconBg="bg-cyan-500/10"
              label="Capteur"
              value={`${avgTemperature}°C`}
              sub={maxTemperature ? `Max ${maxTemperature}°C` : undefined}
              valueColor="text-cyan-400"
            />
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCell({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  sub,
  valueColor = "text-white",
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#475569] leading-none">
          {label}
        </p>
        <p className={`text-sm font-bold font-mono leading-tight mt-0.5 ${valueColor}`}>
          {value}
        </p>
        {sub && (
          <p className="text-[10px] text-[#475569] leading-none mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}
