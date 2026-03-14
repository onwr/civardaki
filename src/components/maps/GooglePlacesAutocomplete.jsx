"use client";

import { useEffect, useRef, useState } from "react";
import { getGoogleMapsLoader } from "@/lib/google-maps-loader";
import { Store, MapPin, Loader2 } from "lucide-react";
import { normalizeLocation } from "@/lib/formatters";

export default function GooglePlacesAutocomplete({ onPlaceSelected, defaultValue = "" }) {
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const [inputValue, setInputValue] = useState(defaultValue);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loader = getGoogleMapsLoader();
        loader.load().then(() => {
            setIsLoaded(true);
            if (inputRef.current) {
                autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                    types: ["establishment", "geocode"],
                    componentRestrictions: { country: "tr" },
                    fields: ["address_components", "geometry", "name", "formatted_address"]
                });

                autocompleteRef.current.addListener("place_changed", () => {
                    const place = autocompleteRef.current.getPlace();
                    if (!place.geometry) return;

                    const addressComponents = place.address_components || [];
                    let city = "";
                    let district = "";
                    let address = place.formatted_address || "";

                    // Extract city and district from address components
                    addressComponents.forEach(component => {
                        const types = component.types;
                        if (types.includes("administrative_area_level_1")) {
                            city = component.long_name;
                        }
                        if (types.includes("administrative_area_level_2") || types.includes("sublocality_level_1")) {
                            district = component.long_name;
                        }
                    });

                    setInputValue(place.name || "");

                    onPlaceSelected({
                        businessName: place.name || "",
                        address: address,
                        city: normalizeLocation(city),
                        district: normalizeLocation(district),
                        latitude: place.geometry.location.lat(),
                        longitude: place.geometry.location.lng()
                    });
                });
            }
        });

        return () => {
            if (window.google && window.google.maps && window.google.maps.event) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [onPlaceSelected]);

    return (
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10">
                {isLoaded ? <Store className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
            </div>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="İşletme adını veya adresini girin..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 ring-1 ring-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 font-semibold transition-all duration-200 bg-white/50 hover:bg-white focus:bg-white outline-none"
            />
            <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2">
                Google Haritalar Desteğiyle Otomatik Doldur
            </p>
        </div>
    );
}
