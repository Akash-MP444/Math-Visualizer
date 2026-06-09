/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.output = { ...config.output, globalObject: 'globalThis' };
    return config;
  },
};

export default nextConfig;
