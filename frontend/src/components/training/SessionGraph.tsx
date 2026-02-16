import { useMemo } from 'react'
import type { CyclingBlock } from '../../types/training'
import {
  durationToSeconds,
  getIntensityZone,
  getIntensityZoneColor,
  percentFtpToWatts,
} from '../../types/training'
import {
  TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/Tooltip'

interface SessionGraphProps {
  blocks: CyclingBlock[]
  ftp: number
  height?: string
  showLabels?: boolean
  compact?: boolean // Mode compact: tooltips sans légende ni labels sur blocs
}

/**
 * Formate une durée en secondes vers un format lisible court
 */
function formatDurationShort(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  if (secs === 0) return `${mins}'`
  return `${mins}'${secs.toString().padStart(2, '0')}`
}

/**
 * Visualisation graphique des blocs d'entraînement
 * Affiche les blocs en fonction de leur durée et intensité
 */
export function SessionGraph({ blocks, ftp, height = 'h-24', showLabels = true, compact = false }: SessionGraphProps) {
  // En mode compact: pas de labels sur blocs, pas de légende, mais tooltips actifs
  const showBlockLabels = showLabels && !compact
  const showLegend = showLabels && !compact
  const showTooltips = showLabels || compact
  const { graphBlocks, totalDuration } = useMemo(() => {
    if (!blocks || blocks.length === 0) {
      return { totalDuration: 0, graphBlocks: [] }
    }

    const total = blocks.reduce((acc, block) => {
      const duration = durationToSeconds(block.duration)
      return acc + duration * (block.reps || 1)
    }, 0)

    const processed = blocks.map((block) => {
      const duration = durationToSeconds(block.duration)
      const totalBlockDuration = duration * (block.reps || 1)
      const widthPercent = (totalBlockDuration / total) * 100
      const heightPercent = Math.min((block.percentFtp / 150) * 100, 100)
      const color = getIntensityZoneColor(block.percentFtp)
      const zone = getIntensityZone(block.percentFtp)
      const zoneShort = zone.split(' ')[0] // "Z1", "Z2", etc.
      const watts = percentFtpToWatts(block.percentFtp, ftp)

      return {
        ...block,
        widthPercent,
        heightPercent,
        color,
        zone,
        zoneShort,
        watts,
        totalBlockDuration,
      }
    })

    return { totalDuration: total, graphBlocks: processed }
  }, [blocks, ftp])

  if (!blocks || blocks.length === 0) {
    return (
      <div className={`${height} bg-black/30 rounded-xl border border-white/10 flex items-center justify-center`}>
        <span className="text-sm text-[var(--text-disabled)]">Aucun bloc défini</span>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-2 mt-10">
        {/* Graphique principal */}
        <div className={`${height} bg-black/30 rounded-xl border border-white/10 p-2 relative`}>
          {/* Lignes de référence */}
          <div className="absolute inset-2 pointer-events-none">
            <div className="absolute bottom-[66.67%] left-0 right-0 border-t border-dashed border-white/10" />
            <div className="absolute bottom-[33.33%] left-0 right-0 border-t border-dashed border-white/5" />
          </div>

          {/* Conteneur des blocs - 100% de l'espace disponible */}
          <div className="w-full h-full flex items-end gap-px">
            {graphBlocks.map((block, idx) => {
              const isWide = block.widthPercent > 8
              const isVeryWide = block.widthPercent > 15

              const blockElement = (
                <div
                  className="relative min-w-0 rounded-t-lg transition-all duration-200 hover:brightness-110 hover:scale-y-105 cursor-default h-full"
                  style={{
                    flex: `${block.widthPercent} 1 0%`,
                    background: `linear-gradient(to top, ${block.color}dd, ${block.color})`,
                    boxShadow: `0 0 10px ${block.color}40`,
                  }}
                >
                  {/* Labels sur les blocs larges */}
                  {showBlockLabels && isWide && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                      <span className="text-[10px] font-bold text-white drop-shadow-lg leading-tight">
                        {block.percentFtp}%
                      </span>
                      {isVeryWide && (
                        <span className="text-[9px] text-white/80 drop-shadow-md">
                          {formatDurationShort(block.totalBlockDuration)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )

              if (!showTooltips) {
                return <div key={idx} style={{ height: `${block.heightPercent}%`, flex: `${block.widthPercent} 1 0%`, minWidth: 0 }}>{blockElement}</div>
              }

              return (
                <TooltipRoot key={idx}>
                  <TooltipTrigger asChild style={{ height: `${block.heightPercent}%`, flex: `${block.widthPercent} 1 0%`, minWidth: 0 }}>
                    {blockElement}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded" style={{ backgroundColor: block.color }} />
                      <span className="font-bold text-white">{block.zoneShort}</span>
                      <span className="text-[var(--text-secondary)]">{block.percentFtp}% FTP</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px]">
                      <span className="text-[var(--brand-primary)] font-medium">{block.watts}W</span>
                      <span className="text-[var(--brand-secondary)]">{formatDurationShort(block.totalBlockDuration)}</span>
                    </div>
                  </TooltipContent>
                </TooltipRoot>
              )
            })}
          </div>
        </div>

        {/* Barre d'info sous le graphique */}
        {showLegend && (
          <div className="flex items-center justify-between text-xs px-1 mt-2">
            <div className="flex items-center gap-3">
              {/* Zones utilisées */}
              {Array.from(new Set(graphBlocks.map(b => b.zoneShort))).slice(0, 4).map((zone) => {
                const block = graphBlocks.find(b => b.zoneShort === zone)
                return (
                  <span key={zone} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: block?.color }}
                    />
                    <span className="text-[var(--text-tertiary)]">{zone}</span>
                  </span>
                )
              })}
            </div>
            <span className="text-[var(--text-disabled)]">
              {Math.floor(totalDuration / 60)} min
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * Badge affichant la zone de puissance
 */
interface ZoneBadgeProps {
  percentFtp: number
}

export function ZoneBadge({ percentFtp }: ZoneBadgeProps) {
  const zone = getIntensityZone(percentFtp)
  const color = getIntensityZoneColor(percentFtp)
  const zoneNumber = zone.split(' ')[0] // "Z1", "Z2", etc.

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {zoneNumber}
    </span>
  )
}

export default SessionGraph
