import { Award, Star, TrendingUp, Sparkles } from 'lucide-react'
import type { ReportRecords as ReportRecordsType, ReportRecord } from '../../types/reports'
import { formatDate } from '../../utils/reportExport'

interface Props {
  records: ReportRecordsType
}

function RecordCard({ record, isNew }: { record: ReportRecord; isNew: boolean }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-4 transition-all duration-300 hover:border-white/20">
      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isNew
            ? 'radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.2), transparent 70%)'
            : 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.2), transparent 70%)',
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        {/* Left side */}
        <div className="flex items-start gap-3">
          {/* Badge icon */}
          <div
            className={`flex-shrink-0 p-2.5 rounded-xl ${
              isNew
                ? 'bg-gradient-to-br from-emerald-500 to-green-400'
                : 'bg-gradient-to-br from-blue-500 to-cyan-400'
            }`}
          >
            {isNew ? (
              <Star className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={2.5} />
            ) : (
              <TrendingUp className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={2.5} />
            )}
          </div>

          {/* Record info */}
          <div>
            {/* Badge label */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isNew
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                {isNew ? 'Nouveau record' : 'Record amélioré'}
              </span>
            </div>

            {/* Record name */}
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">
              {record.recordTypeName}
            </h4>

            {/* Activity type & date */}
            <div className="flex items-center gap-2 text-sm text-[var(--text-disabled)]">
              <span className="px-2 py-0.5 rounded-md bg-white/5">
                {record.activityType}
              </span>
              <span>•</span>
              <span>{formatDate(record.achievedAt)}</span>
            </div>
          </div>
        </div>

        {/* Right side - value */}
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-bold ${
                isNew ? 'text-emerald-400' : 'text-blue-400'
              }`}
            >
              {record.value.toFixed(record.unit === 'km/h' || record.unit === 'km' ? 1 : 0)}
            </span>
            <span className="text-sm text-[var(--text-tertiary)]">{record.unit}</span>
          </div>
          {record.improvement !== null && record.improvement !== undefined && (
            <div className="flex items-center justify-end gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                +{record.improvement.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ReportRecords({ records }: Props) {
  const hasRecords = records.new.length > 0 || records.improved.length > 0
  const totalRecords = records.new.length + records.improved.length

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30">
          <Award className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Records Personnels
          </h3>
          <p className="text-sm text-[var(--text-disabled)]">
            {hasRecords
              ? `${totalRecords} record${totalRecords > 1 ? 's' : ''} battu${totalRecords > 1 ? 's' : ''} cette période`
              : 'Aucun record battu cette période'}
          </p>
        </div>
        {hasRecords && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span className="text-sm font-semibold text-brand-primary">{totalRecords}</span>
          </div>
        )}
      </div>

      {hasRecords ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.new.map((record) => (
            <RecordCard key={record.id} record={record} isNew />
          ))}
          {records.improved.map((record) => (
            <RecordCard key={record.id} record={record} isNew={false} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 p-8 text-center">
          <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
            <Award className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-[var(--text-tertiary)]">
            Continuez à vous entraîner pour battre vos records !
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Vos prochains records apparaîtront ici
          </p>
        </div>
      )}
    </section>
  )
}
