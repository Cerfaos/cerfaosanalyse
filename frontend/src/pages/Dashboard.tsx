import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

interface Stats {
  totalActivities: number
  totalDistance: number
  totalDuration: number
  totalTrimp: number
  averageDistance: number
  averageDuration: number
  averageHeartRate: number | null
  byType: { type: string; count: number; distance: number; duration: number }[]
}

interface GlobalStats {
  totalActivities: number
  totalDistance: number
  totalDuration: number
  totalElevation: number
  totalCalories: number
  averageHeartRate: number
  averageSpeed: number
  averageDistance: number
}

interface Activity {
  id: number
  date: string
  type: string
  duration: number
  distance: number
  avgHeartRate: number | null
  avgSpeed: number | null
  elevationGain: number | null
  calories: number | null
  trimp: number | null
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<'7' | '30' | '90' | '365'>('30')
  const [stats, setStats] = useState<Stats | null>(null)
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [period])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Charger les stats de la période sélectionnée
      const statsResponse = await api.get('/api/activities/stats', {
        params: { period }
      })
      setStats(statsResponse.data.data)

      // Charger les statistiques globales (toutes les activités)
      await loadGlobalStats()

      // Charger les 5 dernières activités
      const activitiesResponse = await api.get('/api/activities', {
        params: { limit: 5, page: 1 }
      })
      setRecentActivities(activitiesResponse.data.data.data)

      // Charger les données mensuelles pour le graphique (12 derniers mois)
      await loadMonthlyData()

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGlobalStats = async () => {
    try {
      // Charger toutes les activités pour calculer les stats globales
      const response = await api.get('/api/activities', {
        params: { limit: 10000, page: 1 }
      })
      const allActivities: Activity[] = response.data.data.data

      if (allActivities.length === 0) {
        setGlobalStats(null)
        return
      }

      // Calculer les statistiques globales
      const totalActivities = allActivities.length
      const totalDistance = allActivities.reduce((sum, a) => sum + a.distance, 0)
      const totalDuration = allActivities.reduce((sum, a) => sum + a.duration, 0)
      const totalElevation = allActivities.reduce((sum, a) => sum + (a.elevationGain || 0), 0)
      const totalCalories = allActivities.reduce((sum, a) => sum + (a.calories || 0), 0)

      // Calculer les moyennes (seulement sur les activités avec données)
      const activitiesWithHR = allActivities.filter(a => a.avgHeartRate)
      const averageHeartRate = activitiesWithHR.length > 0
        ? Math.round(activitiesWithHR.reduce((sum, a) => sum + (a.avgHeartRate || 0), 0) / activitiesWithHR.length)
        : 0

      const activitiesWithSpeed = allActivities.filter(a => a.avgSpeed)
      const averageSpeed = activitiesWithSpeed.length > 0
        ? activitiesWithSpeed.reduce((sum, a) => sum + (a.avgSpeed || 0), 0) / activitiesWithSpeed.length
        : 0

      const averageDistance = totalDistance / totalActivities

      setGlobalStats({
        totalActivities,
        totalDistance,
        totalDuration,
        totalElevation,
        totalCalories,
        averageHeartRate,
        averageSpeed,
        averageDistance
      })
    } catch (error) {
      console.error('Erreur lors du chargement des stats globales:', error)
    }
  }

  const loadMonthlyData = async () => {
    try {
      const response = await api.get('/api/activities', {
        params: { limit: 1000, page: 1 }
      })
      const activities = response.data.data.data

      // Grouper par mois
      const monthsMap = new Map<string, { distance: number; count: number; trimp: number }>()

      activities.forEach((activity: Activity) => {
        const date = new Date(activity.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, { distance: 0, count: 0, trimp: 0 })
        }

        const monthData = monthsMap.get(monthKey)!
        monthData.distance += activity.distance / 1000
        monthData.count += 1
        monthData.trimp += activity.trimp || 0
      })

      // Convertir en tableau et trier
      const monthlyArray = Array.from(monthsMap.entries())
        .map(([month, data]) => ({
          month,
          monthLabel: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          distance: Math.round(data.distance),
          count: data.count,
          trimp: Math.round(data.trimp)
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12) // Garder les 12 derniers mois

      setMonthlyData(monthlyArray)
    } catch (error) {
      console.error('Erreur lors du chargement des données mensuelles:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min`
  }

  const formatDistance = (meters: number) => {
    return `${(meters / 1000).toFixed(1)} km`
  }

  const getPeriodLabel = () => {
    switch (period) {
      case '7': return '7 derniers jours'
      case '30': return '30 derniers jours'
      case '90': return '90 derniers jours'
      case '365': return 'Cette année'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-center text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Bienvenue {user?.fullName || user?.email} ! Voici un aperçu de vos performances.
        </p>
      </div>

      {/* Statistiques globales */}
      {globalStats && globalStats.totalActivities > 0 && (
        <div className="mb-8 bg-linear-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Statistiques Globales (Toutes les activités)
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {/* Total sorties */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Total sorties</p>
              <p className="text-2xl font-bold">{globalStats.totalActivities}</p>
            </div>

            {/* Distance totale */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Distance totale</p>
              <p className="text-2xl font-bold">{formatDistance(globalStats.totalDistance)}</p>
            </div>

            {/* Temps passé */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Temps passé</p>
              <p className="text-2xl font-bold">
                {Math.floor(globalStats.totalDuration / 3600)}h{Math.floor((globalStats.totalDuration % 3600) / 60)}
              </p>
            </div>

            {/* Vitesse moyenne */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Vitesse moyenne</p>
              <p className="text-2xl font-bold">
                {globalStats.averageSpeed > 0 ? `${globalStats.averageSpeed.toFixed(1)} km/h` : '-'}
              </p>
            </div>

            {/* Dénivelé positif */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Dénivelé +</p>
              <p className="text-2xl font-bold">
                {globalStats.totalElevation > 0 ? `${Math.round(globalStats.totalElevation)} m` : '-'}
              </p>
            </div>

            {/* Calories estimées */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Calories</p>
              <p className="text-2xl font-bold">
                {globalStats.totalCalories > 0 ? Math.round(globalStats.totalCalories).toLocaleString() : '-'}
              </p>
            </div>

            {/* FC moyenne */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">FC moyenne</p>
              <p className="text-2xl font-bold">
                {globalStats.averageHeartRate > 0 ? `${globalStats.averageHeartRate} bpm` : '-'}
              </p>
            </div>

            {/* Moyenne distance/sortie */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Moy/sortie</p>
              <p className="text-2xl font-bold">{formatDistance(globalStats.averageDistance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Séparateur avec titre */}
      {globalStats && globalStats.totalActivities > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques par période</h2>
        </div>
      )}

      {/* Sélecteur de période */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setPeriod('7')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === '7'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          7 jours
        </button>
        <button
          onClick={() => setPeriod('30')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === '30'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          30 jours
        </button>
        <button
          onClick={() => setPeriod('90')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === '90'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          90 jours
        </button>
        <button
          onClick={() => setPeriod('365')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            period === '365'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Année
        </button>
      </div>

      {stats && stats.totalActivities > 0 ? (
        <>
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Activités</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalActivities}</p>
              <p className="text-sm text-gray-500 mt-1">{getPeriodLabel()}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Distance</h3>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatDistance(stats.totalDistance)}</p>
              <p className="text-sm text-gray-500 mt-1">Moy: {formatDistance(stats.averageDistance)}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Temps total</h3>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
              <p className="text-sm text-gray-500 mt-1">Moy: {formatDuration(stats.averageDuration)}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">TRIMP Total</h3>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTrimp}</p>
              {stats.averageHeartRate && (
                <p className="text-sm text-gray-500 mt-1">FC moy: {stats.averageHeartRate} bpm</p>
              )}
            </div>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Graphique distance mensuelle */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution distance (12 mois)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthLabel" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`${value} km`, 'Distance']}
                    labelFormatter={(label) => `Mois: ${label}`}
                  />
                  <Line type="monotone" dataKey="distance" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique nombre d'activités */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nombre d'activités (12 mois)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthLabel" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`${value}`, 'Activités']}
                    labelFormatter={(label) => `Mois: ${label}`}
                  />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Répartition par type */}
          {stats.byType && stats.byType.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Répartition par type d'activité ({getPeriodLabel()})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.byType.map((typeData) => {
                  // Définir l'icône et la couleur selon le type
                  let icon = '🏃'
                  let bgColor = 'bg-blue-50'
                  let borderColor = 'border-blue-200'
                  let textColor = 'text-blue-700'

                  if (typeData.type === 'Cyclisme') {
                    icon = '🚴'
                    bgColor = 'bg-green-50'
                    borderColor = 'border-green-200'
                    textColor = 'text-green-700'
                  } else if (typeData.type === 'Course') {
                    icon = '🏃'
                    bgColor = 'bg-orange-50'
                    borderColor = 'border-orange-200'
                    textColor = 'text-orange-700'
                  } else if (typeData.type === 'Rameur') {
                    icon = '🚣'
                    bgColor = 'bg-purple-50'
                    borderColor = 'border-purple-200'
                    textColor = 'text-purple-700'
                  } else if (typeData.type === 'Marche') {
                    icon = '🚶'
                    bgColor = 'bg-yellow-50'
                    borderColor = 'border-yellow-200'
                    textColor = 'text-yellow-700'
                  }

                  // Calculer les moyennes
                  const avgDistance = typeData.distance / typeData.count
                  const avgDuration = typeData.duration / typeData.count

                  return (
                    <div
                      key={typeData.type}
                      className={`${bgColor} border-2 ${borderColor} rounded-lg p-5 transition-all hover:shadow-md`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{icon}</span>
                        <h4 className={`font-bold text-lg ${textColor}`}>{typeData.type}</h4>
                      </div>

                      <div className="space-y-2">
                        {/* Nombre d'activités */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Sorties</span>
                          <span className={`font-bold ${textColor}`}>{typeData.count}</span>
                        </div>

                        {/* Distance totale */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Distance totale</span>
                          <span className="font-semibold text-gray-900">
                            {formatDistance(typeData.distance)}
                          </span>
                        </div>

                        {/* Distance moyenne */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Distance moy.</span>
                          <span className="font-medium text-gray-700">
                            {formatDistance(avgDistance)}
                          </span>
                        </div>

                        {/* Temps total */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Temps total</span>
                          <span className="font-semibold text-gray-900">
                            {formatDuration(typeData.duration)}
                          </span>
                        </div>

                        {/* Temps moyen */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Temps moy.</span>
                          <span className="font-medium text-gray-700">
                            {formatDuration(avgDuration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dernières activités */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Dernières activités</h3>
              <button
                onClick={() => navigate('/activities')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir tout →
              </button>
            </div>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => navigate(`/activities/${activity.id}`)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'Cyclisme' ? 'bg-green-100' :
                        activity.type === 'Course' ? 'bg-orange-100' :
                        activity.type === 'Rameur' ? 'bg-purple-100' :
                        activity.type === 'Marche' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <span className="text-lg">
                          {activity.type === 'Cyclisme' ? '🚴' :
                           activity.type === 'Course' ? '🏃' :
                           activity.type === 'Rameur' ? '🚣' :
                           activity.type === 'Marche' ? '🚶' :
                           '🏃'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.type}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatDistance(activity.distance)}</p>
                      <p className="text-sm text-gray-500">{formatDuration(activity.duration)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Aucune activité récente</p>
              )}
            </div>
          </div>
        </>
      ) : (
        // État vide
        <div className="bg-white p-12 rounded-lg shadow border border-gray-200 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune activité pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par importer vos fichiers FIT, GPX ou CSV pour analyser vos performances.
            </p>
            <button
              onClick={() => navigate('/activities')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Importer une activité
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
