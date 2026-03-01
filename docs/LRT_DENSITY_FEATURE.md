# LRT/MRT Passenger Density Feature

## Overview

This feature replaces traditional traffic levels for LRT/MRT transportation with passenger density measurements, providing users with more relevant information about whether they need to wait for the current train or the next one.

## Implementation Details

### 🏗️ Core Components

#### 1. RouteStep Interface Enhancement

**File:** `src/components/Map.tsx`

-   Added `previousStationDensity?: number` - Density at previous station (0-100)
-   Added `currentStationDensity?: number` - Density at current station (0-100)

#### 2. Traffic Manager Enhancement

**File:** `src/lib/trafficManager.ts`

-   **New Function:** `generateStationDensity(stationName: string, isCurrentStation: boolean)`
-   Generates realistic density values (0-100) based on:
    -   Station popularity (high-traffic stations like Ayala, Cubao get higher base values)
    -   Time of day (rush hours 7-9 AM, 5-7 PM get 1.3x multiplier)
    -   Current vs Previous station (current stations slightly more crowded)
    -   Random variation for realism

#### 3. Density Analysis Utilities

**File:** `src/lib/trafficUtils.ts`

-   **New Types:**
    -   `DensityLevel`: "low" | "moderate" | "high"
    -   `DensityWarning`: Contains level, message, waitForNext flag, and color
-   **New Functions:**
    -   `getDensityLevel(density: number)`: Classifies density into levels
    -   `analyzeLRTDensity(previousDensity: number, currentDensity: number)`: Analyzes both densities and provides user recommendations

#### 4. Route Processing Enhancement

**File:** `src/components/Map.tsx`

-   Routes are enriched with density information during processing
-   LRT/MRT steps get density values from Traffic Manager
-   Density data flows through route caching system

#### 5. UI Display Integration

**File:** `src/components/passenger/PassengerRouteView.tsx`

-   Step consolidation preserves density information from original steps
-   UI displays density warnings instead of traffic levels for LRT/MRT
-   **getDensityWarning()** function provides contextual messaging

### 🎯 Density Classification Logic

#### Density Levels:

-   **Low (0-39%)**: "Low passenger density - comfortable boarding"
-   **Moderate (40-69%)**: "Moderate passenger density" / "Consider waiting for next train"
-   **High (70-100%)**: "High passenger density - expect crowds" / "Very crowded - wait for the train after next"

#### Wait Recommendation:

-   **Wait for train after next** when both previous and current station densities > 70%
-   **Regular boarding** for all other scenarios

### 🚆 Station-Specific Behavior

#### High-Traffic Stations (Base Factor 0.7-0.9):

-   Ayala, Makati, Cubao, Shaw, Ortigas, Recto, Carriedo, Divisoria, Katipunan

#### Medium-Traffic Stations (Base Factor 0.5-0.65):

-   Santolan, Marikina, Pasig, Manila, Ermita, Malate

#### Time-of-Day Multipliers:

-   **Rush Hours (7-9 AM, 5-7 PM)**: 1.3x density
-   **Mid-day (10 AM-4 PM)**: 0.8x density
-   **Evening (8-11 PM)**: 0.9x density
-   **Night/Early Morning**: 0.4x density

### 🔄 Integration Points

#### Route Calculation Flow:

1. **Map Component** generates routes with OSRM API
2. **Traffic Manager** enriches LRT/MRT steps with density values
3. **Route Caching** preserves density information
4. **PassengerRouteView** consolidates steps while maintaining density data
5. **UI Components** display density warnings instead of traffic levels

#### Data Flow:

```
OSRM Route → Map Component → Traffic Manager → Route Cache →
PassengerRouteView → Step Consolidation → UI Display
```

### 📱 User Experience

#### Before (Traffic Levels):

-   "Traffic: High" - Generic and not train-specific
-   No guidance on boarding strategy
-   Same display across all UI components

#### After (Passenger Density):

-   **Thin Card Overlay:** "🚆 High passenger density - expect crowds"
-   **Main Card Display:** "🚆 High Density" badge instead of traffic badge
-   **Expandable Card Header:** "🚆 High Density" with colored background
-   **Step Details:** "🚆 Very crowded - wait for the train after next"
-   **Smart Recommendations:** "💡 Recommendation: Wait for the train after next"
-   Clear boarding recommendations across all UI components

### 🧪 Testing Scenarios

#### Test in the App:

1. Select routes with LRT/MRT segments (e.g., Quezon City to Makati)
2. Observe step-by-step navigation
3. Look for density warnings on LRT/MRT steps
4. Verify different messages appear based on generated density levels

#### Expected Behaviors:

-   LRT/MRT steps show passenger density instead of traffic levels
-   High-traffic stations during rush hours show higher density warnings
-   Users get clear guidance on whether to wait for next train

### 🔧 Configuration

#### Adjustable Parameters:

-   **Station Base Factors** in `generateStationDensity()`
-   **Time Multipliers** for different hours
-   **Density Thresholds** in `getDensityLevel()`
-   **Wait Recommendation Logic** in `analyzeLRTDensity()`

## Benefits

✅ **Contextually Relevant**: Shows passenger density instead of road traffic  
✅ **Actionable Insights**: Clear boarding recommendations  
✅ **Real-time Simulation**: Time-of-day and station-based variations  
✅ **Seamless Integration**: Works with existing route caching and UI  
✅ **User-Friendly**: Intuitive emoji and color-coded warnings

This feature enhances the passenger experience by providing transit-specific information that helps users make better boarding decisions on LRT/MRT systems.
