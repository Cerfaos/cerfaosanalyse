import { useAuthStore } from '../store/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-dark mb-2">
          Tableau de bord
        </h1>
        <p className="text-text-secondary">
          Bienvenue {user?.fullName || user?.email} ! Voici un aperçu de vos performances cyclistes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-secondary">Activités totales</h3>
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-accent-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-text-dark">0</p>
          <p className="text-sm text-text-tertiary mt-1">Importez votre première activité</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-secondary">Distance totale</h3>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-text-dark">0 km</p>
          <p className="text-sm text-text-tertiary mt-1">Ce mois-ci</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-secondary">Poids actuel</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-text-dark">
            {user?.weightCurrent ? `${user.weightCurrent} kg` : '-'}
          </p>
          <p className="text-sm text-text-tertiary mt-1">Configurez votre profil</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg border border-border-base shadow-card text-center">
        <div className="max-w-md mx-auto">
          <svg
            className="w-16 h-16 text-text-tertiary mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-text-dark mb-2">
            Aucune activité pour le moment
          </h3>
          <p className="text-text-secondary mb-6">
            Commencez par importer vos fichiers FIT, GPX ou CSV pour analyser vos performances.
          </p>
          <button className="px-6 py-3 bg-accent-500 text-white rounded-md hover:bg-accent-600 shadow-button hover:shadow-button-hover transition-all font-medium">
            Importer une activité
          </button>
        </div>
      </div>
    </div>
  )
}
