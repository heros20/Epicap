/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
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
      {
        protocol: "https",
        hostname: "whqilnwlubqnigzaqeqe.supabase.co",
      },
    ],
  },
}

export default nextConfig
