/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "utfs.io",
      },
      {
        hostname: "i.pinimg.com",
      },
    ],
  },
}

export default nextConfig
