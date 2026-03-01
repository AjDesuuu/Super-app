/**
 * POI (Point of Interest) Service
 * Fetches nearby establishments using OpenStreetMap's Overpass API
 */

export interface POI {
    id: number;
    name: string;
    type: "cafe" | "pharmacy" | "convenience" | "fast_food" | "restaurant";
    lat: number;
    lng: number;
    distance?: number;
}

export interface POICategory {
    label: string;
    icon: string;
    amenity: string;
    shop?: string;
}

export const POI_CATEGORIES: Record<string, POICategory> = {
    cafe: {
        label: "Coffee Shops",
        icon: "☕",
        amenity: "cafe",
    },
    pharmacy: {
        label: "Pharmacies",
        icon: "💊",
        amenity: "pharmacy",
    },
    convenience: {
        label: "Convenience Stores",
        icon: "🏪",
        shop: "convenience",
        amenity: "",
    },
    fast_food: {
        label: "Food Stalls",
        icon: "🍔",
        amenity: "fast_food",
    },
    restaurant: {
        label: "Restaurants",
        icon: "🍽️",
        amenity: "restaurant",
    },
};

/**
 * Calculates the distance between two coordinates using the Haversine formula
 */
function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Fetches nearby POIs using Overpass API
 * @param lat Latitude
 * @param lng Longitude
 * @param radius Search radius in meters (default: 500m)
 * @returns Array of POIs
 */
export async function findNearbyPOIs(
    lat: number,
    lng: number,
    radius: number = 500,
    maxRetries: number = 3
): Promise<POI[]> {
    // Build Overpass query for multiple amenity types
    const query = `
        [out:json][timeout:25];
        (
            node["amenity"="cafe"](around:${radius},${lat},${lng});
            node["amenity"="pharmacy"](around:${radius},${lat},${lng});
            node["shop"="convenience"](around:${radius},${lat},${lng});
            node["amenity"="fast_food"](around:${radius},${lat},${lng});
            node["amenity"="restaurant"](around:${radius},${lat},${lng});
        );
        out body;
    `;

    let lastError: Error | null = null;

    // Retry loop
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(
                "https://overpass-api.de/api/interpreter",
                {
                    method: "POST",
                    body: query,
                }
            );

            // Check for 5XX server errors
            if (response.status >= 500 && response.status < 600) {
                const errorMsg = `Server error (${response.status}) from Overpass API`;
                console.warn(
                    `${errorMsg} - Attempt ${attempt + 1}/${maxRetries + 1}`
                );
                lastError = new Error(errorMsg);

                // Wait before retrying (exponential backoff: 1s, 2s, 4s)
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }
                // If last attempt, throw the error
                throw lastError;
            }

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch POIs from Overpass API (${response.status})`
                );
            }

            const data = await response.json();

            // Process and map the results
            const pois: POI[] = data.elements.map((element: any) => {
                // Determine type based on tags
                let type: POI["type"] = "fast_food";
                if (element.tags.amenity === "cafe") type = "cafe";
                else if (element.tags.amenity === "pharmacy") type = "pharmacy";
                else if (element.tags.shop === "convenience")
                    type = "convenience";
                else if (element.tags.amenity === "fast_food")
                    type = "fast_food";
                else if (element.tags.amenity === "restaurant")
                    type = "restaurant";

                // Calculate distance from search center
                const distance = calculateDistance(
                    lat,
                    lng,
                    element.lat,
                    element.lon
                );

                return {
                    id: element.id,
                    name:
                        element.tags.name ||
                        `Unnamed ${POI_CATEGORIES[type].label}`,
                    type,
                    lat: element.lat,
                    lng: element.lon,
                    distance: Math.round(distance * 1000), // Convert to meters
                };
            });

            // Sort by distance
            return pois.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        } catch (error) {
            // If this is the last retry or not a fetch error, store it
            if (attempt === maxRetries) {
                console.error("Error fetching POIs after retries:", error);
                return [];
            }
            // Otherwise, retry on next iteration
            lastError = error as Error;
            console.warn(
                `Fetch error - Attempt ${attempt + 1}/${maxRetries + 1}:`,
                error
            );

            // Wait before retrying
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    // Should never reach here, but just in case
    console.error("Error fetching POIs:", lastError);
    return [];
}

/**
 * Groups POIs by type
 */
export function groupPOIsByType(pois: POI[]): Record<string, POI[]> {
    return pois.reduce((acc, poi) => {
        if (!acc[poi.type]) {
            acc[poi.type] = [];
        }
        acc[poi.type].push(poi);
        return acc;
    }, {} as Record<string, POI[]>);
}
