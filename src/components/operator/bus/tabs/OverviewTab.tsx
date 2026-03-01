import { Bus, Calendar, Clock, AlertTriangle, TrendingUp, Fuel, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockBuses, mockTrips } from '@/data/schedule';

export default function OverviewTab() {
  // Calculate metrics
  const activeBusesCount = mockBuses.filter(b => b.status === 'active').length;
  const totalBusLimit = 20;
  const lowFuelBuses = mockBuses.filter(b => b.fuel_level < 30);
  const maintenanceBuses = mockBuses.filter(b => b.status === 'maintenance');
  
  const todayTrips = mockTrips.filter(t => {
    const today = new Date();
    return t.scheduled_time.toDateString() === today.toDateString();
  });
  
  const completedTrips = todayTrips.filter(t => t.status === 'departed').length;
  const delayedTrips = todayTrips.filter(t => t.delay_minutes > 5).length;
  const onTimeTrips = todayTrips.filter(t => t.delay_minutes <= 5 && t.status === 'departed').length;
  const onTimePercentage = completedTrips > 0 ? Math.round((onTimeTrips / completedTrips) * 100) : 0;

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Subscription Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-semibold">Standard Plan</p>
                <p className="text-xs text-muted-foreground">{activeBusesCount}/{totalBusLimit} buses active</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">23 days left</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayTrips.length}</p>
                <p className="text-xs text-muted-foreground">Trips Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bus className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeBusesCount}</p>
                <p className="text-xs text-muted-foreground">Active Buses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{onTimePercentage}%</p>
                <p className="text-xs text-muted-foreground">On-Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{delayedTrips}</p>
                <p className="text-xs text-muted-foreground">Delayed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {lowFuelBuses.length > 0 && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Fuel className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Low Fuel Alert</p>
                  <p className="text-xs text-red-700">
                    {lowFuelBuses.length} {lowFuelBuses.length === 1 ? 'bus' : 'buses'} below 30% fuel
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {lowFuelBuses.map(b => b.id).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {maintenanceBuses.length > 0 && (
            <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-900">Maintenance Required</p>
                  <p className="text-xs text-orange-700">
                    {maintenanceBuses.length} {maintenanceBuses.length === 1 ? 'bus' : 'buses'} in maintenance
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {maintenanceBuses.map(b => b.id).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {delayedTrips > 0 && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Delays Detected</p>
                  <p className="text-xs text-amber-700">
                    {delayedTrips} {delayedTrips === 1 ? 'trip is' : 'trips are'} experiencing delays
                  </p>
                </div>
              </div>
            </div>
          )}

          {lowFuelBuses.length === 0 && maintenanceBuses.length === 0 && delayedTrips === 0 && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
              All systems operating normally
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Today's Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Trips</span>
              <span className="font-semibold">{todayTrips.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="font-semibold text-green-600">{completedTrips}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Boarding/Scheduled</span>
              <span className="font-semibold text-blue-600">{todayTrips.length - completedTrips}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">On-Time Rate</span>
              <Badge variant={onTimePercentage >= 90 ? 'default' : 'secondary'} className="text-xs">
                {onTimePercentage}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
