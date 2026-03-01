import { useState } from "react";
import { MapPin, Clock, Users, AlertCircle, ChevronDown, ChevronRight, Search, MoreHorizontal, Train } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockStations, getCrowdLevel, type Station } from "@/data/operator-data";
import { cn } from "@/lib/utils";
import StationDetails from "@/components/operator/trains/StationDetails";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function StationTab() {
    const [selectedLine, setSelectedLine] = useState<
        "all" | "LRT-1" | "LRT-2" | "MRT-3"
    >("all");
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [expandedStation, setExpandedStation] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStations = mockStations.filter((s) => {
        const matchesLine = selectedLine === "all" || s.line === selectedLine;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLine && matchesSearch;
    });

    const criticalStations = filteredStations.filter(s => getCrowdLevel(s.currentCrowd, s.capacity) === "critical").length;
    const delayedStations = filteredStations.filter(s => s.status !== "operational").length;

    const getCrowdConfig = (currentCrowd: number, capacity: number) => {
        const percentage = Math.round((currentCrowd / capacity) * 100);
        const level = getCrowdLevel(currentCrowd, capacity);
        
        switch (level) {
            case "low":
                return {
                    label: "Low",
                    color: "text-emerald-500",
                    bgColor: "bg-emerald-500/10",
                    barColor: "bg-emerald-500",
                    percentage,
                };
            case "moderate":
                return {
                    label: "Moderate",
                    color: "text-amber-500",
                    bgColor: "bg-amber-500/10",
                    barColor: "bg-amber-500",
                    percentage,
                };
            case "high":
                return {
                    label: "High",
                    color: "text-amber-500",
                    bgColor: "bg-amber-500/10",
                    barColor: "bg-amber-500",
                    percentage,
                };
            case "critical":
                return {
                    label: "Critical",
                    color: "text-red-500",
                    bgColor: "bg-red-500/10",
                    barColor: "bg-red-500",
                    percentage,
                };
        }
    };

    const getStatusConfig = (status: Station["status"]) => {
        switch (status) {
            case "operational":
                return {
                    label: "Operational",
                    color: "text-emerald-500",
                    dot: "bg-emerald-500",
                };
            case "delayed":
                return {
                    label: "Delayed",
                    color: "text-amber-500",
                    dot: "bg-amber-500",
                };
            case "maintenance":
                return {
                    label: "Maintenance",
                    color: "text-slate-500",
                    dot: "bg-slate-500",
                };
            case "incident":
                return {
                    label: "Incident",
                    color: "text-red-500",
                    dot: "bg-red-500",
                };
            case "closed":
                return {
                    label: "Closed",
                    color: "text-slate-500",
                    dot: "bg-slate-500",
                };
        }
    };

    // Convert your station format to details component format
    const convertStationForDetails = (station: Station) => {
        return {
            id: String(station.id),
            name: station.name,
            line: station.line,
            currentCrowd: station.currentCrowd,
            capacity: station.capacity,
            status: getStatusConfig(station.status).label,
            waitTime: station.waitTime,
        };
    };

    // If a station is selected, show details component
    if (selectedStation) {
        return (
            <StationDetails
                station={convertStationForDetails(selectedStation)}
                onBack={() => setSelectedStation(null)}
            />
        );
    }

    // Otherwise show station list
    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold">Station Monitoring</h2>
                <p className="text-xs text-muted-foreground">
                    Real-time crowd and platform status
                </p>
            </div>

            {/* Search and Summary */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search stations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-xs font-medium text-destructive">Issues</span>
                        </div>
                        <p className="text-2xl font-bold text-destructive">{delayedStations}</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-medium text-amber-500">High Crowd</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-500">{criticalStations}</p>
                    </div>
                </div>
            </div>

            {/* Line Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: "all" as const, label: "All Lines" },
                    { id: "MRT-3" as const, label: "MRT-3" },
                    { id: "LRT-1" as const, label: "LRT-1" },
                    { id: "LRT-2" as const, label: "LRT-2" },
                ].map((line) => (
                    <Button
                        key={line.id}
                        onClick={() => setSelectedLine(line.id)}
                        variant={selectedLine === line.id ? "default" : "secondary"}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        {line.label}
                    </Button>
                ))}
            </div>

            {/* Legend */}
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Legend
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Station Status */}
                    <div>
                        <p className="font-medium mb-1.5">Station Status (Outer Ring)</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0" />
                                <span className="text-muted-foreground">Operational</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-amber-500 flex-shrink-0" />
                                <span className="text-muted-foreground">Delayed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-slate-500 flex-shrink-0" />
                                <span className="text-muted-foreground">Maintenance</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0" />
                                <span className="text-muted-foreground">Incident</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Crowd Level */}
                    <div>
                        <p className="font-medium mb-1.5">Crowd Level (Inner Circle)</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0" />
                                <span className="text-muted-foreground">Low (&lt;50%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-amber-500 flex-shrink-0" />
                                <span className="text-muted-foreground">Moderate/High (50-90%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                <span className="text-muted-foreground">Critical (&gt;90%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Station Line Visualization */}
            <div className="relative">
                {filteredStations.map((station, index) => {
                    const crowdConfig = getCrowdConfig(station.currentCrowd, station.capacity);
                    const statusConfig = getStatusConfig(station.status);
                    const crowdLevel = getCrowdLevel(station.currentCrowd, station.capacity);
                    const isExpanded = expandedStation === station.id;
                    const isLast = index === filteredStations.length - 1;

                    return (
                        <div key={station.id} className="relative">
                            {/* Vertical Line */}
                            {!isLast && (
                                <div className="absolute left-[15px] top-[32px] w-[2px] h-[calc(100%-32px)] bg-border" />
                            )}

                            {/* Station Row */}
                            <div className="relative flex items-start gap-3 pb-4">
                                {/* Station Circle */}
                                <button
                                    onClick={() => setExpandedStation(isExpanded ? null : station.id)}
                                    className={cn(
                                        "relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-4 border-background transition-all",
                                        "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                        statusConfig.dot
                                    )}
                                >
                                    {/* Inner indicator for crowd level */}
                                    <div
                                        className={cn(
                                            "absolute inset-1 rounded-full",
                                            crowdConfig.barColor,
                                            crowdLevel === "critical" && "animate-pulse"
                                        )}
                                    />
                                </button>

                                {/* Station Info */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    {/* Station Header - Clickable */}
                                    <button
                                        onClick={() => setExpandedStation(isExpanded ? null : station.id)}
                                        className="w-full text-left group"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                                    {station.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {station.line}
                                                </p>
                                            </div>
                                            
                                            {/* Quick Actions / Next Train Indicator */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                 <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                                        <Train className="h-3 w-3" />
                                                        {station.nextTrain}
                                                    </div>
                                                 </div>

                                                <Badge
                                                    variant="secondary"
                                                    className={cn("text-xs", crowdConfig.color)}
                                                >
                                                    {crowdConfig.percentage}%
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Placeholder for quick actions menu
                                                    }}
                                                >
                                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expandable Details */}
                                    {isExpanded && (
                                        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                            {/* Crowd Density */}
                                            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            Crowd Density
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-medium">
                                                        {crowdConfig.label}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={crowdConfig.percentage}
                                                    indicatorClassName={crowdConfig.barColor}
                                                    className="h-1.5 bg-background"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {station.currentCrowd} / {station.capacity} passengers
                                                </p>
                                            </div>

                                            {/* Wait Time & Next Train */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-muted/50 rounded-lg p-2.5">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            Wait Time
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold">
                                                        {station.waitTime}
                                                    </p>
                                                </div>
                                                <div className="bg-muted/50 rounded-lg p-2.5">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            Next Train
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold">
                                                        {station.nextTrain}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status & Warning */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={cn("w-2 h-2 rounded-full", statusConfig.dot)} />
                                                    <span className={cn("text-xs font-medium", statusConfig.color)}>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                {(crowdLevel === "critical" || station.status !== "operational") && (
                                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                                )}
                                            </div>

                                            {/* View Details Button */}
                                            <Button
                                                onClick={() => setSelectedStation(station)}
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                View Full Details
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}