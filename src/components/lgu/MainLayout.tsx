import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Activity, LayoutDashboard, AlertOctagon, Navigation, Clock, FileText, LogOut, X } from "lucide-react";
import { getTrafficManager } from "@/lib/trafficManager";

// Components
import LGUDashboard from "@/components/lgu/LGUDashboard";
import CommuterPainPoints from "@/components/lgu/CommuterPainPoints";
import CongestionAnalytics from "@/components/lgu/CongestionAnalytics";
import PeakZoneAnalysis from "@/components/lgu/PeakZoneAnalysis";
import ReportsView from "@/components/lgu/ReportsView";

// Types
import type { User } from "@/data/users";

// Data Imports (With Safety Checks)
import { passengerHeatmaps } from "@/data/lgu-data/PassengerHeatMap";
import { riskZones, type RiskZone } from "@/data/lgu-data/riskZones";
import { roadSegments, type RoadSegment } from "@/data/lgu-data/roadSegments";

type ViewState = "dashboard" | "pain-points" | "reports" | "congestion" | "peak";

export type { RiskZone, RoadSegment };

export interface PainPoint {
    id: number;
    area: string;
    type: string;
    level: "Critical" | "High" | "Moderate" | "Low";
    trend: string;
    affected: string;
    status: string;
    paxCount: number;
    lat: number;
    lng: number;
    radius: number;
    wait: number;
    action: string;
}

interface MainLayoutProps {
    user: User;
    onLogout: () => void;
}

// --- FALLBACK DATA (SAFETY NET) ---
const FALLBACK_HEATMAPS = [
    { id: 1, name: "Marikina Bayan", area: "Marikina City", coordinates: [14.6335, 121.0955], paxCount: 520, waitTime: 45, radius: 675, level: "Critical", type: "Passenger Surge", trend: "Rising", status: "Wait > 45 mins", action: "Dispatch Traffic Enforcers" },
    { id: 2, name: "Riverbanks Center", area: "Barangka", coordinates: [14.6300, 121.0880], paxCount: 410, waitTime: 35, radius: 525, level: "Critical", type: "Queue Spillover", trend: "Rising", status: "Wait > 35 mins", action: "Monitor Queue Length" },
    { id: 3, name: "Barangka Flyover", area: "Barangka", coordinates: [14.6285, 121.0825], paxCount: 440, waitTime: 40, radius: 600, level: "Critical", type: "Chokepoint", trend: "Stable", status: "Traffic Buildup", action: "Check Merging Lane" },
    { id: 4, name: "LRT-2 Santolan Station", area: "Santolan/Calumpang", coordinates: [14.6220, 121.0850], paxCount: 480, waitTime: 32, radius: 480, level: "High", type: "Intermodal Bottleneck", trend: "Stable", status: "Heavy Volume", action: "Coord with LRTA" }
];

const viewConfig: Record<ViewState, { label: string; icon: React.ReactNode; component: React.ComponentType<any> }> = {
    dashboard: { label: "Command Center", icon: <LayoutDashboard size={20} />, component: LGUDashboard },
    "pain-points": { label: "Pain Points", icon: <AlertOctagon size={20} />, component: CommuterPainPoints },
    congestion: { label: "Congestion Analytics", icon: <Navigation size={20} />, component: CongestionAnalytics },
    peak: { label: "Peak Zone Intel", icon: <Clock size={20} />, component: PeakZoneAnalysis },
    reports: { label: "Incident Reports", icon: <FileText size={20} />, component: ReportsView },
};

export default function MainLayout({ user, onLogout }: MainLayoutProps) {
    const [currentView, setCurrentView] = useState<ViewState>("dashboard");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // --- SAFE DATA INITIALIZATION ---
    const sourceData = (passengerHeatmaps && passengerHeatmaps.length > 0) ? passengerHeatmaps : FALLBACK_HEATMAPS;

    const initialPainPoints: PainPoint[] = sourceData.map(h => ({
        id: h.id,
        area: h.name,
        type: h.type,
        level: h.level as any,
        trend: h.trend,
        affected: h.area, 
        status: h.status,
        paxCount: h.paxCount,
        lat: h.coordinates[0],
        lng: h.coordinates[1],
        radius: h.radius,
        wait: h.waitTime,
        action: h.action
    }));

    // State
    const [painPoints, setPainPoints] = useState<PainPoint[]>(initialPainPoints);
    const [currentRiskZones, setRiskZones] = useState<RiskZone[]>(riskZones || []);
    const [currentRoadSegments, setRoadSegments] = useState<RoadSegment[]>(roadSegments || []);

    // Sync with TrafficManager (Defensive Coding)
    useEffect(() => {
        try {
            const trafficManager = getTrafficManager();
            const updateFromTrafficData = () => {
                if (!trafficManager || !trafficManager.getAllTrafficData) return;
                const allTraffic = trafficManager.getAllTrafficData();
                if (!allTraffic || allTraffic.length === 0) return;

                setPainPoints(prevPoints => {
                    return prevPoints.map(point => {
                        const trafficArea = allTraffic.find(
                            t => point.area.toLowerCase().includes(t.areaName.toLowerCase()) || 
                                 t.areaName.toLowerCase().includes(point.area.toLowerCase())
                        );
                        if (trafficArea) {
                            return {
                                ...point,
                                paxCount: Math.round(point.paxCount * (0.8 + Math.random() * 0.4)),
                                wait: Math.max(5, Math.round(trafficArea.passengerDensity / 2)),
                                level: trafficArea.passengerDensity > 75 ? "Critical" : 
                                       trafficArea.passengerDensity > 50 ? "High" : 
                                       trafficArea.passengerDensity > 25 ? "Moderate" : "Low"
                            } as PainPoint;
                        }
                        return point;
                    });
                });
            };
            updateFromTrafficData();
            const interval = setInterval(updateFromTrafficData, 5000);
            return () => clearInterval(interval);
        } catch (error) {
            console.warn("Traffic Manager skipped:", error);
        }
    }, []);

    // --- HANDLERS ---
    const handleAddPainPoint = (newPainPoint: Omit<PainPoint, "id">) => {
        const newId = Math.max(...painPoints.map(p => p.id), 0) + 1;
        setPainPoints([...painPoints, { ...newPainPoint, id: newId }]);
    };
    const handleRemovePainPoint = (id: number) => {
        setPainPoints(painPoints.filter(p => p.id !== id));
    };
    const handleAddRiskZone = (newZone: Omit<RiskZone, "id">) => {
        const newId = `GEN-${Date.now()}`;
        setRiskZones([...currentRiskZones, { ...newZone, id: newId }]);
    };
    const handleRemoveRiskZone = (id: string) => {
        setRiskZones(currentRiskZones.filter(z => z.id !== id));
    };
    const handleAddRoadSegment = (newRoad: Omit<RoadSegment, "id">) => {
        const newId = `ROAD-${Date.now()}`; 
        setRoadSegments([...currentRoadSegments, { ...newRoad, id: newId }]);
    };
    const handleRemoveRoadSegment = (id: string) => {
        setRoadSegments(currentRoadSegments.filter(r => r.id !== id));
    };
    const handleNavigation = (view: ViewState) => {
        setCurrentView(view);
        setIsMenuOpen(false);
    };
    const handleLogout = () => {
        setIsMenuOpen(false);
        onLogout();
    };

    const CurrentComponent = viewConfig[currentView].component;

    const getComponentProps = () => {
        const commonProps = {
            painPoints,
            roadSegments: currentRoadSegments,
            riskZones: currentRiskZones,
            onAddPainPoint: handleAddPainPoint, 
            onRemovePainPoint: handleRemovePainPoint,
            onAddRoadSegment: handleAddRoadSegment,
            onRemoveRoadSegment: handleRemoveRoadSegment,
            onAddRiskZone: handleAddRiskZone,
            onRemoveRiskZone: handleRemoveRiskZone
        };
        if (currentView === "dashboard") return commonProps;
        if (currentView === "pain-points") return { painPoints, onRemovePainPoint: handleRemovePainPoint };
        if (currentView === "congestion") return { roadSegments: currentRoadSegments }; 
        if (currentView === "peak") return { riskZones: currentRiskZones, onRemoveRiskZone: handleRemoveRiskZone };
        return {};
    };

    return (
        // KEY FIX: This 'fixed' wrapper breaks out of #root and becomes the full-screen container
        <div className="fixed inset-0 z-[50] w-screen h-screen bg-background flex flex-col overflow-hidden font-sans text-slate-900">
            {/* Header */}
            <header className="border-b bg-card flex-shrink-0 z-[1100] relative shadow-sm">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Activity className="text-blue-600 h-6 w-6" />
                            Marikina Intel
                        </h1>
                        <p className="text-xs text-muted-foreground">LGU Operations Portal</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="hidden md:flex text-muted-foreground hover:text-destructive gap-2" onClick={handleLogout}>
                            <LogOut size={16} /> Sign Out
                        </Button>
                        <Button size="icon" variant="ghost" className="text-foreground hover:bg-accent" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Navigation Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute top-[60px] left-0 right-0 z-[2000] bg-background/95 backdrop-blur-md border-b shadow-lg animate-in slide-in-from-top-2 duration-200 flex flex-col">
                    <nav className="flex flex-col gap-1 p-4">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Navigation</span>
                            <span className="text-xs text-muted-foreground">{user.name}</span>
                        </div>
                        {(Object.entries(viewConfig) as [ViewState, typeof viewConfig[ViewState]][]).map(([view, config]) => (
                            <Button key={view} variant={currentView === view ? 'secondary' : 'ghost'} className={`justify-start gap-3 h-12 rounded-lg text-sm font-medium ${currentView === view ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`} onClick={() => handleNavigation(view)}>
                                {config.icon} <span>{config.label}</span>
                            </Button>
                        ))}
                    </nav>
                    <div className="p-4 border-t bg-muted/20">
                        <Button variant="destructive" className="w-full gap-2 font-medium" onClick={handleLogout}>
                            <LogOut size={16} /> Sign Out
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Content Area - Fills remaining space below Header */}
            <main className="flex-1 overflow-hidden relative z-0 w-full">
                <CurrentComponent {...getComponentProps()} />
            </main>
        </div>
    );
}