/**
 * Geriye dönük uyumluluk: PayTR panelinde eski URL tanımlıysa çalışmaya devam eder.
 * Tercih edilen bildirim URL: /api/paytr/callback
 */
import { handlePaytrIframeCallback } from "@/lib/paytr-subscription-callback";

export const runtime = "nodejs";

export async function POST(req) {
  return handlePaytrIframeCallback(req);
}
