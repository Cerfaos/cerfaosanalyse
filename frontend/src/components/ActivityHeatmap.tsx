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
      const response = await api.get(`/api/activities?year=${selectedYear}&limit=1000`)
      const activities = response.data.data.activities || []

      // Grouper par date
      const grouped: Record<string, DayData> = {}

      activities.forEach((activity: any) => {
        const dateKey = activity.date.split('T')[0]
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
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  // Générer les semaines de l'année
  const weeks = useMemo(() => {
    const result: Array<Array<{ date: string; dayOfWeek: number }>> = []
    const startDate = new Date(selectedYear, 0, 1)
    const endDate = new Date(selectedYear, 11, 31)

    // Ajuster pour commencer un dimanche
    const firstSunday = new Date(startDate)
    firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay())

    let currentDate = new Date(firstSunday)
    let currentWeek: Array<{ date: string; dayOfWeek: number }> = []

    while (currentDate <= endDate || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayOfWeek = currentDate.getDay()

      if (currentDate.getFullYear() === selectedYear) {
        currentWeek.push({ date: dateStr, dayOfWeek })
      } else if (currentDate < startDate) {
        currentWeek.push({ date: '', dayOfWeek }) // Placeholder
      }

      if (dayOfWeek === 6) {
        // Samedi = fin de semaine
        result.push(currentWeek)
        currentWeek = []
      }

      currentDate.setDate(currentDate.getDate() + 1)

      if (currentDate > endDate && currentWeek.length === 0) break
    }

    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }

    return result
  }, [selectedYear])

  const getIntensityColor = (trimp: number) => {
    if (trimp === 0) return 'bg-gray-100 dark:bg-dark-border'
    if (trimp < 50) return 'bg-green-200 dark:bg-green-900/50'
    if (trimp < 100) return 'bg-green-400 dark:bg-green-700'
    if (trimp < 200) return 'bg-green-600 dark:bg-green-500'
    return 'bg-green-800 dark:bg-green-400'
  }

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

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
    return <div className="text-center py-8 text-text-muted">Chargement du calendrier...</div>
  }

  return (
    <div className="space-y-4">
      {/* Sélecteur d'année */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            className="p-2 hover:bg-bg-gray-100 dark:hover:bg-dark-border rounded"
          >
            ←
          </button>
          <span className="font-semibold text-lg">{selectedYear}</span>
          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            disabled={selectedYear >= new Date().getFullYear()}
            className="p-2 hover:bg-bg-gray-100 dark:hover:bg-dark-border rounded disabled:opacity-30"
          >
            →
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-text-muted">Activités:</span>{' '}
            <span className="font-semibold">{stats.totalActivities}</span>
          </div>
          <div>
            <span className="text-text-muted">Jours actifs:</span>{' '}
            <span className="font-semibold">{stats.activeDays}</span>
          </div>
          <div>
            <span className="text-text-muted">Max streak:</span>{' '}
            <span className="font-semibold">{stats.maxStreak} jours</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Mois */}
          <div className="flex mb-1 ml-8">
            {months.map((month) => (
              <div key={month} className="text-xs text-text-muted" style={{ width: `${100 / 12}%`, minWidth: '40px' }}>
                {month}
              </div>
            ))}
          </div>

          {/* Grille */}
          <div className="flex">
            {/* Jours de la semaine */}
            <div className="flex flex-col gap-[2px] mr-2 text-xs text-text-muted">
              {days.map((day, i) => (
                <div key={day} className="h-3 flex items-center">
                  {i % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Semaines */}
            <div className="flex gap-[2px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((day, dayIndex) => {
                    const dayData = day.date ? data[day.date] : null
                    const trimp = dayData?.trimp || 0

                    return (
                      <Tooltip
                        key={dayIndex}
                        content={
                          day.date ? (
                            <div>
                              <div className="font-medium">
                                {new Date(day.date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                })}
                              </div>
                              {dayData ? (
                                <>
                                  <div>{dayData.count} activité(s)</div>
                                  <div>TRIMP: {Math.round(trimp)}</div>
                                  <div>Distance: {Math.round(dayData.distance / 1000)} km</div>
                                </>
                              ) : (
                                <div>Pas d'activité</div>
                              )}
                            </div>
                          ) : (
                            ''
                          )
                        }
                        position="top"
                        delay={100}
                      >
                        <div
                          className={`w-3 h-3 rounded-sm ${day.date ? getIntensityColor(trimp) : 'bg-transparent'} hover:ring-1 hover:ring-text-dark/50 transition-all cursor-pointer`}
                        />
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center justify-end gap-2 text-xs text-text-muted">
        <span>Moins</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-dark-border" />
        <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/50" />
        <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
        <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
        <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-400" />
        <span>Plus</span>
      </div>
    </div>
  )
}
