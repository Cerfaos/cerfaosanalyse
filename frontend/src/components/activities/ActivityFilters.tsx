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
    <div className="glass-panel p-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="period"
            className="block text-sm font-medium text-text-body mb-2"
          >
            Période
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-4 py-2 border border-border-base rounded-xl bg-[#0A191A] text-white hover:border-[#8BC34A] hover:bg-[#8BC34A]/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta [&>option]:bg-[#0A191A] [&>option]:text-white"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="365">1 an</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="type"
            className="block text-sm font-medium text-text-body mb-2"
          >
            Type d'activité
          </label>
          <select
            id="type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-border-base rounded-xl bg-[#0A191A] text-white hover:border-[#8BC34A] hover:bg-[#8BC34A]/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta [&>option]:bg-[#0A191A] [&>option]:text-white [&>option:hover]:bg-[#8BC34A] [&>option:checked]:bg-[#8BC34A]/30"
          >
            <option value="">Tous les types</option>
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
        </div>

        <div className="flex-1 min-w-[250px]">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-text-body mb-2"
          >
            Rechercher
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Notes, type, fichier..."
              className="w-full px-4 py-2 pl-10 border border-border-base rounded-xl bg-[#0A191A] text-white placeholder-gray-500 hover:border-[#8BC34A] hover:bg-[#8BC34A]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-cta/30 focus:border-cta"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                title="Effacer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
