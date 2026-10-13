/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use rewrites in development for API proxy
  ...(process.env.NODE_ENV === "development" && {
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:8000/api/:path*",
        },
      ];
    },
  }),
  // Image optimization for Netlify
  images: {
    unoptimized: true,
  },
};

export default nextConfig;