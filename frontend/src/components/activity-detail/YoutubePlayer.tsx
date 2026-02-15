import { getYoutubeVideoId } from "../../utils/videoUtils";

interface YoutubePlayerProps {
  url: string;
}

export default function YoutubePlayer({ url }: YoutubePlayerProps) {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) return null;

  return (
    <div
      className="rounded-2xl border border-white/[0.04] overflow-hidden"
      style={{ background: `color-mix(in srgb, var(--surface-raised) 40%, transparent)` }}
    >
      {/* Header discret */}
      <div className="flex items-center gap-3 px-6 py-3.5">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-disabled)]">
          Vidéo de la séance
        </span>
      </div>

      <div className="px-6 pb-6">
        <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-black/20">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
