/**
 * Profil utilisateur dans le header
 */

import { NavLink } from "react-router-dom";
import { getAvatarUrl } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

export default function HeaderUserProfile() {
  const { user } = useAuthStore();

  return (
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
  );
}
