/**
 * Éditeur de blocs d'entraînement (cycling ou PPG)
 */

import { useState } from 'react';
import { Plus, Repeat } from 'lucide-react';
import { Button } from '../ui/button';
import { SessionGraph } from './SessionGraph';
import { IntervalCreator } from './IntervalCreator';
import { PpgExerciseEditor } from './PpgExerciseEditor';
import { CyclingBlockCard } from './CyclingBlockCard';
import type { CyclingBlock, PpgExercise } from '../../types/training';
import type { BlockEditorProps, EditorMode } from './blockEditorConfig';
import { DEFAULT_CYCLING_BLOCK } from './blockEditorConfig';

export function BlockEditor({ blocks, onChange, category, ftp, weight }: BlockEditorProps) {
  const [editorMode, setEditorMode] = useState<EditorMode>('simple');

  // Éditeur PPG
  if (category === 'ppg') {
    return (
      <PpgExerciseEditor
        exercises={blocks as PpgExercise[]}
        onChange={(exercises) => onChange(exercises)}
      />
    );
  }

  // Éditeur Cycling
  const cyclingBlocks = blocks as CyclingBlock[];

  const addBlock = () => {
    onChange([...cyclingBlocks, { ...DEFAULT_CYCLING_BLOCK }]);
  };

  const updateBlock = (
    index: number,
    field: keyof CyclingBlock,
    value: CyclingBlock[keyof CyclingBlock]
  ) => {
    const updated = [...cyclingBlocks];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeBlock = (index: number) => {
    onChange(cyclingBlocks.filter((_, i) => i !== index));
  };

  const duplicateBlock = (index: number) => {
    const newBlocks = [...cyclingBlocks];
    newBlocks.splice(index + 1, 0, { ...newBlocks[index] });
    onChange(newBlocks);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === cyclingBlocks.length - 1)
    ) {
      return;
    }
    const newBlocks = [...cyclingBlocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    onChange(newBlocks);
  };

  const handleAddIntervalBlocks = (generatedBlocks: CyclingBlock[]) => {
    onChange([...cyclingBlocks, ...generatedBlocks]);
  };

  return (
    <div className="space-y-4">
      {/* Header avec toggle de mode */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h4 className="font-medium text-text-primary">Blocs d'entraînement</h4>
            <div className="text-sm text-text-secondary">
              FTP: <span className="font-semibold text-primary">{ftp}W</span>
            </div>
          </div>

          {/* Toggle Mode */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-border rounded-lg p-1">
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                editorMode === 'simple'
                  ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                  : 'text-[var(--text-disabled)] hover:text-[var(--text-secondary)]'
              }`}
              onClick={() => setEditorMode('simple')}
            >
              <Plus className="h-4 w-4" />
              Simple
            </button>
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                editorMode === 'interval'
                  ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                  : 'text-[var(--text-disabled)] hover:text-[var(--text-secondary)]'
              }`}
              onClick={() => setEditorMode('interval')}
            >
              <Repeat className="h-4 w-4" />
              Intervalle
            </button>
          </div>
        </div>

        {/* Mode Intervalle : Créateur d'intervalles */}
        {editorMode === 'interval' && (
          <IntervalCreator ftp={ftp} onAddBlocks={handleAddIntervalBlocks} />
        )}

        {/* Mode Simple : Bouton d'ajout */}
        {editorMode === 'simple' && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={addBlock}>
              <Plus className="h-4 w-4 mr-1" /> Ajouter un bloc
            </Button>
          </div>
        )}
      </div>

      {cyclingBlocks.length > 0 && <SessionGraph blocks={cyclingBlocks} ftp={ftp} height="h-32" />}

      {cyclingBlocks.map((block, idx) => (
        <CyclingBlockCard
          key={idx}
          block={block}
          index={idx}
          totalCount={cyclingBlocks.length}
          ftp={ftp}
          weight={weight}
          onUpdate={(field, value) => updateBlock(idx, field, value)}
          onMoveUp={() => moveBlock(idx, -1)}
          onMoveDown={() => moveBlock(idx, 1)}
          onDuplicate={() => duplicateBlock(idx)}
          onRemove={() => removeBlock(idx)}
        />
      ))}
    </div>
  );
}

export default BlockEditor;
