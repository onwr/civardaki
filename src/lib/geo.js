/**
 * Utility for geographic calculations.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the great-circle distance between two points on a sphere 
 * using the Haversine formula.
 * 
 * @param {number} lat1 Latitude of first point
 * @param {number} lon1 Longitude of first point
 * @param {number} lat2 Latitude of second point
 * @param {number} lon2 Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS_KM * c;

    return distance;
}

/**
 * Formats distance for display.
 * 
 * @param {number} km Distance in kilometers
 * @returns {string} Formatted string (e.g. "1.2 km" or "450 m")
 */
export function formatDistance(km) {
    if (km === null || km === undefined) return "";

    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }

    return `${km.toFixed(1)} km`;
}
