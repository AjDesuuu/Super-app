import { useMemo, useCallback } from "react";
import { TRANSPORT_LINES } from "@/lib/constants/transport";
import { getTrafficManager } from "@/lib/trafficManager";
import { type RouteStep } from "@/components/Map";
import { Bus, Train, Footprints } from "lucide-react";

export interface ConsolidatedStep {
    name: string;
    distance: number;
    duration: number;
    mode: string;
    originalStepCount?: number;
    coordinates?: [number, number];
    waitingTime?: number;
    previousStationDensity?: number;
    currentStationDensity?: number;
}

export function useRouteConsolidation(
    routeSteps: RouteStep[] | undefined,
    endLocationName?: string,
    endLocationCoordinates?: [number, number]
) {
    // Memoize transport mode determination
    const getTransportMode = useCallback(
        (step: {
            name: string;
            distance: number;
            mode?: string;
            coordinates?: [number, number];
        }) => {
            const distanceKm = step.distance / 1000;

            // Check if this step has a pre-determined mode from routing
            if (step.mode === "bus") {
                return {
                    icon: Bus,
                    label: `Take Bus to ${step.name}`,
                    vehicle: "Bus",
                    color: "text-red-600",
                };
            }

            if (step.mode === "bus_terminal") {
                return {
                    icon: Bus,
                    label: `At ${step.name}`,
                    vehicle: "BusTerminal",
                    color: "text-red-600",
                };
            }

            // Check for specific train line modes set by route service
            if (step.mode === "lrt1") {
                return {
                    icon: Train,
                    label: `Take LRT-1 to ${step.name}`,
                    vehicle: "LRT-1",
                    color: "text-yellow-600",
                };
            }

            if (step.mode === "lrt2") {
                return {
                    icon: Train,
                    label: `Take LRT-2 to ${step.name}`,
                    vehicle: "LRT-2",
                    color: "text-purple-600",
                };
            }

            if (step.mode === "mrt3") {
                return {
                    icon: Train,
                    label: `Take MRT-3 to ${step.name}`,
                    vehicle: "MRT-3",
                    color: "text-blue-600",
                };
            }

            const stepName = step.name.toLowerCase();

            // Helper function to match road names more precisely
            const matchesRoad = (stepName: string, roadName: string) => {
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

            // Check if road is passed by LRT/MRT lines (using centralized constants)
            const isLrt1Road = TRANSPORT_LINES.lrt1.some((road) =>
                matchesRoad(stepName, road)
            );
            const isLrt2Road = TRANSPORT_LINES.lrt2.some((road) =>
                matchesRoad(stepName, road)
            );
            const isMrt3Road = TRANSPORT_LINES.mrt3.some((road) =>
                matchesRoad(stepName, road)
            );

            if (isLrt1Road) {
                return {
                    icon: Train,
                    label: `Take LRT-1 to ${step.name}`,
                    vehicle: "LRT-1",
                    color: "text-yellow-600",
                };
            } else if (isLrt2Road) {
                return {
                    icon: Train,
                    label: `Take LRT-2 to ${step.name}`,
                    vehicle: "LRT-2",
                    color: "text-purple-600",
                };
            } else if (isMrt3Road) {
                return {
                    icon: Train,
                    label: `Take MRT-3 to ${step.name}`,
                    vehicle: "MRT-3",
                    color: "text-blue-600",
                };
            } else if (distanceKm < 0.5) {
                return {
                    icon: Footprints,
                    label: `Walk to ${step.name}`,
                    vehicle: "Walk",
                    color: "text-green-600",
                };
            } else {
                return {
                    icon: Bus,
                    label: `Take Jeep to ${step.name}`,
                    vehicle: "Jeep",
                    color: "text-orange-600",
                };
            }
        },
        []
    );

    const filteredSteps = useMemo(
        () =>
            routeSteps?.filter((step) => !step.name.includes("Unnamed")) || [],
        [routeSteps]
    );

    const consolidatedSteps = useMemo(() => {
        if (filteredSteps.length === 0) return [];

        const consolidated: ConsolidatedStep[] = [];
        let i = 0;

        while (i < filteredSteps.length) {
            const mode = getTransportMode(filteredSteps[i]);

            // Check if this is a walking or jeep step
            if (mode.vehicle === "Walk" || mode.vehicle === "Jeep") {
                // Look ahead to see if there's a BusTerminal coming
                let foundBusTerminal = false;
                let busTerminalIndex = -1;

                for (let j = i; j < filteredSteps.length; j++) {
                    const checkMode = getTransportMode(filteredSteps[j]);
                    if (checkMode.vehicle === "BusTerminal") {
                        foundBusTerminal = true;
                        busTerminalIndex = j;
                        break;
                    } else if (
                        checkMode.vehicle !== "Jeep" &&
                        checkMode.vehicle !== "Walk"
                    ) {
                        break;
                    }
                }

                if (foundBusTerminal) {
                    // Consolidate jeep + walking steps to just arrive at bus terminal
                    let totalDistance = 0;
                    let totalDuration = 0;
                    const busTerminalName =
                        filteredSteps[busTerminalIndex].name;
                    const busTerminalCoordinates =
                        filteredSteps[busTerminalIndex].coordinates;

                    // Include all walking, jeep, and the bus terminal step itself
                    while (i <= busTerminalIndex) {
                        totalDistance += filteredSteps[i].distance;
                        totalDuration += filteredSteps[i].duration;
                        i++;
                    }

                    consolidated.push({
                        name: busTerminalName,
                        distance: totalDistance,
                        duration: totalDuration,
                        mode: "BusTerminal",
                        coordinates: busTerminalCoordinates,
                    });
                    continue;
                }

                // Look ahead to see if there's an LRT/MRT step coming
                let foundLrtMrt = false;
                let lrtMrtIndex = -1;

                for (let j = i; j < filteredSteps.length; j++) {
                    const checkMode = getTransportMode(filteredSteps[j]);
                    if (
                        checkMode.vehicle === "LRT-1" ||
                        checkMode.vehicle === "LRT-2" ||
                        checkMode.vehicle === "MRT-3"
                    ) {
                        foundLrtMrt = true;
                        lrtMrtIndex = j;
                        break;
                    } else if (
                        checkMode.vehicle !== "Jeep" &&
                        checkMode.vehicle !== "Walk" &&
                        checkMode.vehicle !== "Bus" &&
                        checkMode.vehicle !== "BusTerminal"
                    ) {
                        break;
                    }
                }

                if (foundLrtMrt) {
                    // Consolidate walking + jeep steps BEFORE the LRT/MRT step
                    // Let the train logic handle the LRT/MRT step separately
                    let jeepDistance = 0;
                    let jeepDuration = 0;
                    let lastRoadName = "";
                    let lastRoadCoordinates: [number, number] | undefined =
                        undefined;

                    // Only include walking/jeep steps BEFORE the LRT/MRT (exclude the train step)
                    while (i < lrtMrtIndex) {
                        jeepDistance += filteredSteps[i].distance;
                        jeepDuration += filteredSteps[i].duration;
                        lastRoadName = filteredSteps[i].name;
                        lastRoadCoordinates = filteredSteps[i].coordinates;
                        i++;
                    }

                    // Add the jeep/walk segment
                    consolidated.push({
                        name: lastRoadName || "Walking",
                        distance: jeepDistance,
                        duration: jeepDuration,
                        mode: "Jeep",
                        coordinates: lastRoadCoordinates,
                        waitingTime: Math.floor(Math.random() * 16) + 15, // 15-30 seconds
                    });
                    // i is now at lrtMrtIndex, so the main loop will process the train step next
                } else {
                    // All remaining walking + jeep steps at the end - combine using last road name
                    let jeepDistance = 0;
                    let jeepDuration = 0;
                    let lastRoadName = "";
                    let lastRoadCoordinates: [number, number] | undefined =
                        undefined;

                    while (i < filteredSteps.length) {
                        const currentMode = getTransportMode(filteredSteps[i]);
                        if (
                            currentMode.vehicle === "Jeep" ||
                            currentMode.vehicle === "Walk"
                        ) {
                            jeepDistance += filteredSteps[i].distance;
                            jeepDuration += filteredSteps[i].duration;
                            lastRoadName = filteredSteps[i].name;
                            lastRoadCoordinates = filteredSteps[i].coordinates;
                            i++;
                        } else {
                            break;
                        }
                    }

                    // Use the last road name from the route
                    consolidated.push({
                        name: lastRoadName || "Destination",
                        distance: jeepDistance,
                        duration: jeepDuration,
                        mode: "Jeep",
                        coordinates: lastRoadCoordinates,
                        waitingTime: Math.floor(Math.random() * 16) + 15, // 15-30 seconds
                    });
                }
            } else if (
                mode.vehicle === "LRT-1" ||
                mode.vehicle === "LRT-2" ||
                mode.vehicle === "MRT-3"
            ) {
                // Combine consecutive train steps of the SAME line type (LRT or MRT)
                // Don't consolidate when switching between LRT and MRT
                let trainDistance = 0;
                let trainDuration = 0;
                let lastTrainDestination = "";
                let lastTrainCoordinates: [number, number] | undefined =
                    undefined;
                let lastTrainLine = mode.vehicle;
                let stepCount = 0;

                // Determine if this is LRT or MRT line
                const isLRT =
                    mode.vehicle === "LRT-1" || mode.vehicle === "LRT-2";
                const isMRT = mode.vehicle === "MRT-3";

                // Consolidate consecutive steps of the same type (LRT or MRT)
                const firstStepDensities: { prev?: number; curr?: number } = {};
                while (i < filteredSteps.length) {
                    const currentMode = getTransportMode(filteredSteps[i]);
                    const currentIsLRT =
                        currentMode.vehicle === "LRT-1" ||
                        currentMode.vehicle === "LRT-2";
                    const currentIsMRT = currentMode.vehicle === "MRT-3";

                    // Only consolidate if same type (both LRT or both MRT)
                    if ((isLRT && currentIsLRT) || (isMRT && currentIsMRT)) {
                        trainDistance += filteredSteps[i].distance;
                        trainDuration += filteredSteps[i].duration;
                        lastTrainDestination = filteredSteps[i].name;
                        lastTrainCoordinates = filteredSteps[i].coordinates;
                        lastTrainLine = currentMode.vehicle;

                        // Preserve density information from the first LRT/MRT step
                        if (stepCount === 0) {
                            firstStepDensities.prev =
                                filteredSteps[i].previousStationDensity;
                            firstStepDensities.curr =
                                filteredSteps[i].currentStationDensity;
                        }

                        stepCount++;
                        i++;
                    } else {
                        break;
                    }
                }

                // Generate density information if not already present
                const trafficManager = getTrafficManager();
                const densityInfo = {
                    previousStationDensity:
                        firstStepDensities.prev ??
                        trafficManager.generateStationDensity(
                            lastTrainDestination,
                            false
                        ),
                    currentStationDensity:
                        firstStepDensities.curr ??
                        trafficManager.generateStationDensity(
                            lastTrainDestination,
                            true
                        ),
                };

                consolidated.push({
                    name: lastTrainDestination,
                    distance: trainDistance,
                    duration: trainDuration,
                    mode: lastTrainLine,
                    originalStepCount: stepCount,
                    coordinates: lastTrainCoordinates,
                    waitingTime: Math.floor(Math.random() * 11) + 10, // 10-20 seconds
                    previousStationDensity: densityInfo.previousStationDensity,
                    currentStationDensity: densityInfo.currentStationDensity,
                });
            } else if (mode.vehicle === "Bus") {
                // Combine consecutive bus steps
                let busDistance = 0;
                let busDuration = 0;
                let lastBusDestination = "";
                let lastBusCoordinates: [number, number] | undefined =
                    undefined;

                while (i < filteredSteps.length) {
                    const currentMode = getTransportMode(filteredSteps[i]);
                    if (currentMode.vehicle === "Bus") {
                        busDistance += filteredSteps[i].distance;
                        busDuration += filteredSteps[i].duration;
                        lastBusDestination = filteredSteps[i].name;
                        lastBusCoordinates = filteredSteps[i].coordinates;
                        i++;
                    } else {
                        break;
                    }
                }

                consolidated.push({
                    name:
                        lastBusDestination || endLocationName || "Destination",
                    distance: busDistance,
                    duration: busDuration,
                    mode: "Bus",
                    coordinates: lastBusCoordinates || endLocationCoordinates,
                    waitingTime: Math.floor(Math.random() * 11) + 20, // 20-30 seconds
                });
            } else if (mode.vehicle === "BusTerminal") {
                // Add bus terminal as a separate step
                consolidated.push({
                    name: filteredSteps[i].name,
                    distance: filteredSteps[i].distance,
                    duration: filteredSteps[i].duration,
                    mode: "BusTerminal",
                    coordinates: filteredSteps[i].coordinates,
                });
                i++;
            } else {
                // Unknown mode, skip it (don't add to consolidated)
                i++;
            }
        }

        return consolidated;
    }, [
        filteredSteps,
        endLocationName,
        endLocationCoordinates,
        getTransportMode,
    ]);

    return { consolidatedSteps, getTransportMode };
}
