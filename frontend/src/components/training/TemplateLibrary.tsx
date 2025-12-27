import { useState, useMemo } from 'react'
import { FolderPlus } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { TemplateCard } from './TemplateCard'
import { TemplateForm } from './TemplateForm'
import { useTrainingStore } from '../../store/trainingStore'
import type { TrainingTemplate, CreateTemplateData } from '../../types/training'

interface TemplateLibraryProps {
  onCreateSession?: (template: TrainingTemplate) => void
}

/**
 * Bibliothèque de templates avec filtres
 */
export function TemplateLibrary({ onCreateSession }: TemplateLibraryProps) {
  const {
    templates,
    profile,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  } = useTrainingStore()

  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TrainingTemplate | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterWeek, setFilterWeek] = useState<string>('all')

  // Obtenir les semaines uniques
  const weeks = useMemo(() => {
    const uniqueWeeks = [...new Set(templates.map((t) => t.week).filter(Boolean) as number[])]
    return uniqueWeeks.sort((a, b) => a - b)
  }, [templates])

  // Filtrer les templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (filterCategory !== 'all' && t.category !== filterCategory) return false
      if (filterWeek !== 'all' && t.week !== parseInt(filterWeek)) return false
      return true
    })
  }, [templates, filterCategory, filterWeek])

  const handleSave = async (data: CreateTemplateData) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, data)
      } else {
        await createTemplate(data)
      }
      setShowForm(false)
      setEditingTemplate(null)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du template:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Supprimer ce modèle ?')) {
      try {
        await deleteTemplate(id)
      } catch (error) {
        console.error('Erreur lors de la suppression du template:', error)
      }
    }
  }

  const handleDuplicate = async (template: TrainingTemplate) => {
    try {
      await duplicateTemplate(template.id)
    } catch (error) {
      console.error('Erreur lors de la duplication du template:', error)
    }
  }

  const handleEdit = (template: TrainingTemplate) => {
    setEditingTemplate(template)
    setShowForm(true)
  }

  const ftp = profile.ftp || 200
  const weight = profile.weight || 75

  return (
    <div>
      {/* Filtres et actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              <SelectItem value="cycling">Cyclisme</SelectItem>
              <SelectItem value="ppg">PPG</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterWeek} onValueChange={setFilterWeek}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Toutes semaines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes semaines</SelectItem>
              {weeks.map((w) => (
                <SelectItem key={w} value={w.toString()}>
                  Semaine {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            setEditingTemplate(null)
            setShowForm(true)
          }}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Nouveau modèle
        </Button>
      </div>

      {/* Grille de templates */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Aucun template trouvé</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              ftp={ftp}
              weight={weight}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onUse={onCreateSession}
            />
          ))}
        </div>
      )}

      {/* Dialog formulaire */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle'}
            </DialogTitle>
          </DialogHeader>
          <TemplateForm
            template={editingTemplate}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditingTemplate(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TemplateLibrary
