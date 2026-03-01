import { useState, useMemo } from 'react';
import { Bus, Fuel, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  mockBuses,
  mockTrips,
  getOperatorById,
  getRouteById,
  busStatusConfig,
  type Bus as BusType,
  type BusStatus,
} from '@/data/schedule';

export default function FleetStatusTab() {
  const [selectedStatus, setSelectedStatus] = useState<BusStatus | 'all'>('all');
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);

  // Filter buses
  const filteredBuses = useMemo(() => {
    return mockBuses.filter(bus => {
      if (selectedStatus === 'all') return true;
      return bus.status === selectedStatus;
    });
  }, [selectedStatus]);

  // Get current trip for a bus
  const getCurrentTrip = (busId: string) => {
    return mockTrips.find(trip => 
      trip.bus_id === busId && 
      (trip.status === 'arriving' || trip.status === 'boarding' || trip.status === 'scheduled')
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Stats */}
      <div className="bg-white border-b p-4 space-y-3">
        {/* Status Filter */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Filter by Status</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              All
            </Button>
            {(Object.keys(busStatusConfig) as BusStatus[]).map(status => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(status)}
                className="text-xs"
              >
                {busStatusConfig[status].label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bus Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredBuses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No buses found for selected filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredBuses.map((bus) => {
              const operator = getOperatorById(bus.operator_id);
              const currentTrip = getCurrentTrip(bus.id);
              const route = currentTrip ? getRouteById(currentTrip.route_id) : null;

              return (
                <div
                  key={bus.id}
                  className={cn(
                    "border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                    bus.status === 'active' ? "border-green-200 bg-green-50" :
                    bus.status === 'maintenance' ? "border-orange-200 bg-orange-50" :
                    "border-gray-200 bg-gray-50"
                  )}
                  onClick={() => setSelectedBus(bus)}
                >
                  {/* Bus Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{bus.id}</h3>
                      <p className="text-xs text-gray-600">{bus.plate_number}</p>
                      <p className="text-xs text-gray-600 font-semibold">{operator?.shortName}</p>
                    </div>
                    <Badge className={cn(busStatusConfig[bus.status].color, "text-white")}>
                      {busStatusConfig[bus.status].label}
                    </Badge>
                  </div>

                  {/* Current Trip Info */}
                  {currentTrip && route ? (
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-500 mb-1">Current Trip</p>
                      <p className="font-semibold text-sm">{route.destination}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-600">Gate {currentTrip.gate} / Bay {currentTrip.bay}</p>
                        {currentTrip.delay_minutes > 0 && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                            +{currentTrip.delay_minutes} min
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-500 italic">No active trip</p>
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Bus className="w-4 h-4 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500">Capacity</p>
                      <p className="text-sm font-bold">{bus.capacity}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Fuel className={cn(
                          "w-4 h-4",
                          bus.fuel_level > 60 ? "text-green-500" :
                          bus.fuel_level > 30 ? "text-yellow-500" :
                          "text-red-500"
                        )} />
                      </div>
                      <p className="text-xs text-gray-500">Fuel</p>
                      <p className={cn(
                        "text-sm font-bold",
                        bus.fuel_level > 60 ? "text-green-600" :
                        bus.fuel_level > 30 ? "text-yellow-600" :
                        "text-red-600"
                      )}>
                        {bus.fuel_level}%
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Wrench className="w-4 h-4 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500">Last Maint.</p>
                      <p className="text-xs font-semibold">
                        {bus.last_maintenance.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Warnings */}
                  {bus.fuel_level < 30 && (
                    <div className="mt-3 bg-red-100 border border-red-300 rounded p-2">
                      <p className="text-xs text-red-700 font-semibold"> Low Fuel Alert</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Bus Detail (Bottom Sheet) */}
      {selectedBus && (
        <div className="border-t bg-white p-4 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg">{selectedBus.id}</h3>
              <p className="text-sm text-gray-600">{selectedBus.plate_number}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBus(null)}
            >
              ✕
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Operator</p>
                <p className="font-semibold">{getOperatorById(selectedBus.operator_id)?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Capacity</p>
                <p className="font-semibold">{selectedBus.capacity} passengers</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fuel Level</p>
                <p className="font-semibold">{selectedBus.fuel_level}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-semibold">{busStatusConfig[selectedBus.status].label}</p>
              </div>
            </div>

            <div className="pt-2 border-t">
              <Button variant="outline" size="sm" className="w-full">
                View Trip History
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}