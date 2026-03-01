import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  DollarSign, 
  Users, 
  MapPin, 
  Eye,
  EyeOff,
  Plus,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "revenue" | "ads" | "clients" | "settings";

const tabs = [
  { id: "revenue" as TabType, label: "Revenue", icon: DollarSign },
  { id: "ads" as TabType, label: "Ad Zones", icon: MapPin },
  { id: "clients" as TabType, label: "Clients", icon: Users },
  { id: "settings" as TabType, label: "Settings", icon: Settings },
];

// Mock admin configuration data
interface AdZone {
  id: string;
  name: string;
  area: string;
  enabled: boolean;
  impressions: number;
  revenue: number;
}

interface Client {
  id: string;
  name: string;
  type: "operator" | "lgu" | "terminal";
  features: {
    crowdPrediction: boolean;
    incidentAnalysis: boolean;
    historicalReports: boolean;
    apiAccess: boolean;
  };
  subscription: string;
  revenue: number;
}

interface AdminDashboardProps {
  onLogout?: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("revenue");
  const [addZoneOpen, setAddZoneOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  
  // Settings state
  const [waitThreshold, setWaitThreshold] = useState(75);
  const [adFrequencyCap, setAdFrequencyCap] = useState(3);
  const [crowdAlertThreshold, setCrowdAlertThreshold] = useState(80);
  const [dataRetention, setDataRetention] = useState(90);
  
  const [adZones, setAdZones] = useState<AdZone[]>([
    { id: "z1", name: "Quezon City Jeepney Stops", area: "QC", enabled: true, impressions: 15420, revenue: 77100 },
    { id: "z2", name: "Makati CBD Bus Stops", area: "Makati", enabled: true, impressions: 23150, revenue: 138900 },
    { id: "z3", name: "BGC Terminal Area", area: "Taguig", enabled: false, impressions: 0, revenue: 0 },
    { id: "z4", name: "EDSA MRT Stations", area: "Metro Manila", enabled: true, impressions: 45230, revenue: 271380 },
    { id: "z5", name: "PITX Terminal Area", area: "Parañaque", enabled: true, impressions: 18900, revenue: 94500 },
  ]);

  const [clients, setClients] = useState<Client[]>([
    {
      id: "c1",
      name: "MRT-3 Operations",
      type: "operator",
      features: { crowdPrediction: true, incidentAnalysis: true, historicalReports: true, apiAccess: false },
      subscription: "₱5M/year",
      revenue: 5000000
    },
    {
      id: "c2",
      name: "JAM/CHER Transport",
      type: "operator",
      features: { crowdPrediction: true, incidentAnalysis: false, historicalReports: true, apiAccess: false },
      subscription: "₱149/bus/month",
      revenue: 89400
    },
    {
      id: "c3",
      name: "Quezon City LGU",
      type: "lgu",
      features: { crowdPrediction: true, incidentAnalysis: true, historicalReports: true, apiAccess: true },
      subscription: "₱1.5M/year",
      revenue: 1500000
    },
    {
      id: "c4",
      name: "PITX Terminal",
      type: "terminal",
      features: { crowdPrediction: true, incidentAnalysis: false, historicalReports: true, apiAccess: false },
      subscription: "₱3M/year",
      revenue: 3000000
    },
  ]);

  const toggleAdZone = (id: string) => {
    setAdZones(zones => 
      zones.map(zone => 
        zone.id === id ? { ...zone, enabled: !zone.enabled } : zone
      )
    );
  };

  const toggleFeature = (clientId: string, feature: keyof Client["features"]) => {
    setClients(clients =>
      clients.map(client =>
        client.id === clientId
          ? {
              ...client,
              features: { ...client.features, [feature]: !client.features[feature] }
            }
          : client
      )
    );
  };

  const addAdZone = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newZone: AdZone = {
      id: `z${adZones.length + 1}`,
      name: formData.get("name") as string,
      area: formData.get("area") as string,
      enabled: false,
      impressions: 0,
      revenue: 0
    };
    setAdZones([...adZones, newZone]);
    setAddZoneOpen(false);
  };

  const addClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClient: Client = {
      id: `c${clients.length + 1}`,
      name: formData.get("name") as string,
      type: formData.get("type") as "operator" | "lgu" | "terminal",
      features: {
        crowdPrediction: false,
        incidentAnalysis: false,
        historicalReports: false,
        apiAccess: false
      },
      subscription: formData.get("subscription") as string,
      revenue: Number(formData.get("revenue") || 0)
    };
    setClients([...clients, newClient]);
    setAddClientOpen(false);
  };

  const totalAdRevenue = adZones.reduce((sum, zone) => sum + zone.revenue, 0);
  const totalSubscriptionRevenue = clients.reduce((sum, client) => sum + client.revenue, 0);
  const totalRevenue = totalAdRevenue + totalSubscriptionRevenue;
  const activeZones = adZones.filter(z => z.enabled).length;

  const renderContent = () => {
    switch (activeTab) {
      case "revenue":
        return (
          <div className="p-4 space-y-4 ">
            {/* Revenue Cards */}
            <div className="space-y-3">
              <Card className="bg-red-500/10 border-red-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{(totalRevenue / 1000000).toFixed(2)}M</div>
                  <p className="text-xs text-muted-foreground">Monthly recurring</p>
                </CardContent>
              </Card>

              <Card className="bg-emerald-500/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Ad Revenue</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{(totalAdRevenue / 1000).toFixed(0)}K</div>
                  <p className="text-xs text-muted-foreground">{activeZones} active zones</p>
                </CardContent>
              </Card>

              <Card className="bg-amber-500/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{(totalSubscriptionRevenue / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">{clients.length} active clients</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "ads":
        return (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold mb-1">Location-Based Advertising</h3>
                <p className="text-xs text-muted-foreground">Enable/disable ads by area</p>
              </div>
              <Dialog open={addZoneOpen} onOpenChange={setAddZoneOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Ad Zone</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={addAdZone} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Zone Name</Label>
                      <Input id="name" name="name" placeholder="e.g., Manila CBD Stops" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Area</Label>
                      <Input id="area" name="area" placeholder="e.g., Manila" required />
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Add Zone</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {adZones.map((zone) => (
              <Card
                key={zone.id}
                className={cn(
                  "transition-colors",
                  zone.enabled ? "bg-emerald-500/10 border-emerald-500/20" : ""
                )}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className={cn(
                          "h-4 w-4",
                          zone.enabled ? "text-[#10B981]" : "text-muted-foreground"
                        )} />
                        <h4 className="font-semibold text-sm">{zone.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{zone.area}</p>
                    </div>
                    <Button
                      onClick={() => toggleAdZone(zone.id)}
                      variant={zone.enabled ? "destructive" : "default"}
                      size="sm"
                      className="text-xs h-7"
                    >
                      {zone.enabled ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Off
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          On
                        </>
                      )}
                    </Button>
                  </div>
                  {zone.enabled && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t">
                      <span className="text-muted-foreground">{zone.impressions.toLocaleString()} views</span>
                      <span className="font-medium">₱{zone.revenue.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "clients":
        return (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold mb-1">Client Feature Control</h3>
                <p className="text-xs text-muted-foreground">Toggle premium features</p>
              </div>
              <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Client</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={addClient} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input id="clientName" name="name" placeholder="e.g., Metro Transit Corp" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operator">Operator</SelectItem>
                          <SelectItem value="lgu">LGU</SelectItem>
                          <SelectItem value="terminal">Terminal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription">Subscription</Label>
                      <Input id="subscription" name="subscription" placeholder="e.g., ₱2M/year" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenue">Annual Revenue</Label>
                      <Input id="revenue" name="revenue" type="number" placeholder="2000000" required />
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Add Client</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {clients.map((client) => (
              <Card key={client.id}>
                <CardContent className="p-3 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{client.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {client.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{client.subscription}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₱{(client.revenue / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => toggleFeature(client.id, "crowdPrediction")}
                      variant={client.features.crowdPrediction ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "text-xs h-8",
                        client.features.crowdPrediction ? "bg-red-600 hover:bg-red-700" : ""
                      )}
                    >
                      Crowd
                    </Button>
                    <Button
                      onClick={() => toggleFeature(client.id, "incidentAnalysis")}
                      variant={client.features.incidentAnalysis ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "text-xs h-8",
                        client.features.incidentAnalysis ? "bg-red-600 hover:bg-red-700" : ""
                      )}
                    >
                      Incident
                    </Button>
                    <Button
                      onClick={() => toggleFeature(client.id, "historicalReports")}
                      variant={client.features.historicalReports ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "text-xs h-8",
                        client.features.historicalReports ? "bg-red-600 hover:bg-red-700" : ""
                      )}
                    >
                      Reports
                    </Button>
                    <Button
                      onClick={() => toggleFeature(client.id, "apiAccess")}
                      variant={client.features.apiAccess ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "text-xs h-8",
                        client.features.apiAccess ? "bg-red-600 hover:bg-red-700" : ""
                      )}
                    >
                      API
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "settings":
        return (
          <div className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">System Configuration</h3>
              <p className="text-xs text-muted-foreground">Platform-wide settings</p>
            </div>

            <Card>
              <CardContent className="p-3 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">WAIT Ad Threshold</h4>
                      <p className="text-xs text-muted-foreground">Min confidence</p>
                    </div>
                    <Badge variant="outline">{waitThreshold}%</Badge>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={waitThreshold}
                    onChange={(e) => setWaitThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Ad Frequency Cap</h4>
                      <p className="text-xs text-muted-foreground">Per user/hour</p>
                    </div>
                    <Badge variant="outline">{adFrequencyCap}</Badge>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={adFrequencyCap}
                    onChange={(e) => setAdFrequencyCap(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Crowd Alert</h4>
                      <p className="text-xs text-muted-foreground">Trigger %</p>
                    </div>
                    <Badge variant="outline">{crowdAlertThreshold}%</Badge>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={crowdAlertThreshold}
                    onChange={(e) => setCrowdAlertThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Data Retention</h4>
                      <p className="text-xs text-muted-foreground">Days</p>
                    </div>
                    <Badge variant="outline">{dataRetention}</Badge>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="365"
                    value={dataRetention}
                    onChange={(e) => setDataRetention(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
              <Settings className="h-4 w-4 mr-2" />
              Advanced Settings
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-[95vh] w-[430px] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-red-600">NexStation Admin</h1>
            <p className="text-xs text-muted-foreground">Platform Administration</p>
          </div>
          {onLogout && (
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={onLogout}
                className="text-muted-foreground hover:text-red-600"
            >
                <LogOut className="h-5 w-5" />
            </Button>
          )}
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
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 h-auto flex-1",
                  isActive && "bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-600"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
