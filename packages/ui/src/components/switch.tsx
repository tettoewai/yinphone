"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"

/* The registry copy of this file could not be generated (the shadcn CLI in this
   checkout cannot reach ui.shadcn.com), so it is written against the same
   `@base-ui/react` primitives the generated components use, keeping the
   `data-slot` names and the `data-checked` / `data-unchecked` states Base UI
   exposes on both the root and the thumb.

   The thumb size and travel are custom properties on the root rather than fixed
   utilities, so a screen that needs a larger toggle (the products table mirrors
   the design's 52×30 switch) only overrides two values instead of fighting the
   default thumb classes. */

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-muted transition-colors outline-none select-none [--switch-thumb-size:1rem] [--switch-thumb-travel:1rem] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[var(--switch-thumb-size)] rounded-full bg-card shadow-sm transition-transform data-checked:translate-x-[var(--switch-thumb-travel)] data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
