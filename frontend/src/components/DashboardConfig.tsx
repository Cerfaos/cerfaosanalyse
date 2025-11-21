import { useState } from 'react'
import { useDashboardStore } from '../store/dashboardStore'
import type { Widget } from '../store/dashboardStore'

interface DashboardConfigProps {
  isOpen: boolean
  onClose: () => void
}

export default function DashboardConfig({ isOpen, onClose }: DashboardConfigProps) {
  const { widgets, toggleWidget, reorderWidgets, resetToDefault } = useDashboardStore()
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  if (!isOpen) return null

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    reorderWidgets(draggedIndex, index)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border-base dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-dark dark:text-dark-text-contrast">
                Personnaliser le Dashboard
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Activez, désactivez ou réordonnez les widgets
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Widget List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {sortedWidgets.map((widget, index) => (
            <WidgetItem
              key={widget.id}
              widget={widget}
              index={index}
              onToggle={() => toggleWidget(widget.id)}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              isDragging={draggedIndex === index}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-base dark:border-dark-border bg-bg-gray-50 dark:bg-dark-bg rounded-b-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={resetToDefault}
              className="px-4 py-2 text-sm text-text-muted hover:text-text-dark dark:hover:text-dark-text-contrast transition-colors"
            >
              Réinitialiser par défaut
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-bg-gray-200 dark:bg-dark-border text-text-dark dark:text-dark-text-contrast rounded-lg hover:bg-bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WidgetItem({
  widget,
  index,
  onToggle,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: {
  widget: Widget
  index: number
  onToggle: () => void
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnd: () => void
  isDragging: boolean
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
        isDragging
          ? 'bg-brand/10 border-brand shadow-lg scale-105'
          : widget.enabled
            ? 'bg-white dark:bg-dark-surface border-border-base dark:border-dark-border hover:border-brand/50'
            : 'bg-bg-gray-50 dark:bg-dark-bg border-border-base/50 dark:border-dark-border/50 opacity-60'
      } cursor-grab active:cursor-grabbing`}
    >
      {/* Drag Handle */}
      <div className="text-text-muted">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Icon */}
      <div className="text-2xl">{widget.icon}</div>

      {/* Info */}
      <div className="flex-1">
        <div className="font-medium text-text-dark dark:text-dark-text-contrast">{widget.name}</div>
        <div className="text-xs text-text-muted">{widget.description}</div>
      </div>

      {/* Order Badge */}
      <div className="text-xs text-text-muted bg-bg-gray-100 dark:bg-dark-border px-2 py-1 rounded">
        #{index + 1}
      </div>

      {/* Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          widget.enabled ? 'bg-brand' : 'bg-gray-300 dark:bg-dark-border'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
            widget.enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
