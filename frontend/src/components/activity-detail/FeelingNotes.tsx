import { GlassCard } from "../ui/GlassCard";

interface FeelingNotesProps {
  notes: string;
}

export default function FeelingNotes({ notes }: FeelingNotesProps) {
  if (!notes) return null;

  return (
    <GlassCard>
      <h3 className="text-lg font-display font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <span>📝</span>
        Notes de séance
      </h3>
      <p className="text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
        {notes}
      </p>
    </GlassCard>
  );
}
