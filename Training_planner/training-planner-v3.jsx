import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, X, Clock, Zap, Heart, Dumbbell, Bike, Save, Trash2, Edit2, Copy, BookOpen, FolderPlus, Download, Upload, Star, ChevronDown, ChevronUp, User, Settings, TrendingUp, Activity, Weight } from 'lucide-react';

// ============================================
// DONNÉES ET CONSTANTES
// ============================================

const BLOCK_TYPES = {
  WARMUP: { id: 'warmup', label: 'Échauffement', color: '#9CA3AF' },
  INTERVAL: { id: 'interval', label: 'Intervalle', color: '#F59E0B' },
  EFFORT: { id: 'effort', label: 'Effort', color: '#EF4444' },
  RECOVERY: { id: 'recovery', label: 'Récupération', color: '#10B981' },
  COOLDOWN: { id: 'cooldown', label: 'Retour au calme', color: '#6B7280' }
};

const SESSION_CATEGORIES = {
  CYCLING: { id: 'cycling', label: 'Cyclisme', icon: Bike, color: '#D97706' },
  PPG: { id: 'ppg', label: 'PPG', icon: Dumbbell, color: '#7C3AED' }
};

const INTENSITY_REFERENCES = [
  { id: 'ftp', label: '% FTP' },
  { id: 'fcmax', label: '% FC Max' },
  { id: 'rpe', label: 'RPE (1-10)' }
];

const LEVEL_OPTIONS = [
  { id: 'beginner', label: 'Débutant' },
  { id: 'intermediate', label: 'Intermédiaire' },
  { id: 'expert', label: 'Expert' }
];

const LOCATION_OPTIONS = [
  { id: 'indoor', label: 'Intérieur (Home Trainer)' },
  { id: 'outdoor', label: 'Extérieur' },
  { id: 'both', label: 'Les deux' }
];

// Zones d'entraînement basées sur % FTP
const POWER_ZONES = [
  { zone: 1, name: 'Récupération active', min: 0, max: 55, color: '#9CA3AF' },
  { zone: 2, name: 'Endurance', min: 56, max: 75, color: '#3B82F6' },
  { zone: 3, name: 'Tempo', min: 76, max: 90, color: '#10B981' },
  { zone: 4, name: 'Seuil', min: 91, max: 105, color: '#F59E0B' },
  { zone: 5, name: 'VO2max', min: 106, max: 120, color: '#EF4444' },
  { zone: 6, name: 'Anaérobie', min: 121, max: 150, color: '#7C3AED' },
  { zone: 7, name: 'Neuromuscular', min: 151, max: 300, color: '#EC4899' }
];

const getZoneForPercent = (percent) => {
  return POWER_ZONES.find(z => percent >= z.min && percent <= z.max) || POWER_ZONES[0];
};

// Templates par défaut (Semaine 1) - STOCKÉS EN % FTP
const DEFAULT_TEMPLATES = {
  cycling: [
    {
      id: 'critical-power-test-beginner',
      name: 'Test Puissance Critique',
      level: 'beginner',
      week: 1,
      intensityRef: 'ftp',
      duration: 68,
      tss: 68,
      description: 'Test pour déterminer la puissance critique. Version débutant avec efforts de 3min et 12min.',
      isDefault: true,
      blocks: [
        { type: 'warmup', duration: '05:00', percentFtp: 50, reps: 1, notes: '' },
        { type: 'warmup', duration: '10:00', percentFtp: 58, reps: 1, notes: '' },
        { type: 'warmup', duration: '03:00', percentFtp: 67, reps: 1, notes: '' },
        { type: 'warmup', duration: '02:00', percentFtp: 50, reps: 1, notes: '' },
        { type: 'interval', duration: '00:15', percentFtp: 150, reps: 4, notes: 'Sprint' },
        { type: 'recovery', duration: '00:45', percentFtp: 50, reps: 4, notes: '' },
        { type: 'warmup', duration: '10:00', percentFtp: 58, reps: 1, notes: '' },
        { type: 'effort', duration: '03:00', percentFtp: 125, reps: 1, notes: 'Meilleure puissance possible' },
        { type: 'recovery', duration: '10:00', percentFtp: 50, reps: 1, notes: '' },
        { type: 'effort', duration: '12:00', percentFtp: 95, reps: 1, notes: 'Meilleure puissance possible' },
        { type: 'recovery', duration: '10:00', percentFtp: 50, reps: 1, notes: '' }
      ]
    },
    {
      id: 'critical-power-test-expert',
      name: 'Test Puissance Critique',
      level: 'expert',
      week: 1,
      intensityRef: 'ftp',
      duration: 80,
      tss: 88,
      description: 'Test pour déterminer la puissance critique. Version expert avec efforts de 5min et 20min.',
      isDefault: true,
      blocks: [
        { type: 'warmup', duration: '05:00', percentFtp: 50, reps: 1, notes: '' },
        { type: 'warmup', duration: '05:00', percentFtp: 58, reps: 1, notes: '' },
        { type: 'warmup', duration: '03:00', percentFtp: 67, reps: 1, notes: '' },
        { type: 'warmup', duration: '02:00', percentFtp: 50, reps: 1, notes: '' },
        { type: 'interval', duration: '00:15', percentFtp: 150, reps: 4, notes: 'Sprint' },
        { type: 'recovery', duration: '00:45', percentFtp: 50, reps: 4, notes: '' },
        { type: 'warmup', duration: '10:00', percentFtp: 58, reps: 1, notes: '' },
        { type: 'effort', duration: '05:00', percentFtp: 125, reps: 1, notes: 'Meilleure puissance possible' },
        { type: 'recovery', duration: '10:00', percentFtp: 50, reps: 1, notes: '' },
        { type: 'effort', duration: '20:00', percentFtp: 95, reps: 1, notes: 'Meilleure puissance possible' },
        { type: 'recovery', duration: '10:00', percentFtp: 50, reps: 1, notes: '' }
      ]
    },
    {
      id: 'endurance-velocity',
      name: 'Endurance + Vélocité',
      level: 'intermediate',
      week: 1,
      intensityRef: 'ftp',
      duration: 55,
      tss: 42,
      description: 'Séance combinant endurance Z2 et travail de vélocité. Idéal pour améliorer le coup de pédale.',
      isDefault: true,
      blocks: [
        { type: 'warmup', duration: '05:00', percentFtp: 50, reps: 1, notes: '' },
        { type: 'warmup', duration: '05:00', percentFtp: 58, reps: 1, notes: '' },
        { type: 'warmup', duration: '05:00', percentFtp: 67, reps: 1, notes: '' },
        { type: 'interval', duration: '01:00', percentFtp: 67, reps: 6, notes: '100-110 rpm - Vélocité haute' },
        { type: 'recovery', duration: '02:00', percentFtp: 50, reps: 6, notes: '' },
        { type: 'warmup', duration: '05:00', percentFtp: 67, reps: 1, notes: '' },
        { type: 'cooldown', duration: '10:00', percentFtp: 58, reps: 1, notes: '' }
      ]
    },
    {
      id: 'sweet-spot-indoor',
      name: 'Sweet Spot Z2 + 3 blocs',
      level: 'intermediate',
      week: 1,
      location: 'indoor',
      intensityRef: 'ftp',
      duration: 65,
      tss: 63,
      description: 'Séance Sweet Spot en intérieur. Haut de Z2 avec 3 blocs à Sweet Spot (88-94% FTP).',
      isDefault: true,
      blocks: [
        { type: 'warmup', duration: '05:00', percentFtp: 42, reps: 1, notes: '' },
        { type: 'warmup', duration: '05:00', percentFtp: 50, reps: 1, notes: '' },
        { type: 'warmup', duration: '05:00', percentFtp: 58, reps: 1, notes: '' },
        { type: 'effort', duration: '08:00', percentFtp: 90, reps: 3, notes: 'Sweet Spot 88-94% FTP' },
        { type: 'recovery', duration: '04:00', percentFtp: 50, reps: 3, notes: '' },
        { type: 'cooldown', duration: '05:00', percentFtp: 42, reps: 1, notes: '' }
      ]
    },
    {
      id: 'sweet-spot-outdoor',
      name: 'Sweet Spot Z2 + 3 blocs',
      level: 'intermediate',
      week: 1,
      location: 'outdoor',
      intensityRef: 'ftp',
      duration: 90,
      tss: 75,
      description: 'Séance Sweet Spot en extérieur. Parcours vallonné idéal.',
      isDefault: true,
      blocks: [
        { type: 'warmup', duration: '15:00', percentFtp: 50, reps: 1, notes: 'Mise en route tranquille' },
        { type: 'warmup', duration: '10:00', percentFtp: 58, reps: 1, notes: 'Augmentation progressive' },
        { type: 'effort', duration: '10:00', percentFtp: 90, reps: 3, notes: 'Sweet Spot en côte ou faux-plat' },
        { type: 'recovery', duration: '05:00', percentFtp: 50, reps: 3, notes: '' },
        { type: 'cooldown', duration: '15:00', percentFtp: 42, reps: 1, notes: 'Retour tranquille' }
      ]
    }
  ],
  ppg: [
    {
      id: 'ppg-circuit-base',
      name: 'Circuit PPG Complet',
      level: 'beginner',
      week: 1,
      duration: 30,
      description: 'Circuit de base : Air Squat, Planche, Fentes, Chaise, Romanian Deadlift',
      isDefault: true,
      exercises: [
        { name: 'Air Squat', duration: '00:30', reps: 15, sets: 3, rest: '00:30', hrTarget: '115-153', notes: 'Dos droit, descendre jusqu\'aux cuisses parallèles' },
        { name: 'Planche', duration: '00:45', reps: null, sets: 3, rest: '00:30', hrTarget: '115-153', notes: 'Gainage strict, corps aligné' },
        { name: 'Fentes arrières', duration: '00:30', reps: 12, sets: 3, rest: '00:30', hrTarget: '115-153', notes: 'Alternées, genou frôle le sol' },
        { name: 'Chaise murale', duration: '00:45', reps: null, sets: 3, rest: '00:30', hrTarget: '115-153', notes: 'Cuisses parallèles au sol' },
        { name: 'Romanian Deadlift', duration: '00:30', reps: 12, sets: 3, rest: '00:30', hrTarget: '115-153', notes: 'Jambes légèrement fléchies, dos plat' }
      ]
    },
    {
      id: 'ppg-core-cycling',
      name: 'PPG Core Cycliste',
      level: 'intermediate',
      week: 1,
      duration: 25,
      description: 'Renforcement du core spécifique cyclisme',
      isDefault: true,
      exercises: [
        { name: 'Planche frontale', duration: '01:00', reps: null, sets: 3, rest: '00:30', hrTarget: '100-130', notes: '' },
        { name: 'Planche latérale', duration: '00:30', reps: null, sets: 3, rest: '00:30', hrTarget: '100-130', notes: 'Chaque côté' },
        { name: 'Superman', duration: '00:30', reps: 15, sets: 3, rest: '00:30', hrTarget: '100-130', notes: '' },
        { name: 'Dead Bug', duration: '00:45', reps: 20, sets: 3, rest: '00:30', hrTarget: '100-130', notes: 'Contrôle du mouvement' },
        { name: 'Bridge', duration: '00:30', reps: 15, sets: 3, rest: '00:30', hrTarget: '100-130', notes: 'Squeeze fessiers en haut' }
      ]
    }
  ]
};

// Profil utilisateur par défaut
const DEFAULT_PROFILE = {
  ftp: 200,
  weight: 75,
  fcMax: 185,
  fcRepos: 50,
  ftpHistory: []
};

// ============================================
// UTILITAIRES
// ============================================

const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`;
};

const parseDurationToSeconds = (str) => {
  if (!str) return 0;
  const parts = str.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Calculs de puissance
const calculateWatts = (percentFtp, ftp) => Math.round((percentFtp / 100) * ftp);
const calculateWattsPerKg = (watts, weight) => weight > 0 ? (watts / weight).toFixed(2) : 0;
const calculatePercentFtp = (watts, ftp) => ftp > 0 ? Math.round((watts / ftp) * 100) : 0;

// ============================================
// COMPOSANTS UI DE BASE
// ============================================

const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', type = 'button', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-200',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  };
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, error, className = '', suffix, ...props }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <div className="relative">
      <input
        className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${suffix ? 'pr-12' : ''}`}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
          {suffix}
        </span>
      )}
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const Textarea = ({ label, error, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea
      className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      rows={3}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const Select = ({ label, options, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select
      className="w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
      {...props}
    >
      {options.map(opt => (
        <option key={opt.id || opt.value} value={opt.id || opt.value}>
          {opt.label || opt.name}
        </option>
      ))}
    </select>
  </div>
);

const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

const Tabs = ({ tabs, activeTab, onChange }) => (
  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === tab.id
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {tab.icon && <tab.icon size={18} />}
        {tab.label}
      </button>
    ))}
  </div>
);

// ============================================
// COMPOSANTS PROFIL ET FTP
// ============================================

const FtpHistoryChart = ({ history, currentFtp }) => {
  if (!history || history.length === 0) {
    return (
      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 text-sm">
        Aucun historique de FTP
      </div>
    );
  }
  
  const allValues = [...history.map(h => h.ftp), currentFtp];
  const maxFtp = Math.max(...allValues);
  const minFtp = Math.min(...allValues);
  const range = maxFtp - minFtp || 1;
  
  return (
    <div className="h-32 bg-gray-50 rounded-lg p-3">
      <div className="h-full flex items-end gap-2">
        {history.slice(-12).map((entry, idx) => {
          const height = ((entry.ftp - minFtp) / range) * 80 + 20;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-amber-500 rounded-t transition-all hover:bg-amber-600"
                style={{ height: `${height}%` }}
                title={`${entry.ftp}W - ${new Date(entry.date).toLocaleDateString('fr-FR')}`}
              />
              <span className="text-xs text-gray-500">
                {new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short' })}
              </span>
            </div>
          );
        })}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-green-500 rounded-t"
            style={{ height: `${((currentFtp - minFtp) / range) * 80 + 20}%` }}
            title={`Actuel: ${currentFtp}W`}
          />
          <span className="text-xs text-green-600 font-medium">Actuel</span>
        </div>
      </div>
    </div>
  );
};

const ProfilePanel = ({ profile, onUpdate, isOpen, onClose }) => {
  const [formData, setFormData] = useState(profile);
  const [newFtp, setNewFtp] = useState(profile.ftp);
  
  useEffect(() => {
    setFormData(profile);
    setNewFtp(profile.ftp);
  }, [profile]);
  
  const handleSave = () => {
    const updatedProfile = { ...formData };
    
    // Si la FTP a changé, l'ajouter à l'historique
    if (newFtp !== profile.ftp) {
      updatedProfile.ftp = newFtp;
      updatedProfile.ftpHistory = [
        ...(profile.ftpHistory || []),
        { ftp: profile.ftp, date: new Date().toISOString() }
      ];
    }
    
    onUpdate(updatedProfile);
    onClose();
  };
  
  const ftpDiff = newFtp - profile.ftp;
  const ftpDiffPercent = profile.ftp > 0 ? ((ftpDiff / profile.ftp) * 100).toFixed(1) : 0;
  
  if (!isOpen) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profil Cycliste" size="md">
      <div className="space-y-6">
        {/* FTP Section */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-amber-600" size={20} />
            <h3 className="font-semibold text-gray-900">FTP (Functional Threshold Power)</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FTP actuelle</label>
              <div className="relative">
                <input
                  type="number"
                  value={newFtp}
                  onChange={(e) => setNewFtp(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-3 text-2xl font-bold border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500">W</span>
              </div>
            </div>
            <div className="flex flex-col justify-end">
              {ftpDiff !== 0 && (
                <div className={`p-3 rounded-lg ${ftpDiff > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className={`text-lg font-bold ${ftpDiff > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {ftpDiff > 0 ? '+' : ''}{ftpDiff}W
                  </div>
                  <div className={`text-sm ${ftpDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ftpDiff > 0 ? '+' : ''}{ftpDiffPercent}%
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Historique FTP</label>
            <FtpHistoryChart history={profile.ftpHistory} currentFtp={newFtp} />
          </div>
          
          <p className="text-sm text-gray-600">
            La FTP est utilisée pour calculer automatiquement les watts cibles dans toutes vos séances.
          </p>
        </div>
        
        {/* Autres paramètres */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Poids"
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
            suffix="kg"
          />
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">W/kg @ FTP</div>
            <div className="text-xl font-bold text-gray-900">
              {formData.weight > 0 ? (newFtp / formData.weight).toFixed(2) : '0'} W/kg
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="FC Max"
            type="number"
            value={formData.fcMax}
            onChange={(e) => setFormData({ ...formData, fcMax: parseInt(e.target.value) || 0 })}
            suffix="bpm"
          />
          <Input
            label="FC Repos"
            type="number"
            value={formData.fcRepos}
            onChange={(e) => setFormData({ ...formData, fcRepos: parseInt(e.target.value) || 0 })}
            suffix="bpm"
          />
        </div>
        
        {/* Zones de puissance */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Zones de puissance (basées sur FTP)</h4>
          <div className="space-y-2">
            {POWER_ZONES.map(zone => {
              const minWatts = calculateWatts(zone.min, newFtp);
              const maxWatts = calculateWatts(zone.max, newFtp);
              return (
                <div key={zone.zone} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: zone.color }}
                  >
                    Z{zone.zone}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                    <div className="text-xs text-gray-500">{zone.min}-{zone.max}% FTP</div>
                  </div>
                  <div className="text-sm font-mono text-gray-700">
                    {minWatts}-{maxWatts}W
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save size={18} />
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ============================================
// COMPOSANTS GRAPHIQUES SÉANCE
// ============================================

// Visualisation graphique avec zones de puissance
const SessionGraph = ({ blocks, ftp }) => {
  if (!blocks || blocks.length === 0) return null;
  
  const totalDuration = blocks.reduce((acc, b) => {
    const duration = parseDurationToSeconds(b.duration);
    return acc + (duration * (b.reps || 1));
  }, 0);
  
  return (
    <div className="h-20 bg-gray-50 rounded-lg p-2 flex items-end gap-px overflow-hidden">
      {blocks.map((block, idx) => {
        const duration = parseDurationToSeconds(block.duration);
        const reps = block.reps || 1;
        const totalBlockDuration = duration * reps;
        const width = (totalBlockDuration / totalDuration) * 100;
        const height = Math.min((block.percentFtp / 150) * 100, 100);
        const zone = getZoneForPercent(block.percentFtp);
        
        const watts = calculateWatts(block.percentFtp, ftp);
        
        return (
          <div
            key={idx}
            className="flex-shrink-0 rounded-t transition-all hover:opacity-80 relative group"
            style={{
              width: `${width}%`,
              height: `${height}%`,
              backgroundColor: zone.color,
              minWidth: '4px'
            }}
            title={`${block.percentFtp}% FTP = ${watts}W - ${block.duration}`}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {block.percentFtp}% = {watts}W
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Badge de zone de puissance
const ZoneBadge = ({ percentFtp }) => {
  const zone = getZoneForPercent(percentFtp);
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white"
      style={{ backgroundColor: zone.color }}
    >
      Z{zone.zone}
    </span>
  );
};

// ============================================
// ÉDITEUR DE BLOCS AVEC % FTP
// ============================================

const BlockEditor = ({ blocks, onChange, category, ftp, weight }) => {
  const addBlock = () => {
    const newBlock = category === 'cycling'
      ? { type: 'warmup', duration: '05:00', percentFtp: 50, reps: 1, notes: '' }
      : { name: 'Exercice', duration: '00:30', reps: 10, sets: 3, rest: '00:30', hrTarget: '', notes: '' };
    onChange([...blocks, newBlock]);
  };
  
  const updateBlock = (index, field, value) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };
  
  const removeBlock = (index) => {
    onChange(blocks.filter((_, i) => i !== index));
  };
  
  const duplicateBlock = (index) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, { ...blocks[index] });
    onChange(newBlocks);
  };
  
  const moveBlock = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    onChange(newBlocks);
  };
  
  if (category === 'ppg') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Exercices</h4>
          <Button variant="secondary" size="sm" onClick={addBlock}>
            <Plus size={16} /> Ajouter
          </Button>
        </div>
        {blocks.map((exercise, idx) => (
          <Card key={idx} className="p-4">
            <div className="grid grid-cols-12 gap-3">
              <Input
                label="Nom"
                value={exercise.name}
                onChange={(e) => updateBlock(idx, 'name', e.target.value)}
                className="col-span-4"
              />
              <Input
                label="Durée"
                value={exercise.duration}
                onChange={(e) => updateBlock(idx, 'duration', e.target.value)}
                placeholder="00:30"
                className="col-span-2"
              />
              <Input
                label="Reps"
                type="number"
                value={exercise.reps || ''}
                onChange={(e) => updateBlock(idx, 'reps', e.target.value ? parseInt(e.target.value) : null)}
                className="col-span-2"
              />
              <Input
                label="Séries"
                type="number"
                value={exercise.sets}
                onChange={(e) => updateBlock(idx, 'sets', parseInt(e.target.value) || 1)}
                className="col-span-2"
              />
              <Input
                label="Repos"
                value={exercise.rest}
                onChange={(e) => updateBlock(idx, 'rest', e.target.value)}
                placeholder="00:30"
                className="col-span-2"
              />
              <Input
                label="Notes"
                value={exercise.notes}
                onChange={(e) => updateBlock(idx, 'notes', e.target.value)}
                className="col-span-10"
              />
              <div className="col-span-2 flex items-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => duplicateBlock(idx)}>
                  <Copy size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeBlock(idx)}>
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  // Éditeur cyclisme avec % FTP
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="font-medium text-gray-900">Blocs d'entraînement</h4>
          <div className="text-sm text-gray-500">
            FTP: <span className="font-semibold text-amber-600">{ftp}W</span>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={addBlock}>
          <Plus size={16} /> Ajouter
        </Button>
      </div>
      
      {blocks.length > 0 && <SessionGraph blocks={blocks} ftp={ftp} />}
      
      {blocks.map((block, idx) => {
        const blockType = BLOCK_TYPES[block.type?.toUpperCase()] || BLOCK_TYPES.WARMUP;
        const watts = calculateWatts(block.percentFtp, ftp);
        const wattsPerKg = calculateWattsPerKg(watts, weight);
        const zone = getZoneForPercent(block.percentFtp);
        
        return (
          <Card key={idx} className="p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-1 h-20 rounded-full flex-shrink-0"
                style={{ backgroundColor: zone.color }}
              />
              <div className="flex-1">
                <div className="grid grid-cols-12 gap-3">
                  <Select
                    label="Type"
                    value={block.type}
                    onChange={(e) => updateBlock(idx, 'type', e.target.value)}
                    options={Object.values(BLOCK_TYPES).map(t => ({ id: t.id, label: t.label }))}
                    className="col-span-3"
                  />
                  <Input
                    label="Durée"
                    value={block.duration}
                    onChange={(e) => updateBlock(idx, 'duration', e.target.value)}
                    placeholder="05:00"
                    className="col-span-2"
                  />
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">% FTP</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={block.percentFtp}
                        onChange={(e) => updateBlock(idx, 'percentFtp', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <ZoneBadge percentFtp={block.percentFtp} />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Puissance</label>
                    <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="font-bold text-amber-700">{watts}W</span>
                      <span className="text-xs text-amber-600 ml-1">({wattsPerKg} W/kg)</span>
                    </div>
                  </div>
                  <Input
                    label="Rép."
                    type="number"
                    value={block.reps}
                    onChange={(e) => updateBlock(idx, 'reps', parseInt(e.target.value) || 1)}
                    className="col-span-1"
                  />
                  <div className="col-span-2 flex items-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => moveBlock(idx, -1)} disabled={idx === 0}>
                      <ChevronUp size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1}>
                      <ChevronDown size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => duplicateBlock(idx)}>
                      <Copy size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeBlock(idx)}>
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>
                <Input
                  label="Notes"
                  value={block.notes}
                  onChange={(e) => updateBlock(idx, 'notes', e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ============================================
// COMPOSANTS TEMPLATES ET SESSIONS
// ============================================

const TemplateCard = ({ template, ftp, weight, onEdit, onDelete, onDuplicate, onUse }) => {
  const category = SESSION_CATEGORIES[template.category?.toUpperCase()] || SESSION_CATEGORIES.CYCLING;
  const CategoryIcon = category.icon;
  
  // Calculer la puissance moyenne de la séance
  const avgPercent = template.blocks?.length > 0
    ? Math.round(template.blocks.reduce((sum, b) => sum + b.percentFtp, 0) / template.blocks.length)
    : 0;
  const avgWatts = calculateWatts(avgPercent, ftp);
  
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <CategoryIcon size={20} style={{ color: category.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              {template.isDefault && <Badge color="blue">Par défaut</Badge>}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDuration(template.duration)}
              {template.tss > 0 && ` • TSS ${template.tss}`}
              {template.week && ` • Semaine ${template.week}`}
            </p>
          </div>
        </div>
      </div>
      
      {template.category === 'cycling' && template.blocks?.length > 0 && (
        <>
          <SessionGraph blocks={template.blocks} ftp={ftp} />
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              Moy: <span className="font-medium text-gray-700">{avgPercent}% FTP</span>
            </span>
            <span className="text-amber-600 font-medium">{avgWatts}W</span>
          </div>
        </>
      )}
      
      {template.description && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{template.description}</p>
      )}
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          <Badge color={template.level === 'beginner' ? 'green' : template.level === 'expert' ? 'red' : 'amber'}>
            {LEVEL_OPTIONS.find(l => l.id === template.level)?.label}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onUse(template)} title="Créer une séance">
            <Plus size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDuplicate(template)} title="Dupliquer">
            <Copy size={16} />
          </Button>
          {!template.isDefault && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onEdit(template)} title="Modifier">
                <Edit2 size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(template.id)} title="Supprimer">
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

const SessionCard = ({ session, ftp, weight, onEdit, onDelete, onSaveAsTemplate, compact = false }) => {
  const category = SESSION_CATEGORIES[session.category?.toUpperCase()] || SESSION_CATEGORIES.CYCLING;
  const CategoryIcon = category.icon;
  
  if (compact) {
    return (
      <div
        className="px-2 py-1 rounded text-xs font-medium truncate cursor-pointer hover:opacity-80 transition-opacity"
        style={{ backgroundColor: `${category.color}20`, color: category.color }}
        title={session.name}
      >
        <CategoryIcon size={12} className="inline mr-1" />
        {session.name}
      </div>
    );
  }
  
  // Calculer TSS réel basé sur la FTP actuelle
  const avgPercent = session.blocks?.length > 0
    ? Math.round(session.blocks.reduce((sum, b) => sum + b.percentFtp, 0) / session.blocks.length)
    : 0;
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <CategoryIcon size={20} style={{ color: category.color }} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{session.name}</h4>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDuration(session.duration)}
              {session.tss > 0 && ` • TSS ~${session.tss}`}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onSaveAsTemplate(session)} title="Sauvegarder comme modèle">
            <Star size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(session)}>
            <Edit2 size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(session.id)}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      </div>
      
      {session.category === 'cycling' && session.blocks?.length > 0 && (
        <div className="mt-3">
          <SessionGraph blocks={session.blocks} ftp={ftp} />
          <div className="mt-2 text-sm text-gray-500">
            Intensité moy: <span className="font-medium text-amber-600">{avgPercent}% FTP = {calculateWatts(avgPercent, ftp)}W</span>
          </div>
        </div>
      )}
      
      <div className="flex gap-2 mt-3">
        <Badge color={session.level === 'beginner' ? 'green' : session.level === 'expert' ? 'red' : 'amber'}>
          {LEVEL_OPTIONS.find(l => l.id === session.level)?.label}
        </Badge>
      </div>
    </Card>
  );
};

// Formulaire de session
const SessionForm = ({ session, templates, profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState(session || {
    name: '',
    category: 'cycling',
    level: 'intermediate',
    location: 'both',
    intensityRef: 'ftp',
    duration: 60,
    tss: 50,
    description: '',
    blocks: [],
    exercises: []
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  const allTemplates = [
    ...templates.cycling.map(t => ({ ...t, category: 'cycling' })),
    ...templates.ppg.map(t => ({ ...t, category: 'ppg' }))
  ].filter(t => t.category === formData.category);
  
  const handleTemplateSelect = (templateId) => {
    if (!templateId) {
      setSelectedTemplate('');
      return;
    }
    
    const template = allTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        name: template.name,
        level: template.level,
        location: template.location || formData.location,
        intensityRef: template.intensityRef || formData.intensityRef,
        duration: template.duration,
        tss: template.tss || 0,
        description: template.description,
        blocks: template.blocks ? JSON.parse(JSON.stringify(template.blocks)) : [],
        exercises: template.exercises ? JSON.parse(JSON.stringify(template.exercises)) : []
      });
    }
    setSelectedTemplate(templateId);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info FTP */}
      <div className="p-3 bg-amber-50 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="text-amber-600" size={18} />
          <span className="text-sm text-amber-800">
            FTP actuelle: <strong>{profile.ftp}W</strong> • Poids: <strong>{profile.weight}kg</strong>
          </span>
        </div>
        <span className="text-sm text-amber-600 font-medium">
          {(profile.ftp / profile.weight).toFixed(2)} W/kg
        </span>
      </div>
      
      {/* Catégorie et Template */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
          <div className="flex gap-2">
            {Object.values(SESSION_CATEGORIES).map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, category: cat.id, blocks: [], exercises: [] });
                  setSelectedTemplate('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.category === cat.id
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <cat.icon size={20} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        <Select
          label="Partir d'un modèle"
          value={selectedTemplate}
          onChange={(e) => handleTemplateSelect(e.target.value)}
          options={[
            { id: '', label: '-- Séance vierge --' },
            ...allTemplates.map(t => ({
              id: t.id,
              label: `${t.name} (${t.level === 'beginner' ? 'Déb.' : t.level === 'expert' ? 'Exp.' : 'Int.'}${t.week ? ` - S${t.week}` : ''})`
            }))
          ]}
        />
      </div>
      
      {/* Informations de base */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nom de la séance"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Select
          label="Niveau"
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          options={LEVEL_OPTIONS}
        />
      </div>
      
      {formData.category === 'cycling' && (
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Lieu"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            options={LOCATION_OPTIONS}
          />
          <Input
            label="Durée estimée"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            suffix="min"
          />
          <Input
            label="TSS estimé"
            type="number"
            value={formData.tss}
            onChange={(e) => setFormData({ ...formData, tss: parseInt(e.target.value) || 0 })}
          />
        </div>
      )}
      
      <Textarea
        label="Description / Notes"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      
      {/* Éditeur de blocs */}
      <BlockEditor
        blocks={formData.category === 'cycling' ? formData.blocks : formData.exercises}
        onChange={(data) => setFormData({
          ...formData,
          [formData.category === 'cycling' ? 'blocks' : 'exercises']: data
        })}
        category={formData.category}
        ftp={profile.ftp}
        weight={profile.weight}
      />
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          <Save size={18} />
          Enregistrer
        </Button>
      </div>
    </form>
  );
};

// ============================================
// BIBLIOTHÈQUE DE TEMPLATES
// ============================================

const TemplateLibrary = ({ templates, profile, onSave, onDelete, onCreateSession }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterWeek, setFilterWeek] = useState('all');
  
  const allTemplates = [
    ...templates.cycling.map(t => ({ ...t, category: 'cycling' })),
    ...templates.ppg.map(t => ({ ...t, category: 'ppg' }))
  ];
  
  const filteredTemplates = allTemplates.filter(t => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterWeek !== 'all' && t.week !== parseInt(filterWeek)) return false;
    return true;
  });
  
  const weeks = [...new Set(allTemplates.map(t => t.week).filter(Boolean))].sort((a, b) => a - b);
  
  const handleSave = (templateData) => {
    onSave(templateData);
    setShowForm(false);
    setEditingTemplate(null);
  };
  
  const handleDuplicate = (template) => {
    const duplicated = {
      ...template,
      id: generateId(),
      name: `${template.name} (copie)`,
      isDefault: false
    };
    onSave(duplicated);
  };
  
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={[
              { id: 'all', label: 'Toutes catégories' },
              { id: 'cycling', label: 'Cyclisme' },
              { id: 'ppg', label: 'PPG' }
            ]}
          />
          <Select
            value={filterWeek}
            onChange={(e) => setFilterWeek(e.target.value)}
            options={[
              { id: 'all', label: 'Toutes semaines' },
              ...weeks.map(w => ({ id: w.toString(), label: `Semaine ${w}` }))
            ]}
          />
        </div>
        
        <Button onClick={() => { setEditingTemplate(null); setShowForm(true); }}>
          <FolderPlus size={18} />
          Nouveau modèle
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            ftp={profile.ftp}
            weight={profile.weight}
            onEdit={(t) => { setEditingTemplate(t); setShowForm(true); }}
            onDelete={onDelete}
            onDuplicate={handleDuplicate}
            onUse={onCreateSession}
          />
        ))}
      </div>
      
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingTemplate(null); }}
        title={editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle'}
        size="xl"
      >
        <TemplateForm
          template={editingTemplate}
          profile={profile}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingTemplate(null); }}
        />
      </Modal>
    </div>
  );
};

// Formulaire de template (identique à SessionForm mais pour templates)
const TemplateForm = ({ template, profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState(template || {
    name: '',
    category: 'cycling',
    level: 'intermediate',
    location: 'both',
    intensityRef: 'ftp',
    week: 1,
    duration: 60,
    tss: 50,
    description: '',
    blocks: [],
    exercises: []
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: formData.id || generateId() });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-3 bg-amber-50 rounded-lg flex items-center gap-2">
        <Zap className="text-amber-600" size={18} />
        <span className="text-sm text-amber-800">
          Les intensités sont stockées en <strong>% FTP</strong>. Elles s'adapteront automatiquement à chaque utilisateur.
        </span>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
        <div className="flex gap-2">
          {Object.values(SESSION_CATEGORIES).map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.id, blocks: [], exercises: [] })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                formData.category === cat.id
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <cat.icon size={20} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Nom du modèle"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="col-span-2"
        />
        <Input
          label="Semaine"
          type="number"
          min="1"
          max="52"
          value={formData.week}
          onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) || 1 })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Niveau"
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          options={LEVEL_OPTIONS}
        />
        {formData.category === 'cycling' && (
          <Select
            label="Lieu"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            options={LOCATION_OPTIONS}
          />
        )}
      </div>
      
      {formData.category === 'cycling' && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Durée estimée"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            suffix="min"
          />
          <Input
            label="TSS estimé"
            type="number"
            value={formData.tss}
            onChange={(e) => setFormData({ ...formData, tss: parseInt(e.target.value) || 0 })}
          />
        </div>
      )}
      
      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      
      <BlockEditor
        blocks={formData.category === 'cycling' ? (formData.blocks || []) : (formData.exercises || [])}
        onChange={(data) => setFormData({
          ...formData,
          [formData.category === 'cycling' ? 'blocks' : 'exercises']: data
        })}
        category={formData.category}
        ftp={profile.ftp}
        weight={profile.weight}
      />
      
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          <Save size={18} />
          Enregistrer
        </Button>
      </div>
    </form>
  );
};

// ============================================
// CALENDRIER
// ============================================

const PlanningCalendar = ({ plannedSessions, onAddSession, onRemoveSession, sessions, ftp }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const getSessionsForDate = (day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return (plannedSessions[dateKey] || []).map(id => sessions.find(s => s.id === id)).filter(Boolean);
  };
  
  const handleDateClick = (day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateKey);
    setShowSessionPicker(true);
  };
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const daySessions = getSessionsForDate(day);
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    const dayTss = daySessions.reduce((sum, s) => sum + (s.tss || 0), 0);
    
    days.push(
      <div
        key={day}
        onClick={() => handleDateClick(day)}
        className={`h-24 border border-gray-100 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
          isToday ? 'bg-amber-50' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${isToday ? 'text-amber-600' : 'text-gray-700'}`}>
            {day}
          </span>
          {dayTss > 0 && (
            <span className="text-xs text-amber-600 font-medium">TSS {dayTss}</span>
          )}
        </div>
        <div className="space-y-1 mt-1">
          {daySessions.slice(0, 2).map(session => (
            <SessionCard key={session.id} session={session} ftp={ftp} compact />
          ))}
          {daySessions.length > 2 && (
            <div className="text-xs text-gray-500">+{daySessions.length - 2}</div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {MONTHS_FR[month]} {year}
        </h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <ChevronLeft size={20} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {DAYS_FR.map(day => (
          <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
        <div className="col-span-7 grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, idx) => (
            <div key={idx} className="bg-white">{day}</div>
          ))}
        </div>
      </div>
      
      <Modal
        isOpen={showSessionPicker}
        onClose={() => setShowSessionPicker(false)}
        title={`Planifier - ${selectedDate}`}
        size="lg"
      >
        <div className="space-y-4">
          {selectedDate && plannedSessions[selectedDate]?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Séances planifiées</h4>
              <div className="space-y-2">
                {plannedSessions[selectedDate].map(sessionId => {
                  const session = sessions.find(s => s.id === sessionId);
                  if (!session) return null;
                  return (
                    <div key={sessionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{session.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => onRemoveSession(selectedDate, sessionId)}>
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Ajouter une séance</h4>
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-sm">Créez d'abord des séances dans l'onglet "Mes séances".</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {sessions.map(session => (
                  <Card
                    key={session.id}
                    className="p-3 cursor-pointer hover:border-amber-300 transition-colors"
                    onClick={() => onAddSession(selectedDate, session.id)}
                  >
                    <div className="flex items-center gap-2">
                      {session.category === 'cycling' ? (
                        <Bike size={16} className="text-amber-600" />
                      ) : (
                        <Dumbbell size={16} className="text-purple-600" />
                      )}
                      <span className="font-medium text-sm">{session.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDuration(session.duration)} • TSS {session.tss || 0}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ============================================
// APPLICATION PRINCIPALE
// ============================================

export default function TrainingPlanner() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [sessions, setSessions] = useState([]);
  const [templates, setTemplates] = useState({ cycling: [], ppg: [] });
  const [plannedSessions, setPlannedSessions] = useState({});
  const [activeTab, setActiveTab] = useState('sessions');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [templateToUse, setTemplateToUse] = useState(null);
  
  // Charger les données
  useEffect(() => {
    const savedProfile = localStorage.getItem('training-profile');
    const savedSessions = localStorage.getItem('training-sessions');
    const savedPlanned = localStorage.getItem('training-planned');
    const savedTemplates = localStorage.getItem('training-templates');
    
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedPlanned) setPlannedSessions(JSON.parse(savedPlanned));
    
    if (savedTemplates) {
      const loaded = JSON.parse(savedTemplates);
      setTemplates({
        cycling: [...DEFAULT_TEMPLATES.cycling, ...loaded.cycling.filter(t => !t.isDefault)],
        ppg: [...DEFAULT_TEMPLATES.ppg, ...loaded.ppg.filter(t => !t.isDefault)]
      });
    } else {
      setTemplates(DEFAULT_TEMPLATES);
    }
  }, []);
  
  // Sauvegarder
  useEffect(() => { localStorage.setItem('training-profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('training-sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('training-planned', JSON.stringify(plannedSessions)); }, [plannedSessions]);
  useEffect(() => {
    const toSave = {
      cycling: templates.cycling.filter(t => !t.isDefault),
      ppg: templates.ppg.filter(t => !t.isDefault)
    };
    localStorage.setItem('training-templates', JSON.stringify(toSave));
  }, [templates]);
  
  // Handlers
  const handleSaveSession = (sessionData) => {
    if (editingSession) {
      setSessions(sessions.map(s => s.id === editingSession.id ? { ...sessionData, id: editingSession.id } : s));
    } else {
      setSessions([...sessions, { ...sessionData, id: generateId() }]);
    }
    setShowSessionForm(false);
    setEditingSession(null);
    setTemplateToUse(null);
  };
  
  const handleDeleteSession = (sessionId) => {
    if (confirm('Supprimer cette séance ?')) {
      setSessions(sessions.filter(s => s.id !== sessionId));
      const newPlanned = { ...plannedSessions };
      Object.keys(newPlanned).forEach(date => {
        newPlanned[date] = newPlanned[date].filter(id => id !== sessionId);
        if (newPlanned[date].length === 0) delete newPlanned[date];
      });
      setPlannedSessions(newPlanned);
    }
  };
  
  const handleSaveAsTemplate = (session) => {
    const template = {
      id: generateId(),
      ...session,
      week: 1,
      isDefault: false
    };
    handleSaveTemplate(template);
    alert('Séance sauvegardée comme modèle !');
  };
  
  const handleSaveTemplate = (templateData) => {
    const category = templateData.category;
    const existing = templates[category].find(t => t.id === templateData.id);
    
    if (existing) {
      setTemplates({
        ...templates,
        [category]: templates[category].map(t => t.id === templateData.id ? templateData : t)
      });
    } else {
      setTemplates({
        ...templates,
        [category]: [...templates[category], templateData]
      });
    }
  };
  
  const handleDeleteTemplate = (templateId) => {
    if (confirm('Supprimer ce modèle ?')) {
      setTemplates({
        cycling: templates.cycling.filter(t => t.id !== templateId),
        ppg: templates.ppg.filter(t => t.id !== templateId)
      });
    }
  };
  
  const handleCreateSessionFromTemplate = (template) => {
    setTemplateToUse(template);
    setEditingSession(null);
    setShowSessionForm(true);
  };
  
  const handleAddSessionToDate = (date, sessionId) => {
    setPlannedSessions({
      ...plannedSessions,
      [date]: [...(plannedSessions[date] || []), sessionId]
    });
  };
  
  const handleRemoveSessionFromDate = (date, sessionId) => {
    const updated = {
      ...plannedSessions,
      [date]: (plannedSessions[date] || []).filter(id => id !== sessionId)
    };
    if (updated[date].length === 0) delete updated[date];
    setPlannedSessions(updated);
  };
  
  // Stats
  const getWeekStats = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    
    let totalDuration = 0, totalTss = 0, sessionCount = 0;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      
      (plannedSessions[dateKey] || []).forEach(sessionId => {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          totalDuration += session.duration || 0;
          totalTss += session.tss || 0;
          sessionCount++;
        }
      });
    }
    
    return { totalDuration, totalTss, sessionCount };
  };
  
  const weekStats = getWeekStats();
  
  const initialSession = templateToUse ? {
    name: templateToUse.name,
    category: templateToUse.category,
    level: templateToUse.level,
    location: templateToUse.location || 'both',
    intensityRef: templateToUse.intensityRef || 'ftp',
    duration: templateToUse.duration,
    tss: templateToUse.tss || 0,
    description: templateToUse.description,
    blocks: templateToUse.blocks ? JSON.parse(JSON.stringify(templateToUse.blocks)) : [],
    exercises: templateToUse.exercises ? JSON.parse(JSON.stringify(templateToUse.exercises)) : []
  } : editingSession;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Calendar className="text-amber-600" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Planification Entraînement</h1>
                <p className="text-sm text-gray-500">Centre d'Analyse Cycliste</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Stats semaine */}
              <div className="hidden md:flex items-center gap-6 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm">
                    <span className="font-semibold text-gray-900">{formatDuration(weekStats.totalDuration)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  <span className="text-sm font-semibold text-gray-900">{weekStats.totalTss} TSS</span>
                </div>
              </div>
              
              {/* Bouton FTP/Profil */}
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
              >
                <Activity size={18} className="text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">{profile.ftp}W</span>
                <span className="text-xs text-amber-600">FTP</span>
              </button>
              
              <Button onClick={() => { setEditingSession(null); setTemplateToUse(null); setShowSessionForm(true); }}>
                <Plus size={18} />
                Nouvelle séance
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mt-4">
            <Tabs
              tabs={[
                { id: 'sessions', label: 'Mes séances', icon: Bike },
                { id: 'templates', label: 'Modèles', icon: BookOpen },
                { id: 'planning', label: 'Planification', icon: Calendar }
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>
      </header>
      
      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'sessions' && (
          <div>
            {sessions.length === 0 ? (
              <Card className="p-12 text-center">
                <Bike size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune séance créée</h3>
                <p className="text-gray-500 mb-4">Créez des séances à partir de vos modèles.</p>
                <div className="flex justify-center gap-3">
                  <Button variant="secondary" onClick={() => setActiveTab('templates')}>
                    <BookOpen size={18} />
                    Voir les modèles
                  </Button>
                  <Button onClick={() => { setEditingSession(null); setTemplateToUse(null); setShowSessionForm(true); }}>
                    <Plus size={18} />
                    Créer une séance
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    ftp={profile.ftp}
                    weight={profile.weight}
                    onEdit={(s) => { setEditingSession(s); setShowSessionForm(true); }}
                    onDelete={handleDeleteSession}
                    onSaveAsTemplate={handleSaveAsTemplate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'templates' && (
          <TemplateLibrary
            templates={templates}
            profile={profile}
            onSave={handleSaveTemplate}
            onDelete={handleDeleteTemplate}
            onCreateSession={handleCreateSessionFromTemplate}
          />
        )}
        
        {activeTab === 'planning' && (
          <Card className="p-6">
            <PlanningCalendar
              plannedSessions={plannedSessions}
              sessions={sessions}
              ftp={profile.ftp}
              onAddSession={handleAddSessionToDate}
              onRemoveSession={handleRemoveSessionFromDate}
            />
          </Card>
        )}
      </main>
      
      {/* Modals */}
      <ProfilePanel
        profile={profile}
        onUpdate={setProfile}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
      
      <Modal
        isOpen={showSessionForm}
        onClose={() => { setShowSessionForm(false); setEditingSession(null); setTemplateToUse(null); }}
        title={editingSession ? 'Modifier la séance' : 'Nouvelle séance'}
        size="xl"
      >
        <SessionForm
          session={initialSession}
          templates={templates}
          profile={profile}
          onSave={handleSaveSession}
          onCancel={() => { setShowSessionForm(false); setEditingSession(null); setTemplateToUse(null); }}
        />
      </Modal>
    </div>
  );
}
