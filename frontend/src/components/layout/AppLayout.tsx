import { Bike, CalendarDays, Menu, Plus } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import NotificationCenter from "../NotificationCenter";

type LayoutProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const navigation = [
  { label: "Accueil", to: "/", icon: HomeIcon },
  { label: "Tableau de bord", to: "/dashboard", icon: DashboardIcon },
  { label: "Prédictions", to: "/insights", icon: InsightsIcon },
  { label: "Cartographie FC", to: "/cycling", icon: CyclingIcon },
  { label: "Activités", to: "/activities", icon: ActivitiesIcon },
  { label: "Records", to: "/records", icon: RecordsIcon },
  {
    label: "Planification",
    to: "/training",
    icon: () => <CalendarDays size={18} />,
  },
  { label: "Poids", to: "/weight", icon: WeightIcon },
  { label: "Charge d'entraînement", to: "/training-load", icon: TrainingIcon },
  { label: "Équipement", to: "/equipment", icon: EquipmentIcon },
  { label: "Profil", to: "/profile", icon: ProfileIcon },
  { label: "Export", to: "/export", icon: ExportIcon },
  { label: "Rapports", to: "/reports", icon: ReportsIcon },
  { label: "Icônes (Dev)", to: "/icons", icon: IconsDevIcon },
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
    <div className="flex h-screen w-full overflow-hidden bg-[var(--surface-base)] font-sans text-[var(--text-primary)] selection:bg-[var(--accent-primary-subtle)] relative">
      {/* Gradient Backgrounds for Atmosphere - Slate & Ember */}
      <div className="pointer-events-none absolute -left-64 top-0 h-[500px] w-[500px] rounded-full bg-[rgba(248,113,47,0.04)] blur-[120px]" />
      <div className="pointer-events-none absolute -right-64 bottom-0 h-[600px] w-[600px] rounded-full bg-[rgba(245,158,11,0.03)] blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950/50 blur-[100px]" />

      {/* Mobile Menu Button */}
      <div className="absolute left-4 top-4 z-50 md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--border-default)] text-[var(--accent-primary)] shadow-lg backdrop-blur-md"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-[240px] flex-col bg-[var(--surface-raised)] border-r border-[var(--border-subtle)] transition-transform duration-300 md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area */}
        <div
          className="flex items-center gap-3 px-5 h-16 shrink-0 cursor-pointer group"
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white">
            <Bike size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold text-[var(--text-primary)]">
            Centre d'Analyse
          </span>
        </div>

        {/* Main Action */}
        <div className="px-3 pb-4 shrink-0">
          <button
            type="button"
            onClick={() => navigate("/activities")}
            className="flex w-full items-center gap-2.5 rounded-lg bg-[var(--accent-primary)] px-3 py-2.5 text-sm text-white font-medium transition-colors hover:bg-[var(--accent-primary-hover)]"
          >
            <Plus size={18} strokeWidth={2} />
            <span>Nouvelle Sortie</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3">
          <div className="space-y-1">
            {navigation.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex w-full items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? "bg-[var(--surface-hover)] text-white"
                      : "text-white/70 hover:bg-[var(--surface-hover)] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`transition-colors ${
                        isActive
                          ? "text-[var(--accent-primary)]"
                          : "text-white/60 group-hover:text-white"
                      }`}
                    >
                      <Icon />
                    </span>
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="px-3 py-4 shrink-0 border-t border-[var(--border-subtle)]">
          <div
            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <div className="h-8 w-8 rounded-full bg-[var(--surface-input)] flex items-center justify-center text-xs font-semibold text-[var(--text-secondary)]">
              {user?.fullName?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)] truncate">
                {user?.fullName || "Athlète"}
              </p>
              <p className="text-[var(--text-tertiary)] text-xs truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mt-2 px-2 py-1.5"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-[#0f1419] shadow-2xl ring-1 ring-[var(--border-subtle)] md:rounded-l-[3rem]">
        <div className="h-full w-full overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-[var(--text-tertiary)]">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter />
              {actions}
              {/* User Profile Mini */}
              <NavLink
                to="/profile"
                className="flex items-center gap-3 bg-[var(--surface-card)] rounded-full p-1 pr-4 border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
              >
                {user?.avatarUrl ? (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] p-[1px] overflow-hidden">
                    <img
                      src={getAvatarUrl(user.avatarUrl)}
                      alt={user.fullName || user.email || "Avatar"}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-sm font-bold text-[var(--text-primary)]">
                    {user?.fullName?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "C"}
                  </div>
                )}
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {user?.fullName || "Cycliste"}
                </span>
              </NavLink>
            </div>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </main>
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

function ReportsIcon() {
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
        y="3"
        width="18"
        height="18"
        rx="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 8h10" strokeLinecap="round" />
      <path d="M7 12h10" strokeLinecap="round" />
      <path d="M7 16h6" strokeLinecap="round" />
    </svg>
  );
}

function IconsDevIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4" strokeLinecap="round" />
      <path d="M12 18v4" strokeLinecap="round" />
      <path d="M4.93 4.93l2.83 2.83" strokeLinecap="round" />
      <path d="M16.24 16.24l2.83 2.83" strokeLinecap="round" />
      <path d="M2 12h4" strokeLinecap="round" />
      <path d="M18 12h4" strokeLinecap="round" />
      <path d="M4.93 19.07l2.83-2.83" strokeLinecap="round" />
      <path d="M16.24 7.76l2.83-2.83" strokeLinecap="round" />
    </svg>
  );
}
