import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bike, Plus, Menu, CalendarDays } from "lucide-react";
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
  { label: "Planification", to: "/training", icon: () => <CalendarDays size={18} /> },
  { label: "Poids", to: "/weight", icon: WeightIcon },
  { label: "Charge d'entraînement", to: "/training-load", icon: TrainingIcon },
  { label: "Équipement", to: "/equipment", icon: EquipmentIcon },
  { label: "Profil", to: "/profile", icon: ProfileIcon },
  { label: "Export", to: "/export", icon: ExportIcon },
  { label: "Rapports", to: "/reports", icon: ReportsIcon },
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
    <div className="flex h-screen w-full overflow-hidden bg-[#0a1915] font-sans text-white selection:bg-emerald-500/30 relative">
      {/* Gradient Backgrounds for Atmosphere */}
      <div className="pointer-events-none absolute -left-64 top-0 h-[500px] w-[500px] rounded-full bg-emerald-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-64 bottom-0 h-[600px] w-[600px] rounded-full bg-emerald-900/10 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/40 blur-[100px]" />

      {/* Mobile Menu Button */}
      <div className="absolute left-4 top-4 z-50 md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A191A] border border-[#8BC34A]/30 text-[#8BC34A] shadow-lg backdrop-blur-md"
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
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-[250px] flex-col border-r-[3px] border-[#8BC34A] bg-[#0A191A] py-6 transition-transform duration-300 md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-6 mb-8 shrink-0 cursor-pointer group" onClick={() => navigate("/dashboard")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black group-hover:bg-[#8BC34A] transition-colors">
            <Bike size={20} strokeWidth={3} />
          </div>
          <span className="text-[18px] font-bold text-white leading-tight group-hover:text-[#8BC34A] transition-colors">
            Centre d'Analyse<br/>Cycliste
          </span>
        </div>

        {/* Main Action */}
        <div className="px-4 mb-6 shrink-0">
          <button
            onClick={() => navigate("/activities")}
            className="group flex w-full items-center gap-3 rounded-2xl bg-white/10 p-3 text-white backdrop-blur-md transition-all hover:bg-[#8BC34A] hover:text-black hover:shadow-[0_0_15px_rgba(139,195,74,0.3)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 group-hover:bg-black/10">
              <Plus size={16} />
            </div>
            <span className="font-medium">Nouvelle Sortie</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1 px-0">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `group relative flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
                  isActive
                    ? "bg-[#8BC34A]/10 text-[#E0E0E0]"
                    : "text-[#E0E0E0] hover:bg-[#8BC34A]/5 hover:pl-5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-[3px] bg-[#8BC34A] shadow-[0_0_8px_rgba(139,195,74,0.4)]" />
                  )}
                  <div className="flex items-center gap-3">
                    <span className={`transition-colors ${isActive ? "text-[#8BC34A]" : "text-[#E0E0E0] group-hover:text-[#8BC34A]/70"}`}>
                      <Icon />
                    </span>
                    <span>{label}</span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="px-4 mt-4 shrink-0 border-t border-white/10 pt-4">
          <div className="text-sm mb-3">
            <p className="font-semibold text-white">{user?.fullName || "Athlète"}</p>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-gray-400 hover:text-white transition-colors text-left"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-white/5 shadow-2xl ring-1 ring-white/5 backdrop-blur-3xl md:rounded-l-[3rem]">
        <div className="h-full w-full overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
              {description && (
                <p className="text-sm text-gray-400">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter />
              {actions}
              {/* User Profile Mini */}
              <NavLink to="/profile" className="flex items-center gap-3 bg-white/5 rounded-full p-1 pr-4 border border-white/10 hover:border-[#8BC34A]/30 transition-colors">
                {user?.avatarUrl ? (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#8BC34A] to-[#5CE1E6] p-[1px] overflow-hidden">
                    <img
                      src={getAvatarUrl(user.avatarUrl)}
                      alt={user.fullName || user.email || "Avatar"}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#8BC34A] to-[#5CE1E6] flex items-center justify-center text-sm font-bold text-white">
                    {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                )}
                <span className="text-sm font-medium text-[#E0E0E0]">{user?.fullName || "Cycliste"}</span>
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
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 8h10" strokeLinecap="round" />
      <path d="M7 12h10" strokeLinecap="round" />
      <path d="M7 16h6" strokeLinecap="round" />
    </svg>
  );
}


