import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { CyclingBlock } from '../types/training'
import { durationToSeconds } from '../types/training'

export interface TimerBlock extends CyclingBlock {
  durationSeconds: number
  startTime: number // Temps de début dans la séance totale
  endTime: number   // Temps de fin dans la séance totale
}

export interface SessionTimerState {
  isPlaying: boolean
  currentBlockIndex: number
  elapsedInBlock: number      // Secondes écoulées dans le bloc actuel
  totalElapsed: number        // Secondes écoulées au total
  totalDuration: number       // Durée totale de la séance
  blocks: TimerBlock[]
  currentBlock: TimerBlock | null
  nextBlock: TimerBlock | null
  progress: number            // 0-100 progression globale
  blockProgress: number       // 0-100 progression du bloc actuel
  remainingInBlock: number    // Secondes restantes dans le bloc
  countdown: number | null    // Compte à rebours avant changement (10, 5, 3, 2, 1, null)
}

export interface SessionTimerActions {
  play: () => void
  pause: () => void
  toggle: () => void
  nextBlock: () => void
  previousBlock: () => void
  reset: () => void
  goToBlock: (index: number) => void
}

export interface UseSessionTimerOptions {
  onBlockChange?: (blockIndex: number, block: TimerBlock) => void
  onCountdown?: (seconds: number) => void
  onComplete?: () => void
}

export function useSessionTimer(
  blocks: CyclingBlock[],
  options: UseSessionTimerOptions = {}
): [SessionTimerState, SessionTimerActions] {
  const { onBlockChange, onCountdown, onComplete } = options

  // Préparer les blocs avec les durées en secondes et temps cumulés (memoized)
  const { timerBlocks, totalDuration } = useMemo(() => {
    const processedBlocks: TimerBlock[] = blocks.reduce((acc, block, index) => {
      const durationSeconds = durationToSeconds(block.duration) * (block.reps || 1)
      const startTime = index === 0 ? 0 : acc[index - 1].endTime
      const endTime = startTime + durationSeconds

      acc.push({
        ...block,
        durationSeconds,
        startTime,
        endTime,
      })
      return acc
    }, [] as TimerBlock[])

    const total = processedBlocks.length > 0
      ? processedBlocks[processedBlocks.length - 1].endTime
      : 0

    return { timerBlocks: processedBlocks, totalDuration: total }
  }, [blocks])

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

  // Déterminer le compte à rebours
  const countdownThresholds = [10, 5, 3, 2, 1]
  const countdown = countdownThresholds.find(t =>
    remainingInBlock <= t && remainingInBlock > t - 1
  ) || null

  // Tick du timer - utilise les refs pour avoir les valeurs actuelles
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

      // Vérifier si on doit passer au bloc suivant
      if (block && newTotal >= block.endTime) {
        if (blockIdx < blocks.length - 1) {
          setCurrentBlockIndex(blockIdx + 1)
        } else {
          // Séance terminée
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
  }, [isPlaying, tick, timerBlocks.length])

  // Callback pour changement de bloc
  useEffect(() => {
    if (currentBlock) {
      onBlockChange?.(currentBlockIndex, currentBlock)
    }
  }, [currentBlockIndex, currentBlock, onBlockChange])

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
      // Revenir au début du bloc actuel
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

  const state: SessionTimerState = {
    isPlaying,
    currentBlockIndex,
    elapsedInBlock,
    totalElapsed,
    totalDuration,
    blocks: timerBlocks,
    currentBlock,
    nextBlock,
    progress,
    blockProgress,
    remainingInBlock,
    countdown,
  }

  const actions: SessionTimerActions = {
    play,
    pause,
    toggle,
    nextBlock: nextBlockAction,
    previousBlock,
    reset,
    goToBlock,
  }

  return [state, actions]
}
