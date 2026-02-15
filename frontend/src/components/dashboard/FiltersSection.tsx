/**
 * Section filtres du dashboard
 */

import PeriodCard from './PeriodCard'
import TypeChip from './TypeChip'
import { periodOptions, getActivityTypeConfigSafe, monthNames } from '../../utils/dashboardConfig'
import type { PeriodType } from '../../types/dashboard'

interface FiltersSectionProps {
  period: PeriodType
  setPeriod: (period: PeriodType) => void
  selectedMonth: number
  setSelectedMonth: (month: number) => void
  selectedYear: number
  setSelectedYear: (year: number) => void
  selectedTypes: string[]
  setSelectedTypes: (types: string[]) => void
  availableTypes: string[]
  typeTotals: Record<string, number>
  toggleType: (type: string) => void
  resetFilters: () => void
}

export function FiltersSection({
  period,
  setPeriod,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedTypes,
  setSelectedTypes,
  availableTypes,
  typeTotals,
  toggleType,
  resetFilters,
}: FiltersSectionProps) {
  return (
    <div className="glass-panel p-6 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Filtres intelligents</p>
          <h3 className="text-xl font-semibold text-white">Affinez vos statistiques</h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-sm font-medium text-text-muted hover:text-text-dark dark:text-dark-text-secondary dark:hover:text-dark-text-contrast underline-offset-4 hover:underline"
        >
          Réinitialiser
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-4">Période</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {periodOptions.map((option) => (
            <PeriodCard
              key={option.value}
              option={option}
              isActive={period === option.value}
              onSelect={() => setPeriod(option.value)}
            />
          ))}
        </div>
      </div>

      {/* Sélecteurs de mois et année (mode personnalisé) */}
      {period === 'custom' && (
        <CustomPeriodSelector
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
      )}

      {/* Filtres par type d'activité */}
      {availableTypes.length > 0 && (
        <ActivityTypeFilters
          availableTypes={availableTypes}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          typeTotals={typeTotals}
          toggleType={toggleType}
        />
      )}
    </div>
  )
}

interface CustomPeriodSelectorProps {
  selectedMonth: number
  setSelectedMonth: (month: number) => void
  selectedYear: number
  setSelectedYear: (year: number) => void
}

function CustomPeriodSelector({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}: CustomPeriodSelectorProps) {
  return (
    <div className="rounded-2xl border border-panel-border bg-bg-subtle/40 dark:bg-dark-border/20 p-4">
      <p className="text-sm font-semibold text-white mb-3">Sélectionner le mois et l'année</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="px-4 py-2.5 rounded-xl border-2 border-panel-border bg-white dark:bg-dark-surface text-white font-medium text-sm focus:outline-none focus:border-brand transition-colors"
        >
          {monthNames.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2.5 rounded-xl border-2 border-panel-border bg-white dark:bg-dark-surface text-white font-medium text-sm focus:outline-none focus:border-brand transition-colors"
        >
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

interface ActivityTypeFiltersProps {
  availableTypes: string[]
  selectedTypes: string[]
  setSelectedTypes: (types: string[]) => void
  typeTotals: Record<string, number>
  toggleType: (type: string) => void
}

function ActivityTypeFilters({
  availableTypes,
  selectedTypes,
  setSelectedTypes,
  typeTotals,
  toggleType,
}: ActivityTypeFiltersProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-white">Types d'activités</p>
          <p className="text-xs text-gray-400">Touchez pour afficher/masquer une discipline</p>
        </div>
        {selectedTypes.length > 0 && (
          <button
            onClick={() => setSelectedTypes([])}
            className="text-xs text-[#8BC34A] hover:text-[#8BC34A]-dark dark:text-[#8BC34A] dark:hover:text-[#8BC34A]-light font-medium"
          >
            Tout afficher
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {availableTypes.map((type) => {
          const config = getActivityTypeConfigSafe(type)
          const isSelected = selectedTypes.length === 0 || selectedTypes.includes(type)
          return (
            <TypeChip
              key={type}
              label={type}
              icon={config.icon}
              count={typeTotals[type] || 0}
              selected={isSelected}
              onClick={() => toggleType(type)}
            />
          )
        })}
      </div>
    </div>
  )
}
