import { useState, useMemo, useEffect } from 'react';
import { Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  mockTrips as initialTrips,
  getOperatorById,
  getRouteById,
  getBusById,
  tripStatusConfig,
  delayReasonConfig,
  type Trip,
  type TripStatus,
  type DelayReason,
} from '@/data/schedule';

export default function ScheduleTab() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [selectedStatus, setSelectedStatus] = useState<TripStatus | 'all'>('all');
  
  // Modal states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [delayDialogOpen, setDelayDialogOpen] = useState(false);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  // Timer tracking for each trip
  const [tripTimers, setTripTimers] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Consolidated update logic - runs every 2 seconds instead of 1
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setLastUpdate(now);
      
      setTrips(prevTrips => {
        let hasChanges = false;
        const newTrips = prevTrips.map(trip => {
          const currentTimer = tripTimers[trip.id] || 0;
          
          // Only process trips with active timers
          if (currentTimer === 0 && trip.status === 'scheduled') {
            return trip;
          }

          const newTimer = currentTimer + 2; // Increment by 2 since interval is 2000ms
          hasChanges = true;

          // Arriving -> Scheduled (after 10/12/14/15 seconds)
          if (trip.status === 'arriving') {
            const thresholds = [10, 12, 14, 15];
            const threshold = thresholds[Math.floor(Math.random() * thresholds.length)];
            if (newTimer >= threshold) {
              setTripTimers(prev => ({...prev, [trip.id]: 0}));
              return {
                ...trip,
                status: 'scheduled' as TripStatus,
                passengers: 0,
                updated_at: new Date()
              };
            }
            setTripTimers(prev => ({...prev, [trip.id]: newTimer}));
          }

          // Boarding -> Departed (after 5/10/12 seconds)
          if (trip.status === 'boarding') {
            const thresholds = [5, 10, 12];
            const threshold = thresholds[Math.floor(Math.random() * thresholds.length)];
            
            if (newTimer >= threshold) {
              setTripTimers(prev => ({...prev, [trip.id]: 0}));
              const bus = getBusById(trip.bus_id);
              const capacity = bus?.capacity || 50;
              return {
                ...trip,
                status: 'departed' as TripStatus,
                actual_departure: new Date(),
                passengers: Math.min(trip.passengers + 5, capacity),
                updated_at: new Date()
              };
            }
            
            // Gradually add passengers while boarding
            const bus = getBusById(trip.bus_id);
            const capacity = bus?.capacity || 50;
            const newPassengers = Math.min(trip.passengers + 2, capacity);
            setTripTimers(prev => ({...prev, [trip.id]: newTimer}));
            return {
              ...trip,
              passengers: newPassengers
            };
          }

          // Departed -> Scheduled (after 60 seconds / 1 minute)
          if (trip.status === 'departed') {
            if (newTimer >= 60) {
              setTripTimers(prev => ({...prev, [trip.id]: 0}));
              return {
                ...trip,
                status: 'scheduled' as TripStatus,
                passengers: 0,
                delay_minutes: 0,
                delay_reason: undefined,
                actual_departure: undefined,
                updated_at: new Date()
              };
            }
            setTripTimers(prev => ({...prev, [trip.id]: newTimer}));
          }

          // Delayed -> Arriving (when delay countdown finishes)
          if (trip.status === 'delayed') {
            const delaySeconds = trip.delay_minutes * 60;
            if (newTimer >= delaySeconds) {
              setTripTimers(prev => ({...prev, [trip.id]: 0}));
              return {
                ...trip,
                status: 'arriving' as TripStatus,
                delay_minutes: 0,
                delay_reason: undefined,
                updated_at: new Date()
              };
            }
            setTripTimers(prev => ({...prev, [trip.id]: newTimer}));
          }

          return trip;
        });

        return hasChanges ? newTrips : prevTrips;
      });

      // Random arrival logic - integrated into same interval
      if (Math.random() < 0.3) { // 30% chance every 2 seconds
        setTrips(prevTrips => {
          const availableTrips = prevTrips.filter(t => 
            t.status === 'scheduled' && !tripTimers[t.id]
          );
          
          if (availableTrips.length === 0) return prevTrips;

          const randomTrip = availableTrips[Math.floor(Math.random() * availableTrips.length)];

          return prevTrips.map(trip => {
            if (trip.id === randomTrip.id) {
              setTripTimers(prev => ({...prev, [trip.id]: 0}));
              return {
                ...trip,
                status: 'arriving' as TripStatus,
                updated_at: new Date()
              };
            }
            return trip;
          });
        });
      }
    }, 2000); // Changed from 1000ms to 2000ms

    return () => clearInterval(interval);
  }, [tripTimers]);

  const filteredTrips = useMemo(() => {
    const filtered = trips.filter(trip => {
      if (selectedStatus === 'all') return true;
      return trip.status === selectedStatus;
    });

    // Sort with priority: trips with timers first (arriving, boarding, delayed, departed), then by scheduled time
    return filtered.sort((a, b) => {
      const aHasTimer = tripTimers[a.id] !== undefined && tripTimers[a.id] > 0;
      const bHasTimer = tripTimers[b.id] !== undefined && tripTimers[b.id] > 0;
      
      // Prioritize trips with active timers
      if (aHasTimer && !bHasTimer) return -1;
      if (!aHasTimer && bHasTimer) return 1;
      
      // Among trips with timers, sort by status priority
      const statusPriority: Record<TripStatus, number> = {
        'arriving': 1,
        'boarding': 2,
        'delayed': 3,
        'departed': 4,
        'scheduled': 5,
        'cancelled': 6
      };
      
      const aPriority = statusPriority[a.status];
      const bPriority = statusPriority[b.status];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Finally, sort by scheduled time
      return a.scheduled_time.getTime() - b.scheduled_time.getTime();
    });
  }, [trips, selectedStatus, tripTimers]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatTimer = (seconds: number, status: TripStatus) => {
    if (status === 'delayed') {
      // Show remaining delay time in MM:SS
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  const handleUpdateStatus = (trip: Trip, newStatus: TripStatus) => {
    setTrips(prevTrips => 
      prevTrips.map(t => {
        if (t.id === trip.id) {
          // Reset timer when manually updating status
          setTripTimers(prev => ({...prev, [t.id]: 0}));
          
          // Set appropriate values based on status
          let passengers = t.passengers;
          let delayMinutes = t.delay_minutes;
          let delayReason = t.delay_reason;
          
          if (newStatus === 'boarding') {
            passengers = Math.floor(Math.random() * 20) + 10;
          } else if (newStatus === 'scheduled') {
            passengers = 0;
            delayMinutes = 0;
            delayReason = undefined;
          } else if (newStatus === 'departed') {
            passengers = t.passengers || Math.floor(Math.random() * 30) + 20;
          }

          return {
            ...t,
            status: newStatus,
            passengers,
            delay_minutes: delayMinutes,
            delay_reason: delayReason,
            updated_at: new Date()
          };
        }
        return t;
      })
    );
    setStatusDialogOpen(false);
    setActiveTrip(null);
  };

  const handleTagDelay = (trip: Trip, reason: DelayReason) => {
    setTrips(prevTrips => 
      prevTrips.map(t => {
        if (t.id === trip.id) {
          // Add random delay minutes (5-20 minutes)
          const additionalDelay = Math.floor(Math.random() * 16) + 5;
          const totalDelay = t.delay_minutes + additionalDelay;
          
          // Reset timer to start delay countdown
          setTripTimers(prev => ({...prev, [t.id]: 0}));
          
          return {
            ...t,
            delay_minutes: totalDelay,
            delay_reason: reason,
            status: 'delayed' as TripStatus,
            updated_at: new Date()
          };
        }
        return t;
      })
    );
    setDelayDialogOpen(false);
    setActiveTrip(null);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Trip Schedule</h2>
        <p className="text-xs text-muted-foreground">
          Live departure schedule • Auto-updating • Active trips on top
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          onClick={() => setSelectedStatus('all')}
          variant={selectedStatus === 'all' ? 'default' : 'secondary'}
          size="sm"
          className="whitespace-nowrap"
        >
          All Trips
        </Button>
        {(Object.keys(tripStatusConfig) as TripStatus[]).map(status => (
          <Button
            key={status}
            onClick={() => setSelectedStatus(status)}
            variant={selectedStatus === status ? 'default' : 'secondary'}
            size="sm"
            className="whitespace-nowrap"
          >
            {tripStatusConfig[status].label}
          </Button>
        ))}
      </div>

      {/* Compact Cards */}
      <div className="space-y-2">
        {filteredTrips.map((trip) => {
          const bus = getBusById(trip.bus_id);
          const route = getRouteById(trip.route_id);
          const operator = bus ? getOperatorById(bus.operator_id) : null;
          const statusConfig = tripStatusConfig[trip.status];
          const timer = tripTimers[trip.id] || 0;
          const hasActiveTimer = timer > 0 && ['arriving', 'boarding', 'delayed', 'departed'].includes(trip.status);

          // Status-based background colors
          const getStatusBg = () => {
            switch (trip.status) {
              case 'arriving':
                return 'bg-blue-50/70 border-blue-200';
              case 'boarding':
                return 'bg-green-50/70 border-green-200';
              case 'delayed':
                return 'bg-red-50/70 border-red-200';
              case 'departed':
                return 'bg-purple-50/70 border-purple-200';
              case 'cancelled':
                return 'bg-red-50/70 border-red-200';
              default:
                return ''; // scheduled - default white
            }
          };

          return (
            <Card 
              key={trip.id} 
              className={`p-3 transition-colors ${getStatusBg()}`}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">
                      {formatTime(trip.scheduled_time)}
                    </span>
                    {hasActiveTimer && (
                      <span className="text-xs font-mono text-blue-600">
                        {trip.status === 'delayed' 
                          ? `${formatTimer(timer, trip.status)}/${trip.delay_minutes}:00`
                          : trip.status === 'departed'
                          ? `Return: ${60 - timer}s`
                          : formatTimer(timer, trip.status)
                        }
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {operator?.shortName} • {route?.destination}
                  </div>
                </div>
                <Badge className={`${statusConfig.color} text-white text-xs shrink-0`}>
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Info Row */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    G{trip.gate}/B{trip.bay}
                  </span>
                  <span className="font-medium">{trip.bus_id}</span>
                  {trip.passengers > 0 && trip.status !== 'departed' && trip.status !== 'scheduled' && (
                    <span className="text-muted-foreground">
                      {trip.passengers}/{bus?.capacity || 50}
                    </span>
                  )}
                </div>
                {trip.status === 'delayed' && trip.delay_reason && (
                  <span className="text-orange-600 text-xs truncate max-w-[120px]">
                    {delayReasonConfig[trip.delay_reason].label}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setActiveTrip(trip);
                    setStatusDialogOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={trip.status === 'departed'}
                  className="text-xs h-7 flex-1"
                >
                  Status
                </Button>
                <Button
                  onClick={() => {
                    setActiveTrip(trip);
                    setDelayDialogOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={trip.status === 'departed' || trip.status === 'delayed'}
                  className="text-xs h-7 flex-1"
                >
                  Delay
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-[360px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Update Trip Status</DialogTitle>
            <DialogDescription className="text-xs">
              {activeTrip && `${activeTrip.id} - ${formatTime(activeTrip.scheduled_time)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-3">
            {(Object.keys(tripStatusConfig) as TripStatus[]).map(status => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => activeTrip && handleUpdateStatus(activeTrip, status)}
              >
                <Badge className={`${tripStatusConfig[status].color} text-white mr-2 text-xs`}>
                  
                </Badge>
                {tripStatusConfig[status].label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Delay Dialog */}
      <Dialog open={delayDialogOpen} onOpenChange={setDelayDialogOpen}>
        <DialogContent className="max-w-[360px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Tag Delay Reason</DialogTitle>
            <DialogDescription className="text-xs">
              {activeTrip && `${activeTrip.id} - ${formatTime(activeTrip.scheduled_time)}`}
              <br />
              <span className="text-yellow-600">Will add 5-20 minutes delay and start countdown</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-3">
            {(Object.keys(delayReasonConfig) as DelayReason[]).map(reason => (
              <Button
                key={reason}
                variant="outline"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => activeTrip && handleTagDelay(activeTrip, reason)}
              >
                <span className="mr-2"></span>
                {delayReasonConfig[reason].label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}