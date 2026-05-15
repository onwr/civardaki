"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "civardaki_selected_location";

export const DEFAULT_LOCATION = {
  cityId: "34",
  cityName: "İstanbul",
  districtId: "1421",
  districtName: "Kadıköy",
  lat: null,
  lng: null,
};

const LocationContext = createContext(null);

function parseStoredLocation(raw) {
  if (!raw || typeof raw !== "object") return null;
  const cityName = String(raw.cityName || "").trim();
  const districtName = String(raw.districtName || "").trim();
  const lat = raw.lat != null && raw.lat !== "" ? Number(raw.lat) : null;
  const lng = raw.lng != null && raw.lng !== "" ? Number(raw.lng) : null;
  const hasCoords =
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

  if (!cityName && !districtName && !hasCoords) return null;

  return {
    cityId: raw.cityId ? String(raw.cityId) : "",
    cityName,
    districtId: raw.districtId ? String(raw.districtId) : "",
    districtName,
    lat: hasCoords ? lat : null,
    lng: hasCoords ? lng : null,
  };
}

function persistLocation(location) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch {
    /* ignore quota / private mode */
  }
}

export function LocationProvider({ children }) {
  const [selectedLocation, setSelectedLocationState] = useState(DEFAULT_LOCATION);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = parseStoredLocation(JSON.parse(stored));
        if (parsed) setSelectedLocationState(parsed);
      }
    } catch {
      /* invalid JSON */
    }
    setIsHydrated(true);
  }, []);

  const setSelectedLocation = useCallback((next) => {
    setSelectedLocationState((prev) => {
      const merged =
        typeof next === "function"
          ? next(prev)
          : { ...prev, ...next };
      persistLocation(merged);
      return merged;
    });
  }, []);

  const clearLocation = useCallback(() => {
    setSelectedLocationState(DEFAULT_LOCATION);
    persistLocation(DEFAULT_LOCATION);
  }, []);

  const locationLabel = useMemo(() => {
    const { cityName, districtName, lat, lng } = selectedLocation;
    const hasCoords =
      lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

    if (cityName && districtName) return `${cityName}, ${districtName}`;
    if (cityName) return cityName;
    if (districtName) return districtName;
    if (hasCoords) return "Konumum";
    return "Konum seç";
  }, [selectedLocation]);

  const value = useMemo(
    () => ({
      selectedLocation,
      setSelectedLocation,
      clearLocation,
      locationLabel,
      isHydrated,
    }),
    [selectedLocation, setSelectedLocation, clearLocation, locationLabel, isHydrated],
  );

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return ctx;
}
