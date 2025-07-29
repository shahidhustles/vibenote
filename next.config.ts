import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "img.clerk.com",
      "merry-shark-681.convex.cloud",
      "res.cloudinary.com", // Add Cloudinary domain for Morphik images
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        port: "",
        pathname: "/api/storage/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Add webpack configuration to dedupe TLDraw packages
  webpack: (config) => {
    // Ensure single instance of tldraw packages
    config.resolve.alias = {
      ...config.resolve.alias,
      "@tldraw/utils": require.resolve("@tldraw/utils"),
      "@tldraw/state": require.resolve("@tldraw/state"),
      "@tldraw/state-react": require.resolve("@tldraw/state-react"),
      "@tldraw/store": require.resolve("@tldraw/store"),
      "@tldraw/validate": require.resolve("@tldraw/validate"),
      "@tldraw/tlschema": require.resolve("@tldraw/tlschema"),
      "@tldraw/editor": require.resolve("@tldraw/editor"),
      tldraw: require.resolve("tldraw"),
    };

    return config;
  },
};

export default nextConfig;
