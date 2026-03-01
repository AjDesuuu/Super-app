import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';
import {
  mockBuses,
  mockRoutes,
  busStatusConfig,
  getRouteById,
  type Bus,
  type BusStatus
} from '@/data/busOperatorData.ts';
import { getRoutePolyline } from '@/lib/busRouting'; // Add this import




export default function FleetTab() {
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<BusStatus | 'all'>('all');
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [routePolylines, setRoutePolylines] = useState<Record<string, [number, number][]>>({});
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  


  // Filter buses
  const filteredBuses = useMemo(() => {
    return mockBuses.filter(bus => {
      const routeMatch = selectedRoute === 'all' || bus.routeId === selectedRoute;
      const statusMatch = selectedStatus === 'all' || bus.status === selectedStatus;
      return routeMatch && statusMatch;
    });
  }, [selectedRoute, selectedStatus]);

// Fetch OSRM routes on mount
  useEffect(() => {
  async function fetchAllRoutes() {
    setIsLoadingRoutes(true);
    const polylines: Record<string, [number, number][]> = {};
    
    // Helper to add delay between requests (rate limiting)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    for (const route of mockRoutes) {
      const stops = route.stops;
      const allPoints: [number, number][] = [];
      
      // Get OSRM route between consecutive stops
      for (let i = 0; i < stops.length - 1; i++) {
        try {
          const segment = await getRoutePolyline(
            stops[i].location.lat,
            stops[i].location.lng,
            stops[i + 1].location.lat,
            stops[i + 1].location.lng
          );
          
          if (segment) {
            allPoints.push(...segment);
          } else {
            // Fallback to straight line if OSRM fails
            allPoints.push(
              [stops[i].location.lat, stops[i].location.lng],
              [stops[i + 1].location.lat, stops[i + 1].location.lng]
            );
          }
          
          // Wait 1 second between requests to respect rate limits
          await delay(1000);
        } catch (error) {
          console.error(`Error fetching segment ${i} for route ${route.id}:`, error);
          // Fallback to straight line
          allPoints.push(
            [stops[i].location.lat, stops[i].location.lng],
            [stops[i + 1].location.lat, stops[i + 1].location.lng]
          );
        }
      }
      
      polylines[route.id] = allPoints;
    }
    
    setRoutePolylines(polylines);
    setIsLoadingRoutes(false);
    console.log('✅ All routes loaded with OSRM');
  }
  
  fetchAllRoutes();
}, []); // Run once on mount

// Helper function to get cached polyline
const getCachedRoutePolyline = (routeId: string): [number, number][] => {
  return routePolylines[routeId] || [];
};

  // Get marker color based on status
  const getMarkerColor = (status: BusStatus): string => {
    const colorMap = {
      'on-route': '#22c55e',
      'delayed': '#eab308',
      'stopped': '#ef4444',
      'off-duty': '#9ca3af',
      'maintenance': '#f97316'
    };
    return colorMap[status];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Stats Cards */}
      <div className="bg-white border-b p-4 space-y-3">

        {/* Filter Toggle */}
        <Button
        variant="outline"
        aria-label="Toggle filters"
        onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 pt-2 border-t">
            {/* Route Filter */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Route</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedRoute === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRoute('all')}
                >
                  All Routes
                </Button>
                {mockRoutes.map(route => (
                  <Button
                    key={route.id}
                    variant={selectedRoute === route.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRoute(route.id)}
                  >
                    {route.name.split(' → ')[1]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('all')}
                >
                  All Status
                </Button>
                {(Object.keys(busStatusConfig) as BusStatus[]).map(status => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus(status)}
                  >
                    {busStatusConfig[status].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[14.5547, 121.0244]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Route Lines */}
          {selectedRoute !== 'all' && (
            <Polyline
              positions={getCachedRoutePolyline(selectedRoute)}
              color={getRouteById(selectedRoute)?.color || '#3b82f6'}
              weight={3}
              opacity={0.6}
            />
          )}

          {/* Bus Markers */}
          {filteredBuses.map(bus => (
            <CircleMarker
              key={bus.id}
              center={[bus.location.lat, bus.location.lng]}
              radius={8}
              fillColor={getMarkerColor(bus.status)}
              color="#fff"
              weight={2}
              fillOpacity={0.9}
              eventHandlers={{
                click: () => setSelectedBus(bus)
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{bus.id}</p>
                  <p className="text-xs text-gray-600">{bus.plateNumber}</p>
                  <p className="text-xs mt-1">
                    <span className="font-semibold">Driver:</span> {bus.driver}
                  </p>
                  <p className="text-xs">
                    <span className="font-semibold">Status:</span>{' '}
                    <Badge variant="outline" className="text-xs">
                      {busStatusConfig[bus.status].label}
                    </Badge>
                  </p>
                  <p className="text-xs">
                    <span className="font-semibold">Passengers:</span> {bus.passengers}/{bus.capacity}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Results Counter */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 z-[1000]">
          <p className="text-xs text-gray-600">
            Showing <span className="font-bold">{filteredBuses.length}</span> of {mockBuses.length} buses
          </p>
        </div>
        {/* Loading Routes Indicator */}
        {isLoadingRoutes && (
    <div className="absolute top-16 left-4 bg-blue-500 text-white rounded-lg shadow-md px-3 py-2 z-[1000] animate-pulse">
        <p className="text-xs font-semibold">📍 Loading accurate routes...</p>
    </div>
    )}
      </div>

      {/* Selected Bus Detail Sheet */}
      {selectedBus && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-lg z-[1000] max-h-[40vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{selectedBus.id}</h3>
                <p className="text-sm text-gray-600">{selectedBus.plateNumber}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBus(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  busStatusConfig[selectedBus.status].color,
                  "text-white"
                )}>
                  {busStatusConfig[selectedBus.status].label}
                </Badge>
                {selectedBus.delayMinutes > 0 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    +{selectedBus.delayMinutes} min delay
                  </Badge>
                )}
              </div>

              {/* Route Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Route</p>
                  <p className="text-sm font-semibold">
                    {getRouteById(selectedBus.routeId)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Driver</p>
                  <p className="text-sm font-semibold">{selectedBus.driver}</p>
                </div>
              </div>

              {/* Current Location */}
              <div>
                <p className="text-xs text-gray-500">Current Location</p>
                <p className="text-sm font-semibold">{selectedBus.currentStop}</p>
                <p className="text-xs text-gray-600">Next: {selectedBus.nextStop}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Passengers</p>
                  <p className="text-sm font-bold">{selectedBus.passengers}/{selectedBus.capacity}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className={cn(
                        "h-1.5 rounded-full",
                        selectedBus.passengers / selectedBus.capacity > 0.8 ? "bg-red-500" :
                        selectedBus.passengers / selectedBus.capacity > 0.6 ? "bg-yellow-500" :
                        "bg-green-500"
                      )}
                      style={{ width: `${(selectedBus.passengers / selectedBus.capacity) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Speed</p>
                  <p className="text-sm font-bold">{selectedBus.speed} km/h</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fuel</p>
                  <p className="text-sm font-bold">{selectedBus.fuelLevel}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Updated</p>
                  <p className="text-xs font-semibold">Just now</p>
                </div>
              </div>

              {/* Delay Reason */}
              {selectedBus.delayReason && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-700 font-semibold">Delay Reason</p>
                  <p className="text-sm text-orange-900">
                    {selectedBus.delayReason === 'traffic' && '🚦 Heavy Traffic'}
                    {selectedBus.delayReason === 'breakdown' && '🔧 Mechanical Issue'}
                    {selectedBus.delayReason === 'weather' && '🌧️ Weather Conditions'}
                    {selectedBus.delayReason === 'passenger' && '👥 Passenger Delay'}
                    {selectedBus.delayReason === 'accident' && '⚠️ Road Accident'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}