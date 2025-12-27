import { Bike, Dumbbell, Edit2, Trash2, Star, PlayCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card } from '../ui/Card'
import { SessionGraph } from './SessionGraph'
import type { TrainingSession } from '../../types/training'
import {
  LEVEL_LABELS,
  percentFtpToWatts,
} from '../../types/training'

interface SessionCardProps {
  session: TrainingSession
  ftp: number
  weight?: number
  onEdit?: (session: TrainingSession) => void
  onDelete?: (id: number) => void
  onSaveAsTemplate?: (session: TrainingSession) => void
  onPlay?: (session: TrainingSession) => void
  compact?: boolean
}

/**
 * Formate une durée en minutes vers un format lisible
 */
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`
}

/**
 * Carte d'affichage d'une séance d'entraînement
 */
export function SessionCard({
  session,
  ftp,
  weight: _weight = 75,
  onEdit,
  onDelete,
  onSaveAsTemplate,
  onPlay,
  compact = false,
}: SessionCardProps) {
  void _weight // Unused but kept for API compatibility
  const CategoryIcon = session.category === 'cycling' ? Bike : Dumbbell
  // Utilise les couleurs du thème: primary (#8BC34A) pour cycling, secondary (#5CE1E6) pour PPG
  const categoryColor = session.category === 'cycling' ? '#8BC34A' : '#5CE1E6'

  // Version compacte pour le calendrier
  if (compact) {
    return (
      <div
        className="px-2 py-1 rounded text-xs font-medium truncate cursor-pointer hover:opacity-80 transition-opacity"
        style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
        title={session.name}
      >
        <CategoryIcon className="inline h-3 w-3 mr-1" />
        {session.name}
      </div>
    )
  }

  // Calculer l'intensité moyenne
  const avgPercent =
    session.blocks && session.blocks.length > 0
      ? Math.round(
          session.blocks.reduce((sum, b) => sum + b.percentFtp, 0) / session.blocks.length
        )
      : 0

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${categoryColor}20` }}
          >
            <CategoryIcon className="h-5 w-5" style={{ color: categoryColor }} />
          </div>
          <div>
            <h4 className="font-medium text-text-primary">{session.name}</h4>
            <p className="text-sm text-text-secondary mt-0.5">
              {formatDuration(session.duration)}
              {session.tss && session.tss > 0 && ` • TSS ~${session.tss}`}
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          {onPlay && session.category === 'cycling' && session.blocks && session.blocks.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPlay(session)}
              title="Lancer la séance"
              className="text-[#8BC34A] hover:text-[#8BC34A] hover:bg-[#8BC34A]/10"
            >
              <PlayCircle className="h-5 w-5" />
            </Button>
          )}
          {onSaveAsTemplate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSaveAsTemplate(session)}
              title="Sauvegarder comme modèle"
            >
              <Star className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(session)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(session.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>

      {/* Graphique pour les séances cycling */}
      {session.category === 'cycling' && session.blocks && session.blocks.length > 0 && (
        <div className="mt-3">
          <SessionGraph blocks={session.blocks} ftp={ftp} height="h-20" compact />
          <div className="mt-2 text-sm text-text-secondary">
            Intensité moy:{' '}
            <span className="font-medium text-primary">
              {avgPercent}% FTP = {percentFtpToWatts(avgPercent, ftp)}W
            </span>
          </div>
        </div>
      )}

      {/* Exercices PPG */}
      {session.category === 'ppg' && session.exercises && session.exercises.length > 0 && (
        <div className="mt-3 text-sm text-text-secondary">
          {session.exercises.length} exercice{session.exercises.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-3">
        <Badge
          variant={
            session.level === 'beginner'
              ? 'default'
              : session.level === 'expert'
              ? 'outline'
              : 'secondary'
          }
        >
          {LEVEL_LABELS[session.level]}
        </Badge>
        {session.location && (
          <Badge variant="outline">
            {session.location === 'indoor'
              ? 'Intérieur'
              : session.location === 'outdoor'
              ? 'Extérieur'
              : 'Int./Ext.'}
          </Badge>
        )}
      </div>
    </Card>
  )
}

export default SessionCard
