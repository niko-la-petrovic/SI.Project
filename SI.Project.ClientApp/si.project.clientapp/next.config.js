/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) return config;
    else {
      config.resolve.fallback.fs = false;
      return config;
    }
  },
};

module.exports = nextConfig;
