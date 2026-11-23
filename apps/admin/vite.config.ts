import tailwindcss from "@tailwindcss/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // The admin app has always lived on 3001; keep that so the README and any
  // bookmarks keep working now that the port is no longer set by Next.
  server: {
    port: 3001,
    strictPort: true,
    // Keeps `/api` same-origin in dev, so the admin's httpOnly session cookie
    // is sent without any CORS or `credentials: "include"` plumbing.
    proxy: { "/api": { target: "http://localhost:4000" } },
  },
  preview: {
    port: 3001,
    strictPort: true,
    proxy: { "/api": { target: "http://localhost:4000" } },
  },
})
