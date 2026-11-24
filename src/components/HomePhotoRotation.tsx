"use client";

import { useEffect, useState } from "react";
import { SanityImage } from "@/components/SanityImage";

type Photo = { image: { asset?: { _ref: string } | null }; alt: string };

const SHOW_MS = 5000;

/**
 * The home hero's pictures, one on top of the other, fading from one to the next. The first is in the HTML and
 * visible without scripts; visitors who ask for reduced motion keep it and nothing changes.
 */
export function HomePhotoRotation({ photos, className }: { photos: Photo[]; className?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const timer = window.setInterval(() => setCurrent((i) => (i + 1) % photos.length), SHOW_MS);
    return () => window.clearInterval(timer);
  }, [photos.length]);

  return (
    <div className={`overflow-hidden bg-surface ${className ?? ""}`.trim()}>
      {photos.map((photo, index) => (
        <div
          key={photo.image.asset?._ref ?? index}
          aria-hidden={index === current ? undefined : true}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100" : "opacity-0"}`}
        >
          <SanityImage
            image={photo.image}
            alt={photo.alt}
            width={1200}
            sizes="(min-width: 640px) 30vw, 50vw"
            priority={index === 0}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
