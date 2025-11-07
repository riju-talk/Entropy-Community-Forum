// Load shared root .env for the monorepo (do not expose via nextConfig.env)
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["placeholder.svg", "lh3.googleusercontent.com", "avatars.githubusercontent.com"],
    unoptimized: true,
  },
  // Reduce build warnings
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Experimental features for better build performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

module.exports = nextConfig
