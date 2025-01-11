/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  // Ensure static exports work correctly
  output: 'standalone',
}

export default nextConfig