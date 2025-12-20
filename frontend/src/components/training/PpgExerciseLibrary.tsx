import { useState, useEffect } from 'react'
import { Search, Plus, Filter } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import trainingApi from '../../services/trainingApi'
import type {
  PpgExerciseDefinition,
  PpgCategory,
  DifficultyLevel,
  PpgExercise,
} from '../../types/training'
import {
  PPG_CATEGORY_LABELS,
  PPG_CATEGORY_ICONS,
  DIFFICULTY_LABELS,
} from '../../types/training'

interface PpgExerciseLibraryProps {
  onSelect: (exercise: PpgExercise) => void
}

/**
 * Bibliothèque d'exercices PPG avec recherche et filtres
 */
export function PpgExerciseLibrary({ onSelect }: PpgExerciseLibraryProps) {
  const [exercises, setExercises] = useState<PpgExerciseDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<PpgCategory | 'all'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all')

  useEffect(() => {
    loadExercises()
  }, [categoryFilter, difficultyFilter])

  const loadExercises = async () => {
    try {
      setLoading(true)
      const params: { category?: PpgCategory; difficulty?: DifficultyLevel } = {}
      if (categoryFilter !== 'all') params.category = categoryFilter
      if (difficultyFilter !== 'all') params.difficulty = difficultyFilter

      const response = await trainingApi.ppgExercises.list(params)
      setExercises(response.exercises)
    } catch (error) {
      console.error('Erreur chargement exercices PPG:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer par recherche
  const filteredExercises = exercises.filter((exercise) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      exercise.name.toLowerCase().includes(searchLower) ||
      exercise.description?.toLowerCase().includes(searchLower) ||
      exercise.targetMuscles?.toLowerCase().includes(searchLower)
    )
  })

  // Grouper par catégorie
  const groupedExercises = filteredExercises.reduce(
    (acc, exercise) => {
      if (!acc[exercise.category]) {
        acc[exercise.category] = []
      }
      acc[exercise.category].push(exercise)
      return acc
    },
    {} as Record<PpgCategory, PpgExerciseDefinition[]>
  )

  // Convertir un exercice de la bibliothèque en PpgExercise pour le formulaire
  const handleSelect = (exercise: PpgExerciseDefinition) => {
    const ppgExercise: PpgExercise = {
      name: exercise.name,
      duration: exercise.defaultDuration || '00:30',
      reps: exercise.defaultReps,
      sets: exercise.defaultSets,
      rest: '00:30',
      notes: exercise.description || '',
    }
    onSelect(ppgExercise)
  }

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'debutant':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'intermediaire':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'avance':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un exercice..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-secondary" />
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as PpgCategory | 'all')}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {(Object.keys(PPG_CATEGORY_LABELS) as PpgCategory[]).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {PPG_CATEGORY_ICONS[cat]} {PPG_CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={difficultyFilter}
            onValueChange={(value) => setDifficultyFilter(value as DifficultyLevel | 'all')}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous niveaux</SelectItem>
              {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((level) => (
                <SelectItem key={level} value={level}>
                  {DIFFICULTY_LABELS[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des exercices */}
      {loading ? (
        <div className="text-center py-8 text-text-secondary">Chargement des exercices...</div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">Aucun exercice trouvé</div>
      ) : (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {(Object.keys(groupedExercises) as PpgCategory[]).map((category) => (
            <div key={category}>
              <h5 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-xl">{PPG_CATEGORY_ICONS[category]}</span>
                {PPG_CATEGORY_LABELS[category]}
                <span className="text-sm font-normal text-text-secondary">
                  ({groupedExercises[category].length})
                </span>
              </h5>

              <div className="grid gap-2">
                {groupedExercises[category].map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-3 bg-white dark:bg-dark-surface border border-border-base dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors cursor-pointer group"
                    onClick={() => handleSelect(exercise)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary truncate">
                            {exercise.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(exercise.difficulty)}`}
                          >
                            {DIFFICULTY_LABELS[exercise.difficulty]}
                          </span>
                        </div>

                        {exercise.targetMuscles && (
                          <div className="text-sm text-text-secondary mt-0.5">
                            {exercise.targetMuscles}
                          </div>
                        )}

                        <div className="text-xs text-text-muted mt-1">
                          {exercise.defaultReps
                            ? `${exercise.defaultSets}×${exercise.defaultReps} reps`
                            : exercise.defaultDuration
                              ? `${exercise.defaultSets}×${exercise.defaultDuration}`
                              : `${exercise.defaultSets} séries`}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelect(exercise)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PpgExerciseLibrary
