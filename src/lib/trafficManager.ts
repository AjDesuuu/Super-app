/**
 * @fileoverview Traffic Management System for NexStation Transportation Network
 *
 * This module provides real-time traffic monitoring and passenger density tracking
 * across key transportation areas in Metro Manila and surrounding regions. It implements
 * a singleton pattern to ensure consistent traffic data throughout the application lifecycle.
 *
 * @module trafficManager
 * @author NexStation Development Team
 */

/**
 * Represents traffic conditions for a specific geographical area
 *
 * @interface AreaTraffic
 * @property {string} areaId - Unique identifier for the monitored area
 * @property {string} areaName - Human-readable name of the area
 * @property {[number, number]} coordinates - Geographic coordinates [latitude, longitude]
 * @property {number} passengerDensity - Current passenger density (0-100 scale)
 * @property {TrafficLevel} trafficLevel - Categorized traffic severity level
 * @property {Date} lastUpdated - Timestamp of last data update
 */
export interface AreaTraffic {
    areaId: string;
    areaName: string;
    coordinates: [number, number];
    passengerDensity: number;
    trafficLevel: "low" | "moderate" | "high" | "severe";
    lastUpdated: Date;
}

/**
 * Represents the traffic impact on a specific route
 *
 * @interface RouteTrafficImpact
 * @property {number} baseDistance - Route distance in meters (without traffic consideration)
 * @property {number} baseDuration - Estimated duration in seconds (without traffic)
 * @property {number} trafficMultiplier - Traffic impact multiplier (1.0 to 2.5)
 * @property {number} adjustedDuration - Duration in seconds including traffic impact
 * @property {string[]} affectedAreas - Names of traffic areas affecting this route
 */
export interface RouteTrafficImpact {
    baseDistance: number;
    baseDuration: number;
    trafficMultiplier: number;
    adjustedDuration: number;
    affectedAreas: string[];
}

// Station factors moved to module scope to avoid reallocating on each call
const STATION_FACTORS: Record<string, number> = {
    // High traffic stations
    ayala: 0.8,
    makati: 0.85,
    cubao: 0.9,
    shaw: 0.75,
    ortigas: 0.8,
    "quezon ave": 0.7,
    recto: 0.85,
    carriedo: 0.8,
    divisoria: 0.75,
    katipunan: 0.7,

    // Medium traffic stations
    santolan: 0.6,
    marikina: 0.65,
    antipolo: 0.5,
    cainta: 0.55,
    pasig: 0.6,
    manila: 0.75,
    ermita: 0.65,
    malate: 0.6,

    // Default
    default: 0.5,
};

// NOTE: removed conditional debug flag — using direct console logging

/**
 * Traffic Management System - Singleton
 *
 * Manages real-time traffic conditions and passenger density across the transportation network.
 * Provides methods for querying traffic data, calculating route impacts, and simulating
 * traffic pattern changes.
 *
 * @class TrafficManager
 * @singleton
 *
 * @example
 * ```typescript
 * const trafficManager = TrafficManager.getInstance();
 * const traffic = trafficManager.getAreaTraffic('edsa-north');
 * console.log(`Current density: ${traffic.passengerDensity}%`);
 * ```
 */
export class TrafficManager {
    private static instance: TrafficManager;
    private trafficData: Map<string, AreaTraffic>;
    private updateInterval: number | null = null;

    /**
     * Private constructor to enforce singleton pattern
     * Initializes traffic data for all monitored areas
     *
     * @private
     */
    private constructor() {
        this.trafficData = new Map();
        this.initializeTrafficData();
    }

    /**
     * Retrieves the singleton instance of TrafficManager
     * Creates a new instance if one doesn't exist
     *
     * @static
     * @returns {TrafficManager} The singleton instance
     *
     * @example
     * ```typescript
     * const manager = TrafficManager.getInstance();
     * ```
     */
    public static getInstance(): TrafficManager {
        if (!TrafficManager.instance) {
            TrafficManager.instance = new TrafficManager();
        }
        return TrafficManager.instance;
    }

    /**
     * Initializes traffic monitoring for predefined key areas
     *
     * Populates the traffic data map with 21 strategic locations across:
     * - Metro Manila major thoroughfares (EDSA, C5, Commonwealth, etc.)
     * - Rizal Province areas (Antipolo, Cainta, Marikina)
     * - Cavite areas (Dasmariñas, Aguinaldo Highway)
     * - Major transport terminals (PITX, Cubao)
     * - LRT/MRT station vicinities
     *
     * @private
     * @returns {void}
     */
    private initializeTrafficData(): void {
        const keyAreas = [
            // Metro Manila key areas
            {
                id: "edsa-north",
                name: "EDSA North (Cubao-Quezon Ave)",
                coordinates: [14.6199, 121.0516] as [number, number],
            },
            {
                id: "edsa-central",
                name: "EDSA Central (Ortigas-Shaw)",
                coordinates: [14.5836, 121.0569] as [number, number],
            },
            {
                id: "edsa-south",
                name: "EDSA South (Magallanes-Taft)",
                coordinates: [14.5459, 121.0322] as [number, number],
            },
            {
                id: "c5-north",
                name: "C5 North (Katipunan-Libis)",
                coordinates: [14.6369, 121.0785] as [number, number],
            },
            {
                id: "c5-south",
                name: "C5 South (BGC-Makati)",
                coordinates: [14.5547, 121.0473] as [number, number],
            },
            {
                id: "commonwealth",
                name: "Commonwealth Avenue",
                coordinates: [14.6782, 121.0758] as [number, number],
            },
            {
                id: "quezon-ave",
                name: "Quezon Avenue",
                coordinates: [14.6362, 121.036] as [number, number],
            },
            {
                id: "espana",
                name: "España Boulevard",
                coordinates: [14.6069, 121.002] as [number, number],
            },
            {
                id: "taft-ave",
                name: "Taft Avenue",
                coordinates: [14.5389, 120.9933] as [number, number],
            },
            {
                id: "roxas-blvd",
                name: "Roxas Boulevard",
                coordinates: [14.5389, 120.9833] as [number, number],
            },

            // Rizal Province areas
            {
                id: "marcos-highway",
                name: "Marcos Highway",
                coordinates: [14.6052, 121.1456] as [number, number],
            },
            {
                id: "antipolo-city",
                name: "Antipolo City Center",
                coordinates: [14.5866, 121.1756] as [number, number],
            },
            {
                id: "cainta-junction",
                name: "Cainta Junction",
                coordinates: [14.5778, 121.1222] as [number, number],
            },
            {
                id: "marikina-center",
                name: "Marikina City Center",
                coordinates: [14.6507, 121.1029] as [number, number],
            },

            // Cavite areas
            {
                id: "dasmarinas",
                name: "Dasmariñas Center",
                coordinates: [14.3294, 120.9366] as [number, number],
            },
            {
                id: "aguinaldo-highway",
                name: "Aguinaldo Highway",
                coordinates: [14.4132, 120.9823] as [number, number],
            },

            // Major terminals
            {
                id: "cubao-terminal",
                name: "Cubao Bus Terminal Area",
                coordinates: [14.6191, 121.0515] as [number, number],
            },
            {
                id: "pitx",
                name: "PITX Area",
                coordinates: [14.4594, 121.0118] as [number, number],
            },

            // LRT/MRT stations (high density areas)
            {
                id: "lrt-recto",
                name: "LRT Recto Station Area",
                coordinates: [14.6034, 120.9845] as [number, number],
            },
            {
                id: "lrt-katipunan",
                name: "LRT Katipunan Station Area",
                coordinates: [14.6375, 121.0725] as [number, number],
            },
            {
                id: "mrt-ayala",
                name: "MRT Ayala Station Area",
                coordinates: [14.5481, 121.029] as [number, number],
            },
        ];

        keyAreas.forEach((area) => {
            const passengerDensity = this.generateRandomDensity();
            const trafficLevel = this.getTrafficLevel(passengerDensity);

            this.trafficData.set(area.id, {
                areaId: area.id,
                areaName: area.name,
                coordinates: area.coordinates,
                passengerDensity,
                trafficLevel,
                lastUpdated: new Date(),
            });
        });

        console.log(
            "[TrafficManager] Initialized with",
            this.trafficData.size,
            "monitored areas"
        );
    }

    /**
     * Generates a randomized passenger density value with realistic distribution
     *
     * Uses weighted random generation to create a bell curve distribution,
     * making moderate traffic levels (30-70%) more common than extremes.
     *
     * @private
     * @returns {number} Passenger density value between 0 and 100
     */
    private generateRandomDensity(): number {
        const random1 = Math.random();
        const random2 = Math.random();

        // Weight towards moderate values (30-70) for realistic traffic patterns
        const density = Math.round((random1 * 0.7 + random2 * 0.3) * 100);

        return Math.max(0, Math.min(100, density));
    }

    /**
     * Categorizes passenger density into traffic severity levels
     *
     * @private
     * @param {number} density - Passenger density value (0-100)
     * @returns {TrafficLevel} Categorized traffic level
     *
     * Traffic Level Thresholds:
     * - Low: 0-24% density
     * - Moderate: 25-49% density
     * - High: 50-74% density
     * - Severe: 75-100% density
     */
    private getTrafficLevel(
        density: number
    ): "low" | "moderate" | "high" | "severe" {
        if (density < 25) return "low";
        if (density < 50) return "moderate";
        if (density < 75) return "high";
        return "severe";
    }

    /**
     * Get traffic data for a specific area
     */
    public getAreaTraffic(areaId: string): AreaTraffic | undefined {
        return this.trafficData.get(areaId);
    }

    /**
     * Get all traffic data
     */
    public getAllTrafficData(): AreaTraffic[] {
        return Array.from(this.trafficData.values());
    }

    /**
     * Find the nearest traffic area to given coordinates
     */
    public getNearestAreaTraffic(coords: [number, number]): AreaTraffic | null {
        let nearest: AreaTraffic | null = null;
        let minDistance = Infinity;

        // iterate through map values for slightly better perf and readability
        for (const area of this.trafficData.values()) {
            const distance = this.calculateDistance(coords, area.coordinates);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = area;
            }
        }

        return nearest;
    }

    /**
     * Calculate traffic impact on a route segment
     */
    public calculateRouteTrafficImpact(
        startCoords: [number, number],
        endCoords: [number, number],
        baseDistance: number,
        baseDuration: number
    ): RouteTrafficImpact {
        const affectedAreas: string[] = [];
        let totalDensity = 0;
        let areaCount = 0;

        // Find all areas along the route (within 2km radius)
        for (const area of this.trafficData.values()) {
            const distanceToStart = this.calculateDistance(
                startCoords,
                area.coordinates
            );
            const distanceToEnd = this.calculateDistance(
                endCoords,
                area.coordinates
            );
            const routeLength = this.calculateDistance(startCoords, endCoords);

            // Check if area is reasonably close to the route
            if (
                distanceToStart < 2 ||
                distanceToEnd < 2 ||
                distanceToStart + distanceToEnd < routeLength * 1.2
            ) {
                affectedAreas.push(area.areaName);
                totalDensity += area.passengerDensity;
                areaCount++;
            }
        }

        // Calculate traffic multiplier based on average density
        let trafficMultiplier = 1.0;
        if (areaCount > 0) {
            const avgDensity = totalDensity / areaCount;
            // Convert density (0-100) to multiplier (1.0-2.5)
            trafficMultiplier = 1.0 + (avgDensity / 100) * 1.5;
        }

        const adjustedDuration = Math.round(baseDuration * trafficMultiplier);

        return {
            baseDistance,
            baseDuration,
            trafficMultiplier,
            adjustedDuration,
            affectedAreas,
        };
    }

    /**
     * Calculate distance between two coordinates (Haversine formula)
     * Returns distance in kilometers
     */
    private calculateDistance(
        coords1: [number, number],
        coords2: [number, number]
    ): number {
        const [lat1, lon1] = coords1;
        const [lat2, lon2] = coords2;

        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
                Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Update passenger density for a specific area (for future real-time updates)
     */
    public updateAreaDensity(areaId: string, newDensity: number): void {
        const area = this.trafficData.get(areaId);
        if (area) {
            area.passengerDensity = Math.max(0, Math.min(100, newDensity));
            area.trafficLevel = this.getTrafficLevel(area.passengerDensity);
            area.lastUpdated = new Date();
        }
    }

    /**
     * Simulate traffic changes (for development/demo purposes)
     * This can be called periodically to simulate real-time traffic updates
     */
    public simulateTrafficUpdate(): void {
        this.trafficData.forEach((area, areaId) => {
            // Make small random changes to density (±5-15%)
            const change = (Math.random() - 0.5) * 30;
            const newDensity = Math.max(
                0,
                Math.min(100, area.passengerDensity + change)
            );
            this.updateAreaDensity(areaId, newDensity);
        });

        console.log("[TrafficManager] Traffic data updated");
    }

    /**
     * Start automatic traffic updates
     */
    public startAutoUpdate(intervalMs: number = 60000): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.simulateTrafficUpdate();
        }, intervalMs);

        console.log(
            "[TrafficManager] Auto-update started (interval:",
            intervalMs,
            "ms)"
        );
    }

    /**
     * Stop automatic traffic updates
     */
    public stopAutoUpdate(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log("[TrafficManager] Auto-update stopped");
        }
    }

    /**
     * Get traffic statistics
     */
    public getTrafficStatistics(): {
        totalAreas: number;
        averageDensity: number;
        lowTrafficAreas: number;
        moderateTrafficAreas: number;
        highTrafficAreas: number;
        severeTrafficAreas: number;
    } {
        const areas = Array.from(this.trafficData.values());
        const totalDensity = areas.reduce(
            (sum, area) => sum + area.passengerDensity,
            0
        );

        return {
            totalAreas: areas.length,
            averageDensity:
                areas.length > 0 ? Math.round(totalDensity / areas.length) : 0,
            lowTrafficAreas: areas.filter((a) => a.trafficLevel === "low")
                .length,
            moderateTrafficAreas: areas.filter(
                (a) => a.trafficLevel === "moderate"
            ).length,
            highTrafficAreas: areas.filter((a) => a.trafficLevel === "high")
                .length,
            severeTrafficAreas: areas.filter((a) => a.trafficLevel === "severe")
                .length,
        };
    }

    /**
     * Generates passenger density values for LRT/MRT stations based on station name and time of day
     *
     * @param stationName - Name of the LRT/MRT station
     * @param isCurrentStation - Whether this is the current station (true) or previous station (false)
     * @returns Passenger density value (0-100)
     */
    generateStationDensity(
        stationName: string,
        isCurrentStation: boolean = true
    ): number {
        // Find matching station factor (case-insensitive partial match)
        const name = stationName.toLowerCase();
        let baseFactor = STATION_FACTORS.default;
        for (const [station, factor] of Object.entries(STATION_FACTORS)) {
            if (station !== "default" && name.includes(station)) {
                baseFactor = factor;
                break;
            }
        }

        // Time-of-day multiplier (simulate rush hours)
        const hour = new Date().getHours();
        let timeMultiplier = 1.0;
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            timeMultiplier = 1.3; // rush
        } else if (hour >= 10 && hour <= 16) {
            timeMultiplier = 0.8; // mid-day
        } else if (hour >= 20 && hour <= 23) {
            timeMultiplier = 0.9; // evening
        } else {
            timeMultiplier = 0.4; // night
        }

        // Current stations tend to be slightly more crowded than previous stations
        const positionMultiplier = isCurrentStation ? 1.1 : 0.9;

        // Add some randomness to simulate real-world variations (0.8-1.2)
        const randomFactor = 0.8 + Math.random() * 0.4;

        // Calculate final density and clamp
        const raw =
            baseFactor *
            timeMultiplier *
            positionMultiplier *
            randomFactor *
            100;
        return Math.max(0, Math.min(100, Math.round(raw)));
    }
}

// Export singleton instance getter
export const getTrafficManager = () => TrafficManager.getInstance();
