import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import Tooltip from './ui/Tooltip'

interface DayData {
  date: string
  count: number
  trimp: number
  distance: number
  activities: Array<{ id: number; type: string; trimp: number }>
}

interface ActivityHeatmapProps {
  year?: number
}

export default function ActivityHeatmap({ year = new Date().getFullYear() }: ActivityHeatmapProps) {
  const [data, setData] = useState<Record<string, DayData>>({})
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(year)

  useEffect(() => {
    fetchData()
  }, [selectedYear])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Filtrer par année en utilisant startDate et endDate
      const startDate = `${selectedYear}-01-01`
      const endDate = `${selectedYear}-12-31`
      const response = await api.get('/api/activities', {
        params: {
          startDate,
          endDate,
          limit: 1000,
          page: 1
        }
      })
      const activities = response.data.data.data || []

      // Grouper par date
      const grouped: Record<string, DayData> = {}

      activities.forEach((activity: any) => {
        const dateKey = activity.date.split('T')[0]
        // Debug: vérifier le format des dates
        if (activities.length > 0 && activities.indexOf(activity) === 0) {
        }
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            date: dateKey,
            count: 0,
            trimp: 0,
            distance: 0,
            activities: [],
          }
        }
        grouped[dateKey].count++
        grouped[dateKey].trimp += activity.trimp || 0
        grouped[dateKey].distance += activity.distance || 0
        grouped[dateKey].activities.push({
          id: activity.id,
          type: activity.type,
          trimp: activity.trimp || 0,
        })
      })

      setData(grouped)
    } catch (error) {
      // Silencieux
    } finally {
      setLoading(false)
    }
  }

  // Générer les mois de l'année
  const months = useMemo(() => {
    const result: Array<{
      name: string
      monthIndex: number
      weeks: Array<Array<{ date: string; dayOfMonth: number } | null>>
    }> = []

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const firstDay = new Date(selectedYear, monthIndex, 1)
      const lastDay = new Date(selectedYear, monthIndex + 1, 0)
      const monthName = firstDay.toLocaleDateString('fr-FR', { month: 'long' })

      const weeks: Array<Array<{ date: string; dayOfMonth: number } | null>> = []
      let currentWeek: Array<{ date: string; dayOfMonth: number } | null> = []

      // Remplir les jours vides au début du mois (avant le premier jour)
      // getDay() retourne: 0=Dimanche, 1=Lundi, 2=Mardi... 6=Samedi
      // Notre grille commence par Dimanche (index 0)
      const firstDayOfWeek = firstDay.getDay() // 0=Dim, 1=Lun, etc.
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null)
      }

      // Ajouter tous les jours du mois
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(selectedYear, monthIndex, day)
        // Utiliser un format local pour éviter les problèmes de fuseau horaire
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const dayStr = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${dayStr}`
        currentWeek.push({ date: dateStr, dayOfMonth: day })

        // Si on est samedi (6) ou à la fin du mois, on termine la semaine
        if (date.getDay() === 6 || day === lastDay.getDate()) {
          // Compléter la semaine avec des cases vides si nécessaire
          while (currentWeek.length < 7) {
            currentWeek.push(null)
          }
          weeks.push(currentWeek)
          currentWeek = []
        }
      }

      result.push({ name: monthName, monthIndex, weeks })
    }

    return result
  }, [selectedYear])

  const getIntensityColor = (trimp: number, hasActivity: boolean) => {
    // Pas d'activité = gris sombre
    if (!hasActivity) return 'bg-[var(--surface-input)] border-[var(--text-disabled)]'

    // Activité présente mais TRIMP = 0 (pas de données cardio) = bleu
    if (trimp === 0) return 'bg-[var(--chart-zone1)] border-[var(--chart-zone1)]/70'

    // Gradient basé sur l'intensité TRIMP
    if (trimp < 30) return 'bg-[#448AFF] border-[#448AFF]/70' // Recovery - Bleu
    if (trimp < 70) return 'bg-brand-secondary border-brand-secondary/70' // Endurance - Cyan
    if (trimp < 120) return 'bg-brand-primary border-brand-primary/70' // Tempo - Vert
    if (trimp < 180) return 'bg-metric-energy border-metric-energy/70' // Threshold - Orange
    if (trimp < 250) return 'bg-metric-alert border-metric-alert/70' // Anaerobic - Rouge
    return 'bg-[#FF1744] border-[#FF1744]/70' // Max effort - Rouge vif
  }

  const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  // Calculer les stats
  const stats = useMemo(() => {
    const values = Object.values(data)
    const totalActivities = values.reduce((sum, d) => sum + d.count, 0)
    const totalTrimp = values.reduce((sum, d) => sum + d.trimp, 0)
    const totalDistance = values.reduce((sum, d) => sum + d.distance, 0)
    const activeDays = values.length
    const maxStreak = calculateMaxStreak(Object.keys(data).sort())

    return { totalActivities, totalTrimp, totalDistance, activeDays, maxStreak }
  }, [data])

  function calculateMaxStreak(dates: string[]): number {
    if (dates.length === 0) return 0

    let maxStreak = 1
    let currentStreak = 1

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

      if (diffDays === 1) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }

    return maxStreak
  }

  if (loading) {
    return <div className="text-center py-8 text-[var(--text-tertiary)]">Chargement du calendrier...</div>
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur d'année et stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[var(--text-primary)]"
            title="Année précédente"
          >
            ←
          </button>
          <span className="text-2xl font-bold text-[var(--text-primary)]">{selectedYear}</span>
          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[var(--text-primary)]"
            title="Année suivante"
          >
            →
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-tertiary)]">Activités:</span>
            <span className="font-bold text-lg text-brand-primary">{stats.totalActivities}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-tertiary)]">Jours actifs:</span>
            <span className="font-bold text-lg text-brand-secondary">{stats.activeDays}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-tertiary)]">Série max:</span>
            <span className="font-bold text-lg text-metric-energy">{stats.maxStreak} jours</span>
          </div>
        </div>
      </div>

      {/* Grille des mois */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map((month) => (
          <div key={month.monthIndex} className="bg-surface-deep/60 rounded-xl p-4 border border-[var(--brand-primary)]/20">
            {/* Nom du mois */}
            <h4 className="text-sm font-bold uppercase tracking-wide text-[var(--text-primary)] mb-3 text-center">
              {month.name}
            </h4>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayLabels.map((day) => (
                <div key={day} className="text-xs text-center font-medium text-[var(--text-tertiary)]">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille des jours */}
            <div className="space-y-1">
              {month.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return <div key={dayIndex} className="aspect-square" />
                    }

                    const dayData = data[day.date]
                    const trimp = dayData?.trimp || 0
                    const hasActivity = dayData && dayData.count > 0

                    return (
                      <Tooltip
                        key={day.date}
                        content={
                          <div className="space-y-1">
                            <div className="font-bold text-sm">
                              {new Date(day.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              })}
                            </div>
                            {dayData ? (
                              <div className="space-y-0.5 text-xs">
                                <div className="font-semibold text-[var(--brand-primary)]">
                                  {dayData.count} activité{dayData.count > 1 ? 's' : ''}
                                </div>
                                <div>Distance: {Math.round(dayData.distance / 1000)} km</div>
                                <div>TRIMP: {Math.round(trimp)}</div>
                                {dayData.activities.map((act, i) => (
                                  <div key={i} className="text-[10px] opacity-75">
                                    • {act.type}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs opacity-75">Pas d'activité</div>
                            )}
                          </div>
                        }
                        position="top"
                        delay={150}
                      >
                        <div
                          className={`
                            aspect-square rounded-md border-2 transition-all cursor-pointer
                            flex items-center justify-center text-sm font-semibold
                            ${getIntensityColor(trimp, hasActivity)}
                            ${hasActivity
                              ? 'hover:scale-110 hover:shadow-lg hover:border-[var(--brand-primary)] hover:z-10'
                              : 'hover:border-[var(--text-disabled)]'
                            }
                          `}
                        >
                          <span className="text-[var(--text-primary)]">
                            {day.dayOfMonth}
                          </span>
                        </div>
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Légende améliorée et compacte */}
      <div className="flex flex-col items-center justify-center gap-2 text-sm px-4">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-[var(--text-tertiary)] text-xs font-medium">Légende :</span>

          {/* Repos */}
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded border-2 bg-[var(--surface-input)] border-[var(--text-disabled)]" />
            <span className="text-[var(--text-tertiary)] text-xs">Repos</span>
          </div>

          {/* Sans cardio */}
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded border-2 bg-[var(--chart-zone1)] border-[var(--chart-zone1)]/70" />
            <span className="text-[var(--text-tertiary)] text-xs">Sans FC</span>
          </div>

          {/* Gradient d'intensité */}
          <span className="text-[var(--text-tertiary)] text-xs">•</span>
          <div className="flex items-center gap-0.5">
            <div className="w-4 h-4 rounded border bg-[#448AFF] border-[#448AFF]/70" title="TRIMP < 30 - Recovery" />
            <div className="w-4 h-4 rounded border bg-brand-secondary border-brand-secondary/70" title="TRIMP 30-70 - Endurance" />
            <div className="w-4 h-4 rounded border bg-brand-primary border-brand-primary/70" title="TRIMP 70-120 - Tempo" />
            <div className="w-4 h-4 rounded border bg-metric-energy border-metric-energy/70" title="TRIMP 120-180 - Threshold" />
            <div className="w-4 h-4 rounded border bg-metric-alert border-metric-alert/70" title="TRIMP 180-250 - Anaerobic" />
            <div className="w-4 h-4 rounded border bg-[#FF1744] border-[#FF1744]/70" title="TRIMP > 250 - Max" />
          </div>
          <span className="text-[var(--text-tertiary)] text-xs">Intensité TRIMP</span>
        </div>
      </div>
    </div>
  )
}
