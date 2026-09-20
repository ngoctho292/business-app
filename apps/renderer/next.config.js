const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@t-business/shared-types'],
  webpack: (config) => {
    config.resolve.alias['@t-business/shared-types$'] = path.resolve(
      __dirname,
      '../../packages/shared-types/src/index.ts'
    );
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
