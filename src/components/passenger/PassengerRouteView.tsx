import {
    ArrowLeft,
    Bus,
    ChevronRight,
    Train,
    Footprints,
    Store,
    ChevronDown,
    ChevronUp,
    Maximize2,
    X,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import Map, { type RouteData, type RouteStep } from "../Map";
import type { Location } from "@/data/locations";
import {
    calculateRouteTrafficColors,
    getTrafficColors,
    TRAFFIC_HEX_COLORS,
    formatTrafficLevel,
    analyzeLRTDensity,
    type TrafficColors,
    type TrafficLevel,
    type DensityWarning,
} from "@/lib/trafficUtils";
import { findNearbyPOIs, POI_CATEGORIES, type POI } from "@/lib/poiService";
import { DestinationReached } from "./DestinationReached";
import { useRouteConsolidation } from "@/hooks/useRouteConsolidation";

interface PassengerRouteViewProps {
    startLocation: Location | null;
    endLocation: Location | null;
    routes: RouteData[];
    onBack: () => void;
    onGo: () => void;
}

export default function PassengerRouteView({
    startLocation,
    endLocation,
    routes,
    onBack,
}: PassengerRouteViewProps) {
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [selectedPOIs, setSelectedPOIs] = useState<POI[]>([]);
    const [loadingPOIs, setLoadingPOIs] = useState(false);
    const [waitingTime, setWaitingTime] = useState<number>(0);
    const [isWaiting, setIsWaiting] = useState(false);
    const [animateToStep, setAnimateToStep] = useState<number | undefined>(
        undefined
    );
    const [showDestinationReached, setShowDestinationReached] = useState(false);
    const [showEstablishmentsInMain, setShowEstablishmentsInMain] =
        useState(true);
    const [isMaximized, setIsMaximized] = useState(false);
    const initializedStepRef = useRef<number>(-1);
    const poiCacheRef = useRef<Record<string, POI[]>>({});
    const lastFetchedStepRef = useRef<number>(-1);

    // Derived state for the currently selected route
    const routeData = routes[selectedRouteIndex] || null;

    // NOTE: debug helper removed per request — using direct console logs


    // Memoize density warning analysis for LRT/MRT steps
    const getDensityWarning = useCallback(
        (step: RouteStep): DensityWarning | null => {
            if (!step.previousStationDensity || !step.currentStationDensity) {
                return null;
            }

            return analyzeLRTDensity(
                step.previousStationDensity,
                step.currentStationDensity
            );
        },
        []
    );

    // Use custom hook for route consolidation logic
    const { consolidatedSteps } = useRouteConsolidation(
        routeData?.steps,
        endLocation?.name,
        endLocation?.coordinates
    );

    // Reset step index when route changes
    useEffect(() => {
        setCurrentStepIndex(0);
        setAnimateToStep(undefined);
        setShowDestinationReached(false);
    }, [selectedRouteIndex]);

    // Helper to get display info for consolidated steps
    const getConsolidatedMode = useCallback(
        (step: { name: string; distance: number; mode: string }) => {
            if (step.mode === "Walk") {
                return {
                    icon: Footprints,
                    label: `Walk to ${step.name}`,
                    vehicle: "Walk",
                    color: "text-green-600", // Tailwind class
                };
            } else if (step.mode === "LRT-1") {
                return {
                    icon: Train,
                    label: `Take LRT-1 to ${step.name}`,
                    vehicle: "LRT-1",
                    color: "text-yellow-600",
                };
            } else if (step.mode === "LRT-2") {
                return {
                    icon: Train,
                    label: `Take LRT-2 to ${step.name}`,
                    vehicle: "LRT-2",
                    color: "text-purple-600",
                };
            } else if (step.mode === "MRT-3") {
                return {
                    icon: Train,
                    label: `Take MRT-3 to ${step.name}`,
                    vehicle: "MRT-3",
                    color: "text-blue-600",
                };
            } else if (step.mode === "Jeep") {
                return {
                    icon: Bus,
                    label: `Take Jeep to ${step.name}`,
                    vehicle: "Jeep",
                    color: "text-orange-600",
                };
            } else if (step.mode === "Bus") {
                return {
                    icon: Bus,
                    label: `Take Bus to ${step.name}`,
                    vehicle: "Bus",
                    color: "text-red-600",
                };
            } else if (step.mode === "BusTerminal") {
                return {
                    icon: Bus,
                    label: `Arrive at ${step.name}`,
                    vehicle: "BusTerminal",
                    color: "text-red-600",
                };
            }
            return {
                icon: Bus,
                label: step.name,
                vehicle: "Unknown",
                color: "text-gray-400",
            };
        },
        []
    );

    /**
     * Retrieves traffic information for a specific route step
     *
     * @param stepIndex - Index of the route step
     * @returns Traffic color configuration for the step
     */
    const getStepTrafficLevel = (stepIndex: number): TrafficColors => {
        // Use the pre-calculated traffic colors from the map
        const hexColor = trafficColors[stepIndex];

        if (!hexColor) {
            return getTrafficColors("low");
        }

        // Normalize and compare against canonical hex values
        const hc = hexColor.toLowerCase();
        let level: TrafficLevel = "low";
        if (hc === TRAFFIC_HEX_COLORS.MODERATE.toLowerCase())
            level = "moderate";
        else if (hc === TRAFFIC_HEX_COLORS.HIGH.toLowerCase()) level = "high";
        else if (hc === TRAFFIC_HEX_COLORS.SEVERE.toLowerCase())
            level = "severe";
        else if (hc === TRAFFIC_HEX_COLORS.LOW.toLowerCase()) level = "low";

        return getTrafficColors(level);
    };

    // Generate traffic colors for each step using utility function
    const trafficColors = useMemo(
        () =>
            routeData?.coordinates
                ? calculateRouteTrafficColors(
                      routeData.coordinates,
                      consolidatedSteps.length
                  )
                : [],
        [routeData, consolidatedSteps.length]
    );

    // Calculate total trip metrics
    // Use the original route distance from OSRM rather than summing consolidated steps
    // because consolidation may skip steps or adjust distances (e.g., train routes)
    const totalDistance = routeData?.distance || 0;
    const totalDuration = routeData?.duration || 0;

    // Fetch POIs when current step changes
    useEffect(() => {
        const fetchPOIs = async () => {
            // Prevent duplicate fetches for the same step
            if (lastFetchedStepRef.current === currentStepIndex) {
                return;
            }

            if (currentStepIndex >= consolidatedSteps.length) {
                return;
            }

            // Get the coordinates of where the passenger currently is
            // This is the start of the current step, which is the end of the previous step
            let passengerCoords: [number, number] | undefined;

            if (currentStepIndex === 0 && startLocation?.coordinates) {
                // At the beginning, use start location
                passengerCoords = startLocation.coordinates;
            } else if (currentStepIndex > 0) {
                // Use the end coordinates of the previous step
                const previousStep = consolidatedSteps[currentStepIndex - 1];
                passengerCoords = previousStep?.coordinates;
            }

            if (!passengerCoords) {
                console.log("No coordinates for current passenger position");
                return;
            }

            // Create cache key from coordinates
            const cacheKey = `${passengerCoords[0]},${passengerCoords[1]}`;

            // Check cache first
            if (poiCacheRef.current[cacheKey]) {
                console.log("Using cached POIs for:", cacheKey);
                setSelectedPOIs(poiCacheRef.current[cacheKey]);
                lastFetchedStepRef.current = currentStepIndex;
                return;
            }

            // Mark this step as being fetched immediately to prevent race conditions
            lastFetchedStepRef.current = currentStepIndex;

            console.log(
                "Fetching POIs for passenger coordinates:",
                passengerCoords
            );
            setLoadingPOIs(true);
            try {
                const pois = await findNearbyPOIs(
                    passengerCoords[0], // lat
                    passengerCoords[1], // lng
                    500 // 500m radius
                );
                console.log("Found POIs:", pois);

                // Filter to only include POIs within 200m
                const nearbyFiltered = pois.filter(
                    (poi) => (poi.distance || 0) <= 200
                );

                // Randomly select 1-2 establishments once from filtered list
                const count = Math.floor(Math.random() * 2) + 1; // 1 or 2
                const shuffled = [...nearbyFiltered].sort(
                    () => 0.5 - Math.random()
                );
                const selected = shuffled.slice(
                    0,
                    Math.min(count, nearbyFiltered.length)
                );

                // Cache the results
                poiCacheRef.current[cacheKey] = selected;
                setSelectedPOIs(selected);
            } catch (error) {
                console.error("Failed to fetch POIs:", error);
            } finally {
                setLoadingPOIs(false);
            }
        };

        // Only fetch if we have consolidated steps
        if (consolidatedSteps.length > 0) {
            fetchPOIs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentStepIndex,
        consolidatedSteps.length,
        startLocation?.coordinates,
    ]);

    // Timer for waiting state
    useEffect(() => {
        if (currentStepIndex >= consolidatedSteps.length) return;

        // Only initialize timer once per step
        if (initializedStepRef.current === currentStepIndex) return;

        const currentStep = consolidatedSteps[currentStepIndex];
        if (currentStep?.waitingTime) {
            setWaitingTime(currentStep.waitingTime);
            setIsWaiting(true);
            initializedStepRef.current = currentStepIndex;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStepIndex]);

    // Countdown timer
    useEffect(() => {
        if (!isWaiting || waitingTime <= 0) {
            if (waitingTime === 0 && isWaiting) {
                setIsWaiting(false);
            }
            return;
        }

        const timer = setInterval(() => {
            setWaitingTime((prev) => {
                if (prev <= 1) {
                    setIsWaiting(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isWaiting, waitingTime]);

    // Memoize utility functions
    const formatDuration = useCallback((seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.round((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }, []);



    // Memoize event handlers
    const handleGo = useCallback(() => {
        const nextStep = Math.min(
            consolidatedSteps.length,
            currentStepIndex + 1
        );
        setCurrentStepIndex(nextStep);
        // Trigger animation to next step (if not at destination)
        if (nextStep < consolidatedSteps.length) {
            setAnimateToStep(nextStep);
        } else if (nextStep === consolidatedSteps.length) {
            // Show destination reached screen
            setTimeout(() => setShowDestinationReached(true), 500);
        }
    }, [consolidatedSteps.length, currentStepIndex]);

    const handleBackToMap = useCallback(() => {
        setShowDestinationReached(false);
    }, []);

    const handleBackToHome = useCallback(() => {
        onBack();
    }, [onBack]);

    const toggleEstablishmentsView = useCallback(() => {
        setShowEstablishmentsInMain((prev) => !prev);
    }, []);

    const toggleMaximizedView = useCallback(() => {
        setIsMaximized((prev) => !prev);
    }, []);

    const openMaximizedView = useCallback(() => {
        setIsMaximized(true);
    }, []);

    // Show destination reached screen
    if (showDestinationReached) {
        return (
            <DestinationReached
                locationName={endLocation?.name}
                totalDistance={totalDistance}
                totalDuration={totalDuration}
                onViewRoute={handleBackToMap}
                onBackToHome={handleBackToHome}
            />
        );
    }

    // Show maximized view modal
    if (isMaximized) {
        const showingEstablishments = showEstablishmentsInMain;

        return (
            <div className="h-[95vh] w-[430px] bg-background flex flex-col overflow-hidden">
                {/* Modal Header */}
                <header className="border-b bg-card flex-shrink-0">
                    <div className="px-4 py-3 flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMaximizedView}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-blue-600">
                                {showingEstablishments
                                    ? "Nearby Places"
                                    : "Route Steps"}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {showingEstablishments
                                    ? `${selectedPOIs.length} establishments nearby`
                                    : `${consolidatedSteps.length} steps to destination`}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {showingEstablishments ? (
                        // Show establishments grouped by type
                        <>
                            {loadingPOIs ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Loading nearby places...
                                </p>
                            ) : selectedPOIs.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No establishments found nearby
                                </p>
                            ) : (
                                (() => {
                                    // Group POIs by type
                                    const grouped = selectedPOIs.reduce(
                                        (acc, poi) => {
                                            if (!acc[poi.type]) {
                                                acc[poi.type] = [];
                                            }
                                            acc[poi.type].push(poi);
                                            return acc;
                                        },
                                        {} as Record<string, POI[]>
                                    );

                                    return (
                                        <div className="space-y-4">
                                            {Object.entries(grouped).map(
                                                ([type, pois]) => (
                                                    <div key={type}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-lg">
                                                                {POI_CATEGORIES[
                                                                    type
                                                                ]?.icon || "📍"}
                                                            </span>
                                                            <h3 className="text-sm font-semibold text-blue-600">
                                                                {POI_CATEGORIES[
                                                                    type
                                                                ]?.label ||
                                                                    type}
                                                            </h3>
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-auto"
                                                            >
                                                                {pois.length}
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {pois.map((poi) => (
                                                                <Card
                                                                    key={poi.id}
                                                                    className="border-muted"
                                                                >
                                                                    <CardContent className="p-3">
                                                                        <div className="flex items-start gap-3">
                                                                            <span className="text-xl">
                                                                                {POI_CATEGORIES[
                                                                                    poi
                                                                                        .type
                                                                                ]
                                                                                    ?.icon ||
                                                                                    "📍"}
                                                                            </span>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium">
                                                                                    {poi.name ||
                                                                                        "Unnamed"}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                    {
                                                                                        poi.distance
                                                                                    }

                                                                                    m
                                                                                    away
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    );
                                })()
                            )}
                        </>
                    ) : (
                        // Show all route steps
                        <div className="space-y-3">
                            {consolidatedSteps.map((step, idx) => {
                                const mode = getConsolidatedMode(step);
                                const Icon = mode.icon;
                                const traffic = getStepTrafficLevel(idx);
                                const isCurrentStep = idx === currentStepIndex;

                                return (
                                    <Card
                                        key={idx}
                                        className={`${
                                            isCurrentStep
                                                ? "border-blue-600 shadow-md"
                                                : "border-muted"
                                        }`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <div
                                                        className={`h-10 w-10 rounded-full ${
                                                            isCurrentStep
                                                                ? "bg-blue-600/20"
                                                                : "bg-muted"
                                                        } flex items-center justify-center`}
                                                    >
                                                        <Icon
                                                            className="h-5 w-5"
                                                            style={{
                                                                color: mode.color,
                                                                opacity:
                                                                    isCurrentStep
                                                                        ? 1
                                                                        : 0.75,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge
                                                            variant={
                                                                isCurrentStep
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            Step {idx + 1}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {mode.vehicle}
                                                        </Badge>
                                                        {step.mode !==
                                                            "BusTerminal" &&
                                                            (() => {
                                                                const mode =
                                                                    getConsolidatedMode(
                                                                        step
                                                                    );
                                                                const isLRTMRT =
                                                                    mode.vehicle.includes(
                                                                        "LRT"
                                                                    ) ||
                                                                    mode.vehicle.includes(
                                                                        "MRT"
                                                                    );

                                                                if (
                                                                    isLRTMRT &&
                                                                    step.previousStationDensity !==
                                                                        undefined &&
                                                                    step.currentStationDensity !==
                                                                        undefined
                                                                ) {
                                                                    const densityWarning =
                                                                        getDensityWarning(
                                                                            step
                                                                        );
                                                                    if (
                                                                        densityWarning
                                                                    ) {
                                                                        return (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={`text-xs ${densityWarning.color}`}
                                                                            >
                                                                                {" "}
                                                                                {densityWarning.level
                                                                                    .charAt(
                                                                                        0
                                                                                    )
                                                                                    .toUpperCase() +
                                                                                    densityWarning.level.slice(
                                                                                        1
                                                                                    )}{" "}
                                                                                Density
                                                                            </Badge>
                                                                        );
                                                                    }
                                                                }

                                                                // Default traffic display for non-LRT/MRT
                                                                return (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`text-xs ${traffic.textColor}`}
                                                                    >
                                                                        {formatTrafficLevel(
                                                                            traffic.level
                                                                        )}
                                                                    </Badge>
                                                                );
                                                            })()}
                                                    </div>
                                                    <p className="text-sm font-medium mb-1">
                                                        {mode.label}
                                                    </p>
                                                    <div className="flex gap-3 text-xs text-muted-foreground">
                                                        <span>
                                                            {(
                                                                step.distance /
                                                                1000
                                                            ).toFixed(1)}{" "}
                                                            km
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {Math.round(
                                                                step.duration /
                                                                    60
                                                            )}{" "}
                                                            min
                                                        </span>
                                                        {step.waitingTime && (
                                                            <>
                                                                <span>•</span>
                                                                <span>
                                                                    Wait:{" "}
                                                                    {
                                                                        step.waitingTime
                                                                    }
                                                                    s
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-[95vh] w-[430px] bg-background flex flex-col overflow-hidden">
            {/* Header with Back Button */}
            <header className="border-b bg-card flex-shrink-0">
                <div className="px-4 py-3 pb-2 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="h-8 w-8 p-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-blue-600">
                            Route Details
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Review your journey
                        </p>
                    </div>
                    {/* Route Summary Stats */}
                    <div className="flex gap-3 text-sm">
                        <div className="text-right">
                            <p className="font-semibold text-blue-600">
                                {formatDuration(totalDuration)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Duration
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-blue-600">
                                {(totalDistance / 1000).toFixed(1)} km
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Distance
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alternative Routes Selector */}
                {routes && routes.length > 1 && (
                    <div className="px-4 pb-2 border-t pt-2 scrollbar-none overflow-x-auto">
                        <div className="flex gap-2">
                        {routes.map((route, idx) => {
                            const isSelected = idx === selectedRouteIndex;
                            const duration = Math.round(route.duration / 60);
                            const distance = (route.distance / 1000).toFixed(1);
                            
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedRouteIndex(idx)}
                                    className={`
                                        flex flex-col items-start min-w-[100px] px-3 py-1.5 rounded-lg border text-xs transition-all
                                        ${isSelected 
                                            ? 'bg-blue-600/10 border-blue-600 shadow-sm' 
                                            : 'bg-background border-muted hover:bg-accent/50'
                                        }
                                    `}
                                >
                                    <span className={`font-semibold ${isSelected ? 'text-blue-600' : 'text-foreground'}`}>
                                        Route {idx + 1}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {duration} min • {distance} km
                                    </span>
                                </button>
                            );
                        })}
                        </div>
                    </div>
                )}
            </header>

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 flex-shrink-0">
                    {/* Location Inputs */}
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="from" className="text-sm">
                                Starting Point
                            </Label>
                            <Input
                                id="from"
                                disabled
                                value={
                                    startLocation
                                        ? `${startLocation.name} (${startLocation.area})`
                                        : ""
                                }
                                className="disabled:opacity-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="to" className="text-sm">
                                Destination
                            </Label>
                            <Input
                                id="to"
                                disabled
                                value={
                                    endLocation
                                        ? `${endLocation.name} (${endLocation.area})`
                                        : ""
                                }
                                className="disabled:opacity-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Map Display with Overlay Card */}
                <div className="flex-1 relative">
                    <div className="absolute inset-0 z-0">
                        <Map
                            startCoords={startLocation?.coordinates}
                            endCoords={endLocation?.coordinates}
                            currentStepProgress={currentStepIndex}
                            routeSteps={consolidatedSteps}
                            trafficColors={trafficColors}
                            animateToStep={animateToStep}
                            poiMarkers={selectedPOIs.map((poi) => ({
                                lat: poi.lat,
                                lng: poi.lng,
                                name: poi.name,
                                type: poi.type,
                            }))}
                            routes={routes}
                            selectedRouteIndex={selectedRouteIndex}
                            onRouteSelect={setSelectedRouteIndex}
                        />
                    </div>

                    {/* Route Step Card Overlay */}
                    {routeData &&
                        routeData.steps &&
                        consolidatedSteps.length > 0 && (
                            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                                <div className="space-y-1">
                                    {/* Thin Summary Card */}
                                    {currentStepIndex <
                                        consolidatedSteps.length &&
                                        (() => {
                                            const traffic =
                                                getStepTrafficLevel(
                                                    currentStepIndex
                                                );
                                            const bgColorMap = {
                                                low: "bg-green-50/95",
                                                moderate: "bg-yellow-50/95",
                                                high: "bg-orange-50/95",
                                                severe: "bg-red-50/95",
                                            };
                                            const borderColorMap = {
                                                low: "border-green-500/30",
                                                moderate:
                                                    "border-yellow-500/30",
                                                high: "border-orange-500/30",
                                                severe: "border-red-500/30",
                                            };
                                            const dotColorMap = {
                                                low: "bg-green-500",
                                                moderate: "bg-yellow-500",
                                                high: "bg-orange-500",
                                                severe: "bg-red-500",
                                            };
                                            const textColorMap = {
                                                low: "text-green-900",
                                                moderate: "text-yellow-900",
                                                high: "text-orange-900",
                                                severe: "text-red-900",
                                            };
                                            const textLightColorMap = {
                                                low: "text-green-700",
                                                moderate: "text-yellow-700",
                                                high: "text-orange-700",
                                                severe: "text-red-700",
                                            };
                                            const badgeColorMap = {
                                                low: "bg-green-500",
                                                moderate: "bg-yellow-500",
                                                high: "bg-orange-500",
                                                severe: "bg-red-500",
                                            };

                                            // Determine thin card background color
                                            const thinCardBg =
                                                showEstablishmentsInMain
                                                    ? `${
                                                          bgColorMap[
                                                              traffic.level
                                                          ]
                                                      } backdrop-blur ${
                                                          borderColorMap[
                                                              traffic.level
                                                          ]
                                                      }`
                                                    : "bg-background/95 backdrop-blur border-blue-600/20";

                                            return (
                                                <Card
                                                    className={`${thinCardBg} py-0`}
                                                >
                                                    <CardContent className="p-2 px-3">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                {showEstablishmentsInMain ? (
                                                                    // Show waiting/step info with traffic
                                                                    <>
                                                                        <div
                                                                            className={`h-2 w-2 rounded-full ${
                                                                                dotColorMap[
                                                                                    traffic
                                                                                        .level
                                                                                ]
                                                                            } animate-pulse flex-shrink-0`}
                                                                        />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p
                                                                                className={`text-xs font-medium ${
                                                                                    textColorMap[
                                                                                        traffic
                                                                                            .level
                                                                                    ]
                                                                                }`}
                                                                            >
                                                                                {isWaiting
                                                                                    ? `Waiting for ${
                                                                                          getConsolidatedMode(
                                                                                              consolidatedSteps[
                                                                                                  currentStepIndex
                                                                                              ]
                                                                                          )
                                                                                              .vehicle
                                                                                      } to ${
                                                                                          consolidatedSteps[
                                                                                              currentStepIndex
                                                                                          ]
                                                                                              .name
                                                                                      }`
                                                                                    : `Take ${
                                                                                          getConsolidatedMode(
                                                                                              consolidatedSteps[
                                                                                                  currentStepIndex
                                                                                              ]
                                                                                          )
                                                                                              .vehicle
                                                                                      } to ${
                                                                                          consolidatedSteps[
                                                                                              currentStepIndex
                                                                                          ]
                                                                                              .name
                                                                                      }`}
                                                                            </p>
                                                                            {(() => {
                                                                                // Check if current step is LRT/MRT and has density info
                                                                                const currentStep =
                                                                                    consolidatedSteps[
                                                                                        currentStepIndex
                                                                                    ];
                                                                                const stepModeInfo =
                                                                                    getConsolidatedMode(
                                                                                        currentStep
                                                                                    );
                                                                                const isLRTMRT =
                                                                                    stepModeInfo.vehicle.includes(
                                                                                        "LRT"
                                                                                    ) ||
                                                                                    stepModeInfo.vehicle.includes(
                                                                                        "MRT"
                                                                                    );

                                                                                // Debug logging
                                                                                console.log(
                                                                                    "[Density Check]",
                                                                                    {
                                                                                        stepName:
                                                                                            currentStep.name,
                                                                                        vehicle:
                                                                                            stepModeInfo.vehicle,
                                                                                        isLRTMRT,
                                                                                        prevDensity:
                                                                                            currentStep.previousStationDensity,
                                                                                        currDensity:
                                                                                            currentStep.currentStationDensity,
                                                                                    }
                                                                                );

                                                                                if (
                                                                                    isLRTMRT &&
                                                                                    currentStep.previousStationDensity !==
                                                                                        undefined &&
                                                                                    currentStep.currentStationDensity !==
                                                                                        undefined
                                                                                ) {
                                                                                    const densityWarning =
                                                                                        getDensityWarning(
                                                                                            currentStep
                                                                                        );
                                                                                    if (
                                                                                        densityWarning
                                                                                    ) {
                                                                                        console.log(
                                                                                            "[Density Warning]",
                                                                                            densityWarning
                                                                                        );
                                                                                        return (
                                                                                            <p
                                                                                                className={`text-xs ${densityWarning.color} mt-0.5`}
                                                                                            >
                                                                                                {" "}
                                                                                                {
                                                                                                    densityWarning.message
                                                                                                }
                                                                                            </p>
                                                                                        );
                                                                                    }
                                                                                }

                                                                                // Default traffic info
                                                                                return (
                                                                                    <p
                                                                                        className={`text-xs ${
                                                                                            textLightColorMap[
                                                                                                traffic
                                                                                                    .level
                                                                                            ]
                                                                                        } mt-0.5`}
                                                                                    >
                                                                                        Traffic:{" "}
                                                                                        {formatTrafficLevel(
                                                                                            traffic.level
                                                                                        )}
                                                                                    </p>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    // Show establishments summary
                                                                    <>
                                                                        <Store className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium text-blue-600">
                                                                                {
                                                                                    selectedPOIs.length
                                                                                }{" "}
                                                                                establishment
                                                                                {selectedPOIs.length !==
                                                                                    1 &&
                                                                                    "s"}{" "}
                                                                                nearby
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {isWaiting &&
                                                                showEstablishmentsInMain && (
                                                                    <Badge
                                                                        className={`${
                                                                            badgeColorMap[
                                                                                traffic
                                                                                    .level
                                                                            ]
                                                                        } text-white flex-shrink-0`}
                                                                    >
                                                                        ETA{" "}
                                                                        {
                                                                            waitingTime
                                                                        }
                                                                        s
                                                                    </Badge>
                                                                )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 flex-shrink-0"
                                                                onClick={
                                                                    toggleEstablishmentsView
                                                                }
                                                            >
                                                                {showEstablishmentsInMain ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronUp className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })()}

                                    <Card
                                        className={
                                            "border-blue-600/20 bg-background/95 backdrop-blur shadow-lg"
                                        }
                                    >
                                        <CardContent className="p-4 pt-1">
                                            {currentStepIndex ===
                                            consolidatedSteps.length ? (
                                                <div className="flex items-center gap-2 py-1">
                                                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                        <svg
                                                            className="h-4 w-4 text-green-600"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-xs font-semibold text-blue-600">
                                                            Destination Reached!
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            {endLocation?.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : showEstablishmentsInMain ? (
                                                <>
                                                    {/* Show Nearby Establishments While Waiting */}
                                                    <div className="flex items-center justify-between gap-2 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Store className="h-4 w-4 text-blue-600" />
                                                            <span className="text-sm font-semibold">
                                                                Explore Nearby
                                                            </span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0"
                                                            onClick={
                                                                toggleMaximizedView
                                                            }
                                                        >
                                                            <Maximize2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                                        {loadingPOIs ? (
                                                            <p className="text-xs text-muted-foreground text-center py-4">
                                                                Loading nearby
                                                                places...
                                                            </p>
                                                        ) : selectedPOIs.length ===
                                                          0 ? (
                                                            <p className="text-xs text-muted-foreground text-center py-4">
                                                                No
                                                                establishments
                                                                found nearby
                                                            </p>
                                                        ) : (
                                                            selectedPOIs.map(
                                                                (poi) => (
                                                                    <div
                                                                        key={poi.id}
                                                                        className="group flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card/80 border border-border/50 hover:border-blue-600/20 shadow-sm transition-all duration-300 backdrop-blur-sm cursor-pointer"
                                                                    >
                                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600/10 to-blue-600/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                                            <span className="text-lg filter drop-shadow-sm">
                                                                                {POI_CATEGORIES[
                                                                                    poi.type
                                                                                ]?.icon || "📍"}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        <div className="flex-1 min-w-0">
                                                                            <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-blue-600 transition-colors">
                                                                                {poi.name || "Unnamed Place"}
                                                                            </h4>
                                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                                                <span className="bg-blue-600/5 px-1.5 py-0.5 rounded text-blue-600/80 font-medium text-[10px] uppercase tracking-wider">
                                                                                    {POI_CATEGORIES[poi.type]?.label || poi.type}
                                                                                </span>
                                                                                <span>•</span>
                                                                                <span>{poi.distance}m away</span>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                                                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Show Step Details */}
                                                    {/* Traffic Level Header - Only show for non-BusTerminal steps */}
                                                    {consolidatedSteps[
                                                        currentStepIndex
                                                    ]?.mode !== "BusTerminal" &&
                                                        (() => {
                                                            const currentStep =
                                                                consolidatedSteps[
                                                                    currentStepIndex
                                                                ];
                                                            const traffic =
                                                                getStepTrafficLevel(
                                                                    currentStepIndex
                                                                );

                                                            // Check if this is an LRT/MRT step with density info
                                                            const stepModeInfo =
                                                                getConsolidatedMode(
                                                                    currentStep
                                                                );
                                                            const isLRTMRT =
                                                                stepModeInfo.vehicle.includes(
                                                                    "LRT"
                                                                ) ||
                                                                stepModeInfo.vehicle.includes(
                                                                    "MRT"
                                                                );

                                                            if (
                                                                isLRTMRT &&
                                                                currentStep.previousStationDensity !==
                                                                    undefined &&
                                                                currentStep.currentStationDensity !==
                                                                    undefined
                                                            ) {
                                                                const densityWarning =
                                                                    getDensityWarning(
                                                                        currentStep
                                                                    );
                                                                if (
                                                                    densityWarning
                                                                ) {
                                                                    // Log for debugging
                                                                    console.log(
                                                                        `[Density Display] Step: ${currentStep.name}, Index: ${currentStepIndex}, Level: ${densityWarning.level}`
                                                                    );

                                                                    return (
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <div
                                                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg flex-1 ${
                                                                                    densityWarning.level ===
                                                                                    "high"
                                                                                        ? "bg-red-50"
                                                                                        : densityWarning.level ===
                                                                                          "moderate"
                                                                                        ? "bg-yellow-50"
                                                                                        : "bg-green-50"
                                                                                }`}
                                                                            >
                                                                                <span className="text-xl"></span>
                                                                                <span
                                                                                    className={`text-sm font-semibold ${densityWarning.color}`}
                                                                                >
                                                                                    {densityWarning.level
                                                                                        .charAt(
                                                                                            0
                                                                                        )
                                                                                        .toUpperCase() +
                                                                                        densityWarning.level.slice(
                                                                                            1
                                                                                        )}{" "}
                                                                                    Density
                                                                                </span>
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0"
                                                                                onClick={
                                                                                    openMaximizedView
                                                                                }
                                                                            >
                                                                                <Maximize2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    );
                                                                }
                                                            }

                                                            // Log for debugging
                                                            console.log(
                                                                `[Traffic Display] Step: ${currentStep.name}, Index: ${currentStepIndex}, Level: ${traffic.level}`
                                                            );

                                                            return (
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div
                                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg flex-1 ${traffic.bgColor}`}
                                                                    >
                                                                        <svg
                                                                            className={`h-4 w-4 ${traffic.textColor}`}
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={
                                                                                    2
                                                                                }
                                                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                            />
                                                                        </svg>
                                                                        <span
                                                                            className={`text-sm font-semibold ${traffic.textColor}`}
                                                                        >
                                                                            {formatTrafficLevel(
                                                                                traffic.level
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                        onClick={
                                                                            openMaximizedView
                                                                        }
                                                                    >
                                                                        <Maximize2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            );
                                                        })()}

                                                    {/* Maximize button for BusTerminal steps (no traffic display) */}
                                                    {consolidatedSteps[
                                                        currentStepIndex
                                                    ]?.mode ===
                                                        "BusTerminal" && (
                                                        <div className="flex items-center justify-end mb-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={
                                                                    openMaximizedView
                                                                }
                                                            >
                                                                <Maximize2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* Step Details */}
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center">
                                                                {(() => {
                                                                    const mode =
                                                                        getConsolidatedMode(
                                                                            consolidatedSteps[
                                                                                currentStepIndex
                                                                            ]
                                                                        );
                                                                    const Icon =
                                                                        mode.icon;
                                                                    return (
                                                                        <Icon
                                                                            className="h-6 w-6"
                                                                            style={{
                                                                                color: mode.color,
                                                                            }}
                                                                        />
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <Badge variant="secondary">
                                                                    {
                                                                        getConsolidatedMode(
                                                                            consolidatedSteps[
                                                                                currentStepIndex
                                                                            ]
                                                                        )
                                                                            .vehicle
                                                                    }
                                                                </Badge>
                                                                <Badge variant="outline">
                                                                    {(
                                                                        consolidatedSteps[
                                                                            currentStepIndex
                                                                        ]
                                                                            .distance /
                                                                        1000
                                                                    ).toFixed(
                                                                        1
                                                                    )}{" "}
                                                                    km
                                                                </Badge>
                                                                <Badge variant="outline">
                                                                    {Math.round(
                                                                        consolidatedSteps[
                                                                            currentStepIndex
                                                                        ]
                                                                            .duration /
                                                                            60
                                                                    )}{" "}
                                                                    min
                                                                </Badge>
                                                                {isWaiting && (
                                                                    <Badge className="bg-blue-600 text-white">
                                                                        ETA{" "}
                                                                        {
                                                                            waitingTime
                                                                        }
                                                                        s
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-medium">
                                                                {isWaiting
                                                                    ? `Waiting for ${
                                                                          getConsolidatedMode(
                                                                              consolidatedSteps[
                                                                                  currentStepIndex
                                                                              ]
                                                                          )
                                                                              .vehicle
                                                                      }...`
                                                                    : getConsolidatedMode(
                                                                          consolidatedSteps[
                                                                              currentStepIndex
                                                                          ]
                                                                      ).label}
                                                            </p>
                                                            {/* Add density information for LRT/MRT steps */}
                                                            {(() => {
                                                                const currentStep =
                                                                    consolidatedSteps[
                                                                        currentStepIndex
                                                                    ];
                                                                const stepModeInfo =
                                                                    getConsolidatedMode(
                                                                        currentStep
                                                                    );
                                                                const isLRTMRT =
                                                                    stepModeInfo.vehicle.includes(
                                                                        "LRT"
                                                                    ) ||
                                                                    stepModeInfo.vehicle.includes(
                                                                        "MRT"
                                                                    );

                                                                if (
                                                                    isLRTMRT &&
                                                                    currentStep.previousStationDensity !==
                                                                        undefined &&
                                                                    currentStep.currentStationDensity !==
                                                                        undefined
                                                                ) {
                                                                    const densityWarning =
                                                                        getDensityWarning(
                                                                            currentStep
                                                                        );
                                                                    if (
                                                                        densityWarning
                                                                    ) {
                                                                        return (
                                                                            <p
                                                                                className={`text-xs mt-1 ${densityWarning.color}`}
                                                                            >
                                                                                {" "}
                                                                                {
                                                                                    densityWarning.message
                                                                                }
                                                                                {densityWarning.waitForNext && (
                                                                                    <span className="block mt-1 font-medium">
                                                                                        💡
                                                                                        Recommendation:
                                                                                        Wait
                                                                                        for
                                                                                        the
                                                                                        train
                                                                                        after
                                                                                        next
                                                                                    </span>
                                                                                )}
                                                                            </p>
                                                                        );
                                                                    }
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {!isWaiting && (
                                        <Button
                                            variant="outline"
                                            onClick={
                                                currentStepIndex ===
                                                consolidatedSteps.length
                                                    ? handleBackToHome
                                                    : handleGo
                                            }
                                            className="w-full bg-background/95 backdrop-blur"
                                        >
                                            {currentStepIndex ===
                                            consolidatedSteps.length
                                                ? "Back to Dashboard"
                                                : "GO"}
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
