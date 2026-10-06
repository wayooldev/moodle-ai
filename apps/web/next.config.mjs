/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@moodle-ai/db",
    "@moodle-ai/ops",
    "@moodle-ai/moodle",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
};

export default nextConfig;
