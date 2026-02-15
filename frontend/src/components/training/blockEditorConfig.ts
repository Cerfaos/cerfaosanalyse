/**
 * Configuration et constantes pour l'éditeur de blocs d'entraînement
 */

import type {
  CyclingBlock,
  PpgExercise,
  BlockType,
  SessionCategory,
  IntervalSet,
} from '../../types/training';
import { BLOCK_TYPE_LABELS } from '../../types/training';

// Types d'éditeur
export type EditorMode = 'simple' | 'interval';

// Types de blocs disponibles
export const BLOCK_TYPES: { id: BlockType; label: string }[] = [
  { id: 'warmup', label: BLOCK_TYPE_LABELS.warmup },
  { id: 'interval', label: BLOCK_TYPE_LABELS.interval },
  { id: 'effort', label: BLOCK_TYPE_LABELS.effort },
  { id: 'recovery', label: BLOCK_TYPE_LABELS.recovery },
  { id: 'cooldown', label: BLOCK_TYPE_LABELS.cooldown },
];

// État initial pour un nouvel intervalle
export const DEFAULT_INTERVAL: IntervalSet = {
  effortDuration: '02:00',
  effortPercentFtp: 110,
  recoveryDuration: '01:00',
  recoveryPercentFtp: 50,
  reps: 5,
  notes: '',
};

// Valeurs par défaut pour un nouveau bloc cycling
export const DEFAULT_CYCLING_BLOCK: CyclingBlock = {
  type: 'warmup',
  duration: '05:00',
  percentFtp: 50,
  reps: 1,
  notes: '',
};

// Valeurs par défaut pour un nouvel exercice PPG
export const DEFAULT_PPG_EXERCISE: PpgExercise = {
  name: 'Exercice',
  duration: '00:30',
  reps: 10,
  sets: 3,
  rest: '00:30',
  hrTarget: '',
  notes: '',
};

// Props communes pour les éditeurs de blocs
export interface BlockEditorProps {
  blocks: CyclingBlock[] | PpgExercise[];
  onChange: (blocks: CyclingBlock[] | PpgExercise[]) => void;
  category: SessionCategory;
  ftp: number;
  weight: number;
}

// Props pour les boutons d'action sur les blocs
export interface BlockActionButtonsProps {
  index: number;
  totalCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

// Fonction pour déterminer la zone basée sur le %FTP
export function getZoneFromPercentFtp(percentFtp: number): number {
  if (percentFtp <= 55) return 1;
  if (percentFtp <= 75) return 2;
  if (percentFtp <= 90) return 3;
  if (percentFtp <= 105) return 4;
  if (percentFtp <= 120) return 5;
  return 6;
}
