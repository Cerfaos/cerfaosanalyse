import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import NotificationCenter from "../NotificationCenter";
import ThemeToggle from "../ThemeToggle";

type LayoutProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const navigation = [
  { label: "Accueil", to: "/", icon: HomeIcon },
  { label: "Tableau de bord", to: "/dashboard", icon: DashboardIcon },
  { label: "Insights", to: "/insights", icon: InsightsIcon },
  { label: "Cartographie FC", to: "/cycling", icon: CyclingIcon },
  { label: "Activités", to: "/activities", icon: ActivitiesIcon },
  { label: "Records", to: "/records", icon: RecordsIcon },
  { label: "Badges", to: "/badges", icon: BadgesIcon },
  { label: "Objectifs", to: "/goals", icon: GoalsIcon },
  { label: "Plan d'entraînement", to: "/training-plan", icon: PlanIcon },
  { label: "Poids", to: "/weight", icon: WeightIcon },
  { label: "Charge d'entraînement", to: "/training-load", icon: TrainingIcon },
  { label: "Équipement", to: "/equipment", icon: EquipmentIcon },
  { label: "Profil", to: "/profile", icon: ProfileIcon },
  { label: "Export", to: "/export", icon: ExportIcon },
];

export default function AppLayout({
  title,
  description,
  actions,
  children,
}: LayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="page-shell min-h-screen w-full text-text-dark dark:text-dark-text-contrast">
      <div className="flex">
        <aside
          className={`sidebar-shell font-display fixed inset-y-0 left-0 z-40 w-80 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-8 py-8 flex items-center justify-between border-b-2 border-white/10">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] opacity-60">
                Cerfao
              </p>
              <p className="text-3xl font-bold text-white">Centre Cycliste</p>
            </div>
            <button
              className="lg:hidden opacity-60 hover:opacity-100"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            {navigation.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                }
              >
                <span className="sidebar-link-icon">
                  <Icon />
                </span>
                <span className="sidebar-link-label">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="px-8 py-6 border-t-2 border-white/10 mt-6">
            <div className="text-sm mb-4">
              <p className="font-semibold text-white">
                {user?.fullName || "Athlète"}
              </p>
              <p className="opacity-60 text-xs">{user?.email}</p>
            </div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-xs opacity-60">Thème</span>
              <ThemeToggle />
            </div>
            <button
              onClick={() => {
                const event = new CustomEvent("toggle-shortcuts-help");
                window.dispatchEvent(event);
              }}
              className="btn-primary btn-compact btn-no-transform mb-3 flex items-center justify-center gap-2"
            >
              <kbd className="px-1.5 py-0.5 text-xs bg-white/10 rounded">?</kbd>
              <span>Raccourcis clavier</span>
            </button>
            <button
              onClick={handleLogout}
              className="btn-primary btn-compact btn-no-transform"
            >
              Déconnexion
            </button>
          </div>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <div className="flex-1 lg:ml-0 lg:w-auto w-full min-h-screen flex flex-col">
          <header className="px-6 pt-12">
            <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-7xl mx-auto">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted dark:text-dark-text-secondary mb-1 font-display">
                  Vue générale
                </p>
                <h1 className="text-2xl font-semibold text-text-dark dark:text-dark-text-contrast font-display">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-text-muted dark:text-dark-text-secondary">
                    {description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden h-10 w-10 rounded-full border border-border-base flex items-center justify-center"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Ouvrir le menu"
                >
                  ☰
                </button>
                <NotificationCenter />
                {actions}
                <NavLink to="/profile" className="group relative">
                  {user?.avatarUrl ? (
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand via-accent to-brand rounded-full blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                      <img
                        src={getAvatarUrl(user.avatarUrl)}
                        alt={
                          user.fullName || user.email || "Avatar utilisateur"
                        }
                        className="relative h-11 w-11 rounded-full border-3 border-white dark:border-dark-surface object-cover shadow-md ring-2 ring-brand/30"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand via-accent to-brand rounded-full blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative h-11 w-11 rounded-full border-3 border-white dark:border-dark-surface bg-gradient-to-br from-brand/30 to-accent/30 flex items-center justify-center font-bold text-lg text-brand shadow-md ring-2 ring-brand/30">
                        {user?.fullName?.charAt(0)?.toUpperCase() ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "C"}
                      </div>
                    </div>
                  )}
                </NavLink>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 pb-12 mt-12">
            <div className="max-w-7xl mx-auto space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function DashboardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M3 12h7V3H3v9zm11 9h7v-7h-7v7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 21h7v-6H3v6zm11-9h7V3h-7v9z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CyclingIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="7" cy="17" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="M7 17l3-7h4l3 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 6h4l2 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActivitiesIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M4 12h4l2 7 4-14 2 7h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WeightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 13.5h6" strokeLinecap="round" />
    </svg>
  );
}

function TrainingIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 16c1.333-2 3.333-3 6-3s4.667 1 6 3" strokeLinecap="round" />
      <path d="M12 5v8" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1" />
    </svg>
  );
}

function EquipmentIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M7 7h10v10H7z" opacity="0.4" />
      <path d="M5 5h14v14H5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c1.5-2.5 3.5-4 6-4s4.5 1.5 6 4" strokeLinecap="round" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3v12" strokeLinecap="round" />
      <path d="M15 6l-3-3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5" y="15" width="14" height="6" rx="2" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M3 9.5L12 3l9 6.5V21H3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BadgesIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 2l2.5 7.5H22L16 14l2 7-6-4.5L6 21l2-7-6-4.5h7.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoalsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function RecordsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 21h6" strokeLinecap="round" />
      <path d="M12 6v4" strokeLinecap="round" />
      <path d="M10 10h4" strokeLinecap="round" />
    </svg>
  );
}

function PlanIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 2v4M8 2v4M3 10h18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
