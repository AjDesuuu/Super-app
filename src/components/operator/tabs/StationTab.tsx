import { useState } from "react";
import { MapPin, Clock, Users, AlertCircle } from "lucide-react";
import { mockStations, getCrowdLevel, type Station } from "@/data/operator-data";
import { cn } from "@/lib/utils";
import StationDetails from "@/components/operator/trains/StationDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StationTab() {
    const [selectedLine, setSelectedLine] = useState<
        "all" | "LRT-1" | "LRT-2" | "MRT-3"
    >("all");
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);

    const filteredStations =
        selectedLine === "all"
            ? mockStations
            : mockStations.filter((s) => s.line === selectedLine);

    const getCrowdConfig = (currentCrowd: number, capacity: number) => {
        const percentage = Math.round((currentCrowd / capacity) * 100);
        const level = getCrowdLevel(currentCrowd, capacity);
        
        switch (level) {
            case "low":
                return {
                    label: "Low",
                    color: "text-green-500",
                    bgColor: "bg-green-500/10",
                    barColor: "bg-green-500",
                    percentage,
                };
            case "moderate":
                return {
                    label: "Moderate",
                    color: "text-blue-500",
                    bgColor: "bg-blue-500/10",
                    barColor: "bg-blue-500",
                    percentage,
                };
            case "high":
                return {
                    label: "High",
                    color: "text-orange-500",
                    bgColor: "bg-orange-500/10",
                    barColor: "bg-orange-500",
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
                    color: "text-green-500",
                    dot: "bg-green-500",
                };
            case "delayed":
                return {
                    label: "Delayed",
                    color: "text-orange-500",
                    dot: "bg-orange-500",
                };
            case "maintenance":
                return {
                    label: "Maintenance",
                    color: "text-gray-500",
                    dot: "bg-gray-500",
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
                    color: "text-gray-500",
                    dot: "bg-gray-500",
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

            {/* Station Cards */}
            <div className="space-y-3">
                {filteredStations.map((station) => {
                    const crowdConfig = getCrowdConfig(station.currentCrowd, station.capacity);
                    const statusConfig = getStatusConfig(station.status);

                    return (
                        <Card key={station.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base">
                                            {station.name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {station.line}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className={cn(
                                                "w-2 h-2 rounded-full",
                                                statusConfig.dot
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                "text-xs font-medium",
                                                statusConfig.color
                                            )}
                                        >
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Crowd Density */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                                Crowd Density
                                            </span>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs",
                                                crowdConfig.color
                                            )}
                                        >
                                            {crowdConfig.label}
                                        </Badge>
                                    </div>
                                    <Progress
                                        value={crowdConfig.percentage}
                                        indicatorClassName={crowdConfig.barColor}
                                        className="h-2 bg-muted"
                                    />
                                </div>

                                {/* Station Info Grid */}
                                <div className="grid grid-cols-2 gap-3">
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

                                {/* Warning for Critical/Delayed */}
                                {(getCrowdLevel(station.currentCrowd, station.capacity) === "critical" ||
                                    station.status !== "operational") && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            {getCrowdLevel(station.currentCrowd, station.capacity) === "critical"
                                                ? "Platform capacity critical. Entry control may be needed."
                                                : "Station experiencing delays. Monitor closely."}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-2">
                                    <Button
                                        onClick={() => setSelectedStation(station)}
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}