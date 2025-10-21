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
}

module.exports = nextConfig
