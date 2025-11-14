type TableProps = {
  headers: { key: string; label: string; align?: 'left' | 'right' | 'center' }[]
  children: React.ReactNode
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="glass-panel p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-base text-sm">
          <thead className="bg-bg-gray-100 dark:bg-dark-border/30">
            <tr>
              {headers.map((h) => (
                <th
                  key={h.key}
                  className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary ${
                    h.align === 'right' ? 'text-right' : h.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-base bg-bg-white/70 dark:bg-dark-surface/70">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}
