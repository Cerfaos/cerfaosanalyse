/**
 * Créateur d'intervalles rapide pour les séances vélo
 */

import { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/Card';
import type { IntervalSet, CyclingBlock } from '../../types/training';
import {
  percentFtpToWatts,
  intervalSetToBlocks,
  calculateIntervalSetDuration,
  secondsToDuration,
} from '../../types/training';
import { DEFAULT_INTERVAL } from './blockEditorConfig';

interface IntervalCreatorProps {
  ftp: number;
  onAddBlocks: (blocks: CyclingBlock[]) => void;
}

export function IntervalCreator({ ftp, onAddBlocks }: IntervalCreatorProps) {
  const [intervalForm, setIntervalForm] = useState<IntervalSet>(DEFAULT_INTERVAL);

  // Calculer les stats de l'intervalle
  const intervalTotalSeconds = calculateIntervalSetDuration(intervalForm);
  const intervalTotalDuration = secondsToDuration(intervalTotalSeconds);

  // Estimer le TSS de l'intervalle (approximatif)
  const estimatedIntervalTss = Math.round(
    ((intervalForm.effortPercentFtp / 100) ** 2 *
      intervalForm.reps *
      parseInt(intervalForm.effortDuration.split(':')[0]) +
      (intervalForm.recoveryPercentFtp / 100) ** 2 *
        (intervalForm.reps - 1) *
        parseInt(intervalForm.recoveryDuration.split(':')[0])) *
      (100 / 60)
  );

  const handleAddIntervalBlocks = () => {
    const generatedBlocks = intervalSetToBlocks(intervalForm);
    onAddBlocks(generatedBlocks);
    setIntervalForm(DEFAULT_INTERVAL);
  };

  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-5 w-5 text-orange-500 flex-shrink-0" />
        <h5 className="font-semibold text-orange-700 dark:text-orange-300 text-sm sm:text-base">
          Créateur d'intervalles rapide
        </h5>
      </div>

      <div className="space-y-4">
        {/* Effort + Récupération en flex wrap */}
        <div className="flex flex-wrap gap-4">
          {/* Effort */}
          <div className="flex-1 min-w-[200px] space-y-2 p-3 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg">
            <div className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Effort
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="w-20">
                <label className="block text-xs text-text-secondary mb-1">Durée</label>
                <Input
                  value={intervalForm.effortDuration}
                  onChange={(e) =>
                    setIntervalForm({ ...intervalForm, effortDuration: e.target.value })
                  }
                  placeholder="02:00"
                  className="h-9 border-orange-200"
                />
              </div>
              <div className="flex-1 min-w-[100px]">
                <label className="block text-xs text-text-secondary mb-1">% FTP</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={intervalForm.effortPercentFtp}
                    onChange={(e) =>
                      setIntervalForm({
                        ...intervalForm,
                        effortPercentFtp: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-9 w-16 border-orange-200"
                  />
                  <span className="text-sm font-semibold text-orange-600 whitespace-nowrap">
                    {percentFtpToWatts(intervalForm.effortPercentFtp, ftp)}W
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Récupération */}
          <div className="flex-1 min-w-[200px] space-y-2 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Récupération
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="w-20">
                <label className="block text-xs text-text-secondary mb-1">Durée</label>
                <Input
                  value={intervalForm.recoveryDuration}
                  onChange={(e) =>
                    setIntervalForm({ ...intervalForm, recoveryDuration: e.target.value })
                  }
                  placeholder="01:00"
                  className="h-9 border-blue-200"
                />
              </div>
              <div className="flex-1 min-w-[100px]">
                <label className="block text-xs text-text-secondary mb-1">% FTP</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={intervalForm.recoveryPercentFtp}
                    onChange={(e) =>
                      setIntervalForm({
                        ...intervalForm,
                        recoveryPercentFtp: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-9 w-16 border-blue-200"
                  />
                  <span className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                    {percentFtpToWatts(intervalForm.recoveryPercentFtp, ftp)}W
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Répétitions + Notes + Bouton */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-20">
            <label className="block text-xs text-text-secondary mb-1">Répétitions</label>
            <Input
              type="number"
              value={intervalForm.reps}
              onChange={(e) =>
                setIntervalForm({ ...intervalForm, reps: parseInt(e.target.value) || 1 })
              }
              min={1}
              max={20}
              className="h-9"
            />
          </div>

          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs text-text-secondary mb-1">Notes</label>
            <Input
              value={intervalForm.notes || ''}
              onChange={(e) => setIntervalForm({ ...intervalForm, notes: e.target.value })}
              placeholder="ex: Sprint, VO2max..."
              className="h-9"
            />
          </div>

          {/* Stats + Bouton */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-xs text-text-secondary hidden sm:block">
              <div className="font-semibold text-text-primary">{intervalTotalDuration}</div>
              <div>~{estimatedIntervalTss} TSS</div>
            </div>
            <Button
              type="button"
              className="h-9 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white whitespace-nowrap"
              onClick={handleAddIntervalBlocks}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Ajouter </span>
              {intervalForm.reps * 2 - 1} blocs
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default IntervalCreator;
