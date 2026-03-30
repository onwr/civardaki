"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Lock, LogOut, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const STORAGE_PREFIX = "bh_screen_lock_hash_v1";

function storageKey(userId) {
  return `${STORAGE_PREFIX}_${userId}`;
}

async function hashPin(pin, userId) {
  const payload = `${userId}|civardaki-screen-lock|${pin}`;
  const enc = new TextEncoder().encode(payload);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function EkranKilidiPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [phase, setPhase] = useState(null);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/user/login");
      return;
    }
    if (status !== "authenticated" || !userId) {
      setPhase(null);
      return;
    }
    try {
      const stored = localStorage.getItem(storageKey(userId));
      setPhase(stored ? "unlock" : "setup");
    } catch {
      setPhase("setup");
    }
  }, [status, userId, router]);

  const goDashboard = useCallback(() => {
    router.replace("/business/dashboard");
  }, [router]);

  const handleSetup = async (e) => {
    e.preventDefault();
    const a = pin.trim();
    const b = pin2.trim();
    if (a.length < 4) {
      toast.error("PIN en az 4 karakter olmalıdır.");
      return;
    }
    if (a !== b) {
      toast.error("PIN’ler eşleşmiyor.");
      return;
    }
    if (!userId) return;
    setBusy(true);
    try {
      const h = await hashPin(a, userId);
      localStorage.setItem(storageKey(userId), h);
      toast.success("PIN kaydedildi.");
      setPin("");
      setPin2("");
      goDashboard();
    } catch {
      toast.error("Kayıt başarısız.");
    } finally {
      setBusy(false);
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    const p = pin.trim();
    if (!p || !userId) return;
    setBusy(true);
    try {
      const h = await hashPin(p, userId);
      const stored = localStorage.getItem(storageKey(userId));
      if (h !== stored) {
        toast.error("PIN hatalı.");
        setPin("");
        return;
      }
      toast.success("Kilit açıldı.");
      setPin("");
      goDashboard();
    } catch {
      toast.error("İşlem başarısız.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || (status === "authenticated" && phase === null)) {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
        style={{
          background: "var(--bh-sidebar-bg)",
          fontFamily: '"Segoe UI", system-ui, sans-serif',
        }}
      >
        <Loader2 className="h-10 w-10 animate-spin text-white/50" />
        <p className="mt-4 text-sm text-white/60">Yükleniyor…</p>
      </div>
    );
  }

  if (status !== "authenticated" || !userId) {
    return null;
  }

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center text-base text-white placeholder:text-white/30 outline-none focus:border-white/40";

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
      style={{
        background: "var(--bh-sidebar-bg)",
        fontFamily: '"Segoe UI", system-ui, sans-serif',
      }}
    >
      <Lock className="mb-6 h-16 w-16 text-white/40" aria-hidden />

      {phase === "setup" ? (
        <>
          <h1 className="mb-2 text-center text-xl font-bold text-white">
            PIN belirleyin
          </h1>
          <p className="mb-8 max-w-sm text-center text-sm text-white/60">
            Bu PIN yalnızca bu tarayıcıda saklanır. Ekran kilidini açmak için
            kullanılacaktır. En az 4 karakter.
          </p>
          <form
            onSubmit={handleSetup}
            className="w-full max-w-sm space-y-4"
            autoComplete="off"
          >
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className={inputClass}
                placeholder="PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={32}
                autoFocus
                autoComplete="new-password"
              />
            </div>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className={inputClass}
                placeholder="PIN tekrar"
                value={pin2}
                onChange={(e) => setPin2(e.target.value)}
                maxLength={32}
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="flex w-full items-center justify-center gap-2 text-xs font-medium text-white/50 hover:text-white/80"
            >
              {show ? (
                <>
                  <EyeOff className="h-4 w-4" /> Gizle
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Göster
                </>
              )}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "PIN’i kaydet ve devam et"
              )}
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="mb-2 text-center text-xl font-bold text-white">
            Ekran kilitli
          </h1>
          <p className="mb-8 max-w-sm text-center text-sm text-white/60">
            Panele dönmek için PIN’inizi girin veya çıkış yapın.
          </p>
          <form
            onSubmit={handleUnlock}
            className="w-full max-w-sm space-y-4"
            autoComplete="off"
          >
            <input
              type={show ? "text" : "password"}
              className={inputClass}
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={32}
              autoFocus
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="flex w-full items-center justify-center gap-2 text-xs font-medium text-white/50 hover:text-white/80"
            >
              {show ? (
                <>
                  <EyeOff className="h-4 w-4" /> Gizle
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Göster
                </>
              )}
            </button>
            <button
              type="submit"
              disabled={busy || !pin.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Kilidi aç"
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-10 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Çıkış yap
          </button>
        </>
      )}
    </div>
  );
}
