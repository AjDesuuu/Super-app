import { Train, Bus, ArrowRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardSelectorProps {
  onLogout?: () => void;
  onSelectDashboard?: (type: 'rail' | 'bus') => void;
}

export default function DashboardSelector({ onLogout, onSelectDashboard }: DashboardSelectorProps) {
  const handleRailClick = () => {
    onSelectDashboard?.('rail');
  };

  const handleBusClick = () => {
    onSelectDashboard?.('bus');
  };

  return (
    <div className="h-[95vh] w-[430px] bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Header with Logout */}
      <div className="flex items-center justify-between p-4 pb-2">
        <h1 className="text-xl font-bold text-gray-900">NexStation</h1>
        {onLogout && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-1"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </Button>
        )}
      </div>

      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {/* Subtitle */}
        <p className="text-sm text-gray-600 text-center">Operator Dashboard Management</p>

        {/* Dashboard Cards - Stacked vertically */}
        <div className="space-y-4">
          {/* Rail Operator Dashboard */}
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={handleRailClick}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Train className="w-6 h-6 text-emerald-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-lg mt-2">Rail Operator</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">

              <div className="space-y-1.5 mb-4 -mt-4">
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                  53 Stations Monitored
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                  3 Train Lines (LRT-1, LRT-2, MRT-3)
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
                  Real-time Crowd Prediction
                </div>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold" size="sm">
                Open Rail Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Bus Operator Dashboard */}
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={handleBusClick}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Bus className="w-6 h-6 text-emerald-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-lg mt-2">Bus Operator</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">

              <div className="space-y-1.5 mb-4 -mt-4">
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                  20 Buses Active
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                  4 Routes (PITX ↔ Cubao, Fairview)
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
                  Live Fleet Tracking
                </div>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold" size="sm">
                Open Bus Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}