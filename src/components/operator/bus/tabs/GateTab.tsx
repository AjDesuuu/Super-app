import { useMemo } from 'react';
import { MapPin, Users, Clock, Bus, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  mockTrips,
  terminals,
  pitxGateConfig,
  getRouteById,
  getBusById,
  mockOperators,
} from '@/data/schedule';

export default function GateTab() {
  const gateData = useMemo(() => {
    const pitxTerminal = terminals.find(t => t.id === 1);
    if (!pitxTerminal) return [];

    return pitxTerminal.gates.map(gateId => {
      const gateKey = `gate${gateId}` as keyof typeof pitxGateConfig;
      const gateConfig = pitxGateConfig[gateKey];

      const activeTrips = mockTrips.filter(trip =>
        trip.gate === gateId &&
        ['scheduled', 'arriving', 'boarding', 'delayed'].includes(trip.status)
      );

      const completedTrips = mockTrips.filter(
        trip => trip.gate === gateId && trip.status === 'departed'
      );

      // Calculate density
      const baseDensity = Math.min(activeTrips.length * 15, 80);
      const timeDensity = new Date().getHours() >= 16 && new Date().getHours() <= 20 ? 20 : 0;
      const density = Math.min(baseDensity + timeDensity + Math.random() * 10, 100);

      let densityLevel: 'Low' | 'Moderate' | 'High';
      let densityColor: string;
      if (density < 40) {
        densityLevel = 'Low';
        densityColor = 'bg-green-500';
      } else if (density < 70) {
        densityLevel = 'Moderate';
        densityColor = 'bg-yellow-500';
      } else {
        densityLevel = 'High';
        densityColor = 'bg-red-500';
      }

      // On-time rate
      const onTimeRate = completedTrips.length > 0
        ? Math.round((completedTrips.filter(t => t.delay_minutes <= 5).length / completedTrips.length) * 100)
        : 0;

      return {
        id: gateId,
        name: gateConfig.name,
        bays: gateConfig.bays,
        activeTrips: activeTrips.length,
        totalCapacity: gateConfig.bays.length * 2,
        density,
        densityLevel,
        densityColor,
        onTimeRate,
        nextDepartures: activeTrips
          .filter(t => t.status === 'boarding')
          .sort((a, b) => a.scheduled_time.getTime() - b.scheduled_time.getTime())
          .slice(0, 2)
      };
    });
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Gate Status</h2>
        <p className="text-sm text-muted-foreground">Real-time gate monitoring</p>
      </div>

      <div className="space-y-3">
        {gateData.map((gate) => (
          <Card key={gate.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Gate {gate.id}
                </CardTitle>
                <Badge className={`${gate.densityColor} text-white`}>
                  {gate.densityLevel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{gate.name}</p>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded border">
                  <Bus className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-semibold">{gate.activeTrips}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center p-2 rounded border">
                  <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-semibold">{Math.round(gate.density)}%</p>
                  <p className="text-xs text-muted-foreground">Crowding</p>
                </div>
                <div className="text-center p-2 rounded border">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-semibold">{gate.onTimeRate}%</p>
                  <p className="text-xs text-muted-foreground">On-Time</p>
                </div>
              </div>

              {/* Bays */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Bays</p>
                <div className="flex gap-1.5">
                  {gate.bays.map(bay => {
                    // Hardcode occupied bays per gate
                    let isOccupied = false;
                    if (gate.id === 2) {
                      // Gate 2: 5 bays, make 2 greens (3 reds)
                      isOccupied = [8, 9, 10].includes(bay); // bays 8,9,10 occupied
                    } else if (gate.id === 4) {
                      // Gate 4: 8 bays, make 2 greens (6 reds)
                      isOccupied = [16, 17, 18, 19, 20, 21].includes(bay); // bays 16-21 occupied
                    } else if (gate.id === 5) {
                      // Gate 5: 5 bays, make 4 greens (1 red)
                      isOccupied = [33].includes(bay); // only bay 33 occupied
                    }
                    return (
                      <Badge
                        key={bay}
                        variant="secondary"
                        className={`text-xs ${isOccupied ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                      >
                        B{bay}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Next Departures */}
              {gate.nextDepartures.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Next Departures</p>
                  </div>
                  <div className="space-y-1">
                    {gate.nextDepartures.map((trip) => {
                      const route = getRouteById(trip.route_id);
                      const bus = getBusById(trip.bus_id);
                      const operator = bus?.operator_id
                        ? mockOperators.find(op => op.id === bus.operator_id)
                        : null;
                      return (
                        <div key={trip.id} className="flex justify-between text-xs bg-muted/30 rounded p-1.5">
                          <span className="font-medium">{formatTime(trip.scheduled_time)}</span>
                          <span className="text-muted-foreground truncate ml-2">
                            {operator?.shortName} • {route?.destination}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}