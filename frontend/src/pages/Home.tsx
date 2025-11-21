import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Activity, BarChart3, Calendar, Heart, LineChart, Shield, Target, TrendingUp, Zap, ChevronRight, Check, Bike } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Tableaux de bord',
    description: 'Charge, récupération et puissance affichées dans un seul espace cohérent.',
    color: '#8BC34A',
  },
  {
    icon: Zap,
    title: 'Import intelligent',
    description: 'Déposez vos fichiers, Cerfao détecte météo, zones et anomalies automatiquement.',
    color: '#5CE1E6',
  },
  {
    icon: Calendar,
    title: 'Programmation',
    description: "Construisez vos blocs et visualisez l'impact sur la fatigue en un clin d'œil.",
    color: '#FFAB40',
  },
  {
    icon: Heart,
    title: 'Analyse cardiaque',
    description: 'Zones FC, TRIMP et variabilité pour optimiser votre récupération.',
    color: '#FF5252',
  },
  {
    icon: Target,
    title: 'Objectifs & Records',
    description: 'Définissez vos objectifs et suivez vos records personnels.',
    color: '#8BC34A',
  },
  {
    icon: TrendingUp,
    title: 'CTL / ATL / TSB',
    description: 'Suivez votre forme, fatigue et fraîcheur avec précision.',
    color: '#5CE1E6',
  },
]

const stats = [
  { label: 'Athlètes actifs', value: '1 280', icon: Activity },
  { label: 'Activités analysées', value: '412k', icon: LineChart },
  { label: 'Données locales', value: '100%', icon: Shield },
]

const roadmap = [
  { step: 'Q2', title: 'Coach Workspace', desc: 'Vue multi-athlètes et annotations partagées.', color: '#8BC34A' },
  { step: 'Q3', title: 'Analyse puissance', desc: "Courbes critiques, W' et conseils de pacing.", color: '#5CE1E6' },
  { step: 'Q4', title: 'Apps mobiles', desc: 'Consultation hors ligne et notifications live.', color: '#FFAB40' },
]

const securityFeatures = [
  'Authentification par jeton sécurisé',
  'Sauvegardes chiffrées exportables',
  'Mode lecture seule pour coachs',
  'Aucun transfert de données externes',
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a1915]">
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6">
        <section className="py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            {/* Decorative gradient blob */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#8BC34A]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-[#5CE1E6]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8BC34A]/10 border border-[#8BC34A]/30 mb-6">
                <Bike className="w-4 h-4 text-[#8BC34A]" />
                <span className="text-sm font-medium text-[#8BC34A]">Plateforme locale</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Pilotez votre entraînement{' '}
                <span className="bg-gradient-to-r from-[#8BC34A] to-[#5CE1E6] bg-clip-text text-transparent">
                  cycliste
                </span>
              </h1>

              <p className="text-lg text-gray-400 mb-8 max-w-lg">
                Cerfao centralise poids, charge et activités. Tout reste hébergé chez vous,
                l'interface s'adapte à votre rythme.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#8BC34A] to-[#7CB342] text-white font-semibold rounded-xl shadow-lg shadow-[#8BC34A]/25 hover:shadow-[#8BC34A]/40 hover:scale-[1.02] transition-all duration-300"
                >
                  Créer mon espace gratuit
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-[#8BC34A]/30 transition-all duration-300"
                >
                  J'ai déjà un compte
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8BC34A]/20 to-[#5CE1E6]/10 rounded-3xl blur-xl" />
            <div className="relative glass-panel p-6 space-y-6 border border-[#8BC34A]/20">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Charge actuelle</p>
                  <p className="text-4xl font-bold text-white">
                    CTL <span className="text-[#5CE1E6]">82</span>
                  </p>
                </div>
                <span className="px-4 py-2 text-sm font-semibold rounded-full bg-[#8BC34A]/20 text-[#8BC34A] border border-[#8BC34A]/30">
                  Optimal
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/10">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <stat.icon className="w-5 h-5 text-[#8BC34A] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Activity Preview */}
              <div className="rounded-2xl bg-gradient-to-br from-[#5CE1E6]/10 to-[#8BC34A]/5 border border-[#5CE1E6]/20 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5CE1E6]/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[#5CE1E6]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Activité du jour</p>
                    <p className="text-white font-semibold">2h10 endurance + 4x8' sweet spot</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-[#8BC34A]" />
                  <span className="text-gray-400">Prévision TSB :</span>
                  <span className="text-[#8BC34A] font-semibold">+6 demain</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 border-t border-white/10">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#8BC34A] font-semibold mb-4">
              Fonctionnalités
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Une interface épurée qui écarte les distractions pour vous laisser agir sur les métriques utiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group glass-panel p-6 border border-white/10 hover:border-[#8BC34A]/30 transition-all duration-300 hover:scale-[1.02]"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security & Roadmap */}
        <section id="security" className="py-16 grid md:grid-cols-2 gap-8">
          {/* Security Card */}
          <div className="relative overflow-hidden glass-panel p-8 border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8BC34A]/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#8BC34A]/20 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-[#8BC34A]" />
              </div>

              <p className="text-sm uppercase tracking-[0.3em] text-[#8BC34A] font-semibold mb-2">
                Sécurité
              </p>
              <h3 className="text-2xl font-bold text-white mb-4">
                Vos données restent sur votre serveur
              </h3>
              <p className="text-gray-400 mb-6">
                Cerfao tourne dans Docker. Aucun transfert non souhaité, sauvegardes chiffrées
                et possibilité d'utiliser vos propres clés API.
              </p>

              <ul className="space-y-3">
                {securityFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#8BC34A]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#8BC34A]" />
                    </div>
                    <span className="text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Roadmap Card */}
          <div className="relative overflow-hidden glass-panel p-8 border border-white/10" id="roadmap">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#5CE1E6]/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#5CE1E6]/20 flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7 text-[#5CE1E6]" />
              </div>

              <p className="text-sm uppercase tracking-[0.3em] text-[#5CE1E6] font-semibold mb-2">
                Roadmap 2025
              </p>
              <h3 className="text-2xl font-bold text-white mb-6">
                Ce qui arrive bientôt
              </h3>

              <div className="space-y-6">
                {roadmap.map((item, index) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: `${item.color}20`, color: item.color }}
                      >
                        {item.step}
                      </div>
                      {index < roadmap.length - 1 && (
                        <div className="w-px h-full bg-gradient-to-b from-white/20 to-transparent mt-2" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8BC34A]/10 via-transparent to-[#5CE1E6]/10 rounded-3xl" />

          <div className="relative text-center space-y-8 py-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Zap className="w-4 h-4 text-[#FFAB40]" />
              <span className="text-sm text-gray-300">Commencer maintenant</span>
            </div>

            <h3 className="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight">
              Prêt à passer d'un entraînement{' '}
              <span className="text-gray-500">subi</span> à un entraînement{' '}
              <span className="bg-gradient-to-r from-[#8BC34A] to-[#5CE1E6] bg-clip-text text-transparent">
                piloté
              </span>{' '}
              ?
            </h3>

            <p className="text-gray-400 max-w-xl mx-auto">
              Rejoignez des milliers de cyclistes qui optimisent leur entraînement avec Cerfao.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8BC34A] to-[#7CB342] text-white font-semibold rounded-xl shadow-lg shadow-[#8BC34A]/25 hover:shadow-[#8BC34A]/40 hover:scale-[1.02] transition-all duration-300"
              >
                Lancer mon espace privé
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="mailto:hello@cerfao.dev"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-[#5CE1E6]/30 transition-all duration-300"
              >
                Parler à l'équipe
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/10 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Cerfao. Conçu pour les cyclistes passionnés.
          </p>
        </footer>
      </main>
    </div>
  )
}
