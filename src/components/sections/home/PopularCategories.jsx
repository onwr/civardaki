"use client";

import Link from "next/link";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Star, Clock, Phone, Globe, ChevronRight, Navigation, X, MapPin, Locate } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Leaflet Imports (Dynamic import workaround for Next.js SSR)
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import map components with no SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

// Helper component to update map view when center changes
import { useMap } from 'react-leaflet';
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

// User Location Marker Component
const UserLocationMarker = ({ position }) => {
  const [L, setL] = useState(null);

  useEffect(() => {
    import('leaflet').then(mod => setL(mod.default));
  }, []);

  if (!L) return null;

  const userIcon = L.divIcon({
    className: 'bg-transparent border-none',
    iconSize: [24, 24],
    html: `
      <div class="relative flex h-6 w-6">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-6 w-6 bg-[#004aad] border-4 border-white shadow-xl"></span>
      </div>
    `
  });

  return <Marker position={[position.lat, position.lng]} icon={userIcon} />;
}

const MarkersLayer = ({ locations, hoveredId, onHover, onLeave, onSelect }) => {
  const map = useMap();
  const [positions, setPositions] = useState({});
  const [isMapReady, setIsMapReady] = useState(false);

  // Update pixel positions on map move/zoom
  const updatePositions = useCallback(() => {
    if (!map || typeof window === 'undefined' || !window.L) return;

    // Safety check: ensure map has size before projecting
    const size = map.getSize();
    if (size.x === 0 || size.y === 0) return;

    const newPositions = {};
    locations.forEach(loc => {
      try {
        const latLng = new window.L.LatLng(loc.position.lat, loc.position.lng);
        const point = map.latLngToContainerPoint(latLng);
        newPositions[loc.id] = { x: point.x, y: point.y };
      } catch (e) {
        // Sile failure if projection fails
      }
    });
    setPositions(newPositions);
  }, [map, locations]);

  useEffect(() => {
    if (!map) return;

    import('leaflet').then((mod) => {
      window.L = mod.default;

      // Wait for map to be ready
      map.whenReady(() => {
        setIsMapReady(true);
        updatePositions();
      });

      map.on('move', updatePositions);
      map.on('zoom', updatePositions);
      map.on('resize', updatePositions);
      map.on('viewreset', updatePositions);
    });

    return () => {
      map.off('move', updatePositions);
      map.off('zoom', updatePositions);
      map.off('resize', updatePositions);
      map.off('viewreset', updatePositions);
    };
  }, [map, updatePositions]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[400]">
      {locations.map(loc => {
        const pos = positions[loc.id];
        if (!pos) return null;
        const isHovered = hoveredId === loc.id;

        return (
          <div
            key={loc.id}
            className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto"
            style={{ left: pos.x, top: pos.y, zIndex: isHovered ? 100 : 10 }}
            onMouseEnter={() => onHover(loc.id)}
            onMouseLeave={onLeave}
            onClick={() => onSelect(loc)}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`relative bg-white p-1 shadow-2xl shadow-blue-900/40 cursor-pointer overflow-hidden group/card ${isHovered ? 'rounded-2xl' : 'rounded-full border-4 border-white'}`}
              style={{
                width: isHovered ? 280 : 64,
                height: isHovered ? 'auto' : 64
              }}
            >
              {!isHovered && (
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                </div>
              )}

              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col text-left"
                >
                  <div className="h-32 w-full relative rounded-xl overflow-hidden mb-3">
                    <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {loc.rating}
                    </div>
                  </div>

                  <div className="px-2 pb-2">
                    <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">{loc.name}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{loc.type}</span>
                      <span className={`${loc.status === 'Açık' ? 'text-green-600' : 'text-red-500'} font-medium`}>{loc.status}</span>
                    </div>
                    <div className="w-full py-2 bg-blue-50 text-[#004aad] font-bold text-xs rounded-lg text-center group-hover/card:bg-[#004aad] group-hover/card:text-white transition-colors">
                      Detayları Gör
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default function NearbyMap() {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [hoveredBusinessId, setHoveredBusinessId] = useState(null);
  // Default center (Sisli) - used as fallback
  const [center, setCenter] = useState({ lat: 41.0522, lng: 28.9850 });
  const [locationPermission, setLocationPermission] = useState('prompt'); // prompt, granted, denied
  const [loadingLocation, setLoadingLocation] = useState(false);

  const hoverTimeout = useRef(null);

  useEffect(() => {
    // Check if permission was already granted previously
    const savedPermission = localStorage.getItem('locationGranted');
    if (savedPermission === 'true') {
      setLocationPermission('granted');
      // Optionally auto-fetch location if already granted to update center
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ lat: latitude, lng: longitude });
        },
        () => { } // Ignore errors silently on auto-fetch
      );
    }
  }, []);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum hizmetlerini desteklemiyor.");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCenter({ lat: latitude, lng: longitude });
        setLocationPermission('granted');
        localStorage.setItem('locationGranted', 'true'); // Save permission
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Konum hatası:", error);
        setLocationPermission('denied');
        setLoadingLocation(false);
      }
    );
  };

  const handleMouseEnter = (id) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setHoveredBusinessId(id);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredBusinessId(null);
  };

  const locations = useMemo(() => [
    {
      id: 1,
      slug: "kahve-dunyasi-sisli",
      name: "Kahve Dünyası",
      type: "Cafe",
      rating: 4.5,
      reviews: 120,
      status: "Açık",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80",
      position: { lat: 41.0535, lng: 28.9860 }
    },
    {
      id: 2,
      slug: "migros-jet-sisli",
      name: "Migros Jet",
      type: "Market",
      rating: 4.2,
      reviews: 85,
      status: "Açık",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80",
      position: { lat: 41.0515, lng: 28.9820 }
    },
    {
      id: 3,
      slug: "fitplus-gym-sisli",
      name: "FitPlus Gym",
      type: "Spor Salonu",
      rating: 4.8,
      reviews: 240,
      status: "Kapalı",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80",
      position: { lat: 41.0545, lng: 28.9840 }
    },
  ], []);

  // Generate a stable ID for the map container to avoid reuse errors in dev
  const mapId = useMemo(() => `map-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <section className="relative -mt-24 pb-10  z-20 font-inter">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 lg:p-12 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl -ml-20 -mb-20 opacity-50"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="text-center mb-10">
              <span className="text-[#004aad] font-bold tracking-wider text-sm uppercase bg-blue-50 px-3 py-1 rounded-full">Konum</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-4 mb-4">Yakınınızdaki İşletmeler</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                Bölgenizdeki popüler işletmeleri harita üzerinde keşfedin.
              </p>
            </div>

            {/* Interactive Map Container */}
            <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 relative group bg-slate-100">

              {/* Location Permission Overlay */}
              {locationPermission !== 'granted' && (
                <div className="absolute inset-0 z-[1000] bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center transition-all duration-500">
                  <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-auto relative overflow-hidden border border-white/50 ring-1 ring-gray-100">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#004aad] animate-pulse">
                      <Locate className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Yakınındakileri Keşfet</h3>
                    <p className="text-gray-500 mb-8 font-medium">
                      En iyi deneyim için konum izni vererek haritayı etkinleştirin.
                    </p>
                    <button
                      onClick={handleRequestLocation}
                      disabled={loadingLocation}
                      className="w-full py-4 bg-[#004aad] hover:bg-[#003d8f] text-white font-bold rounded-xl transition-all shadow-xl shadow-[#004aad]/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {loadingLocation ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Navigation className="w-5 h-5" />
                          Konumu Etkinleştir
                        </>
                      )}
                    </button>
                    {locationPermission === 'denied' && (
                      <p className="mt-4 text-xs text-red-500 font-medium">
                        Konum engellendi. Tarayıcı ayarlarını kontrol edin.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <MapContainer
                key={mapId}
                center={[center.lat, center.lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                className={locationPermission !== 'granted' ? 'filter blur-[1px] scale-105 pointer-events-none' : 'transition-all duration-1000 filter-none'}
              >
                <MapController center={center} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <UserLocationMarker position={center} />
                <MarkersLayer
                  locations={locations}
                  hoveredId={hoveredBusinessId}
                  onHover={handleMouseEnter}
                  onLeave={handleMouseLeave}
                  onSelect={setSelectedBusiness}
                />
              </MapContainer>
            </div>

            {/* Business Details Modal */}
            <AnimatePresence>
              {selectedBusiness && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedBusiness(null)}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
                  >
                    <button onClick={() => setSelectedBusiness(null)} className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>

                    <div className="h-48 relative">
                      <img src={selectedBusiness.image} alt={selectedBusiness.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-6 text-white">
                        <span className="bg-[#004aad] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mb-1 inline-block">{selectedBusiness.type}</span>
                        <h3 className="text-2xl font-bold">{selectedBusiness.name}</h3>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div className="bg-yellow-50 p-1.5 rounded-lg">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-none">{selectedBusiness.rating}</p>
                            <p className="text-xs text-gray-500">{selectedBusiness.reviews} Değerlendirme</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 ${selectedBusiness.status === 'Açık' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          <Clock className="w-4 h-4" />
                          {selectedBusiness.status}
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-blue-500 shadow-sm border border-gray-100">
                            <Phone className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">+90 (212) 555 0123</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-blue-500 shadow-sm border border-gray-100">
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">www.isletme.com</span>
                        </div>
                      </div>

                      <Link href={`/isletme/${selectedBusiness.slug}`} className="w-full py-4 bg-[#004aad] rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:bg-[#003d8f] transition-colors shadow-lg shadow-[#004aad]/20">
                        İşletme Profiline Git <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
