/**
 * =============================================================================
 * ICON DASHBOARD - Page de développement pour gérer les icônes
 * =============================================================================
 *
 * Cette page permet de :
 * - Visualiser toutes les icônes custom par catégorie
 * - Voir les icônes Lucide utilisées dans l'app
 * - Comparer côte à côte les icônes custom vs Lucide
 * - Identifier les prochaines icônes à créer (par priorité)
 *
 * Accessible uniquement en développement : /icons
 */

import { useState, useMemo } from 'react'
import * as LucideIcons from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { PageHeader } from '../components/ui/PageHeader'
import {
  customIcons,
  iconMetadata,
  lucideIconsInUse,
  pngIcons,
  getPngIconStats,
  type IconCategory,
} from '../components/icons/custom'
import { Icon } from '../components/icons/Icon'

type TabType = 'overview' | 'png' | 'custom' | 'lucide' | 'comparison'

const CATEGORY_LABELS: Record<IconCategory, { label: string; emoji: string }> = {
  metrics: { label: 'Métriques', emoji: '📊' },
  activities: { label: 'Activités', emoji: '🚴' },
  navigation: { label: 'Navigation', emoji: '🧭' },
  status: { label: 'Status', emoji: '✅' },
  equipment: { label: 'Équipement', emoji: '🎒' },
}

const PRIORITY_COLORS = {
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  low: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
}

export default function IconDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedCategory, setSelectedCategory] = useState<IconCategory | 'all'>('all')

  // Stats
  const stats = useMemo(() => {
    const pngStats = getPngIconStats()
    const totalPng = pngStats.total
    const totalSvg = Object.keys(customIcons).length
    const totalLucide = lucideIconsInUse.length
    const withReplacement = lucideIconsInUse.filter((i) => i.customReplacement).length
    const highPriority = lucideIconsInUse.filter((i) => i.priority === 'high' && !i.customReplacement).length

    return { totalPng, totalSvg, totalLucide, withReplacement, highPriority }
  }, [])

  // Filtered PNG icons
  const filteredPng = useMemo(() => {
    if (selectedCategory === 'all') return pngIcons
    return pngIcons.filter((i) => i.category === selectedCategory)
  }, [selectedCategory])

  // Filtered Lucide icons
  const filteredLucide = useMemo(() => {
    if (selectedCategory === 'all') return lucideIconsInUse
    return lucideIconsInUse.filter((i) => i.category === selectedCategory)
  }, [selectedCategory])

  // Filtered custom icons
  const filteredCustom = useMemo(() => {
    if (selectedCategory === 'all') return iconMetadata
    return iconMetadata.filter((i) => i.category === selectedCategory)
  }, [selectedCategory])

  const renderLucideIcon = (name: string, size = 24) => {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name]
    if (!IconComponent) return <span className="text-red-400">?</span>
    return <IconComponent size={size} className="text-gray-400" />
  }

  return (
    <AppLayout title="Icon Dashboard" description="Gestion des icônes">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Développement"
          title="Dashboard Icônes"
          description="Gérez et suivez la migration des icônes Lucide vers vos icônes personnalisées."
          icon="🎨"
          gradient="from-purple-500 to-pink-500"
          accentColor="#a855f7"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-panel p-4 text-center">
            <div className="text-3xl font-bold text-pink-400">{stats.totalPng}</div>
            <div className="text-sm text-gray-400">Icônes PNG</div>
          </div>
          <div className="glass-panel p-4 text-center">
            <div className="text-3xl font-bold text-[#8BC34A]">{stats.totalSvg}</div>
            <div className="text-sm text-gray-400">Icônes SVG</div>
          </div>
          <div className="glass-panel p-4 text-center">
            <div className="text-3xl font-bold text-[#5CE1E6]">{stats.totalLucide}</div>
            <div className="text-sm text-gray-400">Lucide utilisées</div>
          </div>
          <div className="glass-panel p-4 text-center">
            <div className="text-3xl font-bold text-[#FFAB40]">{stats.withReplacement}</div>
            <div className="text-sm text-gray-400">Remplacées</div>
          </div>
          <div className="glass-panel p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.highPriority}</div>
            <div className="text-sm text-gray-400">Priorité haute</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-700 pb-4">
          {[
            { id: 'overview', label: 'Vue globale' },
            { id: 'png', label: 'Icônes PNG' },
            { id: 'custom', label: 'Icônes SVG' },
            { id: 'lucide', label: 'Lucide utilisées' },
            { id: 'comparison', label: 'Comparaison' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#8BC34A] text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              selectedCategory === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Toutes
          </button>
          {Object.entries(CATEGORY_LABELS).map(([cat, { label, emoji }]) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as IconCategory)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Prochaines icônes à créer</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lucideIconsInUse
                .filter((i) => !i.customReplacement)
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 }
                  return priorityOrder[a.priority] - priorityOrder[b.priority]
                })
                .slice(0, 9)
                .map((icon) => (
                  <div
                    key={icon.name}
                    className={`glass-panel p-4 border ${PRIORITY_COLORS[icon.priority]}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                        {renderLucideIcon(icon.name, 28)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{icon.name}</div>
                        <div className="text-xs text-gray-500">
                          {CATEGORY_LABELS[icon.category]?.emoji} {CATEGORY_LABELS[icon.category]?.label}
                        </div>
                        <div className="text-xs text-gray-500">{icon.usageCount} utilisations</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${PRIORITY_COLORS[icon.priority]}`}
                      >
                        {icon.priority}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'png' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Icônes PNG ({filteredPng.length})
              </h3>
              <div className="text-sm text-gray-400">
                Dossier : <code className="bg-gray-800 px-2 py-0.5 rounded">/public/icons/</code>
              </div>
            </div>

            {filteredPng.length === 0 ? (
              <div className="glass-panel p-8 text-center border-2 border-dashed border-gray-700">
                <div className="text-4xl mb-4">🖼️</div>
                <p className="text-gray-400 mb-2">Aucune icône PNG enregistrée</p>
                <p className="text-sm text-gray-500">
                  Ajoutez vos fichiers PNG dans <code className="bg-gray-800 px-1 rounded">/public/icons/[category]/</code>
                  <br />puis enregistrez-les dans <code className="bg-gray-800 px-1 rounded">pngRegistry.ts</code>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredPng.map((icon) => (
                  <div
                    key={icon.name}
                    className="glass-panel p-4 flex flex-col items-center gap-3 hover:border-pink-500/50 transition-all"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center border border-pink-500/20">
                      <Icon name={icon.name} size={32} />
                    </div>
                    <div className="text-center">
                      <div className="font-mono text-sm text-white">{icon.name}</div>
                      <div className="text-xs text-gray-500">{icon.description}</div>
                      <div className="text-xs text-pink-400 mt-1">{icon.path}</div>
                      {icon.lucideEquivalent && (
                        <div className="text-xs text-purple-400">
                          remplace {icon.lucideEquivalent}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Guide d'ajout PNG */}
            <div className="glass-panel p-6 border-l-4 border-pink-500">
              <h4 className="font-semibold text-white mb-2">Comment ajouter une icône PNG</h4>
              <ol className="text-sm text-gray-400 space-y-2">
                <li>
                  <span className="text-pink-400 font-mono">1.</span> Créer le fichier PNG (64x64 ou 128x128 recommandé)
                </li>
                <li>
                  <span className="text-pink-400 font-mono">2.</span> Placer dans{' '}
                  <code className="bg-gray-800 px-1 rounded">/public/icons/[category]/mon-icone.png</code>
                </li>
                <li>
                  <span className="text-pink-400 font-mono">3.</span> Ouvrir{' '}
                  <code className="bg-gray-800 px-1 rounded">src/components/icons/custom/pngRegistry.ts</code>
                </li>
                <li>
                  <span className="text-pink-400 font-mono">4.</span> Ajouter l'entrée dans le tableau <code className="bg-gray-800 px-1 rounded">pngIcons</code>
                </li>
                <li>
                  <span className="text-pink-400 font-mono">5.</span> L'icône est disponible via{' '}
                  <code className="bg-gray-800 px-1 rounded">{'<Icon name="mon-icone" />'}</code>
                </li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">
              Icônes SVG ({filteredCustom.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredCustom.map((icon) => (
                <div
                  key={icon.name}
                  className="glass-panel p-4 flex flex-col items-center gap-3 hover:border-[#8BC34A]/50 transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8BC34A]/20 to-[#8BC34A]/5 flex items-center justify-center border border-[#8BC34A]/20">
                    <Icon name={icon.name} size={32} color="#8BC34A" forceType="svg" />
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-sm text-white">{icon.name}</div>
                    <div className="text-xs text-gray-500">{icon.description}</div>
                    {icon.lucideEquivalent && (
                      <div className="text-xs text-purple-400 mt-1">
                        remplace {icon.lucideEquivalent}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lucide' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">
              Icônes Lucide utilisées ({filteredLucide.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="pb-3 pr-4">Icône</th>
                    <th className="pb-3 pr-4">Nom</th>
                    <th className="pb-3 pr-4">Catégorie</th>
                    <th className="pb-3 pr-4">Utilisations</th>
                    <th className="pb-3 pr-4">Priorité</th>
                    <th className="pb-3">Remplacement</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLucide.map((icon) => (
                    <tr key={icon.name} className="border-b border-gray-800">
                      <td className="py-3 pr-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                          {renderLucideIcon(icon.name)}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-mono text-white">{icon.name}</td>
                      <td className="py-3 pr-4 text-gray-400">
                        {CATEGORY_LABELS[icon.category]?.emoji} {CATEGORY_LABELS[icon.category]?.label}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{icon.usageCount}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${PRIORITY_COLORS[icon.priority]}`}
                        >
                          {icon.priority}
                        </span>
                      </td>
                      <td className="py-3">
                        {icon.customReplacement ? (
                          <div className="flex items-center gap-2">
                            <Icon name={icon.customReplacement} size={20} color="#8BC34A" />
                            <span className="text-[#8BC34A] font-mono text-sm">
                              {icon.customReplacement}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Comparaison Lucide vs Custom</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {iconMetadata
                .filter((i) => i.lucideEquivalent)
                .map((icon) => (
                  <div key={icon.name} className="glass-panel p-4">
                    <div className="text-sm text-gray-400 mb-3">{icon.description}</div>
                    <div className="flex items-center justify-around">
                      {/* Lucide */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center">
                          {renderLucideIcon(icon.lucideEquivalent!, 32)}
                        </div>
                        <span className="text-xs text-gray-500 font-mono">
                          {icon.lucideEquivalent}
                        </span>
                        <span className="text-[10px] text-gray-600 uppercase">Lucide</span>
                      </div>

                      {/* Arrow */}
                      <div className="text-2xl text-gray-600">→</div>

                      {/* Custom */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8BC34A]/20 to-[#8BC34A]/5 flex items-center justify-center border border-[#8BC34A]/30">
                          <Icon name={icon.name} size={32} color="#8BC34A" />
                        </div>
                        <span className="text-xs text-[#8BC34A] font-mono">{icon.name}</span>
                        <span className="text-[10px] text-[#8BC34A]/70 uppercase">Custom</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Guide d'ajout */}
        <div className="glass-panel p-6 border-l-4 border-purple-500">
          <h4 className="font-semibold text-white mb-2">Comment ajouter une icône custom</h4>
          <ol className="text-sm text-gray-400 space-y-2">
            <li>
              <span className="text-purple-400 font-mono">1.</span> Identifier la catégorie (metrics,
              activities, navigation, status, equipment)
            </li>
            <li>
              <span className="text-purple-400 font-mono">2.</span> Créer ou éditer le fichier
              correspondant dans{' '}
              <code className="bg-gray-800 px-1 rounded">components/icons/custom/[category].tsx</code>
            </li>
            <li>
              <span className="text-purple-400 font-mono">3.</span> Exporter l'icône dans le tableau
              de catégorie (ex: <code className="bg-gray-800 px-1 rounded">metricsIcons</code>)
            </li>
            <li>
              <span className="text-purple-400 font-mono">4.</span> Ajouter les métadonnées dans{' '}
              <code className="bg-gray-800 px-1 rounded">iconMetadata</code> (index.tsx)
            </li>
            <li>
              <span className="text-purple-400 font-mono">5.</span> L'icône est automatiquement
              disponible via{' '}
              <code className="bg-gray-800 px-1 rounded">{'<Icon name="mon-icone" />'}</code>
            </li>
          </ol>
        </div>
      </div>
    </AppLayout>
  )
}
