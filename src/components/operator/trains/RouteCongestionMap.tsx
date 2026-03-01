import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp } from "lucide-react";

// Mock route segments between stations
const routeSegments = [
    { from: "Santolan", to: "Katipunan", congestion: 85, incidents: 2 },
    { from: "Katipunan", to: "Anonas", congestion: 92, incidents: 1 },
    { from: "Anonas", to: "Cubao", congestion: 95, incidents: 3 },
    { from: "Cubao", to: "Quezon Ave", congestion: 78, incidents: 0 },
    { from: "Quezon Ave", to: "GMA Kamuning", congestion: 65, incidents: 1 },
    { from: "GMA Kamuning", to: "Araneta-Cubao", congestion: 88, incidents: 2 },
    { from: "Araneta-Cubao", to: "North Avenue", congestion: 100, incidents: 4 },
];

// LRT-1 Line segments
const lrt1Segments = [
    { from: "Roosevelt", to: "Balintawak", congestion: 70, incidents: 1 },
    { from: "Balintawak", to: "Monumento", congestion: 85, incidents: 2 },
    { from: "Monumento", to: "5th Avenue", congestion: 90, incidents: 1 },
    { from: "5th Avenue", to: "R. Papa", congestion: 75, incidents: 0 },
];

export default function RouteCongestionMap() {
    const getCongestionColor = (congestion: number) => {
        if (congestion >= 90) return "bg-destructive";
        if (congestion >= 75) return "bg-orange-500";
        if (congestion >= 50) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getTextColor = (congestion: number) => {
        if (congestion >= 90) return "text-destructive";
        if (congestion >= 75) return "text-orange-500";
        if (congestion >= 50) return "text-yellow-600";
        return "text-green-600";
    };

    // Find most congested segments
    const allSegments = [...routeSegments, ...lrt1Segments];
    const criticalSegments = allSegments.filter(s => s.congestion >= 90);

    return (
        <div className="space-y-6">
            {/* Critical Bottlenecks Alert */}
            {criticalSegments.length > 0 && (
                <div className="bg-destructive/10 border border-destructive rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-destructive">
                                {criticalSegments.length} Critical Bottleneck{criticalSegments.length > 1 ? 's' : ''} Detected
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Routes operating at 90%+ capacity require immediate attention
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* MRT-3 Line */}
            <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">MRT-3 Line Segments</h3>
                    <span className="text-xs text-muted-foreground">
                        North Ave ← → Santolan
                    </span>
                </div>
                <div className="space-y-2">
                    {routeSegments.map((segment, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <span className="font-medium text-foreground">{segment.from}</span>
                                    <span>→</span>
                                    <span className="font-medium text-foreground">{segment.to}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                    {segment.incidents > 0 && (
                                        <span className="text-orange-500 flex items-center gap-0.5">
                                            <AlertTriangle className="h-3 w-3" />
                                            {segment.incidents}
                                        </span>
                                    )}
                                    <span className={cn(
                                        "font-semibold",
                                        getTextColor(segment.congestion)
                                    )}>
                                        {segment.congestion}%
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all",
                                        getCongestionColor(segment.congestion)
                                    )}
                                    style={{ width: `${segment.congestion}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* LRT-1 Line */}
            <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">LRT-1 Line Segments</h3>
                    <span className="text-xs text-muted-foreground">
                        Roosevelt ← → Baclaran
                    </span>
                </div>
                <div className="space-y-2">
                    {lrt1Segments.map((segment, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <span className="font-medium text-foreground">{segment.from}</span>
                                    <span>→</span>
                                    <span className="font-medium text-foreground">{segment.to}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                    {segment.incidents > 0 && (
                                        <span className="text-orange-500 flex items-center gap-0.5">
                                            <AlertTriangle className="h-3 w-3" />
                                            {segment.incidents}
                                        </span>
                                    )}
                                    <span className={cn(
                                        "font-semibold",
                                        getTextColor(segment.congestion)
                                    )}>
                                        {segment.congestion}%
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all",
                                        getCongestionColor(segment.congestion)
                                    )}
                                    style={{ width: `${segment.congestion}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Congestion Summary */}
            <div className="bg-muted/50 border rounded-lg p-3">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-3">
                    Network Congestion Summary
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-card border rounded p-2">
                        <p className="text-xs text-muted-foreground">Highest Congestion</p>
                        <p className="text-sm font-bold text-destructive">Araneta → North Ave</p>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-destructive" />
                            <p className="text-xs text-destructive">100% capacity</p>
                        </div>
                    </div>
                    <div className="bg-card border rounded p-2">
                        <p className="text-xs text-muted-foreground">Total Incidents</p>
                        <p className="text-sm font-bold text-orange-500">{allSegments.reduce((sum, s) => sum + s.incidents, 0)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Across all segments</p>
                    </div>
                </div>
                <div className="bg-card border rounded p-2 mt-2">
                    <p className="text-xs text-muted-foreground">Average Congestion</p>
                    <p className="text-sm font-bold">
                        {Math.round(allSegments.reduce((sum, s) => sum + s.congestion, 0) / allSegments.length)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Network-wide average load</p>
                </div>
            </div>
        </div>
    );
}