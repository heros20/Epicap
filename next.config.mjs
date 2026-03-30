/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "epicap.com",
      },
      {
        protocol: "https",
        hostname: "www.epicap.com",
      },
    ],
  },
}

export default nextConfig
