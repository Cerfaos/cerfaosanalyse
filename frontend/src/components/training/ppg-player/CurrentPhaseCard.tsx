/**
 * Carte de la phase actuelle
 */

import type { PpgTimerBlock, PpgPhase } from "../../../hooks/usePpgSessionTimer";
import type { PpgExercise } from "../../../types/training";
import { PHASE_CONFIG, formatTime } from "./ppgPlayerConfig";

interface CurrentPhaseCardProps {
  currentPhase: PpgPhase;
  currentExercise: PpgExercise;
  currentBlock: PpgTimerBlock;
  currentRound: number;
  totalRounds: number;
  remainingInBlock: number;
  blockProgress: number;
  countdown: number | null;
}

export function CurrentPhaseCard({
  currentPhase,
  currentExercise,
  currentBlock,
  currentRound,
  totalRounds,
  remainingInBlock,
  blockProgress,
  countdown,
}: CurrentPhaseCardProps) {
  const phaseConfig = PHASE_CONFIG[currentPhase];
  const PhaseIcon = phaseConfig.icon;

  return (
    <div
      className="relative rounded-2xl p-4 md:p-6 mb-4 transition-colors duration-500"
      style={{
        backgroundColor: phaseConfig.bgColor,
        borderLeft: `4px solid ${phaseConfig.color}`,
      }}
    >
      {/* Compte à rebours overlay */}
      {countdown !== null && countdown <= 5 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl animate-pulse">
          <span className="text-6xl md:text-8xl font-bold text-white">{countdown}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Info exercice */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <span
              className="px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-bold text-white flex items-center gap-1 md:gap-2"
              style={{ backgroundColor: phaseConfig.color }}
            >
              <PhaseIcon className="h-3 w-3 md:h-4 md:w-4" />
              {phaseConfig.label}
            </span>
            {currentPhase === "circuit_rest" ? (
              <span className="text-sm text-gray-400">
                Prochain tour: {currentRound + 1} / {totalRounds}
              </span>
            ) : (
              <span className="text-sm text-gray-400">
                Tour {currentRound} / {totalRounds}
              </span>
            )}
          </div>

          <div className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">{currentExercise.name}</div>

          {currentPhase === "exercise" && (
            <div className="text-lg md:text-xl text-gray-300">
              {currentExercise.reps ? (
                <span className="text-xl md:text-2xl font-semibold" style={{ color: phaseConfig.color }}>
                  {currentExercise.reps} répétitions
                </span>
              ) : (
                <span className="text-gray-400">Durée: {currentExercise.duration}</span>
              )}
            </div>
          )}

          {currentExercise.notes && <div className="mt-2 text-xs md:text-sm text-gray-400 italic">{currentExercise.notes}</div>}

          {currentExercise.hrTarget && <div className="mt-1 text-xs md:text-sm text-red-400">Zone cible: {currentExercise.hrTarget} bpm</div>}
        </div>

        {/* Timer */}
        <div className="text-center md:text-right">
          <div className="text-5xl md:text-7xl font-mono font-bold text-white tabular-nums">{formatTime(remainingInBlock)}</div>
          <div className="text-sm md:text-lg text-gray-400 mt-1">sur {formatTime(currentBlock.durationSeconds)}</div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mt-4 h-2 md:h-3 bg-black/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{
            width: `${blockProgress}%`,
            backgroundColor: phaseConfig.color,
          }}
        />
      </div>
    </div>
  );
}
