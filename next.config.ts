import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
  NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  NEXT_PUBLIC_PRIVY_CLIENT_ID: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID,
  },
};

export default nextConfig;
