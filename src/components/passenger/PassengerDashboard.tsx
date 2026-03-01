import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recentTrips } from "@/data/trips";
import {
    startingPoints,
    destinationPoints,
    type Location,
} from "@/data/locations";
import Map, { type RouteData } from "@/components/Map";
import PassengerRouteView from "./PassengerRouteView";
import { calculateRouteTrafficColors } from "@/lib/trafficUtils";
import { Map as MapIcon, Compass, Bus, Train, Coffee, ShoppingBag, Clock, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockStations, getCrowdLevel } from "@/data/operator-data";
import { mockTrips, mockRoutes } from "@/data/schedule";

type TabType = "travel" | "explore" | "bus" | "train";

const tabs = [
    { id: "travel" as TabType, label: "Travel", icon: MapIcon },
    { id: "explore" as TabType, label: "Explore", icon: Compass },
    { id: "bus" as TabType, label: "Bus", icon: Bus },
    { id: "train" as TabType, label: "Train", icon: Train },
];

// Mock nearby stores (from ad zones)
const nearbyStores = [
    { name: "7-Eleven", type: "Convenience Store", distance: "50m", icon: ShoppingBag },
    { name: "Starbucks", type: "Coffee Shop", distance: "120m", icon: Coffee },
    { name: "Mercury Drug", type: "Pharmacy", distance: "200m", icon: ShoppingBag },
    { name: "Jollibee", type: "Restaurant", distance: "150m", icon: ShoppingBag },
];

interface PassengerDashboardProps {
    onLogout?: () => void;
}

export default function PassengerDashboard({ onLogout }: PassengerDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>("travel");
    const [selectedStart, setSelectedStart] = useState<Location | null>(null);
    const [selectedEnd, setSelectedEnd] = useState<Location | null>(null);
    const [showRouteView, setShowRouteView] = useState(false);
    const [routeData, setRouteData] = useState<RouteData | null>(null);
    const [routes, setRoutes] = useState<RouteData[]>([]);
    const [selectedStation, setSelectedStation] = useState<string>("North Avenue");
    const [selectedTerminal, setSelectedTerminal] = useState<string>("PITX");
    const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());

    /**
     * Calculates traffic colors for route visualization
     * Memoized to prevent unnecessary recalculations
     */
    const trafficColors = useMemo(() => {
        // Use the first route (or selected) for the dashboard preview
        const activeRoute = routes.length > 0 ? routes[0] : routeData;
        
        if (!activeRoute?.coordinates || !activeRoute?.steps) {
            return [];
        }

        return calculateRouteTrafficColors(
            activeRoute.coordinates,
            activeRoute.steps.length
        );
    }, [routes, routeData]);

    const handleTravel = () => {
        if (selectedStart && selectedEnd) {
            setShowRouteView(true);
        }
    };

    const handleBack = () => {
        setShowRouteView(false);
    };

    const handleStartJourney = () => {
        // Handle starting the journey
        console.log("Journey started");
    };

    const handleRouteCalculated = (calculatedRoutes: RouteData[] | null) => {
        if (calculatedRoutes && calculatedRoutes.length > 0) {
            setRoutes(calculatedRoutes);
            setRouteData(calculatedRoutes[0]); // Backward compatibility
        } else {
            setRoutes([]);
            setRouteData(null);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "travel":
                return (
                    <div className="p-4 space-y-6">
                        {/* Recent Trips */}
                        <div className="space-y-3">
                            <div>
                                <h2 className="text-lg font-semibold">Recent Trips</h2>
                                <p className="text-xs text-muted-foreground">Your travel history</p>
                            </div>
                            <div className="space-y-2">
                                {recentTrips.map((trip, index) => (
                                    <div key={trip.id}>
                                        <div
                                            className="cursor-pointer hover:bg-accent/50 px-2 py-1.5 rounded-md transition-colors"
                                            onClick={() => handleTripClick(trip)}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 text-xs flex-1 min-w-0">
                                                    <span className="font-medium truncate">{trip.from}</span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className="font-medium truncate">{trip.to}</span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-xs text-muted-foreground">{trip.date}</span>
                                                    <span className="text-xs text-muted-foreground">{trip.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {index < recentTrips.length - 1 && <Separator className="my-2" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Map Display */}
                        <div className="space-y-3">
                            <div>
                                <h2 className="text-lg font-semibold">Plan Route</h2>
                                <p className="text-xs text-muted-foreground">Find your best path</p>
                            </div>
                            <div className="aspect-video rounded-lg overflow-hidden border">
                                <Map
                                    startCoords={selectedStart?.coordinates}
                                    endCoords={selectedEnd?.coordinates}
                                    onRouteCalculated={handleRouteCalculated}
                                    routeSteps={routeData?.steps || []}
                                    trafficColors={trafficColors}
                                />
                            </div>
                        </div>

                        {/* Travel Section */}
                        <div className="space-y-3">
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="from" className="text-sm">Starting Point</Label>
                                    <select
                                        id="from"
                                        value={selectedStart?.id || ""}
                                        onChange={(e) => {
                                            const location = startingPoints.find(
                                                (p) => p.id === parseInt(e.target.value)
                                            );
                                            setSelectedStart(location || null);
                                        }}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">Select starting point...</option>
                                        {startingPoints.map((point) => (
                                            <option key={point.id} value={point.id}>
                                                {point.name} ({point.area})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="to" className="text-sm">Destination</Label>
                                    <select
                                        id="to"
                                        value={selectedEnd?.id || ""}
                                        onChange={(e) => {
                                            const location = destinationPoints.find(
                                                (p) => p.id === parseInt(e.target.value)
                                            );
                                            setSelectedEnd(location || null);
                                        }}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">Select destination...</option>
                                        {destinationPoints.map((point) => (
                                            <option key={point.id} value={point.id}>
                                                {point.name} ({point.area})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleTravel}
                                    disabled={!selectedStart || !selectedEnd}
                                >
                                    Travel
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case "explore":
                return (
                    <div className="p-4 space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">Nearby</h2>
                            <p className="text-xs text-muted-foreground">Shops & services near you</p>
                        </div>
                        {nearbyStores.map((store) => (
                            <Card key={store.name} className="hover:bg-accent/50 cursor-pointer transition-colors">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-primary/10">
                                            <store.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm">{store.name}</h3>
                                            <p className="text-xs text-muted-foreground">{store.type}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{store.distance}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Powered by NexStation Ads
                        </p>
                    </div>
                );

            case "bus":
                const nextBuses = mockTrips.filter(t => t.status === 'boarding' || t.status === 'arriving').slice(0, 5);
                return (
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Select Terminal</Label>
                            <select
                                value={selectedTerminal}
                                onChange={(e) => setSelectedTerminal(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="PITX">PITX Terminal</option>
                                <option value="Cubao">Cubao Terminal</option>
                                <option value="Pasay">Pasay Terminal</option>
                            </select>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">Next Buses</h2>
                            <p className="text-xs text-muted-foreground">Live departure times at {selectedTerminal}</p>
                        </div>

                        {nextBuses.map((trip) => {
                            const route = mockRoutes.find(r => r.id === trip.route_id);
                            const statusConfig = {
                                arriving: { bg: "bg-blue-500/10", text: "text-blue-600", badge: "Arriving" },
                                boarding: { bg: "bg-green-500/10", text: "text-green-600", badge: "Boarding Now" },
                                delayed: { bg: "bg-red-500/10", text: "text-red-600", badge: "Delayed" },
                                departed: { bg: "bg-purple-500/10", text: "text-purple-600", badge: "Departed" },
                                scheduled: { bg: "bg-gray-500/10", text: "text-gray-600", badge: "Scheduled" },
                                cancelled: { bg: "bg-orange-500/10", text: "text-orange-600", badge: "Cancelled" },
                            }[trip.status] || { bg: "", text: "", badge: "" };

                            return (
                                <Card key={trip.id} className={cn("transition-colors", statusConfig.bg)}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm">{route?.destination}</h3>
                                                <p className="text-xs text-muted-foreground">Bus #{trip.bus_id} • Gate {trip.gate}</p>
                                            </div>
                                            <Badge className={statusConfig.text} variant="outline">
                                                {statusConfig.badge}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Clock className="h-3 w-3" />
                                            <span>{trip.scheduled_time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Real-time data by Bus Operators
                        </p>
                    </div>
                );

            case "train":
                const station = mockStations.find(s => s.name === selectedStation);
                const crowdLevel = station ? getCrowdLevel(station.currentCrowd, station.capacity) : "low";
                const crowdConfig = {
                    low: { color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Not Crowded" },
                    moderate: { color: "text-amber-600", bg: "bg-amber-500/10", label: "Moderate" },
                    high: { color: "text-orange-600", bg: "bg-orange-500/10", label: "Crowded" },
                    critical: { color: "text-red-600", bg: "bg-red-500/10", label: "Very Crowded" },
                }[crowdLevel];

                // Group stations by line
                const stationsByLine = mockStations.reduce((acc, s) => {
                    if (!acc[s.line]) acc[s.line] = [];
                    acc[s.line].push(s);
                    return acc;
                }, {} as Record<string, typeof mockStations>);

                const lines = Object.keys(stationsByLine);

                return (
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Select Station</Label>
                            <select
                                value={selectedStation}
                                onChange={(e) => setSelectedStation(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {mockStations.map((s) => (
                                    <option key={s.id} value={s.name}>{s.name} ({s.line})</option>
                                ))}
                            </select>
                        </div>

                        <Card className={crowdConfig.bg}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Current Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Crowd Level</span>
                                        <Badge className={crowdConfig.color} variant="outline">
                                            {crowdConfig.label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Next Train</span>
                                        <span className="text-sm font-medium">~5 minutes</span>
                                    </div>
                                    {station?.status === "operational" ? (
                                        <Badge variant="outline" className="text-green-600 w-full justify-center">
                                            Operational
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-orange-600 w-full justify-center">
                                            {station?.status}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div>
                            <h3 className="text-sm font-semibold mb-2">Stations by Line</h3>
                            {lines.map((line) => {
                                const lineStations = stationsByLine[line];
                                const isExpanded = expandedLines.has(line);
                                const displayStations = isExpanded ? lineStations : lineStations.slice(0, 2);
                                
                                return (
                                    <Card key={line} className="mb-3">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-semibold">{line}</CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newExpanded = new Set(expandedLines);
                                                        if (isExpanded) {
                                                            newExpanded.delete(line);
                                                        } else {
                                                            newExpanded.add(line);
                                                        }
                                                        setExpandedLines(newExpanded);
                                                    }}
                                                    className="h-7"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="h-4 w-4 mr-1" />
                                                            <span className="text-xs">Collapse</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="h-4 w-4 mr-1" />
                                                            <span className="text-xs">Expand ({lineStations.length})</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {displayStations.map((s) => {
                                                const level = getCrowdLevel(s.currentCrowd, s.capacity);
                                                const config = {
                                                    low: { color: "text-emerald-600", label: "Not crowded" },
                                                    moderate: { color: "text-amber-600", label: "Moderate" },
                                                    high: { color: "text-orange-600", label: "Crowded" },
                                                    critical: { color: "text-red-600", label: "Very crowded" },
                                                }[level];

                                                return (
                                                    <div
                                                        key={s.id} 
                                                        className={cn(
                                                            "p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors border",
                                                            s.name === selectedStation && "border-primary bg-primary/5"
                                                        )}
                                                        onClick={() => setSelectedStation(s.name)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-semibold text-sm">{s.name}</h4>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {s.currentCrowd}/{s.capacity} passengers
                                                                </p>
                                                            </div>
                                                            <Badge className={config.color} variant="outline">
                                                                {config.label}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Real-time data by Train Operators
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    if (showRouteView) {
        return (
            <PassengerRouteView
                startLocation={selectedStart}
                endLocation={selectedEnd}
                // routeData={routeData} // Deprecated prop on PassengerRouteView? need to update it too
                routes={routes} // New prop
                onBack={handleBack}
                onGo={handleStartJourney}
            />
        );
    }

    const handleTripClick = (trip: (typeof recentTrips)[0]) => {
        // Find matching locations by name
        const startLocation = [...startingPoints, ...destinationPoints].find(
            (loc) => loc.name === trip.from || trip.from.includes(loc.name)
        );
        const endLocation = [...startingPoints, ...destinationPoints].find(
            (loc) => loc.name === trip.to || trip.to.includes(loc.name)
        );

        console.log("Trip clicked:", {
            trip,
            startLocation,
            endLocation,
        });

        if (startLocation) {
            setSelectedStart(startLocation);
        }
        if (endLocation) {
            setSelectedEnd(endLocation);
        }
    };

    return (
        <div className="h-[95vh] w-[430px] bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b bg-card flex-shrink-0">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-blue-600">
                            NexStation
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Your journey starts here
                        </p>
                    </div>
                    {onLogout && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onLogout}
                            className="text-muted-foreground hover:text-blue-600"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>

            {/* Bottom Navigation */}
            <nav className="border-t bg-card flex-shrink-0">
                <div className="flex items-center justify-around px-2 py-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all w-full",
                                    isActive 
                                        ? "text-blue-600 bg-blue-50" 
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 mb-1", isActive && "text-blue-600")} />
                                <span className="text-[10px] font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
