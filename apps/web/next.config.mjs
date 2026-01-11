/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
      },
      {
        protocol: "https",
        hostname: "premise.com",
      },
    ],
  },
};

export default nextConfig;
