let lastPlayedAt = 0;
const COOLDOWN_MS = 700;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!window.__civardakiNotificationAudioCtx) {
    window.__civardakiNotificationAudioCtx = new Ctx();
  }
  return window.__civardakiNotificationAudioCtx;
}

function tone(ctx, frequency, startAt, duration, gainValue) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.linearRampToValueAtTime(gainValue, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

export async function playNotificationSound(kind = "default") {
  try {
    const now = Date.now();
    if (now - lastPlayedAt < COOLDOWN_MS) return;
    lastPlayedAt = now;

    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const t = ctx.currentTime;
    if (kind === "lead") {
      tone(ctx, 720, t, 0.12, 0.08);
      tone(ctx, 980, t + 0.11, 0.14, 0.09);
      return;
    }

    if (kind === "order") {
      tone(ctx, 880, t, 0.08, 0.1);
      tone(ctx, 1320, t + 0.1, 0.12, 0.08);
      return;
    }

    tone(ctx, 900, t, 0.1, 0.09);
  } catch {
    // Ses çalma başarısız olsa bile bildirim akışı devam etsin.
  }
}

