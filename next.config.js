/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const { getImageRemotePatterns } = require("./src/lib/image-remote-patterns");

const nextConfig = {
  images: {
    remotePatterns: getImageRemotePatterns(),
  },
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "civardaki",
    project: "civardaki-web",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }
);
