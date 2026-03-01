/**
 * Route Cache Utility
 *
 * Manages local storage of route data for offline access and fallback scenarios.
 * Routes are cached per start/destination coordinate pair.
 */

import type { RouteData } from "@/components/Map";

/**
 * Generates a unique cache key for a route based on start and end coordinates
 *
 * @param startCoords - Starting coordinates [lat, lng]
 * @param endCoords - Ending coordinates [lat, lng]
 * @returns Cache key string
 */
function generateRouteKey(
    startCoords: [number, number],
    endCoords: [number, number]
): string {
    // Round coordinates to 4 decimal places (~11 meters precision)
    const start = startCoords.map((c) => c.toFixed(4)).join(",");
    const end = endCoords.map((c) => c.toFixed(4)).join(",");
    return `route_${start}_to_${end}`;
}

/**
 * Saves a route to local storage
 *
 * @param startCoords - Starting coordinates
 * @param endCoords - Ending coordinates
 * @param routeData - Route data to cache
 */
export function saveRoute(
    startCoords: [number, number],
    endCoords: [number, number],
    routeData: RouteData[]
): void {
    try {
        const key = generateRouteKey(startCoords, endCoords);
        const cacheEntry = {
            routeData,
            timestamp: new Date().toISOString(),
            version: "1.0",
        };
        localStorage.setItem(key, JSON.stringify(cacheEntry));
        console.log(`[Route Cache] Saved route: ${key}`);
    } catch (error) {
        console.error("[Route Cache] Failed to save route:", error);
    }
}

/**
 * Loads a cached route from local storage
 *
 * @param startCoords - Starting coordinates
 * @param endCoords - Ending coordinates
 * @returns Cached route data or null if not found
 */
export function loadRoute(
    startCoords: [number, number],
    endCoords: [number, number]
): RouteData[] | null {
    try {
        const key = generateRouteKey(startCoords, endCoords);
        const cached = localStorage.getItem(key);

        if (!cached) {
            console.log(`[Route Cache] No cached route found for: ${key}`);
            return null;
        }

        const cacheEntry = JSON.parse(cached);
        console.log(
            `[Route Cache] Loaded cached route: ${key} (saved: ${cacheEntry.timestamp})`
        );
        return cacheEntry.routeData as RouteData[];
    } catch (error) {
        console.error("[Route Cache] Failed to load route:", error);
        return null;
    }
}

/**
 * Checks if a cached route exists for the given coordinates
 *
 * @param startCoords - Starting coordinates
 * @param endCoords - Ending coordinates
 * @returns True if cached route exists
 */
export function hasCachedRoute(
    startCoords: [number, number],
    endCoords: [number, number]
): boolean {
    const key = generateRouteKey(startCoords, endCoords);
    return localStorage.getItem(key) !== null;
}

/**
 * Clears all cached routes from local storage
 */
export function clearAllRoutes(): void {
    try {
        const keys = Object.keys(localStorage);
        const routeKeys = keys.filter((key) => key.startsWith("route_"));

        routeKeys.forEach((key) => localStorage.removeItem(key));
        console.log(`[Route Cache] Cleared ${routeKeys.length} cached routes`);
    } catch (error) {
        console.error("[Route Cache] Failed to clear routes:", error);
    }
}

/**
 * Gets statistics about cached routes
 *
 * @returns Cache statistics
 */
export function getCacheStats(): {
    totalRoutes: number;
    totalSize: number;
    oldestRoute: string | null;
    newestRoute: string | null;
} {
    try {
        const keys = Object.keys(localStorage);
        const routeKeys = keys.filter((key) => key.startsWith("route_"));

        let totalSize = 0;
        let oldestTimestamp: Date | null = null;
        let newestTimestamp: Date | null = null;

        routeKeys.forEach((key) => {
            const value = localStorage.getItem(key);
            if (value) {
                totalSize += value.length;
                const entry = JSON.parse(value);
                const timestamp = new Date(entry.timestamp);

                if (oldestTimestamp === null) {
                    oldestTimestamp = timestamp;
                } else if (timestamp < oldestTimestamp) {
                    oldestTimestamp = timestamp;
                }

                if (newestTimestamp === null) {
                    newestTimestamp = timestamp;
                } else if (timestamp > newestTimestamp) {
                    newestTimestamp = timestamp;
                }
            }
        });

        const oldestRoute = oldestTimestamp
            ? (oldestTimestamp as Date).toISOString()
            : null;
        const newestRoute = newestTimestamp
            ? (newestTimestamp as Date).toISOString()
            : null;

        return {
            totalRoutes: routeKeys.length,
            totalSize,
            oldestRoute,
            newestRoute,
        };
    } catch (error) {
        console.error("[Route Cache] Failed to get cache stats:", error);
        return {
            totalRoutes: 0,
            totalSize: 0,
            oldestRoute: null,
            newestRoute: null,
        };
    }
}
