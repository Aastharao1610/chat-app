/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    console.log(
      "NEXT_PUBLIC_BACKEND in next config:",
      process.env.NEXT_PUBLIC_BACKEND,
    );
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
