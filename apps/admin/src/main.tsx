import "@fontsource-variable/inter"
import "@workspace/ui/fonts.css"
import "@workspace/ui/globals.css"

import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import { SessionProvider } from "@/auth/session-provider"
import App from "@/App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <SessionProvider>
          <App />
        </SessionProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
