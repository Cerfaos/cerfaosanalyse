/**
 * Header du player PPG
 */

import { Dumbbell, Volume2, VolumeX, Maximize2, X } from "lucide-react";
import { Button } from "../../ui/button";

interface PlayerHeaderProps {
  sessionName: string;
  currentRound: number;
  totalRounds: number;
  exerciseInRound: number;
  totalExercisesInRound: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
}

export function PlayerHeader({
  sessionName,
  currentRound,
  totalRounds,
  exerciseInRound,
  totalExercisesInRound,
  soundEnabled,
  onToggleSound,
  onToggleFullscreen,
  onClose,
}: PlayerHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <div>
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-[#5CE1E6]" />
          <h2 className="text-xl font-bold text-white">{sessionName}</h2>
        </div>
        <p className="text-sm text-gray-400">
          Tour {currentRound} / {totalRounds} • Exercice {exerciseInRound} / {totalExercisesInRound}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSound}
          title={soundEnabled ? "Désactiver le son" : "Activer le son"}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleFullscreen} title="Plein écran">
          <Maximize2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
