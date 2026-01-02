import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import AppLayout from '../components/layout/AppLayout'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

interface Equipment {
  id: number
  name: string
  type: string
  brand: string | null
  model: string | null
  initialDistance: number
  currentDistance: number
  alertDistance: number | null
  purchaseDate: string | null
  retirementDate: string | null
  isActive: boolean
  notes: string | null
  createdAt: string
}

const EQUIPMENT_TYPES = [
  'Vélo Route',
  'Vélo VTT',
  'Vélo Gravel',
  'Chaussures Route',
  'Chaussures Trail',
  'Cardio',
  'Capteur Puissance',
  'Autre',
]

export default function Equipment() {
  const formRef = useRef<HTMLDivElement>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'Vélo Route',
    brand: '',
    model: '',
    initialDistance: 0,
    alertDistance: '',
    purchaseDate: '',
    notes: '',
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  })

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/equipment')
      setEquipment(response.data.data)
    } catch {
      // Silencieux
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      ...formData,
      initialDistance: Number(formData.initialDistance) * 1000, // Convertir km en mètres
      alertDistance: formData.alertDistance ? Number(formData.alertDistance) * 1000 : null,
    }

    try {
      if (editingId) {
        await api.patch(`/api/equipment/${editingId}`, data)
      } else {
        await api.post('/api/equipment', data)
      }

      setShowForm(false)
      setEditingId(null)
      resetForm()
      fetchEquipment()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (item: Equipment) => {
    setFormData({
      name: item.name,
      type: item.type,
      brand: item.brand || '',
      model: item.model || '',
      initialDistance: item.initialDistance / 1000, // Convertir mètres en km
      alertDistance: item.alertDistance ? String(item.alertDistance / 1000) : '',
      purchaseDate: item.purchaseDate || '',
      notes: item.notes || '',
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDeleteClick = (id: number) => {
    setDeleteConfirm({ isOpen: true, id })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return
    try {
      await api.delete(`/api/equipment/${deleteConfirm.id}`)
      fetchEquipment()
      toast.success('Equipement supprimé')
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleteConfirm({ isOpen: false, id: null })
    }
  }

  const toggleActive = async (item: Equipment) => {
    try {
      await api.patch(`/api/equipment/${item.id}`, {
        isActive: !item.isActive,
        retirementDate: !item.isActive ? null : new Date().toISOString().split('T')[0],
      })
      fetchEquipment()
    } catch (error) {
      // Erreur gérée par toast
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Vélo Route',
      brand: '',
      model: '',
      initialDistance: 0,
      alertDistance: '',
      purchaseDate: '',
      notes: '',
    })
  }

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(0) + ' km'
  }

  const getTypeIcon = (type: string) => {
    if (type.includes('Vélo')) return '🚴'
    if (type.includes('Chaussures')) return '👟'
    if (type === 'Cardio') return '⌚'
    if (type === 'Capteur Puissance') return '⚡'
    return '🔧'
  }

  const getMaintenanceStatus = (item: Equipment) => {
    if (!item.alertDistance) return null

    const distanceSinceNew = item.currentDistance - item.initialDistance
    const remaining = item.alertDistance - distanceSinceNew
    const percentage = (distanceSinceNew / item.alertDistance) * 100

    if (remaining <= 0) {
      return { status: 'urgent', label: 'Maintenance urgente !', color: 'bg-danger', percentage: 100 }
    } else if (remaining <= 500000) { // Moins de 500km
      return { status: 'soon', label: `Maintenance dans ${formatDistance(remaining)}`, color: 'bg-warning', percentage }
    } else {
      return { status: 'ok', label: `Prochain entretien: ${formatDistance(remaining)}`, color: 'bg-success', percentage }
    }
  }

  const actions = (
    <button
      onClick={() => {
        setShowForm(true)
        setEditingId(null)
        resetForm()
        setTimeout(scrollToForm, 200)
      }}
      className="btn-primary font-display"
    >
      Ajouter un équipement
    </button>
  )

  if (loading) {
    return (
      <AppLayout title="Équipement" description="Gestion de votre matériel" actions={actions}>
        <div className="glass-panel p-6 text-center text-text-secondary">Chargement...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Équipement" description="Suivez l'usure et planifiez vos remplacements" actions={actions}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Matériel"
          title="Mon Équipement"
          description="Suivez l'usure de votre matériel et planifiez vos remplacements."
          icon="equipment"
          gradient="from-[#8BC34A] to-[#5CE1E6]"
          accentColor="#8BC34A"
        />

        {/* Formulaire */}
        {showForm && (
          <div ref={formRef} className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Modifier l\'équipement' : 'Nouvel équipement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
                    required
                  >
                    {EQUIPMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Modèle
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Kilométrage initial (km)
                  </label>
                  <input
                    type="number"
                    value={formData.initialDistance}
                    onChange={(e) =>
                      setFormData({ ...formData, initialDistance: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Alerte de maintenance (km)
                  </label>
                  <input
                    type="number"
                    value={formData.alertDistance}
                    onChange={(e) => setFormData({ ...formData, alertDistance: e.target.value })}
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
                    min="0"
                    placeholder="Ex: 5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Date d'achat
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-body mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-border-base rounded-lg focus:ring-2 focus:ring-forest-blue focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary px-6">
                  {editingId ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des équipements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => {
            const maintenanceStatus = getMaintenanceStatus(item)

            return (
              <div
                key={item.id}
                className={`glass-panel p-6 ${!item.isActive ? 'opacity-60' : ''} ${
                  maintenanceStatus?.status === 'urgent' ? 'ring-2 ring-danger' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getTypeIcon(item.type)}</span>
                    <div>
                      <h3 className="font-semibold text-lg text-text-dark dark:text-dark-text-contrast">{item.name}</h3>
                      <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{item.type}</p>
                    </div>
                  </div>
                  {!item.isActive && (
                    <span className="text-xs bg-bg-subtle text-text-body px-2 py-1 rounded-full border border-panel-border">
                      Retraité
                    </span>
                  )}
                </div>

                {(item.brand || item.model) && (
                  <p className="text-sm text-text-body dark:text-dark-text-secondary mb-3">
                    {item.brand} {item.model}
                  </p>
                )}

                {/* Alerte de maintenance */}
                {maintenanceStatus && item.isActive && (
                  <div className={`mb-4 p-3 rounded-xl border-2 ${
                    maintenanceStatus.status === 'urgent'
                      ? 'bg-danger/10 border-danger'
                      : maintenanceStatus.status === 'soon'
                      ? 'bg-warning/10 border-warning'
                      : 'bg-success/10 border-success'
                  }`}>
                    <p className={`text-sm font-medium mb-2 ${
                      maintenanceStatus.status === 'urgent'
                        ? 'text-danger'
                        : maintenanceStatus.status === 'soon'
                        ? 'text-warning dark:text-warning'
                        : 'text-success'
                    }`}>
                      {maintenanceStatus.label}
                    </p>

                    {/* Barre de progression */}
                    <div className="w-full bg-bg-subtle rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          maintenanceStatus.status === 'urgent'
                            ? 'bg-danger'
                            : maintenanceStatus.status === 'soon'
                            ? 'bg-warning'
                            : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(maintenanceStatus.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-body dark:text-dark-text-secondary">Distance totale:</span>
                    <span className="font-medium text-text-dark dark:text-dark-text-contrast">{formatDistance(item.currentDistance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-body dark:text-dark-text-secondary">Distance parcourue:</span>
                    <span className="font-medium text-text-dark dark:text-dark-text-contrast">
                      {formatDistance(item.currentDistance - item.initialDistance)}
                    </span>
                  </div>
                  {item.purchaseDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-body dark:text-dark-text-secondary">Acheté le:</span>
                      <span className="font-medium text-text-dark dark:text-dark-text-contrast">
                        {new Date(item.purchaseDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <div className="mb-4 p-3 bg-bg-subtle rounded-xl border border-panel-border">
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary italic">
                      "{item.notes}"
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-panel-border bg-panel-bg hover:bg-accent/10 text-text-secondary dark:text-dark-text-secondary hover:text-accent transition-all text-sm font-medium"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => toggleActive(item)}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      item.isActive
                        ? 'border-warning bg-warning/10 text-warning hover:bg-warning/20'
                        : 'border-success bg-success/10 text-success hover:bg-success/20'
                    }`}
                  >
                    {item.isActive ? 'Retirer' : 'Réactiver'}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className="px-3 py-2 rounded-xl text-sm font-medium border-2 border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 transition-all"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {equipment.length === 0 && !showForm && (
          <div className="glass-panel p-12 text-center">
            <p className="text-text-secondary text-lg mb-4">Aucun équipement enregistré</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary px-8"
            >
              Ajouter votre premier équipement
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'équipement"
        message="Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
      />
    </AppLayout>
  )
}
