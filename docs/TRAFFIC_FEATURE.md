# NexStation Traffic Management System

## Overview

The NexStation Traffic Management System provides real-time simulation of passenger density and traffic conditions across strategic locations in Metro Manila and surrounding regions. The system dynamically adjusts route planning by calculating travel duration multipliers based on current traffic levels, offering users accurate journey time estimates.

## Architecture

### Core Modules

#### 1. TrafficManager (`src/lib/trafficManager.ts`)

**Purpose**: Centralized traffic data management and route impact calculation

The `TrafficManager` implements the singleton pattern to maintain a consistent traffic state across the application. It monitors 21 strategic locations and provides APIs for querying traffic conditions and calculating route impacts.

**Key Responsibilities:**

-   Initialize and maintain passenger density data for monitored areas
-   Calculate traffic impact multipliers for routes (1.0x to 2.5x)
-   Simulate realistic traffic pattern changes
-   Provide traffic statistics and analytics

**Traffic Level Classifications:**

-   **Low** (0-24% density): 1.0-1.2x duration multiplier
-   **Moderate** (25-49% density): 1.2-1.5x duration multiplier
-   **High** (50-74% density): 1.5-2.0x duration multiplier
-   **Severe** (75-100% density): 2.0-2.5x duration multiplier

**Update Frequency**: Every 2 minutes with ±5-15% density variations

#### 2. TrafficUtils (`src/lib/trafficUtils.ts`)

**Purpose**: Centralized traffic visualization and utility functions

Provides consistent color schemes, formatting utilities, and helper functions for traffic-related UI operations across the application.

**Key Functions:**

| Function                                     | Purpose                                 | Returns       |
| -------------------------------------------- | --------------------------------------- | ------------- |
| `getTrafficLevelFromDensity(density)`        | Categorizes density into traffic levels | TrafficLevel  |
| `getTrafficHexColor(level)`                  | Returns hex color for map rendering     | string        |
| `getTrafficColors(level)`                    | Complete color configuration            | TrafficColors |
| `getTrafficForCoordinate(coords)`            | Traffic info for specific location      | TrafficColors |
| `calculateRouteTrafficColors(coords, steps)` | Color array for route segments          | string[]      |
| `formatTrafficLevel(level)`                  | Formats level for UI display            | string        |

**Color Constants:**

```typescript
LOW: "#22c55e"; // Green
MODERATE: "#eab308"; // Yellow
HIGH: "#f97316"; // Orange
SEVERE: "#ef4444"; // Red
DEFAULT: "#3b82f6"; // Blue (fallback)
```

### Monitored Areas (21 Locations)

**Metro Manila Major Thoroughfares:**

-   EDSA North (Cubao-Quezon Ave)
-   EDSA Central (Ortigas-Shaw)
-   EDSA South (Magallanes-Taft)
-   C5 North (Katipunan-Libis)
-   C5 South (BGC-Makati)
-   Commonwealth Avenue
-   Quezon Avenue
-   España Boulevard
-   Taft Avenue
-   Roxas Boulevard

**Rizal Province:**

-   Marcos Highway
-   Antipolo City Center
-   Cainta Junction
-   Marikina City Center

**Cavite:**

-   Dasmariñas Center
-   Aguinaldo Highway

**Major Transit Hubs:**

-   Cubao Bus Terminal Area
-   PITX (Parañaque Integrated Terminal Exchange)
-   LRT Recto Station Area
-   LRT Katipunan Station Area
-   MRT Ayala Station Area

## Integration Points

### Route Calculation (Map.tsx)

The traffic system integrates with OSRM routing in the Map component:

1. **Route Fetching**: Standard OSRM route calculation
2. **Traffic Analysis**: TrafficManager identifies areas within 2km of route
3. **Duration Adjustment**: Applies traffic multiplier to base duration
4. **Segment Coloring**: Each route segment colored by traffic level

### User Interface

#### PassengerDashboard

-   Displays traffic-colored route preview
-   Updates colors when route data changes
-   Uses `calculateRouteTrafficColors()` for consistent visualization

#### PassengerRouteView

-   Shows detailed step-by-step navigation
-   Colored card border indicates traffic level
-   Traffic header prominently displays current conditions
-   Route map segments color-coded by traffic

**Visual Elements:**

-   **Card Border**: 2px colored border matching traffic level
-   **Traffic Header**: Dedicated banner with icon and level text
-   **Map Segments**: Individual route segments in traffic colors
-   **Completed Segments**: Gray overlay for traveled portions

## API Reference

### TrafficManager API

```typescript
// Get singleton instance
const manager = TrafficManager.getInstance();

// Query specific area
const traffic: AreaTraffic | undefined = manager.getAreaTraffic("edsa-north");

// Find nearest area to coordinates
const nearest: AreaTraffic | null = manager.getNearestAreaTraffic([
    14.5995, 120.9842,
]);

// Calculate route impact
const impact: RouteTrafficImpact = manager.calculateRouteTrafficImpact(
    startCoords,
    endCoords,
    baseDistance,
    baseDuration
);

// Get all traffic data
const allTraffic: AreaTraffic[] = manager.getAllTrafficData();

// Get statistics
const stats = manager.getTrafficStatistics();
// Returns: { totalAreas, averageDensity, lowTrafficAreas, moderateTrafficAreas, highTrafficAreas, severeTrafficAreas }

// Manual operations
manager.updateAreaDensity("edsa-central", 85);
manager.simulateTrafficUpdate();
manager.startAutoUpdate(120000); // 2 minutes
manager.stopAutoUpdate();
```

### TrafficUtils API

```typescript
import {
    getTrafficLevelFromDensity,
    getTrafficHexColor,
    getTrafficColors,
    getTrafficForCoordinate,
    calculateRouteTrafficColors,
    formatTrafficLevel,
} from "@/lib/trafficUtils";

// Convert density to level
const level: TrafficLevel = getTrafficLevelFromDensity(65); // 'high'

// Get hex color
const hex: string = getTrafficHexColor("moderate"); // '#eab308'

// Get complete colors
const colors: TrafficColors = getTrafficColors("high");
// { level: 'high', hex: '#f97316', textColor: 'text-orange-600', bgColor: '...', borderColor: '...' }

// Get traffic for location
const traffic: TrafficColors = getTrafficForCoordinate([14.5995, 120.9842]);

// Calculate route colors
const colors: string[] = calculateRouteTrafficColors(coordinates, stepCount);

// Format for display
const text: string = formatTrafficLevel("severe"); // 'Severe Traffic'
```

## Implementation Example

### Basic Usage

```typescript
import { TrafficManager } from '@/lib/trafficManager';
import { calculateRouteTrafficColors, getTrafficForCoordinate } from '@/lib/trafficUtils';

// Initialize (done automatically in App.tsx)
const trafficManager = TrafficManager.getInstance();
trafficManager.startAutoUpdate(120000);

// Get traffic for coordinates
const traffic = getTrafficForCoordinate([14.5995, 120.9842]);
console.log(`Traffic: ${traffic.level} (${traffic.hex})`);

// Calculate colors for route visualization
const routeColors = calculateRouteTrafficColors(routeCoordinates, 5);
// Pass to Map component
<Map trafficColors={routeColors} ... />
```

### Component Integration

```typescript
// In PassengerRouteView or PassengerDashboard
const trafficColors = useMemo(() => {
    if (!routeData?.coordinates || !routeData?.steps) {
        return [];
    }
    return calculateRouteTrafficColors(
        routeData.coordinates,
        routeData.steps.length
    );
}, [routeData]);

// Use in Map
<Map
    startCoords={startLocation?.coordinates}
    endCoords={endLocation?.coordinates}
    routeSteps={consolidatedSteps}
    trafficColors={trafficColors}
/>;
```

## Configuration

### Update Interval

Default: 2 minutes (120000ms)

Modify in `App.tsx`:

```typescript
trafficManager.startAutoUpdate(120000); // Adjust milliseconds
```

### Traffic Thresholds

Modify in `trafficUtils.ts`:

```typescript
export function getTrafficLevelFromDensity(density: number): TrafficLevel {
    if (density < 25) return "low"; // Adjust thresholds
    if (density < 50) return "moderate";
    if (density < 75) return "high";
    return "severe";
}
```

### Duration Multipliers

Modify in `trafficManager.ts`:

```typescript
// In calculateRouteTrafficImpact()
trafficMultiplier = 1.0 + (avgDensity / 100) * 1.5; // Adjust multiplier calculation
```

## Testing

### Manual Testing

1. Start the application
2. Navigate to Passenger Dashboard
3. Select origin and destination
4. Observe color-coded route on map
5. Navigate to Route View
6. Step through route to see traffic indicators
7. Wait 2 minutes for automatic update
8. Verify traffic colors may change

### Console Monitoring

```typescript
// View traffic statistics
const manager = TrafficManager.getInstance();
console.log(manager.getTrafficStatistics());

// Monitor specific area
setInterval(() => {
    const traffic = manager.getAreaTraffic("edsa-north");
    console.log(
        `EDSA North: ${traffic.passengerDensity}% (${traffic.trafficLevel})`
    );
}, 5000);
```

## Performance Considerations

-   **Memory**: ~21 small objects (~2KB total)
-   **Computation**: O(n) for route color calculation, O(1) for area lookup
-   **Update Overhead**: Minimal (~1ms per update cycle)
-   **Distance Calculations**: Haversine formula optimized for accuracy

## Future Enhancements

1. **Real-Time Data Integration**

    - Connect to actual traffic APIs (Google Maps, Waze, TomTom)
    - Replace simulation with live data feeds

2. **Machine Learning**

    - Predict traffic patterns based on time-of-day
    - Learn from historical data

3. **Event-Based Updates**

    - React to accidents, weather, special events
    - Push notifications for route changes

4. **Alternative Routes**

    - Suggest multiple route options
    - Compare traffic impacts

5. **Crowd-Sourced Data**

    - Allow users to report traffic conditions
    - Validate and integrate user reports

6. **Advanced Visualization**
    - Heat maps for traffic density
    - Animated traffic flow
    - 3D route visualization

## Troubleshooting

### Traffic Colors Not Displaying

-   Verify `trafficColors` prop is passed to Map component
-   Check that `routeData` contains valid coordinates
-   Ensure TrafficManager is initialized in App.tsx

### Traffic Not Updating

-   Confirm `startAutoUpdate()` is called
-   Check browser console for error messages
-   Verify update interval is set correctly

### Incorrect Traffic Levels

-   Review coordinate-to-area mapping logic
-   Verify monitored area coordinates are accurate
-   Check density calculation in TrafficManager

## License & Credits

NexStation Traffic Management System  
© 2026 NexStation Development Team  
All rights reserved.
