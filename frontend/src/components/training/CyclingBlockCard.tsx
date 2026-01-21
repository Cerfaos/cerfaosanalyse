/**
 * Carte d'un bloc d'entraînement cycliste
 */

import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card } from '../ui/Card';
import { ZoneBadge } from './SessionGraph';
import { BlockActionButtons } from './BlockActionButtons';
import type { CyclingBlock, BlockType } from '../../types/training';
import { percentFtpToWatts } from '../../types/training';
import { BLOCK_TYPES, getZoneFromPercentFtp } from './blockEditorConfig';

interface CyclingBlockCardProps {
  block: CyclingBlock;
  index: number;
  totalCount: number;
  ftp: number;
  weight: number;
  onUpdate: (field: keyof CyclingBlock, value: CyclingBlock[keyof CyclingBlock]) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function CyclingBlockCard({
  block,
  index,
  totalCount,
  ftp,
  weight,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
}: CyclingBlockCardProps) {
  const watts = percentFtpToWatts(block.percentFtp, ftp);
  const wattsPerKg = weight > 0 ? (watts / weight).toFixed(2) : '0';
  const zone = getZoneFromPercentFtp(block.percentFtp);

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Indicateur de zone coloré */}
        <div
          className="w-1.5 self-stretch rounded-full flex-shrink-0 min-h-[80px]"
          style={{ backgroundColor: `var(--color-zone-${zone})` }}
        />

        <div className="flex-1 min-w-0">
          {/* Ligne principale : Type, Durée, %FTP, Puissance */}
          <div className="flex flex-wrap items-end gap-2 sm:gap-3">
            {/* Type */}
            <div className="w-28 sm:w-32">
              <label className="block text-xs font-medium text-text-secondary mb-1">Type</label>
              <Select
                value={block.type}
                onValueChange={(value) => onUpdate('type', value as BlockType)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Durée */}
            <div className="w-20">
              <label className="block text-xs font-medium text-text-secondary mb-1">Durée</label>
              <Input
                value={block.duration}
                onChange={(e) => onUpdate('duration', e.target.value)}
                placeholder="05:00"
                className="h-9"
              />
            </div>

            {/* % FTP + Zone badge */}
            <div className="w-24">
              <label className="block text-xs font-medium text-text-secondary mb-1">% FTP</label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={block.percentFtp}
                  onChange={(e) => onUpdate('percentFtp', parseInt(e.target.value) || 0)}
                  className="h-9 w-16"
                />
                <ZoneBadge percentFtp={block.percentFtp} />
              </div>
            </div>

            {/* Puissance calculée */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Puissance
              </label>
              <div className="h-9 px-2.5 py-1.5 bg-primary/10 border border-primary/20 rounded-md flex items-center whitespace-nowrap">
                <span className="font-bold text-primary text-sm">{watts}W</span>
                <span className="text-xs text-primary/70 ml-1 hidden sm:inline">({wattsPerKg})</span>
              </div>
            </div>

            {/* Répétitions */}
            <div className="w-14">
              <label className="block text-xs font-medium text-text-secondary mb-1">Rép.</label>
              <Input
                type="number"
                value={block.reps}
                onChange={(e) => onUpdate('reps', parseInt(e.target.value) || 1)}
                className="h-9"
              />
            </div>

            {/* Spacer pour pousser les actions à droite */}
            <div className="flex-1 min-w-0" />

            {/* Actions */}
            <BlockActionButtons
              index={index}
              totalCount={totalCount}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDuplicate={onDuplicate}
              onRemove={onRemove}
            />
          </div>

          {/* Notes */}
          <div className="mt-2">
            <Input
              value={block.notes}
              onChange={(e) => onUpdate('notes', e.target.value)}
              placeholder="Notes pour ce bloc..."
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default CyclingBlockCard;
