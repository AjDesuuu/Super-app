import { useState, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Filter, Search, Plus, X, Save, AlertTriangle, MapPin, Activity, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Initial Data with Coordinates (Marikina/QC Area context)
const initialLogs = [
    { id: "LOG-001", time: "10:42 AM", type: "Incident", location: "Barangka Flyover", lat: 14.6366, lng: 121.0864, details: "Vehicle Collision reported by User #992", status: "Resolved" },
    { id: "LOG-002", time: "10:30 AM", type: "System", location: "Marikina Bayan", lat: 14.6330, lng: 121.0960, details: "Crowd density threshold exceeded (>400)", status: "Alert Sent" },
    { id: "LOG-003", time: "09:15 AM", type: "Traffic", location: "Marcos Hwy", lat: 14.6251, lng: 121.0984, details: "Gridlock detected via GPS Velocity", status: "Monitoring" },
    { id: "LOG-004", time: "08:00 AM", type: "Maintenance", location: "Tumana Bridge", lat: 14.6540, lng: 121.0920, details: "Scheduled structural inspection", status: "Ongoing" },
    { id: "LOG-005", time: "07:45 AM", type: "User Report", location: "Riverbanks", lat: 14.6310, lng: 121.0820, details: "Slippery walkway reported", status: "Pending" },
];

export default function ReportsView() {
    // State for Logs
    const [logs, setLogs] = useState(initialLogs);
    
    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    // State for New Report Form
    const [newReport, setNewReport] = useState({
        type: "Incident",
        location: "",
        lat: "", // Store as string initially for input handling
        lng: "",
        details: "",
        status: "Pending"
    });

    // --- LOGIC: AUTO-CALCULATE RISK ZONES ---
    const riskZones = useMemo(() => {
        const locationCounts: Record<string, { count: number, types: string[] }> = {};
        logs.forEach(log => {
            if (log.status !== "Resolved") {
                if (!locationCounts[log.location]) {
                    locationCounts[log.location] = { count: 0, types: [] };
                }
                locationCounts[log.location].count += 1;
                locationCounts[log.location].types.push(log.type);
            }
        });
        return Object.entries(locationCounts)
            .map(([location, data]) => ({ location, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
    }, [logs]);

    // Handle Input Changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewReport(prev => ({ ...prev, [name]: value }));
    };

    // --- NEW: GET CURRENT GPS LOCATION ---
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setNewReport(prev => ({
                    ...prev,
                    lat: position.coords.latitude.toFixed(6), // Limit decimals
                    lng: position.coords.longitude.toFixed(6)
                }));
                setIsLocating(false);
            },
            () => {
                alert("Unable to retrieve your location");
                setIsLocating(false);
            }
        );
    };

    // Handle Form Submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const nextIdNum = logs.length + 1;
        const newId = `LOG-${String(nextIdNum).padStart(3, '0')}`;
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const logEntry = {
            id: newId,
            time: timeString,
            type: newReport.type,
            location: newReport.location,
            lat: parseFloat(newReport.lat) || 0, // Convert back to number
            lng: parseFloat(newReport.lng) || 0,
            details: newReport.details,
            status: newReport.status
        };

        setLogs([logEntry, ...logs]);
        setNewReport({ type: "Incident", location: "", lat: "", lng: "", details: "", status: "Pending" });
        setIsModalOpen(false);
    };

    // Handle CSV Export
    const handleExportCSV = () => {
        // Logic to export logs as CSV
        const csvContent = logs.map(log => `${log.id},${log.time},${log.type},${log.location},${log.details},${log.status}`).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'incident_reports.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-full bg-background p-4 md:p-8 overflow-y-auto relative">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                            <FileText className="text-blue-600" /> Operational Logs
                        </h2>
                        <p className="text-muted-foreground text-sm">Real-time monitoring and incident reporting</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:scale-105 transition-transform">
                            <Plus className="h-4 w-4 mr-2"/> Add Report
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="h-4 w-4 mr-2"/> Export CSV</Button>
                    </div>
                </div>

                {/* --- DYNAMIC PEAK RISK ZONES --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {riskZones.length > 0 ? (
                        riskZones.map((zone, idx) => (
                            <Card key={zone.location} className={`border-l-4 shadow-sm ${idx === 0 ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                                <CardContent className="p-4 flex items-start justify-between">
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                                            {idx === 0 ? <AlertTriangle className="h-3 w-3 text-red-500"/> : <Activity className="h-3 w-3 text-amber-500"/>}
                                            Risk Zone #{idx + 1}
                                        </div>
                                        <div className="font-bold text-lg flex items-center gap-1">
                                            <MapPin className="h-4 w-4 text-muted-foreground"/> {zone.location}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {zone.count} Active Issue{zone.count > 1 ? 's' : ''} ({zone.types.join(", ")})
                                        </div>
                                    </div>
                                    <Badge variant={idx === 0 ? "destructive" : "default"} className={idx !== 0 ? "bg-amber-500 hover:bg-amber-600" : ""}>
                                        {idx === 0 ? "CRITICAL" : "HIGH"}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="col-span-3 border-dashed bg-muted/50">
                            <CardContent className="p-6 text-center text-muted-foreground text-sm">
                                No critical risk zones detected. System status is normal.
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search logs..." className="pl-8 bg-background" />
                    </div>
                    <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                </div>

                {/* Table Card */}
                <Card className="shadow-sm overflow-hidden border">
                    <div className="overflow-x-auto">
                        <div className="min-w-[900px]"> {/* Increased width to fit coords */}
                            <CardHeader className="border-b bg-muted/50 py-3">
                                <div className="grid grid-cols-12 text-xs font-bold text-muted-foreground uppercase tracking-wider px-4">
                                    <div className="col-span-2">Time</div>
                                    <div className="col-span-2">Type</div>
                                    <div className="col-span-3">Location & Coords</div>
                                    <div className="col-span-3">Details</div>
                                    <div className="col-span-2 text-right">Status</div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 bg-card">
                                {logs.map((log, i) => (
                                    <div key={log.id} className={`grid grid-cols-12 gap-2 p-4 text-sm items-center hover:bg-muted/50 transition-colors ${i !== logs.length - 1 ? 'border-b' : ''}`}>
                                        <div className="col-span-2 font-mono text-xs text-muted-foreground">
                                            {log.time} 
                                            <span className="block text-[10px] text-muted-foreground/60">{log.id}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <Badge variant="outline" className="font-normal">{log.type}</Badge>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="font-medium text-foreground">{log.location}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono">
                                                {log.lat}, {log.lng}
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-muted-foreground truncate" title={log.details}>{log.details}</div>
                                        <div className="col-span-2 text-right">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                                ${log.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                                  log.status === 'Alert Sent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                                                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                {log.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </div>
                    </div>
                </Card>
            </div>

            {/* --- CUSTOM MODAL OVERLAY --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md shadow-lg animate-in fade-in zoom-in-95 duration-200 bg-background border-border">
                        <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                            <h3 className="text-lg font-semibold text-foreground">New Operational Report</h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-foreground">Report Type</label>
                                    <select 
                                        name="type" 
                                        value={newReport.type}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                                    >
                                        <option value="Incident">Incident</option>
                                        <option value="System">System</option>
                                        <option value="Traffic">Traffic</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="User Report">User Report</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-foreground">Location Name</label>
                                    <Input 
                                        name="location" 
                                        placeholder="e.g., Marcos Highway" 
                                        required 
                                        value={newReport.location}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* --- NEW: GPS COORDINATES INPUTS --- */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-foreground">Latitude</label>
                                        <Input name="lat" placeholder="14.xxxx" required value={newReport.lat} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-foreground">Longitude</label>
                                        <Input name="lng" placeholder="121.xxxx" required value={newReport.lng} onChange={handleInputChange} />
                                    </div>
                                </div>
                                
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    size="sm" 
                                    className="w-full text-xs" 
                                    onClick={handleGetLocation}
                                    disabled={isLocating}
                                >
                                    {isLocating ? "Locating..." : <><Crosshair className="h-3 w-3 mr-2"/> Auto-Detect My GPS</>}
                                </Button>
                                {/* ----------------------------------- */}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-foreground">Details</label>
                                    <Input 
                                        name="details" 
                                        placeholder="Brief description..." 
                                        required 
                                        value={newReport.details}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-foreground">Current Status</label>
                                    <select 
                                        name="status" 
                                        value={newReport.status}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Monitoring">Monitoring</option>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Alert Sent">Alert Sent</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        <Save className="h-4 w-4 mr-2" /> Save Log
                                    </Button>
                                </div>
                            </CardContent>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}