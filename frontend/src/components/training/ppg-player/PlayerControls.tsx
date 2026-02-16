/**
 * Contrôles du player PPG
 */

import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward } from "lucide-react";
import { Button } from "../../ui/button";
import { formatTimeWithHours } from "./ppgPlayerConfig";

interface PlayerControlsProps {
  isPlaying: boolean;
  totalElapsed: number;
  totalDuration: number;
  progress: number;
  onToggle: () => void;
  onReset: () => void;
  onPreviousBlock: () => void;
  onNextBlock: () => void;
  onSkipToNextExercise: () => void;
}

export function PlayerControls({
  isPlaying,
  totalElapsed,
  totalDuration,
  progress,
  onToggle,
  onReset,
  onPreviousBlock,
  onNextBlock,
  onSkipToNextExercise,
}: PlayerControlsProps) {
  return (
    <>
      {/* Barre de progression totale */}
      <div className="mb-4">
        <div className="flex justify-between text-xs md:text-sm text-[var(--text-tertiary)] mb-1">
          <span>{formatTimeWithHours(totalElapsed)}</span>
          <span>{formatTimeWithHours(totalDuration)}</span>
        </div>
        <div className="h-1.5 md:h-2 bg-black/30 rounded-full overflow-hidden">
          <div className="h-full bg-[var(--brand-secondary)] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex items-center justify-center gap-2 md:gap-4">
        <Button variant="ghost" size="lg" onClick={onReset} title="Recommencer (R)" className="h-10 w-10 md:h-14 md:w-14">
          <RotateCcw className="h-5 w-5 md:h-6 md:w-6" />
        </Button>

        <Button variant="ghost" size="lg" onClick={onPreviousBlock} title="Bloc précédent (←)" className="h-10 w-10 md:h-14 md:w-14">
          <SkipBack className="h-5 w-5 md:h-6 md:w-6" />
        </Button>

        <Button
          size="lg"
          onClick={onToggle}
          title={isPlaying ? "Pause (Espace)" : "Lecture (Espace)"}
          className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/80 text-black"
        >
          {isPlaying ? <Pause className="h-8 w-8 md:h-10 md:w-10" /> : <Play className="h-8 w-8 md:h-10 md:w-10 ml-1" />}
        </Button>

        <Button variant="ghost" size="lg" onClick={onNextBlock} title="Bloc suivant (→)" className="h-10 w-10 md:h-14 md:w-14">
          <SkipForward className="h-5 w-5 md:h-6 md:w-6" />
        </Button>

        <Button variant="ghost" size="lg" onClick={onSkipToNextExercise} title="Exercice suivant (N)" className="h-10 w-10 md:h-14 md:w-14">
          <FastForward className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>

      {/* Instructions - masquées sur mobile */}
      <div className="hidden md:block mt-4 text-center text-sm text-[var(--text-disabled)]">
        <span className="mr-4">Espace: Play/Pause</span>
        <span className="mr-4">← →: Bloc</span>
        <span className="mr-4">N: Exercice suivant</span>
        <span>R: Recommencer</span>
      </div>
    </>
  );
}
