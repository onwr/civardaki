"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, Loader2, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "@/contexts/LocationContext";
import { toDisplayLocationName } from "@/lib/location-match";

function emptyDraft() {
  return {
    cityId: "",
    cityName: "",
    districtId: "",
    districtName: "",
    lat: null,
    lng: null,
  };
}

export default function LocationPicker({ variant = "desktop", className = "" }) {
  const { selectedLocation, setSelectedLocation, locationLabel, isHydrated } =
    useLocation();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const rootRef = useRef(null);

  const syncDraftFromSelected = useCallback(() => {
    setDraft({
      cityId: selectedLocation.cityId || "",
      cityName: selectedLocation.cityName || "",
      districtId: selectedLocation.districtId || "",
      districtName: selectedLocation.districtName || "",
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    });
  }, [selectedLocation]);

  useEffect(() => {
    if (!open) return;
    syncDraftFromSelected();
    setLoadError("");

    let cancelled = false;
    (async () => {
      setLoadingCities(true);
      try {
        const res = await fetch("/api/locations/cities");
        const data = await res.json();
        if (!cancelled) setCities(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setLoadError("İl listesi yüklenemedi.");
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, syncDraftFromSelected]);

  useEffect(() => {
    if (!open || !draft.cityId) {
      setDistricts([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingDistricts(true);
      try {
        const res = await fetch(
          `/api/locations/districts?sehir_id=${encodeURIComponent(draft.cityId)}`,
        );
        const data = await res.json();
        if (!cancelled) setDistricts(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setDistricts([]);
      } finally {
        if (!cancelled) setLoadingDistricts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, draft.cityId]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const label = isHydrated ? locationLabel : "İstanbul, Kadıköy";

  const canApply =
    Boolean(draft.cityId && draft.cityName) ||
    (draft.lat != null &&
      draft.lng != null &&
      Number.isFinite(draft.lat) &&
      Number.isFinite(draft.lng));

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    const city = cities.find((c) => String(c.sehir_id) === String(cityId));
    setDraft({
      cityId,
      cityName: city ? toDisplayLocationName(city.sehir_adi) : "",
      districtId: "",
      districtName: "",
      lat: null,
      lng: null,
    });
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    if (!districtId) {
      setDraft((prev) => ({
        ...prev,
        districtId: "",
        districtName: "",
        lat: null,
        lng: null,
      }));
      return;
    }
    const district = districts.find(
      (d) => String(d.ilce_id) === String(districtId),
    );
    setDraft((prev) => ({
      ...prev,
      districtId,
      districtName: district ? toDisplayLocationName(district.ilce_adi) : "",
      lat: null,
      lng: null,
    }));
  };

  const handleApply = () => {
    if (!canApply) return;
    setSelectedLocation({ ...draft });
    setOpen(false);
    toast.success("Konum güncellendi");
  };

  const handleUseMyLocation = () => {
    if (typeof window === "undefined") return;

    if (!window.isSecureContext) {
      toast.error("Konum için güvenli bağlantı (HTTPS) gerekir.");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const next = {
          cityId: "",
          cityName: "",
          districtId: "",
          districtName: "",
          lat,
          lng,
        };
        setDraft(next);
        setSelectedLocation(next);
        setOpen(false);
        setGeoLoading(false);
        toast.success("Konumunuz kullanılıyor");
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Konum izni reddedildi.");
        } else if (err.code === err.TIMEOUT) {
          toast.error("Konum alınamadı (zaman aşımı).");
        } else {
          toast.error("Konum alınamadı.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const triggerClass =
    variant === "mobile"
      ? "flex w-full h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left text-[15px] font-bold text-slate-900 transition hover:bg-white"
      : "flex h-12 items-center gap-2 rounded-full px-4 text-[15px] font-bold text-slate-900 transition hover:bg-slate-50";

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
          <MapPin className="h-5 w-5 text-[#0057d9]" />
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Konum seç"
          className={
            variant === "mobile"
              ? "mt-2 w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-xl"
              : "absolute right-0 top-[calc(100%+10px)] z-[100] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
          }
        >
          <p className="mb-3 text-sm font-black text-slate-900">Konum seç</p>

          {loadError ? (
            <p className="mb-3 text-xs font-semibold text-rose-600">{loadError}</p>
          ) : null}

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                İl
              </label>
              <select
                value={draft.cityId}
                onChange={handleCityChange}
                disabled={loadingCities}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#0057d9] focus:ring-2 focus:ring-[#0057d9]/20"
              >
                <option value="">
                  {loadingCities ? "Yükleniyor…" : "İl seçin"}
                </option>
                {cities.map((city) => (
                  <option key={city.sehir_id} value={city.sehir_id}>
                    {toDisplayLocationName(city.sehir_adi)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                İlçe <span className="font-semibold normal-case text-slate-400">(isteğe bağlı)</span>
              </label>
              <select
                value={draft.districtId}
                onChange={handleDistrictChange}
                disabled={!draft.cityId || loadingDistricts}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#0057d9] focus:ring-2 focus:ring-[#0057d9]/20 disabled:opacity-50"
              >
                <option value="">
                  {!draft.cityId
                    ? "Önce il seçin"
                    : loadingDistricts
                      ? "Yükleniyor…"
                      : "Tüm il (ilçe seçmeden uygula)"}
                </option>
                {districts.map((d) => (
                  <option key={d.ilce_id} value={d.ilce_id}>
                    {toDisplayLocationName(d.ilce_adi)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={geoLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 text-[#0057d9]" />
              )}
              Konumumu Kullan
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!canApply}
              className="w-full rounded-xl bg-[#0057d9] py-2.5 text-sm font-black text-white transition hover:bg-[#0046b0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Uygula
            </button>
          </div>
        </div>
      )}
    </div>
  );
}