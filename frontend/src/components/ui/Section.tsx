type SectionProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  children?: React.ReactNode
  icon?: string
  gradient?: string
}

export function Section({ eyebrow, title, description, actions, children, icon, gradient = 'from-brand to-blue-600' }: SectionProps) {
  return (
    <section className="space-y-6">
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-transparent to-blue-500/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {icon && (
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                {icon}
              </div>
            )}
            <div>
              {eyebrow && (
                <p className="text-xs uppercase tracking-[0.4em] text-brand font-semibold mb-1">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-3xl font-bold text-text-dark dark:text-dark-text-contrast mb-1">
                {title}
              </h1>
              {description && (
                <p className="text-text-secondary dark:text-dark-text-secondary max-w-2xl">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      </div>
      {children}
    </section>
  )
}
