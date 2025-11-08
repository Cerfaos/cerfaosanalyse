import { useState, useEffect } from 'react'
import api from '../services/api'

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Équipement</h1>
            <p className="mt-2 text-gray-600">Gérez vos vélos, chaussures et matériel</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
              resetForm()
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Ajouter un équipement
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Modifier l\'équipement' : 'Nouvel équipement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kilométrage initial (km)
                  </label>
                  <input
                    type="number"
                    value={formData.initialDistance}
                    onChange={(e) =>
                      setFormData({ ...formData, initialDistance: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alerte de maintenance (km)
                  </label>
                  <input
                    type="number"
                    value={formData.alertDistance}
                    onChange={(e) => setFormData({ ...formData, alertDistance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    placeholder="Ex: 5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'achat
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    resetForm()
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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
              className={`bg-white p-6 rounded-lg shadow ${
                !item.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{getTypeIcon(item.type)}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.type}</p>
                  </div>
                </div>
                {!item.isActive && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    Retraité
                  </span>
                )}
              </div>

              {(item.brand || item.model) && (
                <p className="text-sm text-gray-600 mb-3">
                  {item.brand} {item.model}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Distance totale:</span>
                  <span className="font-medium">{formatDistance(item.currentDistance)}</span>
                </div>
                {item.alertDistance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prochain entretien:</span>
                    <span className="font-medium">
                      {formatDistance(
                        item.alertDistance - (item.currentDistance - item.initialDistance)
                      )}
                    </span>
                  </div>
                )}
                {item.purchaseDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Acheté le:</span>
                    <span className="font-medium">
                      {new Date(item.purchaseDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => toggleActive(item)}
                  className={`flex-1 px-3 py-1 rounded text-sm transition-colors ${
                    item.isActive
                      ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {item.isActive ? 'Retirer' : 'Réactiver'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {equipment.length === 0 && !showForm && (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg mb-4">Aucun équipement enregistré</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter votre premier équipement
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
