/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // In local dev, serve the Vite staking app under /app on THIS same origin, so
  // the landing page (/) and the app (/app) share one localhost — mirroring the
  // production setup in vercel.json. Only applied in development; in production
  // Vercel's rewrites handle /app.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return []
    const frontend = process.env.FRONTEND_DEV_URL ?? "http://localhost:5173"
    return [
      // Vite serves the app only at /app/ (trailing slash); /app 404s. So map the
      // bare /app to Vite's /app/, and pass sub-paths (assets, HMR) straight through.
      { source: "/app", destination: `${frontend}/app/` },
      { source: "/app/", destination: `${frontend}/app/` },
      { source: "/app/:path*", destination: `${frontend}/app/:path*` },
    ]
  },
}

export default nextConfig
