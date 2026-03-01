import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  mockTrips,
  mockDelayLogs,
  getOperatorById,
  getRouteById,
  getBusById,
  delayReasonConfig,
} from '@/data/schedule';

export default function DelaysTab() {
  // Get delayed trips
  const delayedTrips = useMemo(() => {
    return mockTrips.filter(trip => trip.delay_minutes > 0 || trip.status === 'delayed');
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex flex-col h-full">

      {/* Delayed Trips List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Delayed Trips</h3>
          
          {delayedTrips.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No delays today!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {delayedTrips.map((trip) => {
                const bus = getBusById(trip.bus_id);
                const route = getRouteById(trip.route_id);
                const operator = bus ? getOperatorById(bus.operator_id) : null;

                return (
                  <div
                    key={trip.id}
                    className="border rounded-lg p-3 bg-white"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold">{formatTime(trip.scheduled_time)}</p>
                        <p className="text-sm text-gray-600">{route?.destination}</p>
                      </div>
                      <Badge className="bg-orange-500 text-white">
                        +{trip.delay_minutes} min
                      </Badge>
                    </div>

                    {/* Trip Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-gray-500">Operator:</span>{' '}
                        <span className="font-semibold">{operator?.shortName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Bus:</span>{' '}
                        <span className="font-semibold">{bus?.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Gate/Bay:</span>{' '}
                        <span className="font-semibold">G{trip.gate} / B{trip.bay}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Driver:</span>{' '}
                        <span className="font-semibold">{trip.driver_name}</span>
                      </div>
                    </div>

                    {/* Delay Reason */}
                    {trip.delay_reason ? (
                      <div className="bg-orange-50 border border-orange-200 rounded p-2">
                        <p className="text-xs text-orange-700 font-semibold">
                          {delayReasonConfig[trip.delay_reason].icon}{' '}
                          {delayReasonConfig[trip.delay_reason].label}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded p-2">
                        <p className="text-xs text-gray-500 italic">
                          Delay reason not tagged
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Delay Logs */}
        <div className="p-4 border-t bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Delay Tags</h3>
          
          {mockDelayLogs.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No delay logs yet</p>
          ) : (
            <div className="space-y-2">
              {mockDelayLogs.map((log) => {
                const trip = mockTrips.find(t => t.id === log.trip_id);
                const route = trip ? getRouteById(trip.route_id) : null;

                return (
                  <div
                    key={log.id}
                    className="bg-white border rounded p-2 text-xs"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold">{route?.destination || 'Unknown'}</span>
                      <span className="text-gray-500">
                        {log.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {delayReasonConfig[log.reason].icon} {delayReasonConfig[log.reason].label}
                      {' • '}
                      <span className="text-orange-600 font-semibold">+{log.delay_minutes} min</span>
                    </p>
                    {log.notes && (
                      <p className="text-gray-500 italic mt-1">"{log.notes}"</p>
                    )}
                    <p className="text-gray-400 mt-1">Tagged by: {log.tagged_by}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}