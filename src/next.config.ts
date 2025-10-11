
require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    // 1) Ajoute domains (compatible Next 12 et +)
    domains: [
      'www.boomrang-group.com',
      'boomrang-group.com',
    ],
    // 2) Garde remotePatterns (si ta version le supporte) — SANS "port"
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.boomrang-group.com',
        pathname: '/**', // ou '/wp-content/uploads/**' si tu veux restreindre
      },
      {
        protocol: 'https',
        hostname: 'boomrang-group.com',
        pathname: '/**',
      },
    ],
    // (optionnel) dépannage temporaire :
    // unoptimized: true,
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        async_hooks: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
