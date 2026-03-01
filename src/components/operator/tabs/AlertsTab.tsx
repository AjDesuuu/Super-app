import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, Radio, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { mockStations } from "@/data/operator-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import IncidentImpactAnalysis from "@/components/operator/trains/IncidentImpactAnalysis";

// Types
interface Alert {
    id: string;
    type: "platform_saturation" | "dwell_time_overrun";
    severity: "critical" | "high";
    station: string;
    line: string;
    message: string;
    timestamp: string;
    status: "pending" | "active" | "resolved";
    triggeredAt: number;
    actionLabel: string;
    actionType: "wait_status" | "adjust_eta";
}

// Constants
const ALERT_INTERVAL = 15000; // 15 seconds
const PENDING_DURATION = 5000; // 5 seconds
const CHECK_INTERVAL = 1000; // 1 second

const ALERT_TYPES = [
    {
        type: "platform_saturation" as const,
        severity: "critical" as const,
        message: "Platform capacity exceeded 90%. Crowd density critical - entry control recommended.",
        actionLabel: "Activate WAIT Status",
        actionType: "wait_status" as const,
        icon: Radio,
        description: "This will broadcast a WAIT status to all passengers in the area via the NexStation app.",
    },
    {
        type: "dwell_time_overrun" as const,
        severity: "high" as const,
        message: "Train stopped for 60+ seconds past scheduled departure. Downstream delays expected.",
        actionLabel: "Adjust ETA Updates",
        actionType: "adjust_eta" as const,
        icon: Clock,
        description: "This will automatically update ETA windows for the next 5 downstream stations.",
    },
];

const DOWNSTREAM_STATIONS: Record<string, Array<{ name: string; distance: number }>> = {
    "MRT-3": [
        { name: "Quezon Avenue", distance: 1 },
        { name: "Kamuning", distance: 2 },
        { name: "Cubao", distance: 3 },
        { name: "Santolan", distance: 4 },
        { name: "Ortigas", distance: 5 },
    ],
    "LRT-1": [
        { name: "Balintawak", distance: 1 },
        { name: "Monumento", distance: 2 },
        { name: "5th Avenue", distance: 3 },
        { name: "R. Papa", distance: 4 },
    ],
    "LRT-2": [
        { name: "Legarda", distance: 1 },
        { name: "Pureza", distance: 2 },
        { name: "V. Mapa", distance: 3 },
        { name: "J. Ruiz", distance: 4 },
        { name: "Gilmore", distance: 5 },
    ],
};

// Helper Functions
const generateIncidentImpact = (alert: Alert) => {
    const stations = DOWNSTREAM_STATIONS[alert.line] || [];
    const baseDelay = alert.type === "dwell_time_overrun" ? 8 : 5;
    const baseCrowdIncrease = alert.severity === "critical" ? 30 : 20;

    const affectedStations = stations
        .slice(0, alert.severity === "critical" ? 5 : 3)
        .map((station, index) => {
            const decayFactor = 1 - index * 0.15;
            const delay = Math.round(baseDelay * decayFactor);
            const crowdIncrease = Math.round(baseCrowdIncrease * decayFactor);
            
            let severity: "high" | "medium" | "low" = "low";
            if (delay >= 6 || crowdIncrease >= 25) severity = "high";
            else if (delay >= 4 || crowdIncrease >= 15) severity = "medium";

            return {
                name: station.name,
                line: alert.line,
                distanceFromIncident: station.distance,
                additionalDelay: delay,
                crowdIncrease: crowdIncrease,
                severity: severity,
            };
        });

    return {
        incidentId: alert.id,
        incidentType: alert.type === "dwell_time_overrun" ? "Dwell Time Overrun" : "Platform Saturation",
        originStation: alert.station,
        line: alert.line,
        severity: alert.severity === "critical" ? ("high" as const) : ("medium" as const),
        startTime: alert.timestamp,
        affectedStations: affectedStations,
        estimatedRecoveryTime: alert.severity === "critical" ? "45 mins" : "25 mins",
        totalPassengersAffected: affectedStations.length * 450,
    };
};

const getSeverityConfig = (severity: "critical" | "high") => {
    return severity === "critical"
        ? {
              variant: "destructive" as const,
              color: "text-red-500",
              bgColor: "bg-red-500/10",
              borderColor: "border-red-500/30",
              iconBg: "bg-red-500",
              buttonClass: "bg-red-500 hover:bg-red-600 text-white",
          }
        : {
              variant: "default" as const,
              color: "text-orange-500",
              bgColor: "bg-orange-500/10",
              borderColor: "border-orange-500/30",
              iconBg: "bg-orange-500",
              buttonClass: "bg-orange-500 hover:bg-orange-600 text-white",
          };
};

const getAlertTypeLabel = (type: Alert["type"]) => {
    return type === "platform_saturation" ? "PLATFORM SATURATION" : "DWELL TIME OVERRUN";
};

// Components
function PendingAlertCard({ alert }: { alert: Alert }) {
    const config = getSeverityConfig(alert.severity);
    const timeElapsed = Math.floor((Date.now() - alert.triggeredAt) / 1000);
    const countdown = 5 - timeElapsed;
    const progress = (timeElapsed / 5) * 100;

    return (
        <Card className="bg-yellow-500/5 border-yellow-500/30">
            <CardContent className="pt-4 space-y-3">
                <Progress value={progress} className="h-1 bg-yellow-500/20 [&>div]:bg-yellow-500" />
                
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                        <div className={cn("p-1.5 rounded-full animate-pulse", config.iconBg)}>
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className={cn("font-bold text-sm", config.color)}>
                                {getAlertTypeLabel(alert.type)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {alert.station} • {alert.line}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-500/50">
                            {countdown}s
                        </Badge>
                    </div>
                </div>

                <p className="text-sm">{alert.message}</p>

                <Alert className="bg-yellow-500/10 border-yellow-500/20">
                    <AlertDescription className="text-xs font-medium text-yellow-700 dark:text-yellow-300 text-center">
                        ⏳ Preparing operator controls...
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}

function ActiveAlertCard({
    alert,
    isExpanded,
    onToggleExpand,
    onResolve,
}: {
    alert: Alert;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onResolve: () => void;
}) {
    const config = getSeverityConfig(alert.severity);
    const alertTypeConfig = ALERT_TYPES.find((t) => t.type === alert.type);
    const ActionIcon = alertTypeConfig?.icon || Clock;

    return (
        <div className="space-y-3">
            <Card className={cn("border-2", config.bgColor, config.borderColor, isExpanded && "ring-2 ring-blue-500/50")}>
                <CardContent className="pt-4 space-y-3">
                    {/* Alert Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                            <div className={cn("p-1.5 rounded-full", config.iconBg)}>
                                <AlertTriangle className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className={cn("font-bold text-sm", config.color)}>
                                    {getAlertTypeLabel(alert.type)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {alert.station} • {alert.line}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {alert.timestamp}
                        </Badge>
                    </div>

                    <p className="text-sm">{alert.message}</p>

                    {/* Action Button */}
                    <Button
                        onClick={onResolve}
                        className={cn("w-full", config.buttonClass)}
                        size="lg"
                    >
                        <ActionIcon className="h-4 w-4" />
                        {alert.actionLabel}
                    </Button>

                    {/* Action Description & Impact Button */}
                    <div className="pt-3 border-t space-y-2">
                        <p className="text-xs text-muted-foreground">
                            {alertTypeConfig?.description}
                        </p>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onToggleExpand}
                            className="w-full border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                    Hide Impact Analysis
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    View Impact Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Expandable Impact Analysis */}
            {isExpanded && (
                <div className="ml-4 border-l-4 border-orange-500 pl-4 animate-in slide-in-from-top-2 duration-300">
                    <IncidentImpactAnalysis
                        incident={generateIncidentImpact(alert)}
                        onClose={onToggleExpand}
                    />
                </div>
            )}
        </div>
    );
}

function ResolvedAlertCard({ alert }: { alert: Alert }) {
    return (
        <Card className="opacity-60">
            <CardContent className="pt-3">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium">
                            {alert.station} - {getAlertTypeLabel(alert.type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Resolved at {alert.timestamp}
                        </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
            </CardContent>
        </Card>
    );
}

// Main Component
export default function AlertsTab() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [alertCounter, setAlertCounter] = useState(0);
    const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

    // Generate random alert
    const generateRandomAlert = (): Alert => {
        const station = mockStations[Math.floor(Math.random() * mockStations.length)];
        const alertType = ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];
        const now = new Date();

        return {
            id: `alert-${Date.now()}-${Math.random()}`,
            type: alertType.type,
            severity: alertType.severity,
            station: station.name,
            line: station.line,
            message: alertType.message,
            timestamp: now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
            status: "pending",
            triggeredAt: Date.now(),
            actionLabel: alertType.actionLabel,
            actionType: alertType.actionType,
        };
    };

    // Generate alerts at intervals
    useEffect(() => {
        const interval = setInterval(() => {
            const newAlert = generateRandomAlert();
            setAlerts((prev) => [newAlert, ...prev].slice(0, 10));
            setAlertCounter((prev) => prev + 1);
        }, ALERT_INTERVAL);

        // Initial alert
        setTimeout(() => {
            const initialAlert = generateRandomAlert();
            setAlerts([initialAlert]);
            setAlertCounter(1);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Auto-transition pending → active
    useEffect(() => {
        const checkInterval = setInterval(() => {
            const now = Date.now();
            setAlerts((prev) =>
                prev.map((alert) => {
                    if (alert.status === "pending" && now - alert.triggeredAt >= PENDING_DURATION) {
                        return { ...alert, status: "active" };
                    }
                    return alert;
                })
            );
        }, CHECK_INTERVAL);

        return () => clearInterval(checkInterval);
    }, []);

    const handleAlertAction = (alertId: string) => {
        const alert = alerts.find((a) => a.id === alertId);
        if (!alert) return;

        console.log(
            alert.actionType === "wait_status"
                ? `Broadcasting WAIT status to passengers at ${alert.station}`
                : `Adjusting ETA for 5 downstream stations from ${alert.station}`
        );

        setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: "resolved" } : a)));

        if (expandedIncident === alertId) {
            setExpandedIncident(null);
        }
    };

    const activeAlerts = alerts.filter((a) => a.status === "active");
    const pendingAlerts = alerts.filter((a) => a.status === "pending");
    const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

    return (
        <div className="p-4 space-y-4">
            {/* Header with Live Indicator */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Alert Management</h2>
                    <p className="text-xs text-muted-foreground">
                        Real-time incident monitoring and response
                    </p>
                </div>
                <Badge variant="destructive" className="gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                    {alertCounter > 0 && (
                        <span className="px-1.5 py-0.5 bg-white text-red-500 rounded-full text-xs font-bold">
                            {alertCounter}
                        </span>
                    )}
                </Badge>
            </div>

            {/* Pending Alerts */}
            {pendingAlerts.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                        <Clock className="h-4 w-4" />
                        Pending Activation ({pendingAlerts.length})
                    </h3>
                    {pendingAlerts.map((alert) => (
                        <PendingAlertCard key={alert.id} alert={alert} />
                    ))}
                </div>
            )}

            {/* Active Alerts */}
            {activeAlerts.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                        Active Alerts - Action Required ({activeAlerts.length})
                    </h3>
                    {activeAlerts.map((alert) => (
                        <ActiveAlertCard
                            key={alert.id}
                            alert={alert}
                            isExpanded={expandedIncident === alert.id}
                            onToggleExpand={() =>
                                setExpandedIncident(expandedIncident === alert.id ? null : alert.id)
                            }
                            onResolve={() => handleAlertAction(alert.id)}
                        />
                    ))}
                </div>
            )}

            {/* No Active Alerts */}
            {activeAlerts.length === 0 && pendingAlerts.length === 0 && (
                <Alert className="bg-green-500/10 border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <AlertTitle className="text-green-700 dark:text-green-300">All Clear</AlertTitle>
                    <AlertDescription>
                        No active alerts. System monitoring continues...
                    </AlertDescription>
                </Alert>
            )}

            {/* Recently Resolved */}
            {resolvedAlerts.length > 0 && (
                <div className="space-y-2 mt-6">
                    <h3 className="font-semibold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Recently Resolved ({resolvedAlerts.length})
                    </h3>
                    {resolvedAlerts.slice(0, 3).map((alert) => (
                        <ResolvedAlertCard key={alert.id} alert={alert} />
                    ))}
                </div>
            )}
        </div>
    );
}