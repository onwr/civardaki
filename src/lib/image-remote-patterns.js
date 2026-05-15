/**
 * next/image remotePatterns — harici görsel hostları.
 * CDN_UPLOAD_URL değişirse .env üzerinden hostname otomatik eklenir.
 */

function pattern(hostname, protocol = "https") {
  return {
    protocol,
    hostname,
    port: "",
    pathname: "/**",
  };
}

function hostFromEnvUrl(envValue) {
  if (!envValue || typeof envValue !== "string") return null;
  try {
    return new URL(envValue.trim()).hostname;
  } catch {
    return null;
  }
}

function uniquePatterns(list) {
  const seen = new Set();
  return list.filter((p) => {
    const key = `${p.protocol}://${p.hostname}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getImageRemotePatterns() {
  const hosts = [
    "images.unsplash.com",
    "i.pravatar.cc",
    "cdn.e-puantaj.net",
    "civardaki.com",
    "www.civardaki.com",
    hostFromEnvUrl(process.env.CDN_UPLOAD_URL),
    hostFromEnvUrl(process.env.NEXT_PUBLIC_CDN_BASE_URL),
    hostFromEnvUrl(process.env.NEXT_PUBLIC_APP_URL),
  ].filter(Boolean);

  if (process.env.NODE_ENV === "development") {
    hosts.push("localhost", "127.0.0.1");
  }

  return uniquePatterns(
    hosts.flatMap((hostname) => {
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return [pattern(hostname, "http"), pattern(hostname, "https")];
      }
      return [pattern(hostname, "https"), pattern(hostname, "http")];
    }),
  );
}

module.exports = { getImageRemotePatterns };
