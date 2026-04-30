/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: '*.farcaster.xyz' },
      { hostname: '*.warpcast.com' },
    ],
  },
};

export default nextConfig;
