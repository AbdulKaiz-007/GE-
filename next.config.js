/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // output: 'standalone', // ← Disabled for Cloudflare: OpenNext handles packaging.

  // pdf-parse reads test PDF files from disk during module init — bundling
  // it crashes the Next.js App Router. Tell Next to load it natively instead.
  // NOTE: Next.js 14 uses experimental.serverComponentsExternalPackages (renamed in v15)
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'officeparser', 'pdfjs-dist'],
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      },
    ],
  },
  // Fix OneDrive EPERM cache error on Windows: use in-memory webpack cache for ALL builds
  webpack: (config) => {
    config.cache = { type: 'memory' }
    return config
  },
}

module.exports = nextConfig
