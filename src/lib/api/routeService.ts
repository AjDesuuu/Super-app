import { shouldUseBusRoute } from "@/data/busTerminals";
import { getTrafficManager } from "@/lib/trafficManager";
import { TRANSPORT_LINES } from "@/lib/constants/transport";
import { saveRoute } from "@/lib/routeCache"; // We'll keep caching here for now, or move it

export interface RouteStep {
    name: string;
    distance: number;
    duration: number;
    mode: string;
    coordinates?: [number, number];
    waitingTime?: number;
    previousStationDensity?: number;
    currentStationDensity?: number;
}

export interface RouteData {
    coordinates: [number, number][];
    steps: RouteStep[];
    distance: number;
    duration: number;
}

interface OSRMStep {
    name?: string;
    distance: number;
    duration: number;
    mode?: string;
    maneuver?: {
        type: string;
        location: [number, number];
    };
}

// Helper to convert OSRM step to our RouteStep
const convertOSRMStep = (step: OSRMStep, modeOverride?: string): RouteStep => ({
    name: step.name || "Unnamed road",
    distance: step.distance,
    duration: step.duration,
    mode: modeOverride || step.mode || "driving",
    coordinates: step.maneuver?.location
        ? [step.maneuver.location[1], step.maneuver.location[0]]
        : undefined,
});

export const fetchRoute = async (
    startCoords: [number, number],
    endCoords: [number, number]
): Promise<RouteData[] | null> => {
    try {
        // 1. Initial Check (Direct Route)
        const initialUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`;
        const initialResponse = await fetch(initialUrl);
        const initialData = await initialResponse.json();

        if (!initialData.routes || !initialData.routes[0]) {
            throw new Error("No route found");
        }

        const initialDistance = initialData.routes[0].distance;

        // 2. Bus Route Logic
        const busTerminal = shouldUseBusRoute(
            startCoords,
            endCoords,
            initialDistance
        );

        if (busTerminal) {
            const [route1Response, route2Response] = await Promise.all([
                fetch(
                    `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${busTerminal.coordinates[1]},${busTerminal.coordinates[0]}?overview=full&geometries=geojson&steps=true&annotations=true`
                ),
                fetch(
                    `https://router.project-osrm.org/route/v1/driving/${busTerminal.coordinates[1]},${busTerminal.coordinates[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&steps=true&annotations=true`
                ),
            ]);

            const route1Data = await route1Response.json();
            const route2Data = await route2Response.json();

            if (route1Data.routes?.[0] && route2Data.routes?.[0]) {
                const route1 = route1Data.routes[0];
                const route2 = route2Data.routes[0];

                const coords1 = route1.geometry.coordinates.map(
                    (coord: [number, number]) =>
                        [coord[1], coord[0]] as [number, number]
                );
                const coords2 = route2.geometry.coordinates.map(
                    (coord: [number, number]) =>
                        [coord[1], coord[0]] as [number, number]
                );
                const combinedCoords = [...coords1, ...coords2];

                const steps1: RouteStep[] =
                    route1.legs[0]?.steps?.map((step: OSRMStep) =>
                        convertOSRMStep(step)
                    ) || [];

                const steps2: RouteStep[] =
                    route2.legs[0]?.steps?.map((step: OSRMStep) =>
                        convertOSRMStep(step, "bus")
                    ) || [];

                const busTerminalStep: RouteStep = {
                    name: busTerminal.name,
                    distance: 0,
                    duration: 0,
                    mode: "bus_terminal",
                    coordinates: busTerminal.coordinates,
                };

                const combinedSteps = [...steps1, busTerminalStep, ...steps2];

                const trafficManager = getTrafficManager();
                const trafficImpact =
                    trafficManager.calculateRouteTrafficImpact(
                        startCoords,
                        endCoords,
                        route1.distance + route2.distance,
                        route1.duration + route2.duration
                    );

                const adjustedSteps = combinedSteps.map((step) => ({
                    ...step,
                    duration: Math.round(
                        step.duration * trafficImpact.trafficMultiplier
                    ),
                }));

                const routeData: RouteData = {
                    coordinates: combinedCoords,
                    steps: adjustedSteps,
                    distance: route1.distance + route2.distance,
                    duration: trafficImpact.adjustedDuration,
                };

                saveRoute(startCoords, endCoords, [routeData]);
                return [routeData];
            }
        }

        // 3. Standard Route with Alternatives
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&steps=true&annotations=true&alternatives=true`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const routesData: RouteData[] = data.routes.map((route: any) => {
                const coords = route.geometry.coordinates.map(
                    (coord: [number, number]) =>
                        [coord[1], coord[0]] as [number, number]
                );

                const steps: RouteStep[] =
                    route.legs[0]?.steps?.map((step: OSRMStep) =>
                        convertOSRMStep(step)
                    ) || [];

                const trafficManager = getTrafficManager();
                const trafficImpact =
                    trafficManager.calculateRouteTrafficImpact(
                        startCoords,
                        endCoords,
                        route.distance,
                        route.duration
                    );

                const enrichedSteps = steps.map(
                    (step: RouteStep, index: number) => {
                        const stepName = step.name.toLowerCase();

                        // Helper function to match road names more precisely
                        const matchesRoad = (
                            stepName: string,
                            roadName: string
                        ) => {
                            const roadLower = roadName.toLowerCase();
                            // Check for exact match with common suffixes
                            const patterns = [
                                roadLower,
                                `${roadLower} road`,
                                `${roadLower} avenue`,
                                `${roadLower} highway`,
                                `${roadLower} street`,
                                `${roadLower} boulevard`,
                            ];
                            return patterns.some(
                                (pattern) =>
                                    stepName.includes(pattern) ||
                                    stepName === pattern ||
                                    stepName.startsWith(pattern + " ") ||
                                    stepName.endsWith(" " + pattern)
                            );
                        };

                        const isLrt1Road = TRANSPORT_LINES.lrt1.some((road) =>
                            matchesRoad(stepName, road)
                        );
                        const isLrt2Road = TRANSPORT_LINES.lrt2.some((road) =>
                            matchesRoad(stepName, road)
                        );
                        const isMrt3Road = TRANSPORT_LINES.mrt3.some((road) =>
                            matchesRoad(stepName, road)
                        );

                        // Determine the specific train line and set mode accordingly
                        // Priority: LRT-1 > LRT-2 > MRT-3 (matches useRouteConsolidation logic)
                        if (isLrt1Road) {
                            return {
                                ...step,
                                mode: "lrt1",
                                currentStationDensity:
                                    trafficManager.generateStationDensity(
                                        step.name,
                                        true
                                    ),
                                previousStationDensity:
                                    index > 0
                                        ? trafficManager.generateStationDensity(
                                              steps[index - 1].name,
                                              false
                                          )
                                        : trafficManager.generateStationDensity(
                                              step.name,
                                              false
                                          ),
                            };
                        } else if (isLrt2Road) {
                            return {
                                ...step,
                                mode: "lrt2",
                                currentStationDensity:
                                    trafficManager.generateStationDensity(
                                        step.name,
                                        true
                                    ),
                                previousStationDensity:
                                    index > 0
                                        ? trafficManager.generateStationDensity(
                                              steps[index - 1].name,
                                              false
                                          )
                                        : trafficManager.generateStationDensity(
                                              step.name,
                                              false
                                          ),
                            };
                        } else if (isMrt3Road) {
                            return {
                                ...step,
                                mode: "mrt3",
                                currentStationDensity:
                                    trafficManager.generateStationDensity(
                                        step.name,
                                        true
                                    ),
                                previousStationDensity:
                                    index > 0
                                        ? trafficManager.generateStationDensity(
                                              steps[index - 1].name,
                                              false
                                          )
                                        : trafficManager.generateStationDensity(
                                              step.name,
                                              false
                                          ),
                            };
                        }
                        return step;
                    }
                );

                const adjustedSteps = enrichedSteps.map((step: RouteStep) => ({
                    ...step,
                    duration: Math.round(
                        step.duration * trafficImpact.trafficMultiplier
                    ),
                }));

                return {
                    coordinates: coords,
                    steps: adjustedSteps,
                    distance: route.distance,
                    duration: trafficImpact.adjustedDuration,
                };
            });

            saveRoute(startCoords, endCoords, routesData);
            return routesData;
        }

        return null;
    } catch (error) {
        console.error("[Route API] Failed to fetch route:", error);
        return null; // Let the caller handle fallback (e.g., checking cache)
    }
};
