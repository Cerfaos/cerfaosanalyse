import axios from 'axios'
import { DateTime } from 'luxon'
import env from '#start/env'

interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: number
  description: string
  icon: string
  clouds: number
  visibility: number
}

export default class WeatherService {
  private apiKey: string = env.get('OPENWEATHERMAP_API_KEY', '')
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5'

  /**
   * Récupérer les coordonnées à partir des données GPS
   */
  private getCoordinatesFromGPS(gpsData: string | null): { lat: number; lon: number } | null {
    if (!gpsData) return null

    try {
      const parsed = JSON.parse(gpsData)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Prendre le point GPS au milieu de l'activité
        const midPoint = parsed[Math.floor(parsed.length / 2)]
        if (midPoint.lat && midPoint.lng) {
          return { lat: midPoint.lat, lon: midPoint.lng }
        }
      }
    } catch (error) {
      console.error('Error parsing GPS data:', error)
    }

    return null
  }

  /**
   * Récupérer les coordonnées par défaut (France) si pas de GPS
   */
  private async getDefaultLocation(): Promise<{ lat: number; lon: number }> {
    // Coordonnées par défaut: Paris, France
    return { lat: 48.8566, lon: 2.3522 }
  }

  /**
   * Récupérer les données météo actuelles
   * Note: Avec la clé API gratuite OpenWeatherMap, seules les données actuelles sont disponibles.
   * Les données météo ne seront disponibles que pour les activités récentes (même jour).
   */
  async getCurrentWeather(
    gpsData: string | null,
    activityDate: DateTime
  ): Promise<WeatherData | null> {
    try {
      // Essayer d'obtenir les coordonnées depuis GPS
      let coordinates = this.getCoordinatesFromGPS(gpsData)

      // Si pas de GPS, utiliser les coordonnées par défaut
      if (!coordinates) {
        coordinates = await this.getDefaultLocation()
      }

      // Vérifier si la date est récente (moins de 1 jour)
      const now = DateTime.now()
      const hoursDiff = now.diff(activityDate, 'hours').hours

      // Seulement récupérer la météo pour les activités très récentes (même jour)
      // car l'API gratuite ne fournit que la météo actuelle
      if (hoursDiff < 24 && hoursDiff > -1) {
        const response = await axios.get(`${this.baseUrl}/weather`, {
          params: {
            lat: coordinates.lat,
            lon: coordinates.lon,
            appid: this.apiKey,
            units: 'metric',
            lang: 'fr',
          },
        })

        return this.formatWeatherData(response.data)
      } else {
        // Pour les dates plus anciennes, la météo n'est pas disponible avec l'API gratuite
        console.log(
          `Météo non disponible pour ${activityDate.toISODate()} (${Math.round(hoursDiff)} heures de différence) - API gratuite limitée aux données actuelles`
        )
        return null
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
      return null
    }
  }

  /**
   * Formater les données météo (API Current Weather)
   */
  private formatWeatherData(data: any): WeatherData {
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convertir m/s en km/h
      windDirection: data.wind.deg,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      clouds: data.clouds.all,
      visibility: data.visibility,
    }
  }

  /**
   * Obtenir l'icône météo URL
   */
  getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
  }

  /**
   * Créer des données météo manuelles à partir d'une condition
   */
  createManualWeather(
    condition: string,
    temperature?: number,
    windSpeed?: number,
    windDirection?: number
  ): WeatherData {
    const weatherMap: Record<
      string,
      { description: string; icon: string; clouds: number }
    > = {
      ensoleille: { description: 'ensoleillé', icon: '01d', clouds: 0 },
      'partiellement-nuageux': {
        description: 'partiellement nuageux',
        icon: '02d',
        clouds: 25,
      },
      nuageux: { description: 'nuageux', icon: '03d', clouds: 75 },
      couvert: { description: 'couvert', icon: '04d', clouds: 100 },
      pluie: { description: 'pluie', icon: '10d', clouds: 85 },
      'pluie-legere': { description: 'pluie légère', icon: '09d', clouds: 70 },
      orage: { description: 'orage', icon: '11d', clouds: 90 },
      neige: { description: 'neige', icon: '13d', clouds: 85 },
      brouillard: { description: 'brouillard', icon: '50d', clouds: 60 },
      vent: { description: 'venteux', icon: '01d', clouds: 20 },
    }

    const weather = weatherMap[condition] || weatherMap['ensoleille']

    return {
      temperature: temperature || 20,
      feelsLike: temperature || 20,
      humidity: 50,
      pressure: 1013,
      windSpeed: windSpeed !== undefined ? windSpeed : 10,
      windDirection: windDirection !== undefined ? windDirection : 0,
      description: weather.description,
      icon: weather.icon,
      clouds: weather.clouds,
      visibility: 10000,
    }
  }
}
