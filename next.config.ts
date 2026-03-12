import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  compress: true,
  // Security headers (additional layer alongside nginx)
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns'],
  },
};

export default nextConfig;
