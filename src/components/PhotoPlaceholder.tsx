type Props = {
  /** "person" is a profile silhouette (barber pages and cards); "place" is a neutral picture icon (the barbershop photo on the home hero). */
  kind: "person" | "place";
  className?: string;
};

/**
 * A stand-in for a real photo until the owner supplies one. It carries no text and is hidden from assistive
 * technology, because it says nothing; a real photo replaces it and must come with a description in both
 * languages (constitution V and VII). Real photography only: this is never a substitute for content, only
 * for the empty slot, and every placeholder must be gone before launch.
 */
export function PhotoPlaceholder({ kind, className = "" }: Props) {
  return (
    <div
      aria-hidden="true"
      data-placeholder="photo"
      className={`flex items-end justify-center overflow-hidden rounded-card bg-surface text-muted ${className}`.trim()}
    >
      {kind === "person" ? (
        <svg viewBox="0 0 120 150" className="w-3/4" fill="currentColor">
          <circle cx="60" cy="52" r="26" />
          <path d="M8 150c0-34 24-56 52-56s52 22 52 56z" />
        </svg>
      ) : (
        <svg viewBox="0 0 120 150" className="my-auto w-1/2" fill="currentColor">
          <circle cx="84" cy="50" r="12" />
          <path d="M10 118l34-46 24 30 14-18 28 34z" />
        </svg>
      )}
    </div>
  );
}
