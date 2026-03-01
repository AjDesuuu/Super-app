import { useState } from "react";
import {
    LayoutDashboard,
    MapPin,
    AlertTriangle,
    TrendingUp,
    FileText,
    ArrowLeft,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import OverviewTab from "@/components/operator/trains/tabs/OverviewTab";
import StationsTab from "@/components/operator/trains/tabs/StationTab";
import AlertsTab from "@/components/operator/trains/tabs/AlertsTab";
import AnalyticsTab from "@/components/operator/trains/tabs/AnalyticsTab";
import ReportsTab from "@/components/operator/trains/tabs/ReportsTab";

type TabType = "overview" | "stations" | "alerts" | "analytics" | "reports";

const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: LayoutDashboard },
    { id: "stations" as TabType, label: "Stations", icon: MapPin },
    { id: "alerts" as TabType, label: "Alerts", icon: AlertTriangle },
    { id: "analytics" as TabType, label: "Analytics", icon: TrendingUp },
    { id: "reports" as TabType, label: "Reports", icon: FileText },
];

interface RailOperatorDashboardProps {
    onBack: () => void;
    onLogout: () => void;
}

export default function RailOperatorDashboard({ onBack, onLogout }: RailOperatorDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return <OverviewTab />;
            case "stations":
                return <StationsTab />;
            case "alerts":
                return <AlertsTab />;
            case "analytics":
                return <AnalyticsTab />;
            case "reports":
                return <ReportsTab />;
            default:
                return <OverviewTab />;
        }
    };

    return (
        <div className="h-[95vh] w-[430px] bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b bg-card flex-shrink-0">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-emerald-600">
                            NexStation Rail Ops
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            LRT/MRT Operations Dashboard
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