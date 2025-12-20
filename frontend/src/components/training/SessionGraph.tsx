import { useMemo } from 'react'
import type { CyclingBlock } from '../../types/training'
import {
  durationToSeconds,
  getIntensityZone,
  getIntensityZoneColor,
  percentFtpToWatts,
} from '../../types/training'

interface SessionGraphProps {
  blocks: CyclingBlock[]
  ftp: number
  height?: string
}

/**
 * Visualisation graphique des blocs d'entraînement
 * Affiche les blocs en fonction de leur durée et intensité
 */
export function SessionGraph({ blocks, ftp, height = 'h-20' }: SessionGraphProps) {
  const { graphBlocks } = useMemo(() => {
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
      const watts = percentFtpToWatts(block.percentFtp, ftp)

      return {
        ...block,
        widthPercent,
        heightPercent,
        color,
        zone,
        watts,
      }
    })

    return { totalDuration: total, graphBlocks: processed }
  }, [blocks, ftp])

  if (!blocks || blocks.length === 0) {
    return (
      <div className={`${height} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <span className="text-sm text-gray-400">Aucun bloc défini</span>
      </div>
    )
  }

  return (
    <div className={`${height} bg-gray-100 rounded-lg p-2 flex items-end gap-px overflow-hidden`}>
      {graphBlocks.map((block, idx) => (
        <div
          key={idx}
          className="relative flex-shrink-0 rounded-t transition-all hover:opacity-80 group"
          style={{
            width: `${block.widthPercent}%`,
            height: `${block.heightPercent}%`,
            backgroundColor: block.color,
            minWidth: '4px',
          }}
        >
          {/* Tooltip au hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            <div className="font-medium">{block.percentFtp}% FTP = {block.watts}W</div>
            <div className="text-gray-300">{block.zone}</div>
          </div>
        </div>
      ))}
    </div>
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
