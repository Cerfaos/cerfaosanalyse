/**
 * Layout principal de l'application
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
    <div className="flex h-screen w-full overflow-hidden bg-[var(--surface-base)] font-sans text-[var(--text-primary)] selection:bg-[var(--accent-primary-subtle)] relative">
      {/* Gradient Backgrounds for Atmosphere */}
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
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
              <HeaderUserProfile />
            </div>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
