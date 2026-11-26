import { cn } from "@workspace/ui/lib/utils"

import { SETTINGS_SECTIONS, type SettingsSection } from "@/lib/settings"

type SettingsTabsProps = {
  active: SettingsSection
  onSelect: (section: SettingsSection) => void
}

/**
 * The section strip from the design. All four panels are on screen at once, so
 * these are jump links rather than a real tablist: pressing one scrolls its
 * card into view and marks the strip. `aria-current` is used instead of
 * `aria-selected` because nothing is being hidden.
 */
export function SettingsTabs({ active, onSelect }: SettingsTabsProps) {
  return (
    <nav
      aria-label="Settings sections"
      className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-2"
    >
      {SETTINGS_SECTIONS.map((section) => (
        <button
          key={section.key}
          type="button"
          onClick={() => onSelect(section.key)}
          aria-current={active === section.key ? "true" : undefined}
          className={cn(
            "flex min-h-12 min-w-[140px] flex-1 items-center justify-center rounded-md px-3 text-center font-body text-sm font-bold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            active === section.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {section.label}
        </button>
      ))}
    </nav>
  )
}
