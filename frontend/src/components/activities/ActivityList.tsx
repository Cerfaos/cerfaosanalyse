/**
 * Liste des activités avec pagination
 */

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
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Historique</h2>
        <button
          type="button"
          onClick={onExportCsv}
          disabled={activities.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand/30 text-brand hover:bg-brand/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Exporter en CSV"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-sm font-medium">Export CSV</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : activities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
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

      {pagination && pagination.lastPage > 1 && (
        <Pagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="glass-panel p-5 h-40 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="flex gap-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <div className="grid grid-cols-5 gap-4 mt-4">
            {[1, 2, 3, 4, 5].map((j) => (
              <Skeleton key={j} className="h-12 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
        <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="text-xl font-semibold text-gray-300 mb-2">Aucune activité enregistrée</p>
      <p className="text-sm text-gray-400 max-w-sm mx-auto">
        Importez votre première activité pour commencer à suivre vos performances
      </p>
    </div>
  );
}

interface PaginationProps {
  pagination: PaginationMeta;
  currentPage: number;
  onPageChange: (page: number) => void;
}

function Pagination({ pagination, currentPage, onPageChange }: PaginationProps) {
  const pageNumbers = Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
    if (pagination.lastPage <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= pagination.lastPage - 2) return pagination.lastPage - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
      <div className="text-sm text-gray-400">
        {pagination.total} activité{pagination.total > 1 ? "s" : ""} • Page {pagination.currentPage}{" "}
        sur {pagination.lastPage}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Première page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                currentPage === pageNum
                  ? "bg-brand text-black"
                  : "border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(pagination.lastPage, currentPage + 1))}
          disabled={currentPage === pagination.lastPage}
          className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Suivant
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pagination.lastPage)}
          disabled={currentPage === pagination.lastPage}
          className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Dernière page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
