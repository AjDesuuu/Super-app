import {
    Activity,
    Users,
    AlertTriangle,
    Clock,
    TrendingUp,
} from "lucide-react";
import {
    mockOperatorStats,
    mockAlerts,
    mockStations,
    getCrowdLevel,
} from "@/data/operator-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function OverviewTab() {
    const stats = mockOperatorStats;
    const activeAlerts = mockAlerts.filter((a) => a.status === "active");
    const criticalStations = mockStations.filter(
        (s) => getCrowdLevel(s.currentCrowd, s.capacity) === "critical" || s.status !== "operational"
    );

    const getStatusConfig = (
        status: "normal" | "delayed" | "critical"
    ) => {
        switch (status) {
            case "normal":
                return {
                    label: "Normal Operations",
                    color: "text-green-500",
                    bgColor: "bg-green-500/10",
                    icon: TrendingUp,
                };
            case "delayed":
                return {
                    label: "System Delays",
                    color: "text-orange-500",
                    bgColor: "bg-orange-500/10",
                    icon: Clock,
                };
            case "critical":
                return {
                    label: "Critical Status",
                    color: "text-red-500",
                    bgColor: "bg-red-500/10",
                    icon: AlertTriangle,
                };
        }
    };

    const statusConfig = getStatusConfig(stats.systemStatus);
    const StatusIcon = statusConfig.icon;

    // Parse peak hour load percentage (e.g., "78%" -> 78)
    const peakLoadValue = parseInt(stats.peakHourLoad);

    return (
        <div className="p-4 space-y-4">
            {/* System Status Banner */}
            <Alert
                variant={stats.systemStatus === "critical" ? "destructive" : "default"}
                className={cn(
                    "border-2",
                    statusConfig.bgColor,
                    stats.systemStatus === "critical"
                        ? "border-red-500/30"
                        : stats.systemStatus === "delayed"
                        ? "border-orange-500/30"
                        : "border-green-500/30"
                )}
            >
                <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
                <AlertTitle className={cn("font-semibold", statusConfig.color)}>
                    {statusConfig.label}
                </AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                    {stats.activeLine} • Last updated: Just now
                </AlertDescription>
            </Alert>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                <Card size="sm">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Users className="h-4 w-4 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">
                            {(stats.dailyPassengers / 1000).toFixed(1)}K
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Daily Passengers
                        </p>
                    </CardContent>
                </Card>

                <Card size="sm">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Activity className="h-4 w-4 text-purple-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">
                            {stats.operationalStations}/{stats.totalStations}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Operational Stations
                        </p>
                    </CardContent>
                </Card>

                <Card size="sm">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Clock className="h-4 w-4 text-orange-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{stats.avgWaitTime}</p>
                        <p className="text-xs text-muted-foreground">
                            Avg Wait Time
                        </p>
                    </CardContent>
                </Card>

                <Card size="sm">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{activeAlerts.length}</p>
                        <p className="text-xs text-muted-foreground">
                            Active Alerts
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Peak Hour Load */}
            <Card size="sm">
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">Peak Hour Load</h3>
                        <Badge variant="outline" className="text-xs">
                            Current
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                System Capacity
                            </span>
                            <span className="text-lg font-bold text-orange-500">
                                {stats.peakHourLoad}
                            </span>
                        </div>
                        <Progress 
                            value={peakLoadValue} 
                            className="h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-red-500"
                        />
                        <p className="text-xs text-muted-foreground">
                            Approaching critical capacity threshold
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Critical Stations Alert */}
            {criticalStations.length > 0 && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle className="font-semibold text-sm">
                        Stations Requiring Attention ({criticalStations.length})
                    </AlertTitle>
                    <AlertDescription>
                        <div className="space-y-2 mt-2">
                            {criticalStations.map((station) => (
                                <div
                                    key={station.id}
                                    className="bg-background/50 rounded-lg p-3"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-sm">
                                            {station.name}
                                        </p>
                                        <Badge 
                                            variant={getCrowdLevel(station.currentCrowd, station.capacity) === "critical" ? "destructive" : "default"}
                                            className={cn(
                                                getCrowdLevel(station.currentCrowd, station.capacity) !== "critical" && "bg-orange-500 hover:bg-orange-600 text-white"
                                            )}
                                        >
                                            {getCrowdLevel(station.currentCrowd, station.capacity) === "critical"
                                                ? "Critical Crowd"
                                                : "Delayed"}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {station.line} • Wait: {station.waitTime}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Active Alerts Summary */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Active Alerts</h3>
                    <Button variant="link" size="sm" className="text-xs h-auto p-0">
                        View All
                    </Button>
                </div>
                <div className="space-y-2">
                    {activeAlerts.length > 0 ? (
                        activeAlerts.slice(0, 3).map((alert) => (
                            <Card key={alert.id} size="sm">
                                <CardContent className="pt-3">
                                    <div className="flex items-start gap-2">
                                        <div
                                            className={cn(
                                                "p-1.5 rounded-lg mt-0.5",
                                                alert.severity === "critical"
                                                    ? "bg-red-500/10"
                                                    : alert.severity === "high"
                                                    ? "bg-orange-500/10"
                                                    : "bg-yellow-500/10"
                                            )}
                                        >
                                            <AlertTriangle
                                                className={cn(
                                                    "h-3.5 w-3.5",
                                                    alert.severity === "critical"
                                                        ? "text-red-500"
                                                        : alert.severity === "high"
                                                        ? "text-orange-500"
                                                        : "text-yellow-500"
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {alert.station} - {alert.line}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {alert.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {alert.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card size="sm">
                            <CardContent className="pt-4 text-center">
                                <p className="text-sm text-muted-foreground">
                                    No active alerts
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}