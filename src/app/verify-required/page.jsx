"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, ShieldCheck, MailCheck, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { signOut, useSession } from "next-auth/react";

export default function VerifyRequiredPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSending, setIsSending] = useState(false);
  const [skipAllowed, setSkipAllowed] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email/skip-test");
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && data.allowed) setSkipAllowed(true);
      } catch {
        /* sessiz */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const userEmail = session?.user?.email ?? null;

  const handleResend = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "E-posta adresi zaten doğrulanmış") {
          toast.success("E-posta zaten doğrulanmış. İşletme paneline yönlendiriliyorsunuz.");
          router.replace("/business");
          return;
        }
        throw new Error(data.error || "Gönderim başarısız");
      }

      const msg = userEmail
        ? `Doğrulama e-postası ${userEmail} adresine gönderildi. Gelen kutusu ve spam klasörünü kontrol edin.`
        : "Doğrulama e-postası gönderildi. Gelen kutusu ve spam klasörünü kontrol edin.";
      toast.success(msg);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSkipVerify = async () => {
    if (
      !confirm(
        "Test ortamında e-posta doğrulamasını atlamak istediğinize emin misiniz?",
      )
    ) {
      return;
    }
    setSkipLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email/skip-test", {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "İşlem başarısız");
      }
      toast.success(data.message || "Doğrulama tamamlandı. Yönlendiriliyorsunuz.");
      router.replace("/business");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "İşlem başarısız");
    } finally {
      setSkipLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-8">
      <div className="max-w-xl w-full bg-white rounded-[3rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden border border-slate-100 text-center">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-[#004aad]">
          <ShieldCheck className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-50 text-[#004aad] rounded-[2rem] flex items-center justify-center mb-8 border border-blue-100 shadow-inner">
            <Mail className="w-12 h-12" />
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none mb-4">
            İŞLETMENİZİ <br />
            <span className="text-[#004aad]">DOĞRULAYIN</span>
          </h1>

          <p className="text-slate-500 font-medium text-lg mb-4 max-w-sm">
            İşletme paneline tam ve güvenli erişim sağlayabilmek için, e-posta
            adresinize gönderdiğimiz doğrulama linkine tıklamanız gerekmektedir.
          </p>

          {userEmail && (
            <p className="text-slate-700 font-semibold text-base mb-10 px-4 py-3 bg-slate-100 rounded-2xl border border-slate-200 w-full max-w-sm break-all">
              Link gönderilen adres <br />{" "}
              <span className="text-[#004aad] font-bold">{userEmail}</span>
            </p>
          )}
          {status === "authenticated" && !userEmail && (
            <p className="text-amber-600 text-sm mb-10">
              Oturumda e-posta bilgisi bulunamadı.
            </p>
          )}

          <button
            onClick={handleResend}
            disabled={isSending}
            className="w-full py-5 bg-[#004aad] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] italic hover:bg-slate-950 transition-all shadow-[0_15px_30px_rgba(0,74,173,0.2)] disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
          >
            {isSending ? (
              "MAİL GÖNDERİLİYOR..."
            ) : (
              <>
                YENİ LİNK GÖNDER{" "}
                <MailCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>

          {skipAllowed ? (
            <div className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-left">
              <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-800">
                <FlaskConical className="h-4 w-4 shrink-0" />
                Test ortamı — canlıda kapatılır
              </p>
              <button
                type="button"
                onClick={handleSkipVerify}
                disabled={skipLoading}
                className="w-full rounded-xl border border-amber-600 bg-white py-3 text-[11px] font-black uppercase tracking-[0.15em] text-amber-900 shadow-sm transition hover:bg-amber-100 disabled:opacity-60"
              >
                {skipLoading ? "İşleniyor…" : "Doğrulamayı atla (test)"}
              </button>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 text-center">
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              E-posta gelmedi mi? Spam klasörüne bakmayı unutmayın.
            </p>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest italic flex items-center justify-center gap-1 group transition-colors"
            >
              FARKLI BİR HESAPLA GİRİŞ YAP{" "}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
