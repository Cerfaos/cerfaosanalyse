import { Bike, Dumbbell, Plus, Copy, Edit2, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card } from '../ui/Card'
import { SessionGraph } from './SessionGraph'
import type { TrainingTemplate } from '../../types/training'
import { LEVEL_LABELS, percentFtpToWatts } from '../../types/training'

interface TemplateCardProps {
  template: TrainingTemplate
  ftp: number
  weight?: number
  onEdit?: (template: TrainingTemplate) => void
  onDelete?: (id: number) => void
  onDuplicate?: (template: TrainingTemplate) => void
  onUse?: (template: TrainingTemplate) => void
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
 * Carte d'affichage d'un template d'entraînement
 */
export function TemplateCard({
  template,
  ftp,
  weight: _weight = 75,
  onEdit,
  onDelete,
  onDuplicate,
  onUse,
}: TemplateCardProps) {
  void _weight // Unused but kept for API compatibility
  const CategoryIcon = template.category === 'cycling' ? Bike : Dumbbell
  // Utilise les couleurs du thème: primary (#8BC34A) pour cycling, secondary (#5CE1E6) pour PPG
  const categoryColor = template.category === 'cycling' ? '#8BC34A' : '#5CE1E6'

  // Calculer la puissance moyenne
  const avgPercent =
    template.blocks && template.blocks.length > 0
      ? Math.round(
          template.blocks.reduce((sum, b) => sum + b.percentFtp, 0) / template.blocks.length
        )
      : 0
  const avgWatts = percentFtpToWatts(avgPercent, ftp)

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${categoryColor}20` }}
          >
            <CategoryIcon className="h-5 w-5" style={{ color: categoryColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-text-primary">{template.name}</h4>
              {template.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  Par défaut
                </Badge>
              )}
            </div>
            <p className="text-sm text-text-secondary mt-0.5">
              {formatDuration(template.duration)}
              {template.tss && template.tss > 0 && ` • TSS ${template.tss}`}
              {template.week && ` • Semaine ${template.week}`}
            </p>
          </div>
        </div>
      </div>

      {/* Graphique pour cycling */}
      {template.category === 'cycling' && template.blocks && template.blocks.length > 0 && (
        <>
          <SessionGraph blocks={template.blocks} ftp={ftp} height="h-16" />
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className="text-text-secondary">
              Moy: <span className="font-medium text-text-primary">{avgPercent}% FTP</span>
            </span>
            <span className="text-primary font-medium">{avgWatts}W</span>
          </div>
        </>
      )}

      {/* Exercices PPG */}
      {template.category === 'ppg' && template.exercises && template.exercises.length > 0 && (
        <div className="mt-2 text-sm text-text-secondary">
          {template.exercises.length} exercice{template.exercises.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Description */}
      {template.description && (
        <p className="text-sm text-text-secondary mt-3 line-clamp-2">{template.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={
              template.level === 'beginner'
                ? 'default'
                : template.level === 'expert'
                ? 'outline'
                : 'secondary'
            }
          >
            {LEVEL_LABELS[template.level]}
          </Badge>
          {template.location && (
            <Badge variant="outline">
              {template.location === 'indoor'
                ? 'Intérieur'
                : template.location === 'outdoor'
                ? 'Extérieur'
                : 'Int./Ext.'}
            </Badge>
          )}
        </div>

        <div className="flex gap-1">
          {onUse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUse(template)}
              title="Créer une séance"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDuplicate(template)}
              title="Dupliquer"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
          {!template.isDefault && onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(template)}
              title="Modifier"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {!template.isDefault && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(template.id)}
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default TemplateCard
