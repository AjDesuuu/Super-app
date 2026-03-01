import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Radio,
  Zap,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const mockStations = [
  { name: "North Avenue", line: "MRT-3" },
  { name: "Quezon Avenue", line: "MRT-3" },
  { name: "Balintawak", line: "LRT-1" },
  { name: "Recto", line: "LRT-2" },
];

// Types
interface Alert {
  id: string;
  type: "platform_saturation" | "dwell_time_overrun" | "manual_incident";
  severity: "critical" | "high" | "medium";
  station: string;
  line: string;
  message: string;
  timestamp: string;
  status: "pending" | "active" | "resolved";
  triggeredAt: number;
  actionLabel: string;
  description?: string;
}

interface ImpactStation {
  name: string;
  delay: number;
  crowdIncrease: number;
}

// Constants
const ALERT_INTERVAL = 15000;
const PENDING_DURATION = 5000;
const CHECK_INTERVAL = 1000;

const ALERT_TYPES = [
  {
    type: "platform_saturation" as const,
    severity: "critical" as const,
    message: "Platform at 90%+ capacity",
    actionLabel: "Activate WAIT Status",
    icon: Radio,
  },
  {
    type: "dwell_time_overrun" as const,
    severity: "high" as const,
    message: "Train stopped 60+ seconds",
    actionLabel: "Adjust ETAs",
    icon: Clock,
  },
  {
    type: "manual_incident" as const,
    severity: "high" as const,
    message: "Operator reported incident",
    actionLabel: "Acknowledge & Respond",
    icon: AlertOctagon,
  },
];

const INCIDENT_TYPES = [
  { value: "accident", label: "Accident" },
  { value: "medical", label: "Medical Emergency" },
  { value: "equipment", label: "Equipment Failure" },
  { value: "power_outage", label: "Power Outage" },
  { value: "security", label: "Security Concern" },
  { value: "other", label: "Other" },
];

const DOWNSTREAM_STATIONS: Record<string, ImpactStation[]> = {
  "MRT-3": [
    { name: "Quezon Avenue", delay: 8, crowdIncrease: 30 },
    { name: "Kamuning", delay: 7, crowdIncrease: 25 },
    { name: "Cubao", delay: 5, crowdIncrease: 20 },
  ],
  "LRT-1": [
    { name: "Balintawak", delay: 8, crowdIncrease: 28 },
    { name: "Monumento", delay: 6, crowdIncrease: 22 },
    { name: "5th Avenue", delay: 5, crowdIncrease: 18 },
  ],
  "LRT-2": [
    { name: "Legarda", delay: 7, crowdIncrease: 26 },
    { name: "Pureza", delay: 6, crowdIncrease: 20 },
    { name: "V. Mapa", delay: 4, crowdIncrease: 15 },
  ],
};

// Components
function PendingAlertCard({ alert }: { alert: Alert }) {
  const timeElapsed = Math.floor((Date.now() - alert.triggeredAt) / 1000);
  const countdown = 5 - timeElapsed;
  const progress = (timeElapsed / 5) * 100;

  return (
    <Card className="bg-yellow-500/5 border-yellow-500/30">
      <CardContent className="pt-4 space-y-3">
        <Progress
          value={progress}
          className="h-1 bg-yellow-500/20 [&>div]:bg-yellow-500"
        />

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-full bg-yellow-500 animate-pulse">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">{alert.station}</p>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-500/50"
          >
            {countdown}s
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function ImpactAnalysis({ alert }: { alert: Alert }) {
  const stations = DOWNSTREAM_STATIONS[alert.line] || [];
  const totalDelay = stations.reduce((sum, s) => sum + s.delay, 0);

  return (
    <Card className="border-blue-500/30">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            Impact on {stations.length} stations
          </p>
          <p className="text-sm text-orange-600">+{totalDelay}min total</p>
        </div>

        <div className="space-y-2">
          {stations.map((station) => (
            <div
              key={station.name}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <p className="text-sm">{station.name}</p>
              <div className="flex gap-3 text-xs">
                <span className="text-orange-600">+{station.delay}min</span>
                <span className="text-red-600">+{station.crowdIncrease}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveAlertCard({
  alert,
  isExpanded,
  onToggleExpand,
  onResolve,
}: {
  alert: Alert;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onResolve: () => void;
}) {
  const config =
    alert.severity === "critical"
      ? {
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          iconBg: "bg-red-500",
        }
      : alert.severity === "high"
        ? {
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/30",
            iconBg: "bg-orange-500",
          }
        : {
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/30",
            iconBg: "bg-amber-500",
          };

  const alertTypeConfig = ALERT_TYPES.find((t) => t.type === alert.type);
  const ActionIcon = alertTypeConfig?.icon || Clock;

  return (
    <div className="space-y-3">
      <Card className={cn("border-2", config.bgColor, config.borderColor)}>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className={cn("p-1.5 rounded-full", config.iconBg)}>
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className={cn("font-semibold text-sm", config.color)}>
                  {alert.station}
                </p>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
                {alert.description && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    "{alert.description}"
                  </p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {alert.timestamp}
            </Badge>
          </div>

          <Button
            onClick={onResolve}
            className={cn("w-full", config.iconBg, "hover:opacity-90")}
            size="lg"
          >
            <ActionIcon className="h-4 w-4" />
            {alert.actionLabel}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onToggleExpand}
            className="w-full"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {isExpanded ? "Hide" : "View"} Impact
          </Button>
        </CardContent>
      </Card>

      {isExpanded && (
        <div className="ml-4 pl-4 border-l-4 border-orange-500">
          <ImpactAnalysis alert={alert} />
        </div>
      )}
    </div>
  );
}

function ResolvedAlertCard({ alert }: { alert: Alert }) {
  return (
    <Card className="opacity-60">
      <CardContent className="pt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {alert.station} - {alert.message}
            </p>
            <p className="text-xs text-muted-foreground">
              Resolved at {alert.timestamp}
            </p>
          </div>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function AlertsTab() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertCounter, setAlertCounter] = useState(0);
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const generateRandomAlert = (): Alert => {
    const station =
      mockStations[Math.floor(Math.random() * mockStations.length)];
    const alertType =
      ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];
    const now = new Date();

    return {
      id: `alert-${Date.now()}-${Math.random()}`,
      type: alertType.type,
      severity: alertType.severity,
      station: station.name,
      line: station.line,
      message: alertType.message,
      timestamp: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "pending",
      triggeredAt: Date.now(),
      actionLabel: alertType.actionLabel,
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = generateRandomAlert();
      setAlerts((prev) => [newAlert, ...prev].slice(0, 10));
      setAlertCounter((prev) => prev + 1);
    }, ALERT_INTERVAL);

    setTimeout(() => {
      const initialAlert = generateRandomAlert();
      setAlerts([initialAlert]);
      setAlertCounter(1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now();
      setAlerts((prev) =>
        prev.map((alert) => {
          if (
            alert.status === "pending" &&
            now - alert.triggeredAt >= PENDING_DURATION
          ) {
            return { ...alert, status: "active" };
          }
          return alert;
        }),
      );
    }, CHECK_INTERVAL);

    return () => clearInterval(checkInterval);
  }, []);

  const handleAlertAction = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "resolved" } : a)),
    );
    if (expandedIncident === alertId) {
      setExpandedIncident(null);
    }
  };

  const handleReportIncident = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const now = new Date();

    const newAlert: Alert = {
      id: `manual-${Date.now()}-${Math.random()}`,
      type: "manual_incident",
      severity: formData.get("severity") as "critical" | "high" | "medium",
      station: formData.get("station") as string,
      line:
        mockStations.find((s) => s.name === formData.get("station"))?.line ||
        "Unknown",
      message: `${formData.get("incidentType")}: Operator reported incident`,
      timestamp: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "active",
      triggeredAt: Date.now(),
      actionLabel: "Acknowledge & Respond",
      description: formData.get("description") as string,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setAlertCounter((prev) => prev + 1);
    setReportDialogOpen(false);
  };

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const pendingAlerts = alerts.filter((a) => a.status === "pending");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Alerts</h2>
          <p className="text-xs text-muted-foreground">Real-time monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Report Incident</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleReportIncident} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="station">Station</Label>
                  <Select name="station" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStations.map((station) => (
                        <SelectItem key={station.name} value={station.name}>
                          {station.name} ({station.line})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incidentType">Incident Type</Label>
                  <Select name="incidentType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCIDENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.label}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select name="severity" required defaultValue="high">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide details about the incident..."
                    rows={3}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600"
                >
                  <AlertOctagon className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Badge variant="destructive" className="gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE{" "}
            {alertCounter > 0 && <span className="ml-1">({alertCounter})</span>}
          </Badge>
        </div>
      </div>

      {pendingAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-yellow-600">
            Pending ({pendingAlerts.length})
          </h3>
          {pendingAlerts.map((alert) => (
            <PendingAlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Active ({activeAlerts.length})
          </h3>
          {activeAlerts.map((alert) => (
            <ActiveAlertCard
              key={alert.id}
              alert={alert}
              isExpanded={expandedIncident === alert.id}
              onToggleExpand={() =>
                setExpandedIncident(
                  expandedIncident === alert.id ? null : alert.id,
                )
              }
              onResolve={() => handleAlertAction(alert.id)}
            />
          ))}
        </div>
      )}

      {activeAlerts.length === 0 && pendingAlerts.length === 0 && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">
                  All Clear
                </p>
                <p className="text-xs text-muted-foreground">
                  System monitoring continues
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {resolvedAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-green-600">
            Resolved ({resolvedAlerts.length})
          </h3>
          {resolvedAlerts.slice(0, 3).map((alert) => (
            <ResolvedAlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
