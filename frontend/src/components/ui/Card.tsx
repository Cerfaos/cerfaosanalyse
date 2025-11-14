import { cn } from '../../utils/classnames'

type CardProps = {
  title?: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Card({ title, description, actions, children, className }: CardProps) {
  return (
    <section className={cn('glass-panel p-6 space-y-4', className)}>
      {(title || description || actions) && (
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast font-display">{title}</h2>}
            {description && <p className="text-sm text-text-secondary">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div>{children}</div>
    </section>
  )
}
