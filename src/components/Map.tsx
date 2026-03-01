import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// import { shouldUseBusRoute } from "@/data/busTerminals"; // Moved to service
// import { getTrafficManager } from "@/lib/trafficManager"; // Moved to service
import { TRAFFIC_HEX_COLORS } from "@/lib/trafficUtils";
import { loadRoute } from "@/lib/routeCache"; // saveRoute moved to service
import { fetchRoute } from "@/lib/api/routeService";

// Transport lines used for simple LRT/MRT detection. Lowercased for faster comparisons.
// import { TRANSPORT_LINES } from "@/lib/constants/transport"; // Moved to service

// Fix for default marker icons in Leaflet with webpack
delete (
    L.Icon.Default.prototype as typeof L.Icon.Default.prototype & {
        _getIconUrl?: () => string;
    }
)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export interface RouteStep {
    name: string;
    distance: number;
    duration: number;
    mode: string;
    coordinates?: [number, number];
    waitingTime?: number;
    previousStationDensity?: number; // For LRT/MRT: density at previous station (0-100)
    currentStationDensity?: number; // For LRT/MRT: density at current station (0-100)
}

function renderColoredRoute(
    map: L.Map,
    routeCoordinates: [number, number][],
    routeSteps: RouteStep[],
    trafficColors: string[],
    currentStepProgress: number,
    layersCollection: L.Polyline[]
) {
    // Render all steps with traffic colors using actual step coordinates
    if (routeSteps.length > 0) {
        routeSteps.forEach((step, stepIdx) => {
            // Find the segment of route coordinates that corresponds to this step
            if (step.coordinates) {
                const stepCoord = step.coordinates;

                // Find the index in routeCoordinates closest to this step's coordinate
                let closestIdx = 0;
                let minDist = Infinity;

                for (let i = 0; i < routeCoordinates.length; i++) {
                    const coord = routeCoordinates[i];
                    const dist = Math.sqrt(
                        Math.pow(coord[0] - stepCoord[0], 2) +
                        Math.pow(coord[1] - stepCoord[1], 2)
                    );
                    if (dist < minDist) {
                        minDist = dist;
                        closestIdx = i;
                    }
                }

                // Determine segment boundaries
                const startIdx =
                    stepIdx === 0
                        ? 0
                        : routeSteps[stepIdx - 1].coordinates
                            ? (() => {
                                let prevClosestIdx = 0;
                                let prevMinDist = Infinity;
                                const prevStepCoord =
                                    routeSteps[stepIdx - 1]
                                        .coordinates!;
                                for (
                                    let i = 0;
                                    i < routeCoordinates.length;
                                    i++
                                ) {
                                    const coord =
                                        routeCoordinates[i];
                                    const dist = Math.sqrt(
                                        Math.pow(
                                            coord[0] -
                                            prevStepCoord[0],
                                            2
                                        ) +
                                        Math.pow(
                                            coord[1] -
                                            prevStepCoord[1],
                                            2
                                        )
                                    );
                                    if (dist < prevMinDist) {
                                        prevMinDist = dist;
                                        prevClosestIdx = i;
                                    }
                                }
                                return prevClosestIdx;
                            })()
                            : Math.floor(
                                (stepIdx *
                                    routeCoordinates.length) /
                                routeSteps.length
                            );

                const endIdx = Math.min(
                    closestIdx + 1,
                    routeCoordinates.length
                );

                const segmentCoords = routeCoordinates.slice(
                    startIdx,
                    endIdx
                );

                if (segmentCoords.length > 1) {
                    const color =
                        trafficColors[stepIdx] ||
                        TRAFFIC_HEX_COLORS.DEFAULT;
                    const isCompleted =
                        stepIdx < currentStepProgress;

                    const line = L.polyline(segmentCoords, {
                        color: isCompleted ? "#9ca3af" : color,
                        weight: 4,
                        opacity: isCompleted ? 0.5 : 0.8,
                    }).addTo(map);
                    layersCollection.push(line);
                }
            } else {
                // Fallback to even distribution if no coordinates
                const coordsPerStep = Math.floor(
                    routeCoordinates.length / routeSteps.length
                );
                const startIdx = stepIdx * coordsPerStep;
                const endIdx =
                    stepIdx === routeSteps.length - 1
                        ? routeCoordinates.length
                        : (stepIdx + 1) * coordsPerStep;

                const segmentCoords = routeCoordinates.slice(
                    startIdx,
                    endIdx
                );

                if (segmentCoords.length > 1) {
                    const color =
                        trafficColors[stepIdx] ||
                        TRAFFIC_HEX_COLORS.DEFAULT;
                    const isCompleted =
                        stepIdx < currentStepProgress;

                    const line = L.polyline(segmentCoords, {
                        color: isCompleted ? "#9ca3af" : color,
                        weight: 4,
                        opacity: isCompleted ? 0.5 : 0.8,
                    }).addTo(map);
                    layersCollection.push(line);
                }
            }
        });
    }
}

export interface RouteData {
    coordinates: [number, number][];
    steps: RouteStep[];
    distance: number;
    duration: number;
}

interface MapProps {
    startCoords?: [number, number];
    endCoords?: [number, number];
    onRouteCalculated?: (routes: RouteData[] | null) => void;
    currentStepProgress?: number;
    routeSteps?: RouteStep[];
    trafficColors?: string[];
    animateToStep?: number;
    poiMarkers?: Array<{
        lat: number;
        lng: number;
        name: string;
        type: string;
    }>;
    routes?: RouteData[];
    selectedRouteIndex?: number;
    onRouteSelect?: (index: number) => void;
}

export default function Map({
    startCoords,
    endCoords,
    onRouteCalculated,
    currentStepProgress = 0,
    routeSteps = [], // steps for the SELECTED route
    trafficColors = [], // colors for the SELECTED route
    animateToStep,
    poiMarkers = [],
    routes: propRoutes,
    selectedRouteIndex = 0,
    onRouteSelect,
}: MapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const startMarkerRef = useRef<L.Marker | null>(null);
    const endMarkerRef = useRef<L.Marker | null>(null);
    const routeLinesRef = useRef<L.Polyline[]>([]); // Store all route lines
    const completedLineRef = useRef<L.Polyline | null>(null);
    const poiMarkersRef = useRef<L.Marker[]>([]);
    const passengerMarkerRef = useRef<L.Marker | null>(null);
    
    // Internal state for fetched routes if not provided via props
    const [fetchedRoutes, setFetchedRoutes] = useState<RouteData[] | null>(null);

    // Use props routes if available, otherwise fetched routes
    const allRoutes = propRoutes || fetchedRoutes;

    // Fetch route from Route Service (which calls OSRM API)
    useEffect(() => {
        if (!startCoords || !endCoords) {
            return;
        }

        // If routes are provided via props, we don't need to fetch
        // BUT the existing behavior was to likely fetch if coords changed.
        // We'll keep fetching to support the standalone usage, but check cache first.
        
        const getRoute = async () => {
             // Try to get route from updated service (returns RouteData[])
             const routes = await fetchRoute(startCoords, endCoords);

             if (routes && routes.length > 0) {
                 setFetchedRoutes(routes);
                 onRouteCalculated?.(routes);
             } else {
                 // Fallback to cache or straight line (Refactored logic)
                 console.log("[Route API] No route found or error, checking cache...");
                 const cachedRoutes = loadRoute(startCoords, endCoords);
                 if (cachedRoutes && cachedRoutes.length > 0) {
                     console.log("[Route Cache] Using cached route as fallback");
                     setFetchedRoutes(cachedRoutes);
                     onRouteCalculated?.(cachedRoutes);
                 } else {
                     console.log("[Route Cache] No cached route available, using straight line");
                     // Create a dummy straight line route
                     const straightLineRoute: RouteData = {
                        coordinates: [startCoords, endCoords],
                        steps: [],
                        distance: 0,
                        duration: 0
                     };
                     setFetchedRoutes([straightLineRoute]);
                     onRouteCalculated?.([straightLineRoute]);
                 }
             }
        };

        getRoute();
    }, [startCoords, endCoords, onRouteCalculated]); // Note: removing propRoutes dependency to avoid loops if parent updates it

    // Map initialization (unchanged) -> handled by existing useEffect [116-145] which is outside this replacement block? 
    // Wait, I am replacing a huge chunk. I need to keep the initialization useEffect if it's not in the range. 
    // The range 1-519 covers almost everything. I should verify lines.
    // Line 116 is where initialization starts. I will include it or not?
    // The ReplacementContent replaces nearly the whole file logic for rendering. 
    
    // I will include the map initialization logic in the ReplacementContent to be safe and consistent.
    
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Initialize map only once
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, {
                zoomControl: true,
                attributionControl: false,
            }).setView(
                [14.6269, 121.0955], // Center between Rizal and Quezon City
                12
            );

            // Use CartoDB Positron for cleaner, minimal style
            L.tileLayer(
                "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                {
                    maxZoom: 19,
                }
            ).addTo(mapRef.current);
        }

        return () => {
            // Cleanup map on unmount
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        // Remove existing markers and route lines
        if (startMarkerRef.current) {
            mapRef.current.removeLayer(startMarkerRef.current);
            startMarkerRef.current = null;
        }
        if (endMarkerRef.current) {
            mapRef.current.removeLayer(endMarkerRef.current);
            endMarkerRef.current = null;
        }
        
        routeLinesRef.current.forEach((line) => {
            if (mapRef.current) {
                mapRef.current.removeLayer(line);
            }
        });
        routeLinesRef.current = [];

        if (completedLineRef.current) {
            mapRef.current.removeLayer(completedLineRef.current);
            completedLineRef.current = null;
        }

        // Add markers if coordinates are provided
        if (startCoords && endCoords) {
            // Create custom icons
            const startIcon = L.divIcon({
                className: "custom-marker",
                html: '<div style="background-color: var(--status-low); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">A</div>',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            const endIcon = L.divIcon({
                className: "custom-marker",
                html: '<div style="background-color: var(--status-high); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">B</div>',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            // Display instantly without animation
            startMarkerRef.current = L.marker(startCoords, {
                icon: startIcon,
            }).addTo(mapRef.current);

            endMarkerRef.current = L.marker(endCoords, {
                icon: endIcon,
            }).addTo(mapRef.current);

            // Render Routes
            if (allRoutes && allRoutes.length > 0) {
                // Loop through all routes
                allRoutes.forEach((route, index) => {
                    const isSelected = index === selectedRouteIndex;
                    const routeCoordinates = route.coordinates;
                    
                    if (isSelected) {
                        // RENDER SELECTED ROUTE (Detailed with traffic/progress)
                        
                        // Calculate split point based on current step progress
                        if (currentStepProgress > 0 && routeSteps.length > 0) {
                            // If at destination card (index equals length), show entire route as completed
                            if (currentStepProgress >= routeSteps.length) {
                                completedLineRef.current = L.polyline(routeCoordinates, {
                                    color: "#9ca3af",
                                    weight: 4,
                                    opacity: 0.5,
                                }).addTo(mapRef.current!);
                            } else {
                                // Render traffic colored segments for selected route
                                if (routeSteps.length > 0 && trafficColors.length > 0) {
                                    // ... Existing complicated logic for segment rendering ...
                                    // I'll copy the existing logic but adapt it to be inside this loop
                                    renderColoredRoute(
                                        mapRef.current!, 
                                        routeCoordinates, 
                                        routeSteps, 
                                        trafficColors, 
                                        currentStepProgress,
                                        routeLinesRef.current
                                    );
                                } else {
                                    // Fallback for selected route without detailed traffic
                                    // Default blue line
                                    const line = L.polyline(routeCoordinates, {
                                        color: TRAFFIC_HEX_COLORS.DEFAULT,
                                        weight: 4,
                                        opacity: 0.8,
                                    }).addTo(mapRef.current!);
                                    routeLinesRef.current.push(line);
                                }
                            }
                        } else {
                            // No progress, show full selected route
                             if (routeSteps.length > 0 && trafficColors.length > 0) {
                                renderColoredRoute(
                                    mapRef.current!, 
                                    routeCoordinates, 
                                    routeSteps, 
                                    trafficColors, 
                                    0, // 0 progress
                                    routeLinesRef.current
                                );
                             } else {
                                const line = L.polyline(routeCoordinates, {
                                    color: TRAFFIC_HEX_COLORS.DEFAULT,
                                    weight: 4,
                                    opacity: 0.8,
                                }).addTo(mapRef.current!);
                                routeLinesRef.current.push(line);
                             }
                        }
                    } else {
                        // RENDER ALTERNATIVE ROUTE (Greyed out)
                        const line = L.polyline(routeCoordinates, {
                            color: "#94a3b8", // slate-400
                            weight: 4,
                            opacity: 0.4,
                            dashArray: "10, 10"
                        }).addTo(mapRef.current!);
                        
                        // Add click handler to select this route
                        line.on('click', () => {
                            onRouteSelect?.(index);
                        });
                         
                        // Add hover effect
                         line.on('mouseover', function(e) {
                            const layer = e.target;
                            layer.setStyle({
                                opacity: 0.7,
                                weight: 6
                            });
                        });
                        line.on('mouseout', function(e) {
                            const layer = e.target;
                            layer.setStyle({
                                opacity: 0.4,
                                weight: 4
                            });
                        });

                        routeLinesRef.current.push(line);
                    }
                });
            }
        }
    }, [
        startCoords,
        endCoords,
        allRoutes,
        currentStepProgress,
        routeSteps,
        trafficColors,
        selectedRouteIndex,
        onRouteSelect
    ]);

    // Animate to next step when animateToStep changes
    useEffect(() => {
        if (
            mapRef.current &&
            animateToStep !== undefined &&
            animateToStep < routeSteps.length
        ) {
            // Get the start coordinates of the next step
            // The start of a step is the end of the previous step, or startCoords if it's step 0
            let targetCoords: [number, number] | undefined;

            if (animateToStep === 0 && startCoords) {
                targetCoords = startCoords;
            } else if (
                animateToStep > 0 &&
                routeSteps[animateToStep - 1]?.coordinates
            ) {
                targetCoords = routeSteps[animateToStep - 1].coordinates;
            }

            if (targetCoords) {
                mapRef.current.flyTo([targetCoords[0], targetCoords[1]], 15, {
                    duration: 1.5,
                    easeLinearity: 0.25,
                });
            }
        }
    }, [animateToStep, routeSteps, startCoords]);

    // Render POI markers
    useEffect(() => {
        if (!mapRef.current) return;

        // Remove existing POI markers
        poiMarkersRef.current.forEach((marker) => marker.remove());
        poiMarkersRef.current = [];

        // Add new POI markers
        poiMarkers.forEach((poi) => {
            if (mapRef.current) {
                // Create custom icon for POI with modern map pin design
                const poiIcon = L.divIcon({
                    className: "custom-poi-marker",
                    html: `
                        <div style="
                            position: relative;
                            width: 32px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                        ">
                            <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
                                <!-- Pin shape -->
                                <path d="M16 0C9.373 0 4 5.373 4 12c0 8 12 28 12 28s12-20 12-28c0-6.627-5.373-12-12-12z" 
                                      fill="#ef4444" stroke="white" stroke-width="2"/>
                                <!-- Inner circle -->
                                <circle cx="16" cy="12" r="5" fill="white"/>
                                <!-- Store icon -->
                                <path d="M16 9l-2 2h1v2h2v-2h1l-2-2z" fill="#ef4444"/>
                            </svg>
                        </div>
                    `,
                    iconSize: [32, 40],
                    iconAnchor: [16, 40],
                    popupAnchor: [0, -40],
                });

                const marker = L.marker([poi.lat, poi.lng], {
                    icon: poiIcon,
                }).addTo(mapRef.current);

                // Add popup with POI name
                marker.bindPopup(`<strong>${poi.name}</strong>`);

                poiMarkersRef.current.push(marker);
            }
        });
    }, [poiMarkers]);

    // Render passenger marker at current step
    useEffect(() => {
        if (!mapRef.current) return;

        // Remove existing passenger marker
        if (passengerMarkerRef.current) {
            passengerMarkerRef.current.remove();
            passengerMarkerRef.current = null;
        }

        // Determine passenger position based on current step
        let passengerCoords: [number, number] | undefined;

        if (currentStepProgress === 0 && startCoords) {
            // At the start
            passengerCoords = startCoords;
        } else if (
            currentStepProgress > 0 &&
            currentStepProgress <= routeSteps.length
        ) {
            // At the end of the previous step (start of current step)
            const previousStep = routeSteps[currentStepProgress - 1];
            if (previousStep?.coordinates) {
                passengerCoords = previousStep.coordinates;
            }
        }

        // Add passenger marker if we have coordinates
        if (passengerCoords && mapRef.current) {
            const passengerIcon = L.divIcon({
                className: "custom-passenger-marker",
                html: `
                    <div style="
                        position: relative;
                        width: 44px;
                        height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <!-- Pulsing ring animation -->
                        <div style="
                            position: absolute;
                            width: 44px;
                            height: 44px;
                            border-radius: 50%;
                            background: rgba(59, 130, 246, 0.3);
                            animation: pulseRing 2s ease-out infinite;
                        "></div>
                        <!-- Outer ring -->
                        <svg width="44" height="44" style="position: absolute;">
                            <circle cx="22" cy="22" r="18" 
                                    fill="rgba(59, 130, 246, 0.2)" 
                                    stroke="#3b82f6" 
                                    stroke-width="2"/>
                        </svg>
                        <!-- Inner dot -->
                        <svg width="44" height="44" style="position: absolute;">
                            <circle cx="22" cy="22" r="8" 
                                    fill="#3b82f6" 
                                    stroke="white" 
                                    stroke-width="3"/>
                        </svg>
                    </div>
                    <style>
                        @keyframes pulseRing {
                            0% {
                                transform: scale(0.8);
                                opacity: 1;
                            }
                            100% {
                                transform: scale(1.5);
                                opacity: 0;
                            }
                        }
                    </style>
                `,
                iconSize: [44, 44],
                iconAnchor: [22, 22],
            });

            passengerMarkerRef.current = L.marker(
                [passengerCoords[0], passengerCoords[1]],
                { icon: passengerIcon }
            ).addTo(mapRef.current);

            passengerMarkerRef.current.bindPopup(
                "<strong>Your location</strong>"
            );
        }
    }, [currentStepProgress, routeSteps, startCoords]);

    return (
        <div
            ref={mapContainerRef}
            className="w-full h-full rounded-lg"
            style={{ minHeight: "200px" }}
        />
    );
}
