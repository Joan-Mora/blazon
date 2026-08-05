import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@blazon/shared", "@blazon/ui"],
  // standalone requiere symlinks; en Windows local fallan sin Developer Mode
  output: process.platform === "win32" ? undefined : "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
