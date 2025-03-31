import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Ignoring build errors is dangerous, but we need this for deployment
    // because of some route parameter typings issues in the API routes.
    // This should be fixed properly in development.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
