/**
 * Sidebar de navigation
 */

import { Bike, Plus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { navigation } from "./navConfig";
import { LogoutIcon } from "./navIcons";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-full w-[240px] flex-col bg-[var(--surface-raised)] border-r border-[var(--border-subtle)] transition-transform duration-300 md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
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
              onClick={onClose}
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
          <LogoutIcon />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
