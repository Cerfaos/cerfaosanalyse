import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const features = [
  {
    title: 'Tableaux de bord prêts',
    description: 'Charge, récupération et puissance affichées dans un seul espace cohérent.',
  },
  {
    title: 'Import intelligent',
    description: 'Déposez vos fichiers, Cerfao détecte météo, zones et anomalies automatiquement.',
  },
  {
    title: 'Programmation',
    description: 'Construisez vos blocs et visualisez l’impact sur la fatigue en un clin d’œil.',
  },
]

const stats = [
  { label: 'Athlètes actifs', value: '1 280' },
  { label: 'Activités analysées', value: '412k' },
  { label: 'Données locales', value: '100 %' },
]

const roadmap = [
  { step: 'Q2', title: 'Coach Workspace', desc: 'Vue multi-athlètes et annotations partagées.' },
  { step: 'Q3', title: 'Analyse puissance', desc: 'Courbes critiques, W’ et conseils de pacing.' },
  { step: 'Q4', title: 'Apps mobiles', desc: 'Consultation hors ligne et notifications live.' },
]

export default function Home() {
  return (
    <div className="page-shell min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6">
        <section className="py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-text-muted mb-4">Plateforme locale</p>
            <h1 className="text-4xl md:text-5xl font-semibold mb-6 text-text-dark dark:text-dark-text-contrast">
              Pilotez votre entraînement cycliste sans quitter votre poste
            </h1>
            <p className="text-lg text-text-secondary mb-8">
              Cerfao centralise poids, charge et activités. Tout reste hébergé chez vous, l’interface s’adapte à votre rythme.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-center">
                Créer mon espace gratuit
              </Link>
              <Link to="/login" className="btn-secondary text-center">
                J’ai déjà un compte
              </Link>
            </div>
          </div>

          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Charge actuelle</p>
                <p className="text-3xl font-semibold text-text-dark dark:text-dark-text-contrast">CTL 82</p>
              </div>
              <span className="px-3 py-1 text-xs rounded-full bg-success/10 text-success">Optimal</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold text-text-dark dark:text-dark-text-contrast">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="border border-dashed border-border-base rounded-2xl p-4">
              <p className="text-sm text-text-secondary">Activité du jour</p>
              <p className="text-lg font-medium">2h10 endurance + 4x8’ sweet spot</p>
              <p className="text-xs text-text-muted">Prévision TSB : +6 demain</p>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 border-t border-border-base/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-text-muted mb-3">Fonctionnalités</p>
              <h2 className="text-3xl font-semibold">Tout ce dont vous avez besoin</h2>
            </div>
            <div className="text-text-secondary text-sm max-w-md">
              Une interface épurée qui écarte les distractions pour vous laisser agir sur les métriques utiles.
            </div>
          </div>

          <div className="card-grid">
            {features.map((feature) => (
              <div key={feature.title} className="glass-panel px-6 py-5 space-y-3">
                <p className="text-sm uppercase tracking-wide text-brand">{feature.title}</p>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="security" className="py-16 grid md:grid-cols-2 gap-10">
          <div className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-text-muted mb-3">Sécurité</p>
            <h3 className="text-2xl font-semibold mb-4">Vos données restent sur votre serveur</h3>
            <p className="text-text-secondary mb-6">
              Cerfao tourne dans Docker. Aucun transfert non souhaité, sauvegardes chiffrées et possibilité d’utiliser vos propres clés API.
            </p>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>• Authentification par jeton</li>
              <li>• Sauvegardes exportables</li>
              <li>• Mode lecture seule pour coachs</li>
            </ul>
          </div>
          <div className="glass-panel p-6" id="roadmap">
            <p className="text-sm uppercase tracking-[0.4em] text-text-muted mb-3">Roadmap 2024</p>
            <div className="space-y-5">
              {roadmap.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="text-brand font-semibold w-12">{item.step}</div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-text-muted">Commencer</p>
          <h3 className="text-3xl md:text-4xl font-semibold max-w-3xl mx-auto">
            Prêt à passer d’un entraînement subi à un entraînement piloté ?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary"
            >
              Lancer mon espace privé
            </Link>
            <a
              href="mailto:hello@cerfao.dev"
              className="btn-secondary"
            >
              Parler à l’équipe
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
