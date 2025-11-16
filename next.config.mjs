const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: Cannot use output: 'export' with App Router + dynamic routes + "use client"
  // See TAURI_BUILD_ISSUE.md for details
  images: {
    unoptimized: true,
  },
  // Configure assetPrefix or else the server won't properly resolve your assets.
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
  // Exclude arch folder from Next.js compilation
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    dirs: ['app', 'components', 'lib'],
  },
};

export default nextConfig;

