import React, { useState } from 'react'
import { getPageIcon } from '../../config/pageIcons'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  /** Clé de l'icône (ex: 'dashboard', 'activities') ou emoji direct */
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
  gradient = 'from-[var(--brand-primary)] to-[var(--brand-secondary)]',
  accentColor = 'var(--brand-primary)',
  actions,
}: PageHeaderProps) {
  const [imageError, setImageError] = useState(false)

  // Vérifie si c'est une clé d'icône ou un emoji direct
  const iconConfig = getPageIcon(icon)
  const isEmoji = icon.length <= 2 || !iconConfig.image
  const showImage = !isEmoji && iconConfig.image && !imageError

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
            className={`w-32 h-32 rounded-3xl flex items-center justify-center text-6xl flex-shrink-0 ${
              showImage
                ? ''
                : `bg-gradient-to-br ${gradient} shadow-2xl shadow-black/30 ring-2 ring-white/10`
            }`}
          >
            {showImage ? (
              <img
                src={iconConfig.image}
                alt=""
                className="w-32 h-32 object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              isEmoji ? icon : iconConfig.fallback
            )}
          </div>

          {/* Text content */}
          <div>
            <p
              className="text-xs uppercase tracking-[0.4em] font-semibold mb-1"
              style={{ color: accentColor }}
            >
              {eyebrow}
            </p>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">
              {title}
            </h1>
            <p className="text-[var(--text-tertiary)] max-w-2xl">
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
