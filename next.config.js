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
