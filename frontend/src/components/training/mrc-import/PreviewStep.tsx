/**
 * Étape prévisualisation pour l'import MRC
 */

import { FileText, Bike, Dumbbell, Clock, Zap, TrendingUp, Sparkles } from 'lucide-react'
import type { MrcPreviewData } from '../../../services/trainingApi'
import type { SessionLevel } from '../../../types/training'
import { LEVEL_LABELS, BLOCK_TYPE_LABELS, BLOCK_TYPE_COLORS } from '../../../types/training'
import type { ImportAs } from '../../../hooks/useMrcImport'

interface PreviewStepProps {
  files: File[]
  preview: MrcPreviewData | null
  importAs: ImportAs
  customName: string
  customLevel: SessionLevel | ''
  customWeek: number | ''
  customDay: number | ''
  onImportAsChange: (value: ImportAs) => void
  onCustomNameChange: (value: string) => void
  onCustomLevelChange: (value: SessionLevel | '') => void
  onCustomWeekChange: (value: number | '') => void
  onCustomDayChange: (value: number | '') => void
}

export function PreviewStep({
  files,
  preview,
  importAs,
  customName,
  customLevel,
  customWeek,
  customDay,
  onImportAsChange,
  onCustomNameChange,
  onCustomLevelChange,
  onCustomWeekChange,
  onCustomDayChange,
}: PreviewStepProps) {
  return (
    <div className="space-y-5">
      {/* Fichiers sélectionnés */}
      <FilesSelectedCard files={files} />

      {/* Preview d'un fichier unique */}
      {preview && files.length === 1 && <FilePreviewCard preview={preview} />}

      {/* Options d'import */}
      <ImportOptionsCard
        files={files}
        importAs={importAs}
        customName={customName}
        customLevel={customLevel}
        customWeek={customWeek}
        customDay={customDay}
        onImportAsChange={onImportAsChange}
        onCustomNameChange={onCustomNameChange}
        onCustomLevelChange={onCustomLevelChange}
        onCustomWeekChange={onCustomWeekChange}
        onCustomDayChange={onCustomDayChange}
      />
    </div>
  )
}

function FilesSelectedCard({ files }: { files: File[] }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <p className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-[var(--brand-secondary)]" />
        {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 rounded-lg text-sm text-[var(--brand-primary)]"
          >
            <FileText className="w-3.5 h-3.5" />
            {file.name}
          </span>
        ))}
      </div>
    </div>
  )
}

function FilePreviewCard({ preview }: { preview: MrcPreviewData }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-5">
      {/* Header avec icône */}
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
            preview.category === 'cycling'
              ? 'bg-gradient-to-br from-[var(--brand-primary)]/20 to-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/30'
              : 'bg-gradient-to-br from-[var(--brand-secondary)]/20 to-[var(--brand-secondary)]/5 border border-[var(--brand-secondary)]/30'
          }`}
        >
          {preview.category === 'cycling' ? (
            <Bike className="w-7 h-7 text-[var(--brand-primary)]" />
          ) : (
            <Dumbbell className="w-7 h-7 text-[var(--brand-secondary)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text-primary)] text-lg truncate">{preview.name}</h3>
          {preview.description && (
            <p className="text-sm text-[var(--text-tertiary)] mt-1 line-clamp-2">{preview.description}</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox icon={<Clock className="w-4 h-4 text-[var(--text-disabled)]" />} label="Durée">
          <span className="font-bold text-[var(--text-primary)] text-lg">
            {preview.duration} <span className="text-sm font-normal text-[var(--text-tertiary)]">min</span>
          </span>
        </StatBox>
        {preview.tss && (
          <StatBox icon={<Zap className="w-4 h-4 text-[var(--metric-energy)]" />} label="TSS">
            <span className="font-bold text-[var(--metric-energy)] text-lg">{preview.tss}</span>
          </StatBox>
        )}
        <StatBox icon={<TrendingUp className="w-4 h-4 text-[var(--brand-secondary)]" />} label="Intensité">
          <span className="font-bold text-[var(--brand-secondary)] text-lg">{preview.averageIntensity}%</span>
        </StatBox>
        <StatBox icon={<Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />} label="Niveau">
          <span className="font-bold text-[var(--brand-primary)] text-lg text-sm">{LEVEL_LABELS[preview.level]}</span>
        </StatBox>
      </div>

      {/* Blocs (cycling) */}
      {preview.blocks && preview.blocks.length > 0 && <BlocksVisualization blocks={preview.blocks} duration={preview.duration} />}

      {/* Exercices (PPG) */}
      {preview.exercises && preview.exercises.length > 0 && <ExercisesList exercises={preview.exercises} />}
    </div>
  )
}

function StatBox({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-black/30 border border-white/5 p-3 text-center">
      <div className="mx-auto mb-1 w-fit">{icon}</div>
      <p className="text-xs text-[var(--text-disabled)] uppercase tracking-wider">{label}</p>
      {children}
    </div>
  )
}

function BlocksVisualization({ blocks, duration }: { blocks: MrcPreviewData['blocks']; duration: number }) {
  if (!blocks) return null

  return (
    <div>
      <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">Structure de l'entraînement</p>
      <div className="flex gap-0.5 h-12 rounded-xl overflow-hidden bg-black/30 p-1">
        {blocks.map((block, index) => {
          const durationParts = block.duration.split(':')
          const durationMinutes = parseInt(durationParts[0]) + parseInt(durationParts[1]) / 60
          const widthPercent = (durationMinutes / duration) * 100
          return (
            <div
              key={index}
              className="flex items-center justify-center text-xs text-white font-medium rounded-lg transition-all hover:scale-y-110 cursor-default"
              style={{
                backgroundColor: BLOCK_TYPE_COLORS[block.type],
                width: `${Math.max(widthPercent, 1.5)}%`,
              }}
              title={`${BLOCK_TYPE_LABELS[block.type]} - ${block.percentFtp}% FTP - ${block.duration}`}
            >
              {widthPercent > 10 && <span className="drop-shadow-md">{block.percentFtp}%</span>}
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-[var(--text-disabled)] flex-wrap">
        {Object.entries(BLOCK_TYPE_LABELS).map(([type, label]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: BLOCK_TYPE_COLORS[type as keyof typeof BLOCK_TYPE_COLORS] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function ExercisesList({ exercises }: { exercises: NonNullable<MrcPreviewData['exercises']> }) {
  return (
    <div>
      <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">Exercices ({exercises.length})</p>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
        {exercises.map((exercise, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-2.5 border border-white/5"
          >
            <span className="font-medium text-[var(--text-primary)]">{exercise.name}</span>
            <span className="text-[var(--brand-secondary)] font-mono text-sm">
              {exercise.sets}x {exercise.duration}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImportOptionsCard({
  files,
  importAs,
  customName,
  customLevel,
  customWeek,
  customDay,
  onImportAsChange,
  onCustomNameChange,
  onCustomLevelChange,
  onCustomWeekChange,
  onCustomDayChange,
}: Omit<PreviewStepProps, 'preview'>) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-5">
      <h4 className="font-medium text-[var(--text-primary)] flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
        Options d'import
      </h4>

      {/* Type d'import */}
      <div>
        <label className="block text-sm text-[var(--text-tertiary)] mb-3">Importer comme</label>
        <div className="flex gap-2 p-1 bg-black/30 rounded-xl">
          <button
            onClick={() => onImportAsChange('template')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              importAs === 'template'
                ? 'bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-black shadow-lg'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/5'
            }`}
          >
            Template
          </button>
          <button
            onClick={() => onImportAsChange('session')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              importAs === 'session'
                ? 'bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-black shadow-lg'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/5'
            }`}
          >
            Séance
          </button>
        </div>
        <p className="text-xs text-[var(--text-disabled)] mt-2">
          {importAs === 'template'
            ? 'Modèle réutilisable pour créer plusieurs séances'
            : 'Utilisation unique, prêt à planifier'}
        </p>
      </div>

      {/* Options pour fichier unique */}
      {files.length === 1 && (
        <>
          <div>
            <label className="block text-sm text-[var(--text-tertiary)] mb-2">Nom personnalisé</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => onCustomNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-disabled)] focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-brand-primary/50 transition-all"
              placeholder="Nom de la séance"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-tertiary)] mb-2">Niveau</label>
              <select
                value={customLevel}
                onChange={(e) => onCustomLevelChange(e.target.value as SessionLevel | '')}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-brand-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">Auto</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            {importAs === 'template' && (
              <>
                <div>
                  <label className="block text-sm text-[var(--text-tertiary)] mb-2">Semaine</label>
                  <select
                    value={customWeek}
                    onChange={(e) => onCustomWeekChange(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-brand-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">—</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>S{String(i + 1).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-tertiary)] mb-2">Jour</label>
                  <select
                    value={customDay}
                    onChange={(e) => onCustomDayChange(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-brand-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">—</option>
                    {[...Array(7)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>J{String(i + 1).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
