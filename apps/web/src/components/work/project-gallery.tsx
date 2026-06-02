import type { ProjectImage } from "@/content/projects";

export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  if (!images.length) return null;

  return (
    <section>
      <h2 className="font-display text-sm font-medium uppercase tracking-[0.2em] text-gold">
        Gallery
      </h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {images.map((img) => (
          <li key={img.id} className="overflow-hidden rounded-2xl border border-line bg-surface/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt ?? ""}
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            {img.caption && (
              <p className="border-t border-line px-4 py-3 text-sm text-muted">{img.caption}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
