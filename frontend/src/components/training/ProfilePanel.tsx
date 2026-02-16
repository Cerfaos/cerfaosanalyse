import { useState, useEffect } from 'react'
import { Zap, Save, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { useTrainingStore } from '../../store/trainingStore'
import type { FtpHistoryEntry } from '../../types/training'
import { percentFtpToWatts } from '../../types/training'
import toast from 'react-hot-toast'

// Zones de puissance avec couleurs adaptées au thème
const POWER_ZONES = [
  { zone: 1, name: 'Récupération active', min: 0, max: 55, color: 'var(--text-disabled)' },
  { zone: 2, name: 'Endurance', min: 56, max: 75, color: 'var(--brand-primary)' },
  { zone: 3, name: 'Tempo', min: 76, max: 90, color: 'var(--brand-secondary)' },
  { zone: 4, name: 'Seuil', min: 91, max: 105, color: 'var(--metric-energy)' },
  { zone: 5, name: 'VO2max', min: 106, max: 120, color: 'var(--metric-alert)' },
  { zone: 6, name: 'Anaérobie', min: 121, max: 150, color: '#8b5cf6' },
  { zone: 7, name: 'Neuromusculaire', min: 151, max: 300, color: '#ec4899' },
]

interface FtpHistoryChartProps {
  history: FtpHistoryEntry[]
  currentFtp: number
}

function FtpHistoryChart({ history, currentFtp }: FtpHistoryChartProps) {
  if (!history || history.length === 0) {
    return (
      <div className="h-32 bg-muted rounded-lg flex items-center justify-center text-text-muted text-sm">
        Aucun historique de FTP
      </div>
    )
  }

  const allValues = [...history.map((h) => h.ftp), currentFtp]
  const maxFtp = Math.max(...allValues)
  const minFtp = Math.min(...allValues)
  const range = maxFtp - minFtp || 1

  return (
    <div className="h-32 bg-muted rounded-lg p-3">
      <div className="h-full flex items-end gap-2">
        {history.slice(-12).map((entry, idx) => {
          const height = ((entry.ftp - minFtp) / range) * 80 + 20
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                style={{ height: `${height}%` }}
                title={`${entry.ftp}W - ${new Date(entry.date).toLocaleDateString('fr-FR')}`}
              />
              <span className="text-xs text-text-muted">
                {new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short' })}
              </span>
            </div>
          )
        })}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-[var(--brand-primary)] rounded-t"
            style={{ height: `${((currentFtp - minFtp) / range) * 80 + 20}%` }}
            title={`Actuel: ${currentFtp}W`}
          />
          <span className="text-xs text-[var(--brand-primary)] font-medium">Actuel</span>
        </div>
      </div>
    </div>
  )
}

interface ProfilePanelProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal de gestion du profil cycliste (FTP, poids, FC)
 */
export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { profile, updateProfileApi } = useTrainingStore()

  const [formData, setFormData] = useState({
    ftp: profile.ftp || 200,
    weight: profile.weight || 75,
    fcMax: profile.fcMax || 185,
    fcRepos: profile.fcRepos || 50,
  })

  const [newFtp, setNewFtp] = useState(profile.ftp || 200)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFormData({
      ftp: profile.ftp || 200,
      weight: profile.weight || 75,
      fcMax: profile.fcMax || 185,
      fcRepos: profile.fcRepos || 50,
    })
    setNewFtp(profile.ftp || 200)
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Envoyer toutes les modifications à l'API
      await updateProfileApi({
        ftp: newFtp,
        weight: formData.weight,
        fcMax: formData.fcMax,
        fcRepos: formData.fcRepos,
      })
      toast.success('Profil enregistré')
      onClose()
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement du profil')
      // Erreur gérée par toast
    } finally {
      setSaving(false)
    }
  }

  const ftpDiff = newFtp - (profile.ftp || 0)
  const ftpDiffPercent =
    profile.ftp && profile.ftp > 0 ? ((ftpDiff / profile.ftp) * 100).toFixed(1) : '0'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profil Cycliste</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* FTP Section */}
          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-primary h-5 w-5" />
              <h3 className="font-semibold text-text-primary">
                FTP (Functional Threshold Power)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  FTP actuelle
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newFtp}
                    onChange={(e) => setNewFtp(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-3 text-2xl font-bold border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-text-secondary">
                    W
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-end">
                {ftpDiff !== 0 && (
                  <div
                    className={`p-3 rounded-lg ${
                      ftpDiff > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <div
                      className={`text-lg font-bold ${
                        ftpDiff > 0 ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {ftpDiff > 0 ? '+' : ''}
                      {ftpDiff}W
                    </div>
                    <div
                      className={`text-sm ${ftpDiff > 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {ftpDiff > 0 ? '+' : ''}
                      {ftpDiffPercent}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Historique FTP
              </label>
              <FtpHistoryChart history={profile.ftpHistory} currentFtp={newFtp} />
            </div>

            <p className="text-sm text-text-secondary">
              La FTP est utilisée pour calculer automatiquement les watts cibles dans
              toutes vos séances.
            </p>
          </div>

          {/* Autres paramètres */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Poids
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                  kg
                </span>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-text-muted">W/kg @ FTP</div>
              <div className="text-xl font-bold text-text-primary">
                {formData.weight > 0 ? (newFtp / formData.weight).toFixed(2) : '0'} W/kg
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                FC Max
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.fcMax}
                  onChange={(e) =>
                    setFormData({ ...formData, fcMax: parseInt(e.target.value) || 0 })
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                  bpm
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                FC Repos
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.fcRepos}
                  onChange={(e) =>
                    setFormData({ ...formData, fcRepos: parseInt(e.target.value) || 0 })
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                  bpm
                </span>
              </div>
            </div>
          </div>

          {/* Zones de puissance */}
          <div>
            <h4 className="font-medium text-text-primary mb-3">
              Zones de puissance (basées sur FTP)
            </h4>
            <div className="space-y-2">
              {POWER_ZONES.map((zone) => {
                const minWatts = percentFtpToWatts(zone.min, newFtp)
                const maxWatts = percentFtpToWatts(zone.max, newFtp)
                return (
                  <div key={zone.zone} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: zone.color }}
                    >
                      Z{zone.zone}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-text-primary">{zone.name}</div>
                      <div className="text-xs text-text-muted">
                        {zone.min}-{zone.max}% FTP
                      </div>
                    </div>
                    <div className="text-sm font-mono text-text-secondary">
                      {minWatts}-{maxWatts}W
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProfilePanel
