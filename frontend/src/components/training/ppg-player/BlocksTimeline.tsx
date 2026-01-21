/**
 * Timeline des blocs d'exercices
 */

import type { PpgTimerBlock } from "../../../hooks/usePpgSessionTimer";
import { PHASE_CONFIG } from "./ppgPlayerConfig";

interface BlocksTimelineProps {
  blocks: PpgTimerBlock[];
  currentBlockIndex: number;
  blockProgress: number;
  totalDuration: number;
  onGoToBlock: (index: number) => void;
}

export function BlocksTimeline({ blocks, currentBlockIndex, blockProgress, totalDuration, onGoToBlock }: BlocksTimelineProps) {
  return (
    <div className="mb-4">
      <div className="h-12 md:h-16 bg-black/30 rounded-xl p-2 flex items-end gap-0.5 overflow-x-auto">
        {blocks.map((block, idx) => {
          const isActive = idx === currentBlockIndex;
          const isPast = idx < currentBlockIndex;
          const config = PHASE_CONFIG[block.phase];
          const widthPercent = Math.max((block.durationSeconds / totalDuration) * 100, 1);

          return (
            <div
              key={idx}
              className={`relative rounded cursor-pointer transition-all flex-shrink-0 ${isActive ? "ring-2 ring-white" : ""}`}
              style={{
                width: `${Math.max(widthPercent, 2)}%`,
                minWidth: "4px",
                height: block.phase === "exercise" ? "100%" : block.phase === "circuit_rest" ? "30%" : "50%",
                background: isPast
                  ? `${config.color}40`
                  : isActive
                    ? `linear-gradient(to right, ${config.color} ${blockProgress}%, ${config.color}60 ${blockProgress}%)`
                    : config.color,
                opacity: isPast ? 0.5 : 1,
              }}
              onClick={() => onGoToBlock(idx)}
              title={`Tour ${block.roundNumber} - ${block.exercise.name} - ${config.label}`}
            />
          );
        })}
      </div>
    </div>
  );
}
