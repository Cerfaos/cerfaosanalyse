import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-gray-50 to-bg-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <div className="inline-block p-4 bg-accent-500 rounded-2xl mb-6">
            <svg
              className="w-16 h-16 text-white"
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
          <h1 className="text-5xl font-bold text-text-dark mb-4">
            Centre d'Analyse Cycliste
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Analysez vos performances cyclistes, suivez votre entraînement et optimisez vos résultats avec des métriques avancées.
          </p>
        </div>

        <div className="flex gap-4 justify-center mb-12">
          <Link
            to="/register"
            className="px-8 py-4 bg-accent-500 text-white rounded-lg hover:bg-accent-600 shadow-card hover:shadow-card-hover transition-all font-semibold text-lg"
          >
            Commencer maintenant
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-white text-text-body border border-border-base rounded-lg hover:bg-bg-gray-50 hover:border-border-medium shadow-card hover:shadow-card-hover transition-all font-semibold text-lg"
          >
            Se connecter
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-6 h-6 text-accent-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-dark mb-2">
              Métriques avancées
            </h3>
            <p className="text-text-secondary">
              TRIMP, CTL/ATL/TSB, zones FC, dérive cardiaque et plus encore
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-6 h-6 text-accent-500"
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
            <h3 className="text-lg font-semibold text-text-dark mb-2">
              Cartes GPS
            </h3>
            <p className="text-text-secondary">
              Visualisez vos parcours avec traces GPS colorées selon votre FC
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border-base shadow-card">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-6 h-6 text-accent-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-dark mb-2">
              100% Local
            </h3>
            <p className="text-text-secondary">
              Vos données restent chez vous, zéro cloud, confidentialité totale
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
