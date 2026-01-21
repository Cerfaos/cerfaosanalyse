/**
 * Boutons d'action pour les blocs d'entraînement (monter, descendre, dupliquer, supprimer)
 */

import { Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import type { BlockActionButtonsProps } from './blockEditorConfig';

export function BlockActionButtons({
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
}: BlockActionButtonsProps) {
  return (
    <div className="flex items-end gap-0.5 flex-shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={onMoveUp}
        disabled={index === 0}
        title="Monter"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={onMoveDown}
        disabled={index === totalCount - 1}
        title="Descendre"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={onDuplicate}
        title="Dupliquer"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={onRemove}
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}

export default BlockActionButtons;
