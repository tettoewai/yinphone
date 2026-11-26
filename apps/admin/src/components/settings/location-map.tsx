import { MapPin } from "lucide-react"

/**
 * The decorative map strip above the location controls.
 *
 * Drawn with the theme's own colours instead of the design's remote bitmap: the
 * admin bundle should not depend on an image hosted outside the repo, and this
 * version follows the light/dark theme for free. `aria-hidden` because the
 * coordinates beside it carry the information.
 */
export function LocationMap() {
  return (
    <div className="relative aspect-[16/7] w-full overflow-hidden bg-secondary">
      <svg
        viewBox="0 0 320 140"
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
        aria-hidden="true"
      >
        <rect width="320" height="140" fill="var(--color-secondary)" />

        <g fill="var(--color-card)" opacity="0.6">
          <rect x="10" y="10" width="72" height="40" rx="4" />
          <rect x="96" y="10" width="60" height="52" rx="4" />
          <rect x="170" y="10" width="80" height="34" rx="4" />
          <rect x="264" y="10" width="48" height="56" rx="4" />
          <rect x="10" y="64" width="54" height="30" rx="4" />
          <rect x="78" y="76" width="70" height="52" rx="4" />
          <rect x="166" y="58" width="56" height="34" rx="4" />
          <rect x="236" y="80" width="76" height="50" rx="4" />
          <rect x="10" y="108" width="52" height="24" rx="4" />
        </g>

        <path
          d="M0 30 C 60 52, 90 18, 150 34 S 250 60, 320 40"
          stroke="var(--color-primary)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          opacity="0.12"
        />

        <g stroke="var(--color-border)" strokeWidth="1.2" fill="none">
          <path d="M0 58 H320" />
          <path d="M88 0 V140" />
          <path d="M162 0 V140" />
          <path d="M258 0 V140" />
          <path d="M0 102 H320" />
        </g>
      </svg>

      <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
        <MapPin className="size-[18px]" strokeWidth={2.6} />
      </span>
    </div>
  )
}
