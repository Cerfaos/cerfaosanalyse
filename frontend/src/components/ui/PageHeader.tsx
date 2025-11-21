import React from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  icon: string
  gradient?: string
  accentColor?: string
  actions?: React.ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  gradient = 'from-[#8BC34A] to-[#5CE1E6]',
  accentColor = '#8BC34A',
  actions,
}: PageHeaderProps) {
  return (
    <div className="glass-panel p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div
        className="absolute inset-0 bg-gradient-to-r via-transparent"
        style={{
          background: `linear-gradient(to right, ${accentColor}08, transparent, ${accentColor}05)`
        }}
      />
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-32 translate-x-32 blur-3xl"
        style={{ backgroundColor: `${accentColor}08` }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          {/* Icon box */}
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}
          >
            {icon}
          </div>

          {/* Text content */}
          <div>
            <p
              className="text-xs uppercase tracking-[0.4em] font-semibold mb-1"
              style={{ color: accentColor }}
            >
              {eyebrow}
            </p>
            <h1 className="text-3xl font-bold text-white mb-1">
              {title}
            </h1>
            <p className="text-gray-400 max-w-2xl">
              {description}
            </p>
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
