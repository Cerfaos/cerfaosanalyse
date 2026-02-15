import { useRef, useState } from "react";

interface UploadFormProps {
  selectedFile: File | null;
  selectedGpxFile: File | null;
  uploading: boolean;
  uploadProgress: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGpxFileChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function UploadForm({
  selectedFile,
  selectedGpxFile,
  uploading,
  uploadProgress,
  onFileChange,
  onGpxFileChange,
  onSubmit,
}: UploadFormProps) {
  const fitInputRef = useRef<HTMLInputElement>(null);
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".fit") || file.name.endsWith(".csv"))) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fitInputRef.current) {
        fitInputRef.current.files = dataTransfer.files;
        fitInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* ── Drop Zone ── */}
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
          isDragging
            ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 scale-[1.02]"
            : selectedFile
              ? "border-emerald-500/40 bg-emerald-500/[0.06]"
              : "border-white/[0.08] hover:border-[var(--accent-primary)]/30 hover:bg-white/[0.02]"
        }`}
        onClick={() => fitInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Animated background on drag */}
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 via-transparent to-[var(--accent-secondary)]/10 animate-pulse-soft" />
        )}

        <input
          ref={fitInputRef}
          type="file"
          accept=".fit,.csv"
          onChange={onFileChange}
          className="hidden"
        />

        <div className="relative flex flex-col items-center py-8 px-4">
          {selectedFile ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[var(--text-primary)] mb-1 truncate max-w-full">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-emerald-400/80 font-mono font-semibold">
                {(selectedFile.size / 1024).toFixed(1)} KB - Prêt
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08] flex items-center justify-center mb-3 group-hover:ring-white/[0.12] transition-all">
                <svg className="w-6 h-6 text-[var(--text-disabled)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[var(--text-secondary)] mb-2">
                Glissez un fichier ici
              </p>
              <p className="text-[11px] text-[var(--text-disabled)] mb-3">
                ou cliquez pour parcourir
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/20">
                  .FIT
                </span>
                <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)] ring-1 ring-[var(--accent-secondary)]/20">
                  .CSV
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── GPX File ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-disabled)]">
            Trace GPS
          </p>
          {selectedGpxFile && (
            <button
              type="button"
              onClick={() => {
                onGpxFileChange(null);
                if (gpxInputRef.current) gpxInputRef.current.value = "";
              }}
              className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              Retirer
            </button>
          )}
        </div>

        {selectedGpxFile ? (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/[0.06] ring-1 ring-emerald-500/20">
            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{selectedGpxFile.name}</span>
            <span className="text-[10px] text-[var(--text-disabled)] font-mono ml-auto flex-shrink-0">
              {(selectedGpxFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => gpxInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-white/[0.08] text-[var(--text-disabled)] hover:text-[var(--text-tertiary)] hover:border-white/[0.15] hover:bg-white/[0.02] transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-semibold">Fichier GPX (optionnel)</span>
          </button>
        )}

        <input
          ref={gpxInputRef}
          type="file"
          accept=".gpx"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onGpxFileChange(e.target.files[0]);
            }
          }}
          className="hidden"
        />
      </div>

      {/* ── Submit Button ── */}
      <button
        type="submit"
        disabled={uploading || !selectedFile}
        className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[var(--accent-primary)] to-[#ea580c] shadow-[0_4px_20px_rgba(248,113,47,0.3)] hover:shadow-[0_6px_28px_rgba(248,113,47,0.4)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 overflow-hidden"
      >
        {!uploading && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
        )}
        <span className="relative">
          {uploading ? "Import en cours..." : "Importer l'activité"}
        </span>
      </button>

      {/* ── Progress Bar ── */}
      {uploading && (
        <div className="space-y-1.5">
          <div className="w-full h-2 rounded-full bg-black/30 ring-1 ring-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{
                width: `${uploadProgress}%`,
                background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
              }}
            >
              {/* Shimmer effect on progress bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>
          <p className="text-[11px] text-center text-[var(--accent-primary)] font-mono font-bold tabular-nums">
            {uploadProgress}%
          </p>
        </div>
      )}

      {/* ── Info tip ── */}
      <div className="rounded-xl bg-blue-500/[0.06] ring-1 ring-blue-500/10 px-4 py-3">
        <p className="text-[11px] text-blue-300/70 leading-relaxed">
          <span className="font-bold text-blue-300/90">FIT/CSV</span> pour les métriques,{" "}
          <span className="font-bold text-blue-300/90">GPX</span> pour la trace.
          Le TRIMP est calculé automatiquement si la FC est disponible.
        </p>
      </div>
    </form>
  );
}
