import type { NextConfig } from "next";
const mediaOrigin = (() => {
  try {
    const u = new URL(
      process.env.IMAGEKIT_URL_ENDPOINT ?? "https://ik.imagekit.io",
    );
    return u.protocol === "https:" ? u.origin : "https://ik.imagekit.io";
  } catch {
    return "https://ik.imagekit.io";
  }
})();
const config: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  transpilePackages: ["@atelier/database", "@atelier/shared"],
  poweredByHeader: false,
  htmlLimitedBots: /.*/,
  experimental: { useTypeScriptCli: false },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: ${mediaOrigin}; media-src 'self' blob: ${mediaOrigin}; font-src 'self'; connect-src 'self' https://upload.imagekit.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`,
          },
        ],
      },
    ];
  },
};
export default config;
