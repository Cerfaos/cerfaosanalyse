import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { PpgExercise } from '../types/training'
import { durationToSeconds } from '../types/training'

/** Phase d'un exercice PPG */
export type PpgPhase = 'exercise' | 'rest' | 'circuit_rest'

/** Bloc de timer PPG avec métadonnées calculées */
export interface PpgTimerBlock {
  exerciseIndex: number
  exercise: PpgExercise
  roundNumber: number
  totalRounds: number
  phase: PpgPhase
  durationSeconds: number
  startTime: number
  endTime: number
}

export interface PpgSessionTimerState {
  isPlaying: boolean
  currentBlockIndex: number
  currentBlock: PpgTimerBlock | null
  nextBlock: PpgTimerBlock | null
  totalElapsed: number
  totalDuration: number
  remainingInBlock: number
  blockProgress: number
  progress: number
  countdown: number | null
  blocks: PpgTimerBlock[]
  currentExercise: PpgExercise | null
  currentRoundNumber: number
  totalRounds: number
  currentPhase: PpgPhase
  exerciseInRound: number
  totalExercisesInRound: number
}

export interface PpgSessionTimerActions {
  play: () => void
  pause: () => void
  toggle: () => void
  nextBlock: () => void
  previousBlock: () => void
  reset: () => void
  goToBlock: (index: number) => void
  skipToNextExercise: () => void
}

export interface UsePpgSessionTimerOptions {
  onBlockChange?: (index: number, block: PpgTimerBlock) => void
  onCountdown?: (seconds: number) => void
  onComplete?: () => void
  onPhaseChange?: (phase: PpgPhase, exercise: PpgExercise, setNumber: number) => void
}

/**
 * Hook pour gérer le timer d'une séance PPG
 */
export function usePpgSessionTimer(
  exercises: PpgExercise[],
  options: UsePpgSessionTimerOptions = {}
): [PpgSessionTimerState, PpgSessionTimerActions] {
  const { onBlockChange, onCountdown, onComplete, onPhaseChange } = options

  // Préparer les blocs en mode circuit
  // Le nombre de tours est déterminé par le premier exercice's sets (ou 1 par défaut)
  const { timerBlocks, totalDuration, totalRounds } = useMemo(() => {
    const blocks: PpgTimerBlock[] = []
    let currentTime = 0

    // Nombre de tours du circuit (basé sur le premier exercice ou 1 par défaut)
    const numRounds = exercises.length > 0 ? (exercises[0].sets || 1) : 1

    // Durée de repos entre circuits (60 secondes par défaut, ou le double du repos normal)
    const circuitRestDuration = exercises.length > 0 && exercises[0].rest
      ? Math.max(durationToSeconds(exercises[0].rest) * 2, 60)
      : 60

    for (let round = 1; round <= numRounds; round++) {
      exercises.forEach((exercise, exerciseIndex) => {
        const exerciseDuration = exercise.duration ? durationToSeconds(exercise.duration) : 30
        const restDuration = exercise.rest ? durationToSeconds(exercise.rest) : 30

        // Phase exercice
        blocks.push({
          exerciseIndex,
          exercise,
          roundNumber: round,
          totalRounds: numRounds,
          phase: 'exercise',
          durationSeconds: exerciseDuration,
          startTime: currentTime,
          endTime: currentTime + exerciseDuration,
        })
        currentTime += exerciseDuration

        // Repos entre exercices (sauf après le dernier exercice du dernier tour)
        const isLastExercise = exerciseIndex === exercises.length - 1
        const isLastRound = round === numRounds

        if (!isLastExercise) {
          // Repos normal entre exercices
          blocks.push({
            exerciseIndex,
            exercise,
            roundNumber: round,
            totalRounds: numRounds,
            phase: 'rest',
            durationSeconds: restDuration,
            startTime: currentTime,
            endTime: currentTime + restDuration,
          })
          currentTime += restDuration
        } else if (isLastExercise && !isLastRound) {
          // Repos plus long entre les tours du circuit
          blocks.push({
            exerciseIndex,
            exercise,
            roundNumber: round,
            totalRounds: numRounds,
            phase: 'circuit_rest',
            durationSeconds: circuitRestDuration,
            startTime: currentTime,
            endTime: currentTime + circuitRestDuration,
          })
          currentTime += circuitRestDuration
        }
      })
    }

    return { timerBlocks: blocks, totalDuration: currentTime, totalRounds: numRounds }
  }, [exercises])

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const [lastCountdown, setLastCountdown] = useState<number | null>(null)

  const intervalRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(Date.now())
  const currentBlockIndexRef = useRef(currentBlockIndex)
  const timerBlocksRef = useRef(timerBlocks)
  const totalDurationRef = useRef(totalDuration)

  // Sync refs with state
  currentBlockIndexRef.current = currentBlockIndex
  timerBlocksRef.current = timerBlocks
  totalDurationRef.current = totalDuration

  // Calculer les valeurs dérivées
  const currentBlock = timerBlocks[currentBlockIndex] || null
  const nextBlock = timerBlocks[currentBlockIndex + 1] || null

  const elapsedInBlock = currentBlock
    ? Math.max(0, totalElapsed - currentBlock.startTime)
    : 0

  const remainingInBlock = currentBlock
    ? Math.max(0, currentBlock.durationSeconds - elapsedInBlock)
    : 0

  const progress = totalDuration > 0
    ? Math.min(100, (totalElapsed / totalDuration) * 100)
    : 0

  const blockProgress = currentBlock && currentBlock.durationSeconds > 0
    ? Math.min(100, (elapsedInBlock / currentBlock.durationSeconds) * 100)
    : 0

  // Compte à rebours
  const countdownThresholds = [10, 5, 3, 2, 1]
  const countdown = countdownThresholds.find(t =>
    remainingInBlock <= t && remainingInBlock > t - 1
  ) || null

  // Tick du timer
  const tick = useCallback(() => {
    const now = Date.now()
    const delta = (now - lastTickRef.current) / 1000
    lastTickRef.current = now

    const blocks = timerBlocksRef.current
    const blockIdx = currentBlockIndexRef.current
    const block = blocks[blockIdx]
    const total = totalDurationRef.current

    setTotalElapsed(prev => {
      const newTotal = prev + delta

      if (block && newTotal >= block.endTime) {
        if (blockIdx < blocks.length - 1) {
          setCurrentBlockIndex(blockIdx + 1)
        } else {
          setIsPlaying(false)
          onComplete?.()
          return total
        }
      }

      return Math.min(newTotal, total)
    })
  }, [onComplete])

  // Gérer le timer
  useEffect(() => {
    if (isPlaying) {
      lastTickRef.current = Date.now()
      intervalRef.current = window.setInterval(tick, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, tick])

  // Callback pour changement de bloc
  useEffect(() => {
    if (currentBlock) {
      onBlockChange?.(currentBlockIndex, currentBlock)
      onPhaseChange?.(currentBlock.phase, currentBlock.exercise, currentBlock.roundNumber)
    }
  }, [currentBlockIndex, currentBlock, onBlockChange, onPhaseChange])

  // Callback pour compte à rebours
  useEffect(() => {
    if (countdown !== null && countdown !== lastCountdown && isPlaying) {
      onCountdown?.(countdown)
      setLastCountdown(countdown)
    } else if (countdown === null) {
      setLastCountdown(null)
    }
  }, [countdown, lastCountdown, isPlaying, onCountdown])

  // Actions
  const play = useCallback(() => setIsPlaying(true), [])
  const pause = useCallback(() => setIsPlaying(false), [])
  const toggle = useCallback(() => setIsPlaying(p => !p), [])

  const nextBlockAction = useCallback(() => {
    if (currentBlockIndex < timerBlocks.length - 1) {
      const nextIdx = currentBlockIndex + 1
      setCurrentBlockIndex(nextIdx)
      setTotalElapsed(timerBlocks[nextIdx].startTime)
    }
  }, [currentBlockIndex, timerBlocks])

  const previousBlock = useCallback(() => {
    if (currentBlockIndex > 0) {
      const prevIdx = currentBlockIndex - 1
      setCurrentBlockIndex(prevIdx)
      setTotalElapsed(timerBlocks[prevIdx].startTime)
    } else {
      setTotalElapsed(currentBlock?.startTime || 0)
    }
  }, [currentBlockIndex, timerBlocks, currentBlock])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentBlockIndex(0)
    setTotalElapsed(0)
    setLastCountdown(null)
  }, [])

  const goToBlock = useCallback((index: number) => {
    if (index >= 0 && index < timerBlocks.length) {
      setCurrentBlockIndex(index)
      setTotalElapsed(timerBlocks[index].startTime)
    }
  }, [timerBlocks])

  const skipToNextExercise = useCallback(() => {
    const currentExerciseIdx = currentBlock?.exerciseIndex ?? 0
    const nextExerciseBlock = timerBlocks.find(
      (b, idx) => idx > currentBlockIndex && b.exerciseIndex > currentExerciseIdx && b.phase === 'exercise'
    )
    if (nextExerciseBlock) {
      const idx = timerBlocks.indexOf(nextExerciseBlock)
      setCurrentBlockIndex(idx)
      setTotalElapsed(nextExerciseBlock.startTime)
    }
  }, [currentBlock, currentBlockIndex, timerBlocks])

  const state: PpgSessionTimerState = {
    isPlaying,
    currentBlockIndex,
    currentBlock,
    nextBlock,
    totalElapsed,
    totalDuration,
    remainingInBlock,
    blockProgress,
    progress,
    countdown,
    blocks: timerBlocks,
    currentExercise: currentBlock?.exercise || null,
    currentRoundNumber: currentBlock?.roundNumber || 1,
    totalRounds,
    currentPhase: currentBlock?.phase || 'exercise',
    exerciseInRound: (currentBlock?.exerciseIndex || 0) + 1,
    totalExercisesInRound: exercises.length,
  }

  const actions: PpgSessionTimerActions = {
    play,
    pause,
    toggle,
    nextBlock: nextBlockAction,
    previousBlock,
    reset,
    goToBlock,
    skipToNextExercise,
  }

  return [state, actions]
}
