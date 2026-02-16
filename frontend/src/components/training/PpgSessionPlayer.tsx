/**
 * Player de session PPG (Préparation Physique Générale)
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { usePpgSessionTimer } from "../../hooks/usePpgSessionTimer";
import type { TrainingSession, TrainingTemplate } from "../../types/training";
import { PlayerHeader, CurrentPhaseCard, NextBlockPreview, BlocksTimeline, PlayerControls } from "./ppg-player";

interface PpgSessionPlayerProps {
  session: TrainingSession | TrainingTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PpgSessionPlayer({ session, open, onOpenChange }: PpgSessionPlayerProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const exercises = session.exercises || [];

  // Fonction pour jouer un bip
  const playBeep = useCallback(
    (frequency: number = 800, duration: number = 150) => {
      if (!soundEnabled) return;

      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration / 1000);
      } catch {
        // Audio non disponible
      }
    },
    [soundEnabled]
  );

  // Callbacks pour le timer
  const handleBlockChange = useCallback(
    (_index: number, block: { phase: string }) => {
      if (block.phase === "exercise") {
        playBeep(1000, 300);
      } else {
        playBeep(600, 200);
      }
    },
    [playBeep]
  );

  const handleCountdown = useCallback(
    (seconds: number) => {
      if (seconds <= 3) {
        playBeep(1200, 100);
      } else if (seconds === 5 || seconds === 10) {
        playBeep(800, 150);
      }
    },
    [playBeep]
  );

  const handleComplete = useCallback(() => {
    playBeep(800, 200);
    setTimeout(() => playBeep(1000, 200), 250);
    setTimeout(() => playBeep(1200, 400), 500);
  }, [playBeep]);

  const [state, actions] = usePpgSessionTimer(exercises, {
    onBlockChange: handleBlockChange,
    onCountdown: handleCountdown,
    onComplete: handleComplete,
  });

  // Gestion du plein écran
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Raccourcis clavier
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Space":
          e.preventDefault();
          actions.toggle();
          break;
        case "ArrowRight":
          actions.nextBlock();
          break;
        case "ArrowLeft":
          actions.previousBlock();
          break;
        case "KeyR":
          actions.reset();
          break;
        case "KeyN":
          actions.skipToNextExercise();
          break;
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, actions, isFullscreen]);

  // Reset quand on ouvre
  const hasResetRef = useRef(false);
  useEffect(() => {
    if (open && !hasResetRef.current) {
      actions.reset();
      hasResetRef.current = true;
    }
    if (!open) {
      hasResetRef.current = false;
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state.currentBlock || !state.currentExercise) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={containerRef}
        className={`${isFullscreen ? "max-w-full w-full h-full rounded-none" : "max-w-4xl"} p-0 bg-[var(--surface-deep)] border-[var(--brand-secondary)]/30 overflow-hidden`}
      >
        <DialogTitle className="sr-only">{session.name} - Session Player PPG</DialogTitle>

        <PlayerHeader
          sessionName={session.name}
          currentRound={state.currentRoundNumber}
          totalRounds={state.totalRounds}
          exerciseInRound={state.exerciseInRound}
          totalExercisesInRound={state.totalExercisesInRound}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onToggleFullscreen={toggleFullscreen}
          onClose={() => onOpenChange(false)}
        />

        <div className={`flex flex-col ${isFullscreen ? "h-[calc(100vh-80px)] overflow-y-auto" : "max-h-[calc(100vh-200px)] overflow-y-auto"} p-4 md:p-6`}>
          <CurrentPhaseCard
            currentPhase={state.currentPhase}
            currentExercise={state.currentExercise}
            currentBlock={state.currentBlock}
            currentRound={state.currentRoundNumber}
            totalRounds={state.totalRounds}
            remainingInBlock={state.remainingInBlock}
            blockProgress={state.blockProgress}
            countdown={state.countdown}
          />

          <NextBlockPreview nextBlock={state.nextBlock} currentExerciseName={state.currentExercise.name} currentRound={state.currentRoundNumber} />

          <BlocksTimeline
            blocks={state.blocks}
            currentBlockIndex={state.currentBlockIndex}
            blockProgress={state.blockProgress}
            totalDuration={state.totalDuration}
            onGoToBlock={actions.goToBlock}
          />

          <PlayerControls
            isPlaying={state.isPlaying}
            totalElapsed={state.totalElapsed}
            totalDuration={state.totalDuration}
            progress={state.progress}
            onToggle={actions.toggle}
            onReset={actions.reset}
            onPreviousBlock={actions.previousBlock}
            onNextBlock={actions.nextBlock}
            onSkipToNextExercise={actions.skipToNextExercise}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PpgSessionPlayer;
