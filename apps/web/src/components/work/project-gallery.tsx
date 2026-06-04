import type { ProjectImage } from "@/content/projects";
import { ProjectGalleryImages } from "./project-image-lightbox";

export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  if (!images.length) return null;

  const lightboxImages = images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
    caption: img.caption,
  }));

  return (
    <section>
      <h2 className="font-display text-sm font-medium uppercase tracking-[0.2em] text-gold">
        Gallery
      </h2>
      <ProjectGalleryImages images={lightboxImages} />
    </section>
  );
}
