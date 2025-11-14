import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'

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

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/equipment')
      setEquipment(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'équipement:', error)
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
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde de l\'équipement')
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

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) return

    try {
      await api.delete(`/api/equipment/${id}`)
      fetchEquipment()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
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
      console.error('Erreur lors de la mise à jour:', error)
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
          {equipment.map((item) => (
            <div
              key={item.id}
              className={`glass-panel p-6 ${!item.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{getTypeIcon(item.type)}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-text-secondary">{item.type}</p>
                  </div>
                </div>
                {!item.isActive && (
                  <span className="text-xs bg-bg-gray-200 text-text-body px-2 py-1 rounded">
                    Retraité
                  </span>
                )}
              </div>

              {(item.brand || item.model) && (
                <p className="text-sm text-text-body mb-3">
                  {item.brand} {item.model}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-body">Distance totale:</span>
                  <span className="font-medium">{formatDistance(item.currentDistance)}</span>
                </div>
                {item.alertDistance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-body">Prochain entretien:</span>
                    <span className="font-medium">
                      {formatDistance(
                        item.alertDistance - (item.currentDistance - item.initialDistance)
                      )}
                    </span>
                  </div>
                )}
                {item.purchaseDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-body">Acheté le:</span>
                    <span className="font-medium">
                      {new Date(item.purchaseDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 px-3 py-1 rounded-full border border-info text-info-dark bg-info-light/70 text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => toggleActive(item)}
                  className={`flex-1 px-3 py-1 rounded-full text-sm border transition-colors ${
                    item.isActive
                      ? 'border-warning text-warning bg-warning-light/80'
                      : 'border-success text-success bg-success-light/80'
                  }`}
                >
                  {item.isActive ? 'Retirer' : 'Réactiver'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1 rounded-full text-sm border border-danger/40 text-danger"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
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
    </AppLayout>
  )
}
