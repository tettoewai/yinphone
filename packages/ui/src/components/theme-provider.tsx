"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

function ThemeProvider({
  children,
  scriptProps,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      scriptProps={{
        // The inline theme script must run during SSR to avoid a flash of the
        // wrong theme. On the client React never executes scripts rendered by
        // components, so mark it as inert there to avoid React's warning.
        type: typeof window === "undefined" ? "text/javascript" : "text/plain",
        ...scriptProps,
      }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
