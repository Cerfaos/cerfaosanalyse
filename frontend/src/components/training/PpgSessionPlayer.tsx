import { useEffect, useRef, useCallback } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  FastForward,
  Dumbbell,
  Timer,
  Coffee,
} from 'lucide-react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../ui/dialog'
import { usePpgSessionTimer, type PpgTimerBlock, type PpgPhase } from '../../hooks/usePpgSessionTimer'
import type { TrainingSession, TrainingTemplate } from '../../types/training'
import { useState } from 'react'

interface PpgSessionPlayerProps {
  session: TrainingSession | TrainingTemplate
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatTimeWithHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const PHASE_CONFIG: Record<PpgPhase, { label: string; color: string; bgColor: string; icon: typeof Timer }> = {
  exercise: {
    label: 'EXERCICE',
    color: '#8BC34A',
    bgColor: '#8BC34A15',
    icon: Dumbbell,
  },
  rest: {
    label: 'REPOS',
    color: '#5CE1E6',
    bgColor: '#5CE1E615',
    icon: Coffee,
  },
  circuit_rest: {
    label: 'REPOS CIRCUIT',
    color: '#FFAB40',
    bgColor: '#FFAB4015',
    icon: Coffee,
  },
}

export function PpgSessionPlayer({ session, open, onOpenChange }: PpgSessionPlayerProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const exercises = session.exercises || []

  // Fonction pour jouer un bip
  const playBeep = useCallback((frequency: number = 800, duration: number = 150) => {
    if (!soundEnabled) return

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration / 1000)
    } catch (e) {
      console.warn('Audio not available:', e)
    }
  }, [soundEnabled])

  // Callbacks pour le timer
  const handleBlockChange = useCallback((_index: number, block: PpgTimerBlock) => {
    if (block.phase === 'exercise') {
      playBeep(1000, 300) // Son aigu pour exercice
    } else {
      playBeep(600, 200) // Son grave pour repos
    }
  }, [playBeep])

  const handleCountdown = useCallback((seconds: number) => {
    if (seconds <= 3) {
      playBeep(1200, 100)
    } else if (seconds === 5 || seconds === 10) {
      playBeep(800, 150)
    }
  }, [playBeep])

  const handleComplete = useCallback(() => {
    playBeep(800, 200)
    setTimeout(() => playBeep(1000, 200), 250)
    setTimeout(() => playBeep(1200, 400), 500)
  }, [playBeep])

  const [state, actions] = usePpgSessionTimer(exercises, {
    onBlockChange: handleBlockChange,
    onCountdown: handleCountdown,
    onComplete: handleComplete,
  })

  const {
    isPlaying,
    currentBlock,
    nextBlock,
    totalElapsed,
    totalDuration,
    remainingInBlock,
    blockProgress,
    progress,
    countdown,
    blocks: timerBlocks,
    currentExercise,
    currentRoundNumber,
    totalRounds,
    currentPhase,
    exerciseInRound,
    totalExercisesInRound,
  } = state

  // Gestion du plein écran
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Raccourcis clavier
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          actions.toggle()
          break
        case 'ArrowRight':
          actions.nextBlock()
          break
        case 'ArrowLeft':
          actions.previousBlock()
          break
        case 'KeyR':
          actions.reset()
          break
        case 'KeyN':
          actions.skipToNextExercise()
          break
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, actions, isFullscreen])

  // Reset quand on ouvre
  const hasResetRef = useRef(false)
  useEffect(() => {
    if (open && !hasResetRef.current) {
      actions.reset()
      hasResetRef.current = true
    }
    if (!open) {
      hasResetRef.current = false
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentBlock || !currentExercise) {
    return null
  }

  const phaseConfig = PHASE_CONFIG[currentPhase]
  const PhaseIcon = phaseConfig.icon

  // Trouver l'exercice suivant
  const nextExercise = nextBlock?.exercise
  const isNextDifferentExercise = nextExercise && nextExercise.name !== currentExercise.name
  const isNextCircuitRest = nextBlock?.phase === 'circuit_rest'
  const isNextNewRound = nextBlock && nextBlock.roundNumber > currentRoundNumber

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={containerRef}
        className={`${isFullscreen ? 'max-w-full w-full h-full rounded-none' : 'max-w-4xl'} p-0 bg-[#050d0e] border-[#5CE1E6]/30 overflow-hidden`}
      >
        <DialogTitle className="sr-only">{session.name} - Session Player PPG</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-[#5CE1E6]" />
              <h2 className="text-xl font-bold text-white">{session.name}</h2>
            </div>
            <p className="text-sm text-gray-400">
              Tour {currentRoundNumber} / {totalRounds} • Exercice {exerciseInRound} / {totalExercisesInRound}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title="Plein écran"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex flex-col ${isFullscreen ? 'h-[calc(100vh-80px)] overflow-y-auto' : 'max-h-[calc(100vh-200px)] overflow-y-auto'} p-4 md:p-6`}>
          {/* Phase actuelle - Grande carte centrale */}
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
                  {currentPhase === 'circuit_rest' ? (
                    <span className="text-sm text-gray-400">
                      Prochain tour: {currentRoundNumber + 1} / {totalRounds}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Tour {currentRoundNumber} / {totalRounds}
                    </span>
                  )}
                </div>

                <div className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                  {currentExercise.name}
                </div>

                {currentPhase === 'exercise' && (
                  <div className="text-lg md:text-xl text-gray-300">
                    {currentExercise.reps ? (
                      <span className="text-xl md:text-2xl font-semibold" style={{ color: phaseConfig.color }}>
                        {currentExercise.reps} répétitions
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        Durée: {currentExercise.duration}
                      </span>
                    )}
                  </div>
                )}

                {currentExercise.notes && (
                  <div className="mt-2 text-xs md:text-sm text-gray-400 italic">
                    {currentExercise.notes}
                  </div>
                )}

                {currentExercise.hrTarget && (
                  <div className="mt-1 text-xs md:text-sm text-red-400">
                    Zone cible: {currentExercise.hrTarget} bpm
                  </div>
                )}
              </div>

              {/* Timer */}
              <div className="text-center md:text-right">
                <div className="text-5xl md:text-7xl font-mono font-bold text-white tabular-nums">
                  {formatTime(remainingInBlock)}
                </div>
                <div className="text-sm md:text-lg text-gray-400 mt-1">
                  sur {formatTime(currentBlock.durationSeconds)}
                </div>
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

          {/* Prochain bloc */}
          {nextBlock && (
            <div className="mb-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs md:text-sm text-gray-400 mb-1">
                {isNextCircuitRest
                  ? 'Repos entre tours'
                  : isNextNewRound
                    ? `Début du tour ${nextBlock.roundNumber}`
                    : isNextDifferentExercise
                      ? 'Prochain exercice'
                      : 'Ensuite'}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold text-white"
                    style={{ backgroundColor: PHASE_CONFIG[nextBlock.phase].color }}
                  >
                    {PHASE_CONFIG[nextBlock.phase].label}
                  </span>
                  <span className="text-white text-sm md:text-base font-medium">
                    {nextBlock.phase === 'circuit_rest'
                      ? `Tour ${nextBlock.roundNumber + 1}`
                      : nextBlock.phase === 'rest'
                        ? 'Repos'
                        : nextExercise?.name}
                  </span>
                  {nextBlock.phase === 'exercise' && nextBlock.exercise.reps && (
                    <span className="text-xs md:text-sm text-gray-400">
                      × {nextBlock.exercise.reps} reps
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-400">
                  {formatTime(nextBlock.durationSeconds)}
                </span>
              </div>
            </div>
          )}

          {/* Liste des exercices miniature */}
          <div className="mb-4">
            <div className="h-12 md:h-16 bg-black/30 rounded-xl p-2 flex items-end gap-0.5 overflow-x-auto">
              {timerBlocks.map((block, idx) => {
                const isActive = idx === state.currentBlockIndex
                const isPast = idx < state.currentBlockIndex
                const config = PHASE_CONFIG[block.phase]
                const widthPercent = Math.max((block.durationSeconds / totalDuration) * 100, 1)

                return (
                  <div
                    key={idx}
                    className={`relative rounded cursor-pointer transition-all flex-shrink-0 ${isActive ? 'ring-2 ring-white' : ''}`}
                    style={{
                      width: `${Math.max(widthPercent, 2)}%`,
                      minWidth: '4px',
                      height: block.phase === 'exercise' ? '100%' : block.phase === 'circuit_rest' ? '30%' : '50%',
                      background: isPast
                        ? `${config.color}40`
                        : isActive
                          ? `linear-gradient(to right, ${config.color} ${blockProgress}%, ${config.color}60 ${blockProgress}%)`
                          : config.color,
                      opacity: isPast ? 0.5 : 1,
                    }}
                    onClick={() => actions.goToBlock(idx)}
                    title={`Tour ${block.roundNumber} - ${block.exercise.name} - ${config.label}`}
                  />
                )
              })}
            </div>
          </div>

          {/* Barre de progression totale */}
          <div className="mb-4">
            <div className="flex justify-between text-xs md:text-sm text-gray-400 mb-1">
              <span>{formatTimeWithHours(totalElapsed)}</span>
              <span>{formatTimeWithHours(totalDuration)}</span>
            </div>
            <div className="h-1.5 md:h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5CE1E6] rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={actions.reset}
              title="Recommencer (R)"
              className="h-10 w-10 md:h-14 md:w-14"
            >
              <RotateCcw className="h-5 w-5 md:h-6 md:w-6" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={actions.previousBlock}
              title="Bloc précédent (←)"
              className="h-10 w-10 md:h-14 md:w-14"
            >
              <SkipBack className="h-5 w-5 md:h-6 md:w-6" />
            </Button>

            <Button
              size="lg"
              onClick={actions.toggle}
              title={isPlaying ? 'Pause (Espace)' : 'Lecture (Espace)'}
              className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-[#5CE1E6] hover:bg-[#4BC8CD] text-black"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 md:h-10 md:w-10" />
              ) : (
                <Play className="h-8 w-8 md:h-10 md:w-10 ml-1" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={actions.nextBlock}
              title="Bloc suivant (→)"
              className="h-10 w-10 md:h-14 md:w-14"
            >
              <SkipForward className="h-5 w-5 md:h-6 md:w-6" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={actions.skipToNextExercise}
              title="Exercice suivant (N)"
              className="h-10 w-10 md:h-14 md:w-14"
            >
              <FastForward className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>

          {/* Instructions - masquées sur mobile */}
          <div className="hidden md:block mt-4 text-center text-sm text-gray-500">
            <span className="mr-4">Espace: Play/Pause</span>
            <span className="mr-4">← →: Bloc</span>
            <span className="mr-4">N: Exercice suivant</span>
            <span>R: Recommencer</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PpgSessionPlayer
