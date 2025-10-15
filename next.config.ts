import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  },
};

export default nextConfig;
