import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, Gauge, TrendingDown, Activity, Car, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { RoadSegment } from "@/components/lgu/MainLayout";

export default function CongestionAnalytics({ 
    roadSegments = [] 
}: { 
    roadSegments?: RoadSegment[]; 
}) {
    const [congestionFilter, setCongestionFilter] = useState<string>("all");
    const [networkFilter, setNetworkFilter] = useState<string>("all");

    // Extract unique traffic flow statuses from road segments
    const trafficFlowStatuses = Array.from(new Set(roadSegments.map(r => r.status))).sort();

    // Normalize congestion status values
    const getCongestionCategory = (status: string): string => {
        const normalized = status.toLowerCase();
        const congestionLevels = ['gridlock', 'heavy', 'slowing', 'moderate', 'flowing', 'clear', 'moving', 'congested'];
        if (congestionLevels.some(level => normalized.includes(level))) {
            return normalized.split('/')[0].trim(); // Return first part before slash
        }
        return normalized;
    };

    // Filter for congestion analytics cards
    const filteredAnalytics = roadSegments.filter(road => {
        if (congestionFilter === "all") return true;
        return getCongestionCategory(road.status) === congestionFilter;
    });

    // Filter for network congestion status
    const filteredNetwork = roadSegments.filter(road => {
        if (networkFilter === "all") return true;
        return road.status === networkFilter;
    });
    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 bg-background">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-foreground">
                            <Navigation className="text-indigo-600 h-8 w-8" /> 
                            Congestion Analytics
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-base tracking-tight">Real-time traffic velocity and road network efficiency.</p>
                    </div>
                    <Badge variant="outline" className="w-fit border-indigo-200 bg-indigo-50 text-indigo-700 animate-pulse">
                        <Gauge className="h-3 w-3 mr-1" /> VELOCITY TRACKING ACTIVE
                    </Badge>
                </div>

                {/* Filter for Congestion Analytics */}
                <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Congestion Status Filter:</label>
                    <select 
                        className="border rounded p-2 text-xs font-medium bg-background"
                        value={congestionFilter}
                        onChange={(e) => setCongestionFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="gridlock">Gridlock</option>
                        <option value="heavy">Heavy</option>
                        <option value="flowing">Flowing</option>
                        <option value="clear">Clear</option>
                        <option value="slowing">Slowing</option>
                        <option value="moderate">Moderate</option>
                        <option value="moving">Moving</option>
                    </select>
                </div>

                {/* KPI CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredAnalytics.map((road) => (
                        <Card key={road.id} className="border-t-4 shadow-sm transition-all relative hover:shadow-md" style={{ borderTopColor: road.color }}>
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="text-[10px] font-bold" style={{ borderColor: road.color, color: road.color }}>
                                        {road.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <Car className="h-4 w-4 text-muted-foreground mt-2" />
                                <CardTitle className="text-lg font-bold mt-2">{road.name}</CardTitle>
                                <CardDescription className="text-xs font-semibold text-muted-foreground">ID: {road.id}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 space-y-3">
                                <div className="text-[11px] text-white bg-muted p-2 rounded-lg flex justify-between items-center">
                                    <span>Avg Velocity:</span>
                                    <strong className="text-foreground">{road.count}</strong>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                    <TrendingDown className="h-3 w-3" />
                                    Flow Status: {road.status}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* NETWORK THROUGHPUT LIST */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Network Congestion Status Filter:</label>
                    <select 
                        className="border rounded p-2 ml-2 text-xs font-medium bg-background"
                        value={networkFilter}
                        onChange={(e) => setNetworkFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        {trafficFlowStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <Card className="shadow-lg border-none overflow-hidden">
                    <CardHeader className="bg-indigo-950 text-white p-4 md:p-6">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-400" /> 
                            Network Congestion Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 bg-card">
                        {filteredNetwork.map((road, i) => {
                            // Helper to determine progress bar percentage based on status string
                            const getCongestionPct = (status: string) => {
                                if (status.includes("Gridlock")) return 95;
                                if (status.includes("Heavy")) return 75;
                                if (status.includes("Slowing")) return 50;
                                return 20; // Clear/Flowing
                            };
                            const congestionPct = getCongestionPct(road.status);

                            return (
                                <div key={i} className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/50 transition-colors relative ${i !== filteredNetwork.length - 1 ? 'border-b' : ''}`}>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700">
                                            <span className="text-[9px] font-bold uppercase">Speed</span>
                                            <span className="text-xs font-black text-center leading-none">{road.count.replace(' kph', '')}<br/><span className="text-[8px] font-normal">kph</span></span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-foreground">{road.name}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                Traffic Flow <ArrowRight size={10}/> <span style={{ color: road.color, fontWeight: 'bold' }}>{road.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5 w-full md:w-1/3">
                                        <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase">
                                            <span>Congestion Index</span>
                                            <span>{congestionPct}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{ 
                                                    width: `${congestionPct}%`,
                                                    backgroundColor: road.color 
                                                }} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}