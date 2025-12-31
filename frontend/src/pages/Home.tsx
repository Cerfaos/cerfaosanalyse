import {
  Activity,
  BarChart3,
  Bike,
  Calendar,
  Check,
  ChevronRight,
  Heart,
  LineChart,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { GlassCard } from "../components/ui/GlassCard";

const features = [
  {
    icon: BarChart3,
    title: "Tableaux de bord",
    description:
      "Charge, récupération et puissance affichées dans un seul espace cohérent.",
    color: "var(--accent-primary)",
  },
  {
    icon: Zap,
    title: "Import intelligent",
    description:
      "Déposez vos fichiers, Cerfao détecte météo, zones et anomalies automatiquement.",
    color: "var(--accent-secondary)",
  },
  {
    icon: Calendar,
    title: "Programmation",
    description:
      "Construisez vos blocs et visualisez l'impact sur la fatigue en un clin d'œil.",
    color: "var(--status-info)",
  },
  {
    icon: Heart,
    title: "Analyse cardiaque",
    description:
      "Zones FC, TRIMP et variabilité pour optimiser votre récupération.",
    color: "var(--status-error)",
  },
  {
    icon: Target,
    title: "Objectifs & Records",
    description: "Définissez vos objectifs et suivez vos records personnels.",
    color: "var(--accent-secondary)",
  },
  {
    icon: TrendingUp,
    title: "CTL / ATL / TSB",
    description: "Suivez votre forme, fatigue et fraîcheur avec précision.",
    color: "var(--accent-primary)",
  },
];

const stats = [
  { label: "Athlètes actifs", value: "1 280", icon: Activity },
  { label: "Activités analysées", value: "412k", icon: LineChart },
  { label: "Données locales", value: "100%", icon: Shield },
];

const roadmap = [
  {
    step: "Q2",
    title: "Coach Workspace",
    desc: "Vue multi-athlètes et annotations partagées.",
    color: "var(--status-success)",
  },
  {
    step: "Q3",
    title: "Analyse puissance",
    desc: "Courbes critiques, W' et conseils de pacing.",
    color: "var(--status-info)",
  },
  {
    step: "Q4",
    title: "Apps mobiles",
    desc: "Consultation hors ligne et notifications live.",
    color: "var(--accent-secondary)",
  },
];

const securityFeatures = [
  "Authentification par jeton sécurisé",
  "Sauvegardes chiffrées exportables",
  "Mode lecture seule pour coachs",
  "Aucun transfert de données externes",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--surface-base)] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute top-0 -left-64 h-[800px] w-[800px] rounded-full bg-[var(--accent-primary)]/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 -right-64 h-[600px] w-[600px] rounded-full bg-[var(--accent-secondary)]/5 blur-[120px]" />

      <Navbar />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 relative z-10">
        <section className="py-20 md:py-32 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Bike className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-sm font-medium text-[var(--accent-primary)]">
                Plateforme 100% locale & privée
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-[var(--text-primary)] leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
              Pilotez votre entraînement{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">
                cycliste
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Cerfao centralise vos données de puissance, charge et fatigue.
              Tout reste hébergé chez vous, sans abonnement, sans cloud, juste
              la performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link to="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base h-14 px-8 rounded-xl shadow-lg shadow-[var(--accent-primary)]/20 hover:shadow-[var(--accent-primary)]/40 transition-all"
                >
                  Créer mon espace gratuit
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base h-14 px-8 rounded-xl bg-transparent border-[var(--border-default)] hover:bg-[var(--surface-hover)]"
                >
                  J'ai déjà un compte
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Card */}
          <div className="relative animate-in fade-in zoom-in duration-1000 delay-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/10 rounded-3xl blur-3xl transform translate-y-4" />
            <GlassCard className="relative space-y-8 border-[var(--border-strong)]">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-semibold">
                    État de forme
                  </p>
                  <p className="text-5xl font-display font-bold text-[var(--text-primary)]">
                    CTL{" "}
                    <span className="text-[var(--accent-secondary)]">82</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/20 mb-2">
                    Productif
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    TSB +6
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 py-6 border-y border-[var(--border-default)]">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center group cursor-default"
                  >
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--surface-hover)] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <stat.icon className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {stat.value}
                    </p>
                    <p className="text-[10px] md:text-xs text-[var(--text-tertiary)] uppercase tracking-wide mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Activity Preview */}
              <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-5 hover:border-[var(--accent-primary)]/30 transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-secondary)]/10 flex items-center justify-center border border-[var(--accent-secondary)]/20">
                    <Activity className="w-6 h-6 text-[var(--accent-secondary)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      Sortie Longue - Zone 2
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Aujourd'hui • 3h15 • 98 TSS
                    </p>
                  </div>
                </div>
                <div className="w-full bg-[var(--surface-input)] h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] h-full w-[75%]" />
                </div>
              </div>
            </GlassCard>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 glass-panel px-6 py-4 flex items-center gap-3 animate-bounce shadow-xl">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--status-success)] rounded-full animate-ping opacity-25" />
                <div className="w-3 h-3 bg-[var(--status-success)] rounded-full" />
              </div>
              <span className="font-semibold text-[var(--text-primary)]">
                Sync active
              </span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-24 border-t border-[var(--border-subtle)]"
        >
          <div className="text-center mb-16 space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-primary)] font-bold">
              Fonctionnalités
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)]">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
              Une interface épurée qui écarte les distractions pour vous laisser
              vous concentrer sur votre progression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <GlassCard
                key={feature.title}
                className="group hover:border-[var(--accent-primary)]/30 transition-all duration-300"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm"
                  style={{
                    backgroundColor: `${feature.color}15`,
                    color: feature.color,
                  }}
                >
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Security & Roadmap */}
        <section id="security" className="py-24 grid lg:grid-cols-2 gap-10">
          {/* Security Card */}
          <GlassCard className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-3xl transition-opacity group-hover:opacity-100" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center mb-8 border border-[var(--accent-primary)]/20">
                <Shield className="w-8 h-8 text-[var(--accent-primary)]" />
              </div>

              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-primary)] font-bold mb-3">
                Sécurité & Privacité
              </p>
              <h3 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-6">
                Vos données, votre serveur
              </h3>
              <p className="text-[var(--text-secondary)] mb-8 text-lg leading-relaxed">
                Cerfao est conçu pour être auto-hébergé via Docker. Vos fichiers
                FIT et vos métriques de santé ne quittent jamais votre machine.
              </p>

              <ul className="space-y-4">
                {securityFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    </div>
                    <span className="text-[var(--text-primary)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          {/* Roadmap Card */}
          <GlassCard className="relative overflow-hidden group" id="roadmap">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-secondary)]/5 rounded-full blur-3xl transition-opacity group-hover:opacity-100" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-secondary)]/10 flex items-center justify-center mb-8 border border-[var(--accent-secondary)]/20">
                <Calendar className="w-8 h-8 text-[var(--accent-secondary)]" />
              </div>

              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-secondary)] font-bold mb-3">
                Roadmap 2025
              </p>
              <h3 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-8">
                L'avenir de la plateforme
              </h3>

              <div className="space-y-8">
                {roadmap.map((item, index) => (
                  <div key={item.step} className="flex gap-6 group/item">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border border-transparent group-hover/item:scale-110 transition-transform shadow-sm"
                        style={{
                          backgroundColor: `${item.color}15`,
                          color: item.color,
                          borderColor: `${item.color}30`,
                        }}
                      >
                        {item.step}
                      </div>
                      {index < roadmap.length - 1 && (
                        <div className="w-px h-full bg-[var(--border-default)] mt-4" />
                      )}
                    </div>
                    <div className="pb-2 pt-1">
                      <p className="text-xl font-bold text-[var(--text-primary)] mb-1">
                        {item.title}
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative mb-12">
          <GlassCard className="relative overflow-hidden text-center py-20 px-6 border-[var(--accent-primary)]/20">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/5 via-transparent to-[var(--accent-secondary)]/5" />

            <div className="relative z-10 space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-raised)] border border-[var(--border-default)] shadow-sm">
                <Zap className="w-4 h-4 text-[var(--accent-secondary)]" />
                <span className="text-sm text-[var(--text-secondary)] font-medium">
                  Commencer maintenant
                </span>
              </div>

              <h3 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-[var(--text-primary)] max-w-4xl mx-auto leading-tight">
                Prêt à passer d'un entraînement{" "}
                <span className="text-[var(--text-tertiary)] italic">subi</span>{" "}
                à un entraînement{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">
                  piloté
                </span>{" "}
                ?
              </h3>

              <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
                Rejoignez la communauté et prenez le contrôle de vos données dès
                aujourd'hui.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 text-base px-10 rounded-xl shadow-xl shadow-[var(--accent-primary)]/25 hover:shadow-[var(--accent-primary)]/40 hover:-translate-y-1 transition-all"
                  >
                    Lancer mon espace
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto h-14 text-base px-10 rounded-xl hover:bg-[var(--surface-hover)]"
                  asChild
                >
                  <a href="mailto:hello@cerfao.dev">Contacter l'équipe</a>
                </Button>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-[var(--border-subtle)] text-center">
          <div className="flex items-center justify-center gap-3 mb-6 opacity-50">
            <Bike className="w-6 h-6" />
            <span className="font-display font-bold text-lg">
              Cerfao Analyse
            </span>
          </div>
          <p className="text-[var(--text-tertiary)] text-sm">
            © 2025 Centre d'Analyse Cycliste. Conçu par et pour les passionnés.
          </p>
        </footer>
      </main>
    </div>
  );
}
