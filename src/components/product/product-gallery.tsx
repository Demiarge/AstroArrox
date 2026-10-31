"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ProductPlaceholder } from "@/components/product/product-placeholder";
import { cn } from "@/lib/cn";

type GalleryImage = { id: string; url: string; alt: string };

/** Badges come in as `overlay` so they stay server-rendered. */
export function ProductGallery({ images, name, overlay }: { images: GalleryImage[]; name: string; overlay?: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || images.length < 2) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { root: track, threshold: 0.6 },
    );
    track.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [images.length]);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const index = (i + images.length) % images.length;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
    setActive(index);
  };

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line">
        <ProductPlaceholder label={name} />
        {overlay}
      </div>
    );
  }

  return (
    <div>
      <div className="group relative overflow-hidden rounded-2xl border border-line bg-white">
        <div
          ref={trackRef}
          className="flex aspect-square snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
          aria-label={`${name} photos`}
        >
          {images.map((img, i) => (
            <div
              key={img.id}
              data-index={i}
              className="relative size-full shrink-0 snap-center"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${images.length}`}
            >
              <Image
                src={img.url}
                alt={img.alt || name}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                preload={i === 0}
                className="object-contain p-4 sm:p-6"
              />
            </div>
          ))}
        </div>
        {overlay}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100 sm:grid"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100 sm:grid"
              aria-label="Next photo"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden" aria-hidden>
              {images.map((img, i) => (
                <span key={img.id} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-5 bg-brand" : "w-1.5 bg-black/25")} />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-xl border-2 bg-white transition-colors sm:size-20",
                  i === active ? "border-brand" : "border-line hover:border-brand-text/40",
                )}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
