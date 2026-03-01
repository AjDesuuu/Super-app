# Route Caching System

## Overview

The Route Caching System provides offline route access by storing successful API responses in browser localStorage. Routes are cached per start/destination coordinate pair and automatically used as fallback when the OSRM API is unavailable.

## Features

-   **Automatic Caching**: Successfully fetched routes are automatically saved to localStorage
-   **Intelligent Fallback**: When API calls fail, the system attempts to load cached routes before falling back to straight-line rendering
-   **Coordinate-Based Keys**: Routes are keyed by rounded coordinates (4 decimal places ≈ 11-meter precision)
-   **Metadata Tracking**: Each cached route includes timestamp and version information
-   **Cache Management**: Utility functions for statistics and cache clearing

## Usage

### Automatic Operation

The system works automatically in the Map component:

1. **Route Fetched Successfully** → Saved to cache
2. **API Call Fails** → Load from cache if available
3. **No Cache Available** → Fall back to straight line

### Manual Cache Operations

```typescript
import {
    saveRoute,
    loadRoute,
    hasCachedRoute,
    clearAllRoutes,
    getCacheStats,
} from "@/lib/routeCache";

// Check if route is cached
const isCached = hasCachedRoute(startCoords, endCoords);

// Manually load cached route
const cachedRoute = loadRoute(startCoords, endCoords);

// Get cache statistics
const stats = getCacheStats();
console.log(`Cached routes: ${stats.totalRoutes}`);
console.log(`Total size: ${stats.totalSize} bytes`);
console.log(`Oldest: ${stats.oldestRoute}`);
console.log(`Newest: ${stats.newestRoute}`);

// Clear all cached routes
clearAllRoutes();
```

## Cache Structure

### LocalStorage Key Format

```
route_{lat1},{lng1}_to_{lat2},{lng2}
```

Example: `route_14.5866,121.1756_to_14.6522,121.0498`

### Cache Entry Format

```typescript
{
    routeData: {
        coordinates: [[lat, lng], ...],
        steps: [...],
        distance: number,
        duration: number
    },
    timestamp: "2026-01-13T12:34:56.789Z",
    version: "1.0"
}
```

## Benefits

1. **Offline Access**: Previously fetched routes available even without internet
2. **Reduced API Calls**: Fallback mechanism reduces dependency on external API
3. **Faster Loading**: Cached routes load instantly from localStorage
4. **Better UX**: Users see routes instead of straight lines during API outages

## Limitations

-   **Browser Storage Limits**: LocalStorage typically limited to 5-10MB per domain
-   **No Expiration**: Cached routes don't automatically expire (manual clearing required)
-   **Coordinate Rounding**: Routes cached at ~11-meter precision granularity
-   **Browser-Specific**: Cache is not shared across browsers or devices

## Future Enhancements

-   Cache expiration/TTL
-   IndexedDB for larger storage capacity
-   Compression for efficient storage
-   Background cache warming for common routes
-   Cloud sync across devices
