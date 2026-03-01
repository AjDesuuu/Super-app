import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { mockStations } from "@/data/operator-data";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

type LineFilter = "all" | "LRT-1" | "LRT-2" | "MRT-3";

const getCrowdLevel = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return "critical";
    if (percentage >= 75) return "high";
    if (percentage >= 50) return "moderate";
    return "low";
};

const getCrowdColor = (level: string) => {
    switch (level) {
        case "critical": return "#EF4444";
        case "high": return "#F59E0B";
        case "moderate": return "#F59E0B";
        case "low": return "#10B981";
        default: return "#10B981";
    }
};

const getLineColor = (line: string) => {
    switch (line) {
        case "LRT-1": return "#fbbf24";
        case "LRT-2": return "#a855f7";
        case "MRT-3": return "#3b82f6";
        default: return "#6b7280";
    }
};

export default function LeafletStationHeatMap() {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<Map<string, { marker: L.Marker; circle: L.Circle }>>(new Map());
    const [selectedLine, setSelectedLine] = useState<LineFilter>("all");

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        mapRef.current = L.map(mapContainerRef.current, {
            zoomControl: true,
            attributionControl: false,
        }).setView([14.6000, 121.0300], 12);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            maxZoom: 19,
        }).addTo(mapRef.current);

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update markers based on filter
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(({ marker, circle }) => {
            mapRef.current?.removeLayer(marker);
            mapRef.current?.removeLayer(circle);
        });
        markersRef.current.clear();

        // Filter stations
        const filteredStations = selectedLine === "all" 
            ? mockStations 
            : mockStations.filter(s => s.line === selectedLine);

        // Add markers for filtered stations
        filteredStations.forEach(station => {
            const crowdLevel = getCrowdLevel(station.currentCrowd, station.capacity);
            const crowdColor = getCrowdColor(crowdLevel);
            const lineColor = getLineColor(station.line);
            const crowdPercentage = Math.round((station.currentCrowd / station.capacity) * 100);

            // Create custom marker
            const markerIcon = L.divIcon({
                className: "custom-station-marker",
                html: `
                    <div style="
                        position: relative;
                        width: 24px;
                        height: 24px;
                    ">
                        <div style="
                            width: 24px;
                            height: 24px;
                            background-color: ${lineColor};
                            border: 3px solid white;
                            border-radius: 50%;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            cursor: pointer;
                            transition: transform 0.2s;
                        "></div>
                        <div style="
                            position: absolute;
                            top: -8px;
                            right: -8px;
                            width: 16px;
                            height: 16px;
                            background-color: ${crowdColor};
                            border: 2px solid white;
                            border-radius: 50%;
                            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                        "></div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            const marker = L.marker(station.coordinates, { 
                icon: markerIcon,
                zIndexOffset: 1000 
            }).addTo(mapRef.current!);

            // Create radius circle based on crowd density
            const radiusMeters = 100 + (crowdPercentage * 3);
            const circle = L.circle(station.coordinates, {
                color: crowdColor,
                fillColor: crowdColor,
                fillOpacity: 0.15 + (crowdPercentage / 200),
                opacity: 0.4,
                radius: radiusMeters,
            }).addTo(mapRef.current!);

            // Popup content
            marker.bindPopup(`
                <div style="font-family: system-ui; min-width: 180px;">
                    <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: ${lineColor};">
                        ${station.name}
                    </div>
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 8px;">
                        ${station.line}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px;">
                            <span style="color: #6b7280;">Current:</span>
                            <span style="font-weight: 600; color: ${crowdColor};">${station.currentCrowd}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px;">
                            <span style="color: #6b7280;">Capacity:</span>
                            <span style="font-weight: 600;">${station.capacity}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px;">
                            <span style="color: #6b7280;">Level:</span>
                            <span style="font-weight: 600; color: ${crowdColor}; text-transform: uppercase;">${crowdLevel}</span>
                        </div>
                        <div style="margin-top: 4px; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; background: ${crowdColor}; width: ${crowdPercentage}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="text-align: center; font-size: 11px; color: #6b7280; margin-top: 2px;">
                            ${crowdPercentage}% Full
                        </div>
                    </div>
                </div>
            `, {
                maxWidth: 250,
                className: 'custom-popup'
            });

            // Hover effects
            marker.on('mouseover', () => {
                circle.setStyle({ 
                    fillOpacity: 0.3,
                    opacity: 0.6 
                });
            });

            marker.on('mouseout', () => {
                circle.setStyle({ 
                    fillOpacity: 0.15 + (crowdPercentage / 200),
                    opacity: 0.4 
                });
            });

            markersRef.current.set(station.id, { marker, circle });
        });

        // Fit bounds to show all filtered stations
        if (filteredStations.length > 0 && mapRef.current) {
            const bounds = L.latLngBounds(filteredStations.map(s => s.coordinates));
            mapRef.current.fitBounds(bounds, { 
                padding: [50, 50],
                maxZoom: 13 
            });
        }
    }, [selectedLine]);

    return (
        <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    size="sm"
                    variant={selectedLine === "all" ? "default" : "outline"}
                    onClick={() => setSelectedLine("all")}
                    className="text-xs"
                >
                    All Stations
                </Button>
                <Button
                    size="sm"
                    variant={selectedLine === "LRT-1" ? "default" : "outline"}
                    onClick={() => setSelectedLine("LRT-1")}
                    className="text-xs"
                    style={selectedLine === "LRT-1" ? { 
                        backgroundColor: "#fbbf24", 
                        borderColor: "#fbbf24" 
                    } : {}}
                >
                    LRT-1
                </Button>
                <Button
                    size="sm"
                    variant={selectedLine === "LRT-2" ? "default" : "outline"}
                    onClick={() => setSelectedLine("LRT-2")}
                    className="text-xs"
                    style={selectedLine === "LRT-2" ? { 
                        backgroundColor: "#a855f7", 
                        borderColor: "#a855f7" 
                    } : {}}
                >
                    LRT-2
                </Button>
                <Button
                    size="sm"
                    variant={selectedLine === "MRT-3" ? "default" : "outline"}
                    onClick={() => setSelectedLine("MRT-3")}
                    className="text-xs"
                    style={selectedLine === "MRT-3" ? { 
                        backgroundColor: "#3b82f6", 
                        borderColor: "#3b82f6" 
                    } : {}}
                >
                    MRT-3
                </Button>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">Low (0-50%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-muted-foreground">Moderate (51-75%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-muted-foreground">High (76-90%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-muted-foreground">Critical (90%+)</span>
                </div>
            </div>

            {/* Map Container */}
            <div 
                ref={mapContainerRef} 
                className="w-full rounded-lg border border-border overflow-hidden"
                style={{ height: "500px" }}
            />

            {/* Station Count */}
            <div className="text-sm text-muted-foreground text-center">
                Showing {selectedLine === "all" ? mockStations.length : mockStations.filter(s => s.line === selectedLine).length} stations
                {selectedLine !== "all" && ` on ${selectedLine}`}
            </div>
        </div>
    );
}