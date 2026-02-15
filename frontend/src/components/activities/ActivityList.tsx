import { Skeleton } from "../ui/skeleton";
import type { Activity } from "./activityUtils";
import ActivityCard from "./ActivityCard";
import type { PaginationMeta } from "../../types/activities";

interface ActivityListProps {
  activities: Activity[];
  loading: boolean;
  pagination: PaginationMeta | null;
  currentPage: number;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  onExportCsv: () => void;
  onPageChange: (page: number) => void;
}

export default function ActivityList({
  activities,
  loading,
  pagination,
  currentPage,
  onEdit,
  onDelete,
  onExportCsv,
  onPageChange,
}: ActivityListProps) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--status-info)]" />
          <h2 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
            Historique
          </h2>
          {pagination && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--surface-input)] text-[11px] font-mono font-bold text-[var(--text-disabled)] tabular-nums">
              {pagination.total}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onExportCsv}
          disabled={activities.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-disabled)] hover:text-white bg-[var(--surface-raised)] border border-[var(--border-default)] hover:border-[var(--border-strong)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exporter CSV
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : activities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.lastPage > 1 && (
        <Pagination pagination={pagination} currentPage={currentPage} onPageChange={onPageChange} />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-default)] p-5">
          <div className="flex items-center gap-5">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="flex gap-6">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <Skeleton className="h-2 w-12 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-default)] py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-default)] flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-[var(--text-disabled)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <p className="text-base font-extrabold text-[var(--text-tertiary)] mb-1">Aucune activité</p>
      <p className="text-sm text-[var(--text-disabled)]">
        Importez un fichier <span className="font-mono font-bold text-[var(--accent-primary)]">.FIT</span> ou{" "}
        <span className="font-mono font-bold text-[var(--accent-secondary)]">.CSV</span> pour commencer
      </p>
    </div>
  );
}

function Pagination({ pagination, currentPage, onPageChange }: {
  pagination: PaginationMeta;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const pageNumbers = Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
    if (pagination.lastPage <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= pagination.lastPage - 2) return pagination.lastPage - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <div className="flex items-center justify-between mt-6 pt-5 border-t border-[var(--border-default)]">
      <span className="text-xs font-mono font-bold text-[var(--text-disabled)] tabular-nums">
        {pagination.currentPage} / {pagination.lastPage}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-9 px-3 rounded-xl text-[var(--text-disabled)] hover:text-white bg-[var(--surface-raised)] border border-[var(--border-default)] hover:border-[var(--border-strong)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`w-9 h-9 rounded-xl text-xs font-bold font-mono transition-all ${
              currentPage === pageNum
                ? "bg-[var(--accent-primary)] text-white shadow-[0_2px_12px_rgba(248,113,47,0.35)]"
                : "text-[var(--text-disabled)] hover:text-white bg-[var(--surface-raised)] border border-[var(--border-default)] hover:border-[var(--border-strong)]"
            }`}
          >
            {pageNum}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pagination.lastPage, currentPage + 1))}
          disabled={currentPage === pagination.lastPage}
          className="h-9 px-3 rounded-xl text-[var(--text-disabled)] hover:text-white bg-[var(--surface-raised)] border border-[var(--border-default)] hover:border-[var(--border-strong)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
