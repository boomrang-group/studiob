
require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'www.boomrang-group.com',
      'boomrang-group.com',
      'i0.wp.com',
      'i1.wp.com',
      'i2.wp.com',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'www.boomrang-group.com', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'boomrang-group.com',      pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'i0.wp.com', pathname: '/www.boomrang-group.com/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'i1.wp.com', pathname: '/www.boomrang-group.com/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'i2.wp.com', pathname: '/www.boomrang-group.com/wp-content/uploads/**' },
    ],
  },
  webpack: (config, { isServer }) => {
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
