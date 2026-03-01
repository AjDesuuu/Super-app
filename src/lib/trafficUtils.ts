/**
 * TrafficUtils - Utility class for traffic-related UI helpers and color mappings.
 *
 * This module provides consistent color schemes and styling utilities for displaying
 * traffic conditions across the application. It ensures visual consistency and provides
 * a centralized location for traffic visualization logic.
 *
 * @module trafficUtils
 */

import { getTrafficManager } from "./trafficManager";

/**
 * Traffic level type definition
 */
export type TrafficLevel = "low" | "moderate" | "high" | "severe";

/**
 * Traffic color configuration for UI elements
 */
export interface TrafficColors {
    /** Traffic severity level */
    level: TrafficLevel;
    /** Hex color code for map routes */
    hex: string;
    /** Tailwind text color class */
    textColor: string;
    /** Tailwind background color class */
    bgColor: string;
    /** Tailwind border color class */
    borderColor: string;
}

/**
 * Color constants for traffic levels
 * These hex values are used for map rendering
 */
export const TRAFFIC_HEX_COLORS = {
    LOW: "#10B981", // Emerald Green (design)
    MODERATE: "#F59E0B", // Amber (design)
    HIGH: "#EF4444", // Red (design)
    SEVERE: "#EF4444", // Red (design)
    DEFAULT: "#4F46E5", // Primary Indigo (fallback)
} as const;

/**
 * Tailwind CSS class mappings for traffic levels
 */
export const TRAFFIC_TAILWIND_COLORS = {
    LOW: {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        borderStrong: "border-emerald-500/50",
    },
    MODERATE: {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        borderStrong: "border-amber-500/50",
    },
    HIGH: {
        text: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        borderStrong: "border-red-500/50",
    },
    SEVERE: {
        text: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        borderStrong: "border-red-500/50",
    },
} as const;

/**
 * Passenger density level for LRT/MRT stations
 */
export type DensityLevel = "low" | "moderate" | "high";

/**
 * Passenger density warning information
 */
export interface DensityWarning {
    level: DensityLevel;
    message: string;
    waitForNext: boolean; // True if user should wait for the train after next
    color: string;
}

/**
 * Determines traffic level from passenger density percentage
 *
 * @param density - Passenger density value (0-100)
 * @returns Traffic level classification
 *
 * @example
 * ```typescript
 * const level = getTrafficLevelFromDensity(65); // Returns 'high'
 * ```
 */
export function getTrafficLevelFromDensity(density: number): TrafficLevel {
    if (density < 25) return "low";
    if (density < 50) return "moderate";
    if (density < 75) return "high";
    return "severe";
}

/**
 * Determines density level for LRT/MRT stations
 *
 * @param density - Passenger density value (0-100)
 * @returns Density level classification
 */
export function getDensityLevel(density: number): DensityLevel {
    if (density < 40) return "low";
    if (density < 70) return "moderate";
    return "high";
}

/**
 * Analyzes passenger density at LRT/MRT stations and provides warnings
 *
 * @param previousDensity - Density at previous station (0-100)
 * @param currentDensity - Density at current station (0-100)
 * @returns Density warning information
 */
export function analyzeLRTDensity(
    previousDensity: number,
    currentDensity: number
): DensityWarning {
    const avgDensity = (previousDensity + currentDensity) / 2;
    const densityLevel = getDensityLevel(avgDensity);

    // High density at both stations = wait for train after next
    const waitForNext = previousDensity > 70 && currentDensity > 70;

    let message: string;
    let color: string;

    if (densityLevel === "high") {
        message = waitForNext
            ? "Very crowded - wait for the train after next"
            : "High passenger density - expect crowds";
        color = "text-red-600";
    } else if (densityLevel === "moderate") {
        message = waitForNext
            ? "Moderately crowded - consider waiting for next train"
            : "Moderate passenger density";
        color = "text-amber-600";
    } else {
        message = "Low passenger density - comfortable boarding";
        color = "text-emerald-600";
    }

    return {
        level: densityLevel,
        message,
        waitForNext,
        color,
    };
}

/**
 * Gets hex color code for a given traffic level
 *
 * @param level - Traffic severity level
 * @returns Hex color code string
 *
 * @example
 * ```typescript
 * const color = getTrafficHexColor('high'); // Returns '#f97316'
 * ```
 */
export function getTrafficHexColor(level: TrafficLevel): string {
    const colorMap: Record<TrafficLevel, string> = {
        low: TRAFFIC_HEX_COLORS.LOW,
        moderate: TRAFFIC_HEX_COLORS.MODERATE,
        high: TRAFFIC_HEX_COLORS.HIGH,
        severe: TRAFFIC_HEX_COLORS.SEVERE,
    };
    return colorMap[level];
}

/**
 * Gets complete color configuration for a traffic level
 *
 * @param level - Traffic severity level
 * @returns Object containing hex and Tailwind color classes
 *
 * @example
 * ```typescript
 * const colors = getTrafficColors('moderate');
 * // Returns: { level: 'moderate', hex: '#eab308', textColor: 'text-yellow-600', ... }
 * ```
 */
export function getTrafficColors(level: TrafficLevel): TrafficColors {
    const tailwindMap = {
        low: TRAFFIC_TAILWIND_COLORS.LOW,
        moderate: TRAFFIC_TAILWIND_COLORS.MODERATE,
        high: TRAFFIC_TAILWIND_COLORS.HIGH,
        severe: TRAFFIC_TAILWIND_COLORS.SEVERE,
    } as const;

    const tailwind = tailwindMap[level];

    return {
        level,
        hex: getTrafficHexColor(level),
        textColor: tailwind.text,
        bgColor: `${tailwind.bg} ${tailwind.border}`,
        borderColor: tailwind.borderStrong,
    };
}

/**
 * Calculates traffic level for a specific coordinate location
 *
 * @param coordinates - Latitude and longitude tuple
 * @returns Complete traffic color configuration
 *
 * @example
 * ```typescript
 * const traffic = getTrafficForCoordinate([14.5995, 120.9842]);
 * console.log(traffic.level); // 'moderate'
 * console.log(traffic.hex);   // '#eab308'
 * ```
 */
export function getTrafficForCoordinate(
    coordinates: [number, number]
): TrafficColors {
    const trafficManager = getTrafficManager();
    const nearestArea = trafficManager.getNearestAreaTraffic(coordinates);

    if (nearestArea) {
        const level = getTrafficLevelFromDensity(nearestArea.passengerDensity);
        return getTrafficColors(level);
    }

    // Default to low traffic if no area found
    return getTrafficColors("low");
}

/**
 * Calculates traffic colors for multiple route steps
 *
 * @param coordinates - Array of route coordinates
 * @param stepCount - Number of steps in the route
 * @returns Array of hex color codes for each step
 *
 * @remarks
 * This function divides the route coordinates evenly among steps and determines
 * the traffic level for each segment by sampling coordinates.
 *
 * @example
 * ```typescript
 * const colors = calculateRouteTrafficColors(routeCoords, 5);
 * // Returns: ['#22c55e', '#eab308', '#f97316', '#eab308', '#22c55e']
 * ```
 */
export function calculateRouteTrafficColors(
    coordinates: [number, number][],
    stepCount: number
): string[] {
    if (!coordinates || coordinates.length === 0 || stepCount === 0) {
        return [];
    }

    const trafficManager = getTrafficManager();
    const colors: string[] = [];

    // Pre-calc coordinate grouping per step
    const coordsPerStep = Math.max(
        1,
        Math.floor(coordinates.length / (stepCount + 1))
    );

    for (let stepIndex = 0; stepIndex < stepCount; stepIndex++) {
        const stepCoordIndex = Math.min(
            (stepIndex + 1) * coordsPerStep,
            coordinates.length - 1
        );
        const stepCoords = coordinates[stepCoordIndex];

        const nearestArea = trafficManager.getNearestAreaTraffic(stepCoords);
        if (nearestArea) {
            const level = getTrafficLevelFromDensity(
                nearestArea.passengerDensity
            );
            colors.push(getTrafficHexColor(level));
        } else {
            colors.push(TRAFFIC_HEX_COLORS.DEFAULT);
        }
    }

    return colors;
}

/**
 * Formats traffic level for display
 *
 * @param level - Traffic severity level
 * @returns Formatted string suitable for UI display
 *
 * @example
 * ```typescript
 * formatTrafficLevel('moderate'); // Returns 'Moderate Traffic'
 * formatTrafficLevel('severe');   // Returns 'Severe Traffic'
 * ```
 */
export function formatTrafficLevel(level: TrafficLevel): string {
    return level.charAt(0).toUpperCase() + level.slice(1) + " Traffic";
}
