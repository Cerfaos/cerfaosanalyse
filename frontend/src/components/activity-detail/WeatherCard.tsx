import { GlassCard } from "../ui/GlassCard";
import { parseWeatherData, getWindDirection, getWeatherIconUrl } from "../../utils/weatherUtils";

interface WeatherCardProps {
  weatherJson: string | null;
}

export default function WeatherCard({ weatherJson }: WeatherCardProps) {
  const weather = parseWeatherData(weatherJson);

  if (!weather) return null;

  return (
    <GlassCard>
      <h3 className="text-lg font-display font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span>🌤️</span>
        Conditions météo
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Température */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <img
              src={getWeatherIconUrl(weather.icon)}
              alt={weather.description}
              className="w-10 h-10"
            />
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
              Température
            </p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {Math.round(weather.temperature)}°C
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Ressenti {Math.round(weather.feelsLike)}°C
            </p>
          </div>
        </div>

        {/* Vent */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">
            💨
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
              Vent
            </p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {weather.windSpeed} km/h
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              {getWindDirection(weather.windDirection)}
            </p>
          </div>
        </div>

        {/* Humidité */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-2xl">
            💧
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
              Humidité
            </p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {weather.humidity}%
            </p>
          </div>
        </div>

        {/* Pression */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl">
            🌡️
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
              Pression
            </p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {weather.pressure} hPa
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
        <p className="text-[var(--text-secondary)] text-center capitalize">
          {weather.description}
        </p>
      </div>
    </GlassCard>
  );
}
