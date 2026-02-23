// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   async rewrites() {
//     console.log(
//       "NEXT_PUBLIC_BACKEND in next config:",
//       process.env.NEXT_PUBLIC_BACKEND,
//     );
//     return [
//       {
//         source: "/api/:path*",
//         destination: `${process.env.NEXT_PUBLIC_BACKEND}/api/:path*`,
//       },
//     ];
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Falls back to local if the env variable isn't set, ensuring local testing works
    const backendUrl = (
      process.env.NEXT_PUBLIC_BACKEND || "http://localhost:5000"
    ).replace(/\/$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
