import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    // Admins paste product image URLs straight into the dashboard, so any
    // HTTPS host is allowed instead of a fixed allowlist. Add
    // `{ protocol: "http", hostname: "**" }` if plain-HTTP sources are needed.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
}

// Wires `i18n/request.ts` into the build, which is where next-intl resolves
// the active locale and its message catalogue.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

export default withNextIntl(nextConfig)
