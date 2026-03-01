import { useState } from 'react';
import { Calendar, Bus, AlertTriangle, MapPin, ArrowLeft, LogOut, Clock, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import OverviewTab from '@/components/operator/bus/tabs/OverviewTab';
import ScheduleTab from '@/components/operator/bus/tabs/ScheduleTab';
import FleetStatusTab from '@/components/operator/bus/tabs/FleetStatusTab';
import HistoryTab from '@/components/operator/bus/tabs/HistoryTab';
import GateTab from '@/components/operator/bus/tabs/GateTab';
import DelaysTab from '@/components/operator/bus/tabs/DelaysTab';

type TabType = 'overview' | 'schedule' | 'fleet' | 'gate' | 'delays' | 'history';

const tabs = [
  { id: 'overview' as TabType, label: 'Overview', icon: LayoutGrid },
  { id: 'schedule' as TabType, label: 'Schedule', icon: Calendar },
  { id: 'fleet' as TabType, label: 'Fleet', icon: Bus },
  { id: 'gate' as TabType, label: 'Gate', icon: MapPin },
  { id: 'delays' as TabType, label: 'Delays', icon: Clock },
  { id: 'history' as TabType, label: 'History', icon: AlertTriangle }
];

interface BusOperatorDashboardProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function BusOperatorDashboard({ onBack, onLogout }: BusOperatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'schedule':
        return <ScheduleTab />;
      case 'fleet':
        return <FleetStatusTab />;
      case 'gate':
        return <GateTab />;
      case 'delays':
        return <DelaysTab />;
      case 'history':
        return <HistoryTab />;
      default:
        return <ScheduleTab />;
    }
  };

  return (
    <div className="h-[95vh] w-[430px] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-emerald-600">
              NexStation Bus Ops
            </h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onBack} title="Back to Selector">
               <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout} title="Sign Out">
               <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <nav className="border-t bg-card flex-shrink-0">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 h-auto flex-1",
                  isActive && "bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 hover:text-emerald-600"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">
                  {tab.label}
                </span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}