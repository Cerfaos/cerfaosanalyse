interface FeelingNotesProps {
  notes: string;
}

export default function FeelingNotes({ notes }: FeelingNotesProps) {
  if (!notes) return null;

  return (
    <div
      className="rounded-2xl border border-white/[0.04] overflow-hidden"
      style={{ background: `color-mix(in srgb, var(--surface-raised) 40%, transparent)` }}
    >
      {/* Header discret */}
      <div className="flex items-center gap-3 px-6 py-3.5">
        <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-disabled)]">
          Notes de séance
        </span>
      </div>

      <div className="px-6 pb-6">
        <div className="border-l-2 border-violet-500/20 pl-4">
          <p className="text-[var(--text-tertiary)] whitespace-pre-wrap leading-relaxed italic">
            {notes}
          </p>
        </div>
      </div>
    </div>
  );
}
