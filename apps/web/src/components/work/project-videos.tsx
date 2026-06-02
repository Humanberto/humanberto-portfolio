import type { ProjectVideo } from "@/content/projects";
import { isDirectVideoUrl, videoEmbedSrc } from "@/lib/project-media";

export function ProjectVideos({ videos }: { videos: ProjectVideo[] }) {
  if (!videos.length) return null;

  return (
    <section>
      <h2 className="font-display text-sm font-medium uppercase tracking-[0.2em] text-gold">
        Video
      </h2>
      <ul className="mt-6 space-y-8">
        {videos.map((video) => {
          const embed = videoEmbedSrc(video.url);
          return (
            <li key={video.id}>
              <div className="overflow-hidden rounded-2xl border border-line bg-black/40">
                {embed ? (
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={embed}
                      title={video.caption ?? "Project video"}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : isDirectVideoUrl(video.url) ? (
                  <video
                    controls
                    playsInline
                    poster={video.posterUrl}
                    className="aspect-video w-full"
                    preload="metadata"
                  >
                    <source src={video.url} />
                  </video>
                ) : (
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex aspect-video items-center justify-center text-sm text-muted hover:text-fg"
                  >
                    Open video ↗
                  </a>
                )}
              </div>
              {video.caption && (
                <p className="mt-2 text-sm text-muted">{video.caption}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
