const PERIODS = [
  { value: "7", label: "7j" },
  { value: "30", label: "30j" },
  { value: "90", label: "90j" },
  { value: "365", label: "1 an" },
];

interface ActivityFiltersProps {
  period: string;
  setPeriod: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function ActivityFilters({
  period,
  setPeriod,
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
}: ActivityFiltersProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Period selector */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-default)]">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 ${
              period === p.value
                ? "bg-[var(--accent-primary)] text-white shadow-[0_2px_12px_rgba(248,113,47,0.4)]"
                : "text-[var(--text-disabled)] hover:text-[var(--text-tertiary)] hover:bg-[var(--surface-input)]/50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="h-10 px-4 pr-8 rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] text-xs font-bold text-[var(--text-tertiary)] cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--accent-primary)] outline-none transition-all appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
        }}
      >
        <option value="">Tous types</option>
        <option value="Cyclisme">Cyclisme</option>
        <option value="Course">Course</option>
        <option value="Marche">Marche</option>
        <option value="Mobilité">Mobilité</option>
        <option value="Musculation">Musculation</option>
        <option value="Natation">Natation</option>
        <option value="Rameur">Rameur</option>
        <option value="Randonnée">Randonnée</option>
        <option value="Yoga">Yoga</option>
      </select>

      {/* Active filter chip */}
      {filterType && (
        <button
          type="button"
          onClick={() => setFilterType("")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/25 text-[var(--accent-primary)] text-xs font-bold hover:bg-[var(--accent-primary)]/25 transition-colors"
        >
          {filterType}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative w-64">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-disabled)]"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une activité..."
          className="w-full h-10 pl-10 pr-10 rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] text-sm text-white placeholder-[var(--text-disabled)] focus:border-[var(--accent-primary)] outline-none transition-colors"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-disabled)] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
