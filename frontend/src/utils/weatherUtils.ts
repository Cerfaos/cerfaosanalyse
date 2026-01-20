/**
 * Fonctions utilitaires pour la météo
 */

export const getWindDirection = (degrees: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  clouds: number;
  visibility: number;
}

export const parseWeatherData = (weatherJson: string | null): WeatherData | null => {
  if (!weatherJson) return null;
  try {
    return JSON.parse(weatherJson) as WeatherData;
  } catch {
    return null;
  }
};
