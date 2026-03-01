import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ShieldCheck, Calendar, Timer, History, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { RiskZone } from "@/components/lgu/MainLayout"; // Import RiskZone type

export default function PeakZoneAnalysis({ 
    riskZones = [], // Renamed prop to match MainLayout passing
    onRemoveRiskZone // Renamed prop
}: { 
    riskZones?: RiskZone[]; 
    onRemoveRiskZone?: (id: string) => void;
}) {
    const [peakZoneFilter, setPeakZoneFilter] = useState<string>("all");

    // Filter risk zones by risk level
    const filteredZones = riskZones.filter(zone => {
        if (peakZoneFilter === "all") return true;
        return zone.riskLevel.toLowerCase() === peakZoneFilter.toLowerCase();
    });
    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 bg-background">
             <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-foreground">
                            <Clock className="text-amber-600 h-8 w-8" /> 
                            Peak Zone Intelligence
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-base tracking-tight">Temporal risk modeling and peak-hour safety metrics.</p>
                    </div>
                    <Badge variant="outline" className="w-fit border-amber-200 bg-amber-50 text-amber-700 animate-pulse">
                        <History className="h-3 w-3 mr-1" /> PREDICTIVE ENGINE ACTIVE
                    </Badge>
                </div>

                {/* Filter for Peak Zone Intel */}
                <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Predictive Engine Filter:</label>
                    <select 
                        className="border rounded p-2 text-xs font-medium bg-background"
                        value={peakZoneFilter}
                        onChange={(e) => setPeakZoneFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="moderate">Moderate</option>
                    </select>
                </div>

                {/* RISK WINDOW CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredZones.map((zone) => (
                        <Card key={zone.id} className={`border-l-4 shadow-sm hover:translate-y-[-2px] transition-all relative ${
                            zone.riskLevel === 'Critical' ? 'border-l-red-500' : 'border-l-amber-500'
                        }`}>
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter flex items-center gap-1">
                                        <Timer size={10}/> Peak Window
                                    </span>
                                    <Badge variant={zone.riskLevel === 'Critical' ? 'destructive' : 'secondary'} className="text-[9px]">
                                        {zone.riskLevel}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg font-bold mt-2">{zone.name}</CardTitle>
                                <CardDescription className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
                                    <Calendar size={12}/> {zone.time}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                    <ShieldCheck className="h-3 w-3 text-green-600" />
                                    Risk Impact: {zone.impact}
                                </div>
                                <div className="text-[10px] bg-muted p-2 rounded-lg text-white">
                                    <strong className="block text-white mb-1">Hazards Identified:</strong>
                                    {zone.hazards.join(", ")}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* SAFETY SCORE INDEX - Update map to use filteredZones */}
                <Card className="shadow-lg border-none overflow-hidden">
                    <CardHeader className="bg-amber-950 text-white p-4 md:p-6">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-amber-400" /> 
                            Population Density Impact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 bg-card">
                        {filteredZones.map((zone, i) => {
                            const safetyScore = zone.riskLevel === 'Critical' ? 25 : zone.riskLevel === 'High' ? 50 : zone.riskLevel === 'Moderate' ? 65 : 85;
                            return (
                                <div key={i} className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/50 transition-colors relative ${i !== filteredZones.length - 1 ? 'border-b' : ''}`}>
                                    <div className="flex items-center gap-4 flex-1">
                                         <div className={`h-12 w-12 rounded-xl flex flex-col items-center justify-center font-black text-white ${
                                             safetyScore < 40 ? 'bg-red-500' : safetyScore < 70 ? 'bg-amber-500' : 'bg-green-500'
                                         }`}>
                                             <span className="text-[9px] font-normal uppercase opacity-70">Score</span>
                                             <span className="text-lg leading-none">{safetyScore}</span>
                                         </div>
                                         <div className="flex-1">
                                              <div className="font-bold text-foreground text-lg leading-none">{zone.name}</div>
                                              <div className="text-xs text-muted-foreground mt-1">Severity: {zone.riskLevel}</div>
                                         </div>
                                    </div>
                                    
                                     {onRemoveRiskZone && (
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => onRemoveRiskZone(zone.id)}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        >
                                            <X size={14} />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}