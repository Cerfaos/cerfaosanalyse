/**
 * Aperçu du prochain bloc
 */

import type { PpgTimerBlock } from "../../../hooks/usePpgSessionTimer";
import { PHASE_CONFIG, formatTime } from "./ppgPlayerConfig";

interface NextBlockPreviewProps {
  nextBlock: PpgTimerBlock | null;
  currentExerciseName: string;
  currentRound: number;
}

export function NextBlockPreview({ nextBlock, currentExerciseName, currentRound }: NextBlockPreviewProps) {
  if (!nextBlock) return null;

  const nextExercise = nextBlock.exercise;
  const isNextDifferentExercise = nextExercise && nextExercise.name !== currentExerciseName;
  const isNextCircuitRest = nextBlock.phase === "circuit_rest";
  const isNextNewRound = nextBlock.roundNumber > currentRound;

  const getLabel = () => {
    if (isNextCircuitRest) return "Repos entre tours";
    if (isNextNewRound) return `Début du tour ${nextBlock.roundNumber}`;
    if (isNextDifferentExercise) return "Prochain exercice";
    return "Ensuite";
  };

  const getBlockName = () => {
    if (nextBlock.phase === "circuit_rest") return `Tour ${nextBlock.roundNumber + 1}`;
    if (nextBlock.phase === "rest") return "Repos";
    return nextExercise?.name;
  };

  return (
    <div className="mb-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="text-xs md:text-sm text-[var(--text-tertiary)] mb-1">{getLabel()}</div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="px-2 py-0.5 rounded text-xs font-bold text-white"
            style={{ backgroundColor: PHASE_CONFIG[nextBlock.phase].color }}
          >
            {PHASE_CONFIG[nextBlock.phase].label}
          </span>
          <span className="text-[var(--text-primary)] text-sm md:text-base font-medium">{getBlockName()}</span>
          {nextBlock.phase === "exercise" && nextBlock.exercise.reps && (
            <span className="text-xs md:text-sm text-[var(--text-tertiary)]">× {nextBlock.exercise.reps} reps</span>
          )}
        </div>
        <span className="text-sm text-[var(--text-tertiary)]">{formatTime(nextBlock.durationSeconds)}</span>
      </div>
    </div>
  );
}
