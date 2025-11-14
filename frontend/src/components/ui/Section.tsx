type SectionProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  children?: React.ReactNode
}

export function Section({ eyebrow, title, description, actions, children }: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          {eyebrow && <p className="text-xs uppercase tracking-[0.35em] text-text-muted">{eyebrow}</p>}
          <h1 className="text-3xl font-semibold text-text-dark dark:text-dark-text-contrast">{title}</h1>
          {description && <p className="text-text-secondary">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}
