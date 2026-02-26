import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
