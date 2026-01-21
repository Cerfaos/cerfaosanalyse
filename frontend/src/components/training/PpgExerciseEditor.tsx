/**
 * Éditeur d'exercices PPG (Préparation Physique Générale)
 */

import { Plus, Repeat } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/Card';
import { BlockActionButtons } from './BlockActionButtons';
import type { PpgExercise } from '../../types/training';
import { DEFAULT_PPG_EXERCISE } from './blockEditorConfig';

interface PpgExerciseEditorProps {
  exercises: PpgExercise[];
  onChange: (exercises: PpgExercise[]) => void;
}

export function PpgExerciseEditor({ exercises, onChange }: PpgExerciseEditorProps) {
  // Le nombre de tours est déterminé par le sets du premier exercice
  const circuitRounds = exercises.length > 0 ? exercises[0].sets || 1 : 3;

  const addExercise = () => {
    onChange([...exercises, { ...DEFAULT_PPG_EXERCISE }]);
  };

  const updateExercise = (
    index: number,
    field: keyof PpgExercise,
    value: PpgExercise[keyof PpgExercise]
  ) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeExercise = (index: number) => {
    onChange(exercises.filter((_, i) => i !== index));
  };

  const duplicateExercise = (index: number) => {
    const newExercises = [...exercises];
    newExercises.splice(index + 1, 0, { ...newExercises[index] });
    onChange(newExercises);
  };

  const moveExercise = (index: number, direction: -1 | 1) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === exercises.length - 1)
    ) {
      return;
    }
    const newExercises = [...exercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[index + direction];
    newExercises[index + direction] = temp;
    onChange(newExercises);
  };

  // Mettre à jour le nombre de tours pour tous les exercices
  const handleRoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newRounds = value === '' ? 1 : Math.max(1, Math.min(10, parseInt(value) || 1));
    const updatedExercises: PpgExercise[] = exercises.map((ex) => ({
      ...ex,
      sets: newRounds,
    }));
    onChange(updatedExercises);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <h4 className="font-medium text-text-primary">Exercices</h4>
          {/* Nombre de tours du circuit */}
          {exercises.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#5CE1E6]/10 border border-[#5CE1E6]/30 rounded-lg">
              <Repeat className="h-4 w-4 text-[#5CE1E6]" />
              <span className="text-sm text-[#5CE1E6] font-medium">Tours :</span>
              <input
                type="number"
                min={1}
                max={10}
                value={circuitRounds}
                onChange={handleRoundsChange}
                className="h-7 w-14 text-center bg-transparent border border-[#5CE1E6]/30 rounded-md text-white focus:outline-none focus:border-[#5CE1E6]"
              />
            </div>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addExercise}>
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>

      {exercises.map((exercise, idx) => (
        <Card key={idx} className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Ligne 1 : Nom + Actions */}
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Nom de l'exercice
                </label>
                <Input
                  value={exercise.name}
                  onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex items-end gap-0.5 pt-5 flex-shrink-0">
                <BlockActionButtons
                  index={idx}
                  totalCount={exercises.length}
                  onMoveUp={() => moveExercise(idx, -1)}
                  onMoveDown={() => moveExercise(idx, 1)}
                  onDuplicate={() => duplicateExercise(idx)}
                  onRemove={() => removeExercise(idx)}
                />
              </div>
            </div>

            {/* Ligne 2 : Paramètres */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="w-16">
                <label className="block text-xs font-medium text-text-secondary mb-1">Durée</label>
                <Input
                  value={exercise.duration}
                  onChange={(e) => updateExercise(idx, 'duration', e.target.value)}
                  placeholder="00:30"
                  className="h-9"
                />
              </div>
              <div className="w-14">
                <label className="block text-xs font-medium text-text-secondary mb-1">Reps</label>
                <Input
                  type="number"
                  value={exercise.reps ?? ''}
                  onChange={(e) =>
                    updateExercise(idx, 'reps', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="h-9"
                />
              </div>
              <div className="w-16">
                <label className="block text-xs font-medium text-text-secondary mb-1">Repos</label>
                <Input
                  value={exercise.rest}
                  onChange={(e) => updateExercise(idx, 'rest', e.target.value)}
                  placeholder="00:30"
                  className="h-9"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-text-secondary mb-1">Notes</label>
                <Input
                  value={exercise.notes}
                  onChange={(e) => updateExercise(idx, 'notes', e.target.value)}
                  placeholder="Instructions..."
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default PpgExerciseEditor;
