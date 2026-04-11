/** Next.js production build fazında true (ör. dış fetch’i atlamak için). */
export function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}
