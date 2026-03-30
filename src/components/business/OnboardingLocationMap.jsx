"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Crosshair, Locate, Trash2 } from "lucide-react";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false },
);

import { useMap, useMapEvents } from "react-leaflet";

const TURKEY_CENTER = { lat: 39.0, lng: 35.0 };
const DEFAULT_ZOOM_WIDE = 6;
const DEFAULT_ZOOM_PIN = 15;

function ViewSync({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center.lat, center.lng, zoom, map]);
  return null;
}

function MapClickSelect({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function PinMarker({ position }) {
  const [icon, setIcon] = useState(null);
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled) return;
      setIcon(
        L.default.divIcon({
          className: "",
          html: `<div style="width:28px;height:28px;background:#004aad;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,.28)"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);
  if (!icon) return null;
  return (
    <Marker position={[position.lat, position.lng]} icon={icon} />
  );
}

/**
 * @param {number | null | undefined} latitude
 * @param {number | null | undefined} longitude
 * @param {(lat: number | null, lng: number | null) => void} onChange
 */
export default function OnboardingLocationMap({
  latitude,
  longitude,
  onChange,
}) {
  const hasPosition =
    latitude != null &&
    longitude != null &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  const center = hasPosition
    ? { lat: Number(latitude), lng: Number(longitude) }
    : TURKEY_CENTER;
  const zoom = hasPosition ? DEFAULT_ZOOM_PIN : DEFAULT_ZOOM_WIDE;

  const mapId = useMemo(
    () => `onboarding-loc-${Math.random().toString(36).slice(2, 11)}`,
    [],
  );

  const handleMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Tarayıcı konum erişimini desteklemiyor.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        toast.success("Konum alındı.");
      },
      () => {
        toast.error(
          "Konum alınamadı. İzin verdiğinizden emin olun veya haritaya tıklayın.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  };

  const handleClear = () => {
    onChange(null, null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleMyLocation}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <Locate className="h-4 w-4 text-[#004aad]" />
          Konumumu kullan
        </button>
        {hasPosition ? (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-rose-700 shadow-sm transition hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
            Konumu kaldır
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-inner">
        <div className="relative h-[min(320px,55vh)] w-full min-h-[240px] bg-gray-100">
          <MapContainer
            key={mapId}
            center={[center.lat, center.lng]}
            zoom={zoom}
            scrollWheelZoom
            className="h-full w-full z-0 [&_.leaflet-control-attribution]:text-[10px]"
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ViewSync center={center} zoom={zoom} />
            <MapClickSelect onSelect={(lat, lng) => onChange(lat, lng)} />
            {hasPosition ? (
              <PinMarker position={{ lat: Number(latitude), lng: Number(longitude) }} />
            ) : null}
          </MapContainer>

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[400] flex items-start gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs text-gray-600 shadow-md backdrop-blur-sm">
            <Crosshair className="mt-0.5 h-4 w-4 shrink-0 text-[#004aad]" />
            <span>
              Haritada işletmenizin tam yerine <strong>tıklayın</strong>; mavi
              işaret güncellenir.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>
          Enlem:{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800">
            {hasPosition ? Number(latitude).toFixed(6) : "—"}
          </code>
        </span>
        <span>
          Boylam:{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-800">
            {hasPosition ? Number(longitude).toFixed(6) : "—"}
          </code>
        </span>
      </div>
    </div>
  );
}
