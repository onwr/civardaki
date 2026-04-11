import { handlePaytrIframeCallback } from "@/lib/paytr-subscription-callback";

export const runtime = "nodejs";

export async function POST(req) {
  return handlePaytrIframeCallback(req);
}
