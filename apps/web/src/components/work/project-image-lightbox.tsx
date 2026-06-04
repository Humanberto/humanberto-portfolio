"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@humanberto/ui";

export type LightboxImage = {
  id?: string;
  url: string;
  alt?: string;
  caption?: string;
};

type LightboxProps = {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

function ImageLightbox({ images, index, onClose, onChangeIndex }: LightboxProps) {
  const open = index !== null && index >= 0 && index < images.length;
  const current = open ? images[index]! : null;
  const hasMultiple = images.length > 1;

  const goPrev = useCallback(() => {
    if (index === null || !hasMultiple) return;
    onChangeIndex((index + images.length - 1) % images.length);
  }, [hasMultiple, images.length, index, onChangeIndex]);

  const goNext = useCallback(() => {
    if (index === null || !hasMultiple) return;
    onChangeIndex((index + 1) % images.length);
  }, [hasMultiple, images.length, index, onChangeIndex]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, goPrev, goNext]);

  if (!open || !current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged image"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-sm text-white hover:bg-white/10"
        aria-label="Close"
      >
        Close
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-3 text-white hover:bg-white/10 sm:left-4"
            aria-label="Previous image"
          >
            ←
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-3 text-white hover:bg-white/10 sm:right-4"
            aria-label="Next image"
          >
            →
          </button>
        </>
      )}

      <figure
        className="flex max-h-full max-w-full flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.alt ?? ""}
          className="max-h-[min(85vh,900px)] max-w-full object-contain"
        />
        {(current.caption || hasMultiple) && (
          <figcaption className="mt-4 max-w-2xl text-center text-sm text-white/75">
            {hasMultiple && (
              <span className="mr-2 text-white/50">
                {index + 1} / {images.length}
              </span>
            )}
            {current.caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}

const frameClass =
  "flex w-full cursor-zoom-in items-center justify-center overflow-hidden bg-surface/40";

type FrameProps = {
  image: LightboxImage;
  aspectClass: string;
  onOpen: () => void;
  className?: string;
};

function ClickableImageFrame({ image, aspectClass, onOpen, className = "" }: FrameProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${frameClass} ${aspectClass} ${className}`.trim()}
      aria-label={image.alt ? `Enlarge: ${image.alt}` : "Enlarge image"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.alt ?? ""}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
      />
    </button>
  );
}

export function ProjectCoverImage({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const images: LightboxImage[] = [{ url: src, alt }];

  return (
    <>
      <div className={cn("overflow-hidden rounded-2xl border border-line", className)}>
        <ClickableImageFrame
          image={images[0]!}
          aspectClass="aspect-[16/9]"
          onOpen={() => setIndex(0)}
        />
      </div>
      <ImageLightbox
        images={images}
        index={index}
        onClose={() => setIndex(null)}
        onChangeIndex={setIndex}
      />
    </>
  );
}

export function ProjectGalleryImages({
  images,
}: {
  images: LightboxImage[];
}) {
  const [index, setIndex] = useState<number | null>(null);

  if (!images.length) return null;

  return (
    <>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {images.map((img, i) => (
          <li key={img.id ?? `${img.url}-${i}`} className="overflow-hidden rounded-2xl border border-line">
            <ClickableImageFrame
              image={img}
              aspectClass="aspect-[4/3]"
              onOpen={() => setIndex(i)}
            />
            {img.caption && (
              <p className="border-t border-line px-4 py-3 text-sm text-muted">{img.caption}</p>
            )}
          </li>
        ))}
      </ul>
      <ImageLightbox
        images={images}
        index={index}
        onClose={() => setIndex(null)}
        onChangeIndex={setIndex}
      />
    </>
  );
}
