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
} from 'lucide-react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../ui/dialog'
import { useSessionTimer, type TimerBlock } from '../../hooks/useSessionTimer'
import type { TrainingSession, TrainingTemplate } from '../../types/training'
import {
  getIntensityZone,
  getIntensityZoneColor,
  percentFtpToWatts,
} from '../../types/training'
import { useState } from 'react'

interface SessionPlayerProps {
  session: TrainingSession | TrainingTemplate
  ftp: number
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

export function SessionPlayer({ session, ftp, open, onOpenChange }: SessionPlayerProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const blocks = session.blocks || []

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
      // Audio non disponible
    }
  }, [soundEnabled])

  // Callbacks pour le timer
  const handleBlockChange = useCallback((_index: number, block: TimerBlock) => {
    // Son de changement de bloc
    if (block.percentFtp > 80) {
      playBeep(1000, 300) // Son aigu pour haute intensité
    } else {
      playBeep(600, 200) // Son grave pour basse intensité
    }
  }, [playBeep])

  const handleCountdown = useCallback((seconds: number) => {
    if (seconds <= 3) {
      playBeep(1200, 100) // Bips courts pour les dernières secondes
    } else if (seconds === 5 || seconds === 10) {
      playBeep(800, 150)
    }
  }, [playBeep])

  const handleComplete = useCallback(() => {
    // Mélodie de fin
    playBeep(800, 200)
    setTimeout(() => playBeep(1000, 200), 250)
    setTimeout(() => playBeep(1200, 400), 500)
  }, [playBeep])

  const [state, actions] = useSessionTimer(blocks, {
    onBlockChange: handleBlockChange,
    onCountdown: handleCountdown,
    onComplete: handleComplete,
  })

  const {
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

  // Reset quand on ouvre (seulement une fois)
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

  if (!currentBlock) {
    return null
  }

  const zone = getIntensityZone(currentBlock.percentFtp)
  const zoneColor = getIntensityZoneColor(currentBlock.percentFtp)
  const watts = percentFtpToWatts(currentBlock.percentFtp, ftp)
  const zoneShort = zone.split(' ')[0]

  const nextZone = nextBlock ? getIntensityZone(nextBlock.percentFtp) : null
  const nextWatts = nextBlock ? percentFtpToWatts(nextBlock.percentFtp, ftp) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={containerRef}
        className={`${isFullscreen ? 'max-w-full w-full h-full rounded-none' : 'max-w-4xl'} p-0 bg-[#050d0e] border-[#8BC34A]/30 overflow-hidden`}
      >
        <DialogTitle className="sr-only">{session.name} - Session Player</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">{session.name}</h2>
            <p className="text-sm text-gray-400">
              Bloc {currentBlockIndex + 1} / {timerBlocks.length}
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
        <div className={`flex flex-col ${isFullscreen ? 'h-[calc(100vh-80px)]' : ''} p-6`}>
          {/* Zone actuelle - Grande carte centrale */}
          <div
            className="relative rounded-2xl p-8 mb-6 transition-colors duration-500"
            style={{
              backgroundColor: `${zoneColor}15`,
              borderLeft: `4px solid ${zoneColor}`,
            }}
          >
            {/* Compte à rebours overlay */}
            {countdown !== null && countdown <= 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl animate-pulse">
                <span className="text-8xl font-bold text-white">{countdown}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              {/* Info bloc */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: zoneColor }}
                  >
                    {zoneShort}
                  </span>
                  <span className="text-gray-400">{zone.replace(zoneShort, '').trim()}</span>
                </div>
                <div className="text-5xl font-bold text-white mb-2">
                  {currentBlock.percentFtp}% FTP
                </div>
                <div className="text-3xl font-semibold" style={{ color: zoneColor }}>
                  {watts} W
                </div>
                {currentBlock.type && (
                  <div className="mt-3 text-lg text-gray-300">
                    {currentBlock.type === 'effort' ? 'Effort' : 'Récupération'}
                  </div>
                )}
              </div>

              {/* Timer bloc */}
              <div className="text-right">
                <div className="text-7xl font-mono font-bold text-white tabular-nums">
                  {formatTime(remainingInBlock)}
                </div>
                <div className="text-lg text-gray-400 mt-2">
                  sur {formatTime(currentBlock.durationSeconds)}
                </div>
              </div>
            </div>

            {/* Barre de progression du bloc */}
            <div className="mt-6 h-3 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${blockProgress}%`,
                  backgroundColor: zoneColor,
                }}
              />
            </div>
          </div>

          {/* Bloc suivant */}
          {nextBlock && (
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-sm text-gray-400 mb-1">Prochain bloc</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold text-white"
                    style={{ backgroundColor: getIntensityZoneColor(nextBlock.percentFtp) }}
                  >
                    {nextZone?.split(' ')[0]}
                  </span>
                  <span className="text-white font-medium">
                    {nextBlock.percentFtp}% FTP
                  </span>
                  <span className="text-gray-400">→</span>
                  <span style={{ color: getIntensityZoneColor(nextBlock.percentFtp) }} className="font-medium">
                    {nextWatts} W
                  </span>
                </div>
                <span className="text-gray-400">
                  {formatTime(nextBlock.durationSeconds)}
                </span>
              </div>
            </div>
          )}

          {/* Graphique miniature avec curseur */}
          <div className="mb-6">
            <div className="h-16 bg-black/30 rounded-xl p-2 flex items-end gap-px relative">
              {timerBlocks.map((block, idx) => {
                const widthPercent = (block.durationSeconds / totalDuration) * 100
                const heightPercent = Math.min((block.percentFtp / 150) * 100, 100)
                const color = getIntensityZoneColor(block.percentFtp)
                const isActive = idx === currentBlockIndex
                const isPast = idx < currentBlockIndex

                return (
                  <div
                    key={idx}
                    className={`relative rounded-t cursor-pointer transition-all ${isActive ? 'ring-2 ring-white' : ''}`}
                    style={{
                      flex: `${widthPercent} 1 0%`,
                      height: `${heightPercent}%`,
                      minWidth: '4px',
                      background: isPast
                        ? `${color}40`
                        : isActive
                          ? `linear-gradient(to right, ${color} ${blockProgress}%, ${color}60 ${blockProgress}%)`
                          : color,
                      opacity: isPast ? 0.5 : 1,
                    }}
                    onClick={() => actions.goToBlock(idx)}
                    title={`${block.percentFtp}% FTP - ${formatTime(block.durationSeconds)}`}
                  />
                )
              })}
            </div>
          </div>

          {/* Barre de progression totale */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{formatTimeWithHours(totalElapsed)}</span>
              <span>{formatTimeWithHours(totalDuration)}</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8BC34A] rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={actions.reset}
              title="Recommencer (R)"
              className="h-14 w-14"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={actions.previousBlock}
              title="Bloc précédent (←)"
              className="h-14 w-14"
            >
              <SkipBack className="h-6 w-6" />
            </Button>

            <Button
              size="lg"
              onClick={actions.toggle}
              title={isPlaying ? 'Pause (Espace)' : 'Lecture (Espace)'}
              className="h-20 w-20 rounded-full bg-[#8BC34A] hover:bg-[#7CB342] text-black"
            >
              {isPlaying ? (
                <Pause className="h-10 w-10" />
              ) : (
                <Play className="h-10 w-10 ml-1" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={actions.nextBlock}
              title="Bloc suivant (→)"
              className="h-14 w-14"
            >
              <SkipForward className="h-6 w-6" />
            </Button>

            <div className="w-14" /> {/* Spacer for symmetry */}
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <span className="mr-4">Espace: Play/Pause</span>
            <span className="mr-4">← →: Bloc précédent/suivant</span>
            <span>R: Recommencer</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SessionPlayer
