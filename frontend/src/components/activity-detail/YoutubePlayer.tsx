import { GlassCard } from "../ui/GlassCard";
import { getYoutubeVideoId } from "../../utils/videoUtils";

interface YoutubePlayerProps {
  url: string;
}

export default function YoutubePlayer({ url }: YoutubePlayerProps) {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) return null;

  return (
    <GlassCard className="overflow-hidden">
      <h3 className="text-lg font-display font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span className="text-red-500">▶</span>
        Vidéo de la séance
      </h3>
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
    </GlassCard>
  );
}
