import { Loader } from "@googlemaps/js-api-loader";

let loader = null;

export const getGoogleMapsLoader = () => {
    if (!loader) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey || apiKey === "your-google-maps-api-key") {
            console.warn("Google Maps API key is missing or invalid.");
        }

        loader = new Loader({
            apiKey: apiKey,
            version: "weekly",
            libraries: ["places"]
        });
    }
    return loader;
};
