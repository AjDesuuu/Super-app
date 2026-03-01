import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Polyline, Polygon, Tooltip, ZoomControl, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Added new icons for the descriptive UI
import { Activity, Users, Navigation, Clock, Plus, X, TrendingUp, AlertTriangle, ShieldAlert, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- UPDATED TYPES BASED ON YOUR NEW DATA STRUCTURE ---
export interface PainPoint {
    id: number;
    name: string;
    area: string; // Used as the main display name often
    coordinates: [number, number]; // [Lat, Lng]
    paxCount: number;
    waitTime: number;
    radius: number;
    level: "Critical" | "High" | "Moderate" | "Low";
    type: string;
    trend: string;
    status: string;
    action: string;
    lat: number; // Helper for map rendering
    lng: number; // Helper for map rendering
    [key: string]: any;
}

export interface RiskZone {
    id: string;
    name: string;
    lat: number;
    lng: number;
    impact: string;
    time: string;
    color: string;
    hazards: string[];
    riskLevel: string;
    affectedCount: number;
    [key: string]: any;
}

export interface RoadSegment {
    id: string;
    name: string;
    color: string;
    status: string;
    count: string;
    points: [number, number][]; 
}

const MARIKINA_BOUNDS: L.LatLngBoundsExpression = [[14.6050, 121.0750], [14.6750, 121.1450]];

const MARIKINA_BOUNDARY_COORDS: L.LatLngExpression[] = [
    [14.6760, 121.1150], [14.6650, 121.1380], [14.6450, 121.1480], 
    [14.6200, 121.1350], [14.6080, 121.1100], [14.6150, 121.0850], 
    [14.6350, 121.0780], [14.6600, 121.0920]
];

const BOUNDARY_STYLE = {
    color: '#334155', weight: 4, opacity: 0.7, fillOpacity: 0.0, dashArray: '12, 12', interactive: false
};

const getHeatmapColorByWait = (wait: number) => {
    if (wait > 30) return "#be123c"; 
    if (wait >= 30) return "#ff9900"; 
    if (wait >= 11) return "#ffe063"; 
    return "#22c55e"; 
};

function MapEvents({ setZoom, onMapClick }: { setZoom: (z: number) => void, onMapClick: (e: L.LeafletMouseEvent) => void }) {
    const map = useMapEvents({ 
        zoomend: () => setZoom(map.getZoom()), 
        click: (e) => onMapClick(e)
    });
    return null;
}

interface DashboardProps {
    painPoints?: PainPoint[];
    roadSegments?: RoadSegment[];
    riskZones?: RiskZone[];
    onAddPainPoint?: (point: any) => void;
    onRemovePainPoint?: (id: number) => void;
    onAddRoadSegment?: (road: any) => void;
    onRemoveRoadSegment?: (id: string) => void;
    onAddRiskZone?: (zone: any) => void;
    onRemoveRiskZone?: (id: string) => void;
}

interface FormState {
    area: string;
    lat: string;
    lng: string;
    type: string;
    paxCount: number;
    wait: number;
    radius: number;
    roadStatus: "Heavy" | "Moderate" | "Light";
    trafficCount: number;
    riskLevel: "Critical" | "High" | "Moderate";
    timeRange: string;
}

export default function LGUDashboard({ 
    painPoints = [], roadSegments = [], riskZones = [], 
    onAddPainPoint, onRemovePainPoint,
    onAddRoadSegment, onRemoveRoadSegment,
    onAddRiskZone, onRemoveRiskZone
}: DashboardProps) {
    const [activeTab, setActiveTab] = useState<"pain" | "congestion" | "peak">("pain");
    const [zoomLevel, setZoomLevel] = useState(14);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [formData, setFormData] = useState<FormState>({ 
        area: "", lat: "", lng: "", type: "Passenger Surge", 
        paxCount: 0, wait: 15, radius: 300, 
        roadStatus: "Heavy", trafficCount: 50, riskLevel: "Critical", timeRange: "5PM - 8PM"
    });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleMapClick = (e: L.LeafletMouseEvent) => {
        setSelectedItem(null);
        if (showAddForm) {
            setFormData(prev => ({
                ...prev, lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6)
            }));
        }
    };

    const handleSubmit = () => {
        if (!formData.area.trim() || !formData.lat || !formData.lng) return;
        const lat = parseFloat(formData.lat);
        const lng = parseFloat(formData.lng);
        if (isNaN(lat) || isNaN(lng)) { alert("Please enter valid latitude/longitude."); return; }

        // Note: For brevity, keeping simple add logic. In real app, match full structure.
        if (activeTab === "pain" && onAddPainPoint) {
            onAddPainPoint({
                area: formData.area, name: formData.area, type: formData.type, level: "Moderate",
                paxCount: formData.paxCount, waitTime: formData.wait, trend: "Rising",
                status: "Monitoring", radius: formData.radius, action: "Monitor situation", lat, lng, coordinates: [lat, lng]
            });
        } else if (activeTab === "congestion" && onAddRoadSegment) {
            onAddRoadSegment({
                name: formData.area, points: [[lat, lng - 0.002], [lat, lng + 0.002]],
                status: formData.roadStatus, count: `${formData.trafficCount} kph`,
                color: formData.roadStatus === 'Heavy' ? '#ef4444' : formData.roadStatus === 'Moderate' ? '#f59e0b' : '#22c55e',
            });
        } else if (activeTab === "peak" && onAddRiskZone) {
            onAddRiskZone({
                name: formData.area, lat, lng, riskLevel: formData.riskLevel,
                time: formData.timeRange, hazards: ["Reported by user"],
                impact: formData.riskLevel, color: formData.riskLevel === 'Critical' ? '#ef4444' : formData.riskLevel === 'High' ? '#f97316' : '#3b82f6',
                affectedCount: 0
            });
        }
        setShowAddForm(false);
        setFormData(prev => ({ ...prev, area: "", lat: "", lng: "" }));
    };

    return (
        <div className="flex flex-col h-full w-full relative bg-slate-100 overflow-hidden font-sans text-slate-900">
            {/* Map Area */}
            <div className="flex-1 relative z-0 w-full h-full">
                <MapContainer center={[14.6330, 121.0980]} zoom={14} zoomControl={false} maxBounds={MARIKINA_BOUNDS} maxBoundsViscosity={1.0} minZoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    {!isMobile && <ZoomControl position="bottomleft" />}
                    <MapEvents setZoom={setZoomLevel} onMapClick={handleMapClick} />

                    <Polygon positions={MARIKINA_BOUNDARY_COORDS} pathOptions={BOUNDARY_STYLE as L.PathOptions} />

                    {/* --- ROAD SEGMENTS --- */}
                    {roadSegments.map(r => {
                        const isSelected = selectedItem?.id === r.id;
                        return (
                            <Polyline 
                                key={r.id} 
                                positions={r.points as L.LatLngExpression[]} 
                                eventHandlers={{ 
                                    mouseover: (e) => { L.DomEvent.stopPropagation(e); setSelectedItem({ ...r, dataType: 'road' }); },
                                    click: (e) => { L.DomEvent.stopPropagation(e); setSelectedItem({ ...r, dataType: 'road' }); }
                                }} 
                                pathOptions={{ 
                                    color: activeTab === 'congestion' ? r.color : "#cbd5e1", 
                                    weight: isSelected ? 12 : 8, 
                                    opacity: isSelected ? 1 : (activeTab === 'congestion' ? 0.9 : 0.4) 
                                }} 
                            />
                        );
                    })}

                    {/* --- PAIN POINTS (Circles) --- */}
                    {activeTab === 'pain' && painPoints.map(p => {
                        const isSelected = selectedItem?.id === p.id;
                        const dynamicColor = getHeatmapColorByWait(p.waitTime || p.wait);
                        return (
                            <Circle 
                                key={p.id} 
                                center={[p.lat || p.coordinates[0], p.lng || p.coordinates[1]]} 
                                radius={isSelected ? (p.radius || 300) * 1.1 : (p.radius || 300)} 
                                eventHandlers={{ 
                                    mouseover: (e) => { L.DomEvent.stopPropagation(e); setSelectedItem({ ...p, dataType: 'heatmap' }); },
                                    click: (e) => { L.DomEvent.stopPropagation(e); setSelectedItem({ ...p, dataType: 'heatmap' }); }
                                }} 
                                pathOptions={{ 
                                    fillColor: dynamicColor, 
                                    color: isSelected ? "#3b82f6" : "white", 
                                    weight: isSelected ? 4 : 2, 
                                    fillOpacity: isSelected ? 0.8 : 0.6 
                                }} 
                            >
                                <Tooltip permanent direction="center" className="bg-transparent border-none shadow-none">
                                    <div className="flex flex-col items-center">
                                        <span className="font-black text-[9px] text-slate-800 drop-shadow-sm">{p.waitTime || p.wait}m</span>
                                        {(zoomLevel > 14 || isSelected) && <span className="text-[7px] text-slate-900 font-bold drop-shadow-sm">{p.paxCount} pax</span>}
                                    </div>
                                </Tooltip>
                            </Circle>
                        );
                    })}

                    {/* --- RISK ZONES --- */}
                    {activeTab === 'peak' && riskZones.map(z => {
                        const isSelected = selectedItem?.id === z.id;
                        return (
                            <Circle 
                                key={z.id} 
                                center={[z.lat, z.lng]} 
                                radius={400} 
                                eventHandlers={{ 
                                    mouseover: (e) => { L.DomEvent.stopPropagation(e); setSelectedItem({ ...z, dataType: 'risk' }); },
                                    click: (e) => { L.DomEvent.stopPropagation(e); setSelectedItem({ ...z, dataType: 'risk' }); }
                                }} 
                                pathOptions={{ 
                                    fillColor: z.color, 
                                    color: z.color, 
                                    weight: isSelected ? 4 : 2, 
                                    fillOpacity: isSelected ? 0.6 : 0.3, 
                                    dashArray: '10, 10' 
                                }} 
                            >
                                <Tooltip permanent direction="top"><div className="text-[9px] font-black tracking-tighter bg-white/90 px-1 rounded border" style={{ color: z.color }}>RISK</div></Tooltip>
                            </Circle>
                        );
                    })}
                </MapContainer>

                {/* Header Overlay */}
                <div className="absolute top-4 left-4 right-4 md:right-auto md:w-[240px] z-[500]"><Card className="bg-white/90 backdrop-blur-sm shadow-sm border-none"><CardHeader className="px-2 py-1"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-7 w-7 bg-blue-700 rounded-md flex items-center justify-center text-white"><Activity size={14} /></div><div><CardTitle className="text-[10px] font-black text-slate-900 tracking-tighter uppercase">Marikina Mobility</CardTitle><CardDescription className="text-[8px] font-bold text-blue-600 uppercase">Live Ops</CardDescription></div></div><Badge variant="destructive" className="animate-pulse text-[7px] h-3 px-1">LIVE</Badge></div></CardHeader></Card></div>
                
                {/* --- FLOATING DESCRIPTIVE DETAIL CARD --- */}
                {selectedItem && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm animate-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200 p-0 overflow-hidden">
                            {/* Card Header */}
                            <div className={`p-3 text-white flex justify-between items-start ${selectedItem.dataType === 'risk' ? 'bg-purple-600' : selectedItem.dataType === 'heatmap' ? 'bg-red-600' : 'bg-blue-600'}`}>
                                <div>
                                    <div className="flex items-center gap-2">
                                        {selectedItem.dataType === 'risk' ? <ShieldAlert size={16}/> : selectedItem.dataType === 'heatmap' ? <Users size={16}/> : <Navigation size={16}/>}
                                        <h3 className="text-sm font-bold">{selectedItem.name || selectedItem.area}</h3>
                                    </div>
                                    <p className="text-[10px] opacity-90 mt-0.5">{selectedItem.type || selectedItem.status || "Traffic Segment"}</p>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="text-white/80 hover:text-white"><X size={16}/></button>
                            </div>

                            {/* Descriptive Body */}
                            <div className="p-4 space-y-3">
                                {/* HEATMAP DETAILS */}
                                {selectedItem.dataType === 'heatmap' && (
                                    <>
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1.5"><Users size={14} className="text-slate-400"/> <span className="font-bold text-slate-700">{selectedItem.paxCount} Passengers</span></div>
                                            <div className="flex items-center gap-1.5"><Timer size={14} className="text-slate-400"/> <span className="font-bold text-red-600">{selectedItem.waitTime || selectedItem.wait} mins wait</span></div>
                                        </div>
                                        {selectedItem.action && (
                                            <div className="bg-red-50 border border-red-100 p-2 rounded text-[11px] text-red-800">
                                                <span className="font-bold uppercase text-[9px] text-red-400 block mb-1">Recommended Action</span>
                                                {selectedItem.action}
                                            </div>
                                        )}
                                        {selectedItem.status && <div className="text-[10px] text-slate-500 italic text-right">{selectedItem.status}</div>}
                                    </>
                                )}

                                {/* RISK ZONE DETAILS */}
                                {selectedItem.dataType === 'risk' && (
                                    <>
                                        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400"/> <span className="font-semibold">{selectedItem.time}</span></div>
                                            <div className="font-bold text-purple-600">{selectedItem.affectedCount} Affected</div>
                                        </div>
                                        {selectedItem.hazards && (
                                            <div>
                                                <span className="font-bold uppercase text-[9px] text-slate-400 block mb-1">Identified Hazards</span>
                                                <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                                                    {selectedItem.hazards.map((h: string, i: number) => <li key={i}>{h}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ROAD DETAILS */}
                                {selectedItem.dataType === 'road' && (
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs">{selectedItem.status}</Badge>
                                        <span className="text-sm font-black text-slate-700">{selectedItem.count}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Panel */}
            <div className="z-[500] bg-background border-t h-[30%] md:h-[30%] flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] w-full">
                <div className="p-3 border-b flex justify-between items-center bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="grid grid-cols-3 gap-1 w-full bg-indigo-600/10 p-1 rounded-lg">
                        <button onClick={() => { setActiveTab('pain'); setShowAddForm(false); }} className={`flex items-center justify-center gap-2 py-2 rounded-md text-[10px] md:text-xs font-bold transition-all ${activeTab === 'pain' ? 'bg-background shadow-sm text-foreground ring-1 ring-black/5' : 'text-foreground/70 hover:bg-background/50 hover:text-foreground'}`}><Users size={14} /> <span>Pain Points</span></button>
                        <button onClick={() => { setActiveTab('congestion'); setShowAddForm(false); }} className={`flex items-center justify-center gap-2 py-2 rounded-md text-[10px] md:text-xs font-bold transition-all ${activeTab === 'congestion' ? 'bg-background shadow-sm text-foreground ring-1 ring-black/5' : 'text-foreground/70 hover:bg-background/50 hover:text-foreground'}`}><Navigation size={14} /> <span>Congestion</span></button>
                        <button onClick={() => { setActiveTab('peak'); setShowAddForm(false); }} className={`flex items-center justify-center gap-2 py-2 rounded-md text-[10px] md:text-xs font-bold transition-all ${activeTab === 'peak' ? 'bg-background shadow-sm text-foreground ring-1 ring-black/5' : 'text-foreground/70 hover:bg-background/50 hover:text-foreground'}`}><Clock size={14} /> <span>Peak Risk Zones</span></button>
                    </div>
                    {((activeTab === 'pain' && onAddPainPoint) || (activeTab === 'congestion' && onAddRoadSegment) || (activeTab === 'peak' && onAddRiskZone)) && (
                        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="ml-3 bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0 transition-all hover:scale-105 shadow-md">{showAddForm ? <X size={16} /> : <Plus size={16} />}</Button>
                    )}
                </div>
                
                {/* Add Form */}
                {showAddForm && (
                    <div className="p-4 bg-blue-50 border-b border-blue-100 flex gap-2 flex-wrap items-end animate-in slide-in-from-top-2">
                        <div className="w-full"><label className="text-xs font-bold text-slate-700">Name</label><Input value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} className="h-8 text-xs bg-white" /></div>
                        <div className="flex gap-2 w-full">
                            <div className="flex-1"><label className="text-xs font-bold text-slate-700">Lat</label><Input value={formData.lat} onChange={(e) => setFormData({...formData, lat: e.target.value})} className="h-8 text-xs bg-white" /></div>
                            <div className="flex-1"><label className="text-xs font-bold text-slate-700">Lng</label><Input value={formData.lng} onChange={(e) => setFormData({...formData, lng: e.target.value})} className="h-8 text-xs bg-white" /></div>
                            <Button size="sm" onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white h-8 mt-auto">Save</Button>
                        </div>
                    </div>
                )}

                {/* DESCRIPTIVE LIST VIEW */}
                <div className="flex-1 overflow-y-auto p-4 w-full space-y-2">
                    {/* --- HEATMAP LIST ITEMS --- */}
                    {activeTab === 'pain' && painPoints.map(item => (
                        <div 
                            key={item.id} 
                            onMouseEnter={() => setSelectedItem({ ...item, dataType: 'heatmap' })}
                            onMouseLeave={() => setSelectedItem(null)}
                            onClick={() => setSelectedItem({ ...item, dataType: 'heatmap' })} 
                            className={`flex flex-col p-3 rounded-xl border transition-all ${selectedItem?.id === item.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-white hover:bg-slate-50'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        {item.name || item.area}
                                        {item.trend === 'Rising' && <TrendingUp size={14} className="text-red-500" />}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium">{item.type}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-slate-800">{item.paxCount} pax</div>
                                    <div className="text-[10px] text-red-600 font-bold">{item.waitTime || item.wait}m wait</div>
                                </div>
                            </div>
                            
                            {/* Action Bar */}
                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                                <div className="text-[10px] text-slate-600 flex-1 mr-2">
                                    <span className="font-bold text-slate-400 uppercase text-[8px] block">Action</span>
                                    {item.action || "Monitor"}
                                </div>
                                {onRemovePainPoint && (
                                    <button onClick={(e) => { e.stopPropagation(); onRemovePainPoint(item.id); }} className="text-slate-300 hover:text-red-600">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* --- ROAD LIST ITEMS --- */}
                    {activeTab === 'congestion' && roadSegments.map(road => (
                        <div 
                            key={road.id} 
                            onMouseEnter={() => setSelectedItem({ ...road, dataType: 'road' })}
                            onMouseLeave={() => setSelectedItem(null)}
                            onClick={() => setSelectedItem({ ...road, dataType: 'road' })} 
                            className={`flex items-center justify-between p-3 rounded-xl border mb-2 shadow-sm cursor-pointer transition-all ${selectedItem?.id === road.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-white hover:bg-slate-50'}`}
                        >
                            <div className="text-sm font-bold text-slate-800">{road.name}</div>
                            <div className="flex items-center gap-3">
                                <Badge style={{ backgroundColor: road.color }} className="text-[10px]">{road.status}</Badge>
                                {onRemoveRoadSegment && (
                                    <button onClick={(e) => { e.stopPropagation(); onRemoveRoadSegment(road.id); }} className="p-1 text-slate-300 hover:text-red-600 transition-colors">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* --- RISK ZONE LIST ITEMS --- */}
                    {activeTab === 'peak' && riskZones.map(zone => (
                        <div 
                            key={zone.id} 
                            onMouseEnter={() => setSelectedItem({ ...zone, dataType: 'risk' })}
                            onMouseLeave={() => setSelectedItem(null)}
                            onClick={() => setSelectedItem({ ...zone, dataType: 'risk' })} 
                            className={`flex flex-col p-3 rounded-xl border-l-4 border-l-orange-500 border transition-all ${selectedItem?.id === zone.id ? 'bg-orange-50 border-orange-200' : 'bg-white hover:bg-slate-50'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-sm font-bold text-slate-800">{zone.name}</div>
                                <div className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{zone.riskLevel}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 mb-2">
                                <div className="flex items-center gap-1"><Clock size={12}/> {zone.time}</div>
                                <div className="flex items-center gap-1"><AlertTriangle size={12}/> {zone.affectedCount} People</div>
                            </div>

                            {/* Hazards List */}
                            {zone.hazards && zone.hazards.length > 0 && (
                                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-end">
                                    <div className="flex-1">
                                        <span className="font-bold text-slate-400 uppercase text-[8px] block mb-0.5">Primary Hazard</span>
                                        <span className="text-[10px] text-slate-700 block leading-tight">{zone.hazards[0]}</span>
                                    </div>
                                    {onRemoveRiskZone && (
                                        <button onClick={(e) => { e.stopPropagation(); onRemoveRiskZone(zone.id); }} className="text-slate-300 hover:text-red-600 ml-2">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}