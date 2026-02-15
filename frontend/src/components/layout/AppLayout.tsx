/**
 * Layout principal - Cockpit Design
 */

import { Menu } from "lucide-react";
import { useState } from "react";
import NotificationCenter from "../NotificationCenter";
import Sidebar from "./Sidebar";
import HeaderUserProfile from "./HeaderUserProfile";

type LayoutProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export default function AppLayout({
  title,
  description,
  actions,
  children,
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#080c12] font-sans text-[var(--text-primary)] selection:bg-[var(--accent-primary-subtle)] relative">
      {/* Mobile Menu */}
      <div className="absolute left-4 top-4 z-50 md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--border-default)] text-[var(--accent-primary)] shadow-lg backdrop-blur-md"
        >
          <Menu size={24} />
        </button>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* ═══ MAIN CONTAINER ═══ */}
      <main className="relative flex-1 flex flex-col overflow-hidden">
        {/* Background: visible gradient mesh */}
        <div className="absolute inset-0 bg-[#0b1018]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 20% 0%, rgba(248,113,47,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 80% 100%, rgba(59,130,246,0.06) 0%, transparent 60%)
            `,
          }}
        />
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* ── TOP BAR ── */}
        <header className="relative z-10 flex-shrink-0">
          <div className="flex items-center justify-between px-6 md:px-10 h-[72px]">
            {/* Left: Title block */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block w-1 h-8 rounded-full bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-primary)]/30" />
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-white leading-none">
                  {title}
                </h1>
                {description && (
                  <p className="text-xs text-[#64748b] mt-0.5">{description}</p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <NotificationCenter />
              {actions}
              <div className="w-px h-6 bg-[#1e293b] hidden md:block" />
              <HeaderUserProfile />
            </div>
          </div>
          {/* Bottom border - visible */}
          <div className="h-px bg-[#1e293b]" />
        </header>

        {/* ── CONTENT AREA ── */}
        <div className="relative flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-8 space-y-8 max-w-[1600px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
