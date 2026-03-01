import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Users,
  TrendingUp,
  MapPin,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImpactedStation {
  name: string;
  line: string;
  distanceFromIncident: number; // in stations
  additionalDelay: number; // in minutes
  crowdIncrease: number; // percentage
  severity: "low" | "medium" | "high";
}

interface IncidentImpact {
  incidentId: string;
  incidentType: string;
  originStation: string;
  line: string;
  severity: "high" | "medium" | "low";
  startTime: string;
  affectedStations: ImpactedStation[];
  estimatedRecoveryTime: string;
  totalPassengersAffected: number;
}

interface IncidentImpactAnalysisProps {
  incident: IncidentImpact;
  onClose?: () => void;
}

// Helper functions
const getSeverityColor = (severity: "high" | "medium" | "low") => {
  switch (severity) {
    case "high":
      return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
    case "medium":
      return "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30";
    case "low":
      return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
  }
};

const getImpactSeverityColor = (severity: "high" | "medium" | "low") => {
  switch (severity) {
    case "high":
      return "border-l-red-500 bg-red-500/5";
    case "medium":
      return "border-l-orange-500 bg-orange-500/5";
    case "low":
      return "border-l-yellow-500 bg-yellow-500/5";
  }
};

const getSeverityDot = (severity: "high" | "medium" | "low") => {
  switch (severity) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-orange-500";
    case "low":
      return "bg-yellow-500";
  }
};

export default function IncidentImpactAnalysis({ incident, onClose }: IncidentImpactAnalysisProps) {
  const totalDelay = incident.affectedStations.reduce((sum, s) => sum + s.additionalDelay, 0);
  const avgCrowdIncrease = Math.round(
    incident.affectedStations.reduce((sum, s) => sum + s.crowdIncrease, 0) / 
    incident.affectedStations.length
  );

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-2 border-orange-500/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Incident Impact Analysis
              </CardTitle>
              <CardDescription className="mt-1">
                Real-time cascade effect on downstream stations
              </CardDescription>
            </div>
            <Badge variant="outline" className={getSeverityColor(incident.severity)}>
              {incident.severity.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Incident Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Incident Type</div>
              <div className="font-semibold">{incident.incidentType}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Origin Station</div>
              <div className="font-semibold">{incident.originStation}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Start Time</div>
              <div className="font-semibold">{incident.startTime}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Est. Recovery</div>
              <div className="font-semibold text-orange-600 dark:text-orange-400">
                {incident.estimatedRecoveryTime}
              </div>
            </div>
          </div>

          {/* Impact Summary */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Affected</span>
              </div>
              <div className="text-xl font-bold">{incident.affectedStations.length}</div>
              <div className="text-xs text-muted-foreground">stations</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total Delay</span>
              </div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                +{totalDelay}m
              </div>
              <div className="text-xs text-muted-foreground">cumulative</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Passengers</span>
              </div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">
                {incident.totalPassengersAffected.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">affected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Propagation Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-blue-500" />
            Delay Propagation Timeline
          </CardTitle>
          <CardDescription>
            How delays cascade through {incident.line}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Origin Station */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                  0
                </div>
                <div className="w-0.5 h-full bg-gradient-to-b from-red-500 to-orange-500 mt-2 mb-2" 
                     style={{ minHeight: "20px" }} />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold">{incident.originStation}</div>
                  <Badge className="bg-red-500 text-white border-red-600">
                    Origin
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {incident.incidentType} detected at {incident.startTime}
                </div>
              </div>
            </div>

            {/* Affected Stations */}
            {incident.affectedStations.map((station, index) => {
              const isLast = index === incident.affectedStations.length - 1;
              
              return (
                <div key={station.name} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                      getSeverityDot(station.severity)
                    )}>
                      {station.distanceFromIncident}
                    </div>
                    {!isLast && (
                      <div className="w-0.5 h-full bg-gradient-to-b from-orange-500 to-yellow-500 mt-2 mb-2" 
                           style={{ minHeight: "20px" }} />
                    )}
                  </div>
                  <div className={cn(
                    "flex-1 p-3 rounded-lg border-l-4",
                    getImpactSeverityColor(station.severity)
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold">{station.name}</div>
                        <div className="text-xs text-muted-foreground">{station.line}</div>
                      </div>
                      <Badge variant="outline" className={getSeverityColor(station.severity)}>
                        {station.severity}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-orange-500" />
                        <span className="text-xs font-medium">+{station.additionalDelay} mins delay</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-medium">+{station.crowdIncrease}% crowd</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Impact Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Average Crowd Increase */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Average Crowd Increase</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                +{avgCrowdIncrease}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                style={{ width: `${Math.min(avgCrowdIncrease, 100)}%` }}
              />
            </div>
          </div>

          {/* Total Cumulative Delay */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Total Cumulative Delay</span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {totalDelay} minutes
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                style={{ width: `${Math.min((totalDelay / 50) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Severity Distribution */}
          <div>
            <div className="text-sm font-medium mb-2">Station Impact Distribution</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg border border-red-500/30 bg-red-500/5">
                <div className="text-xs text-muted-foreground mb-1">High</div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {incident.affectedStations.filter(s => s.severity === "high").length}
                </div>
              </div>
              <div className="p-2 rounded-lg border border-orange-500/30 bg-orange-500/5">
                <div className="text-xs text-muted-foreground mb-1">Medium</div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {incident.affectedStations.filter(s => s.severity === "medium").length}
                </div>
              </div>
              <div className="p-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                <div className="text-xs text-muted-foreground mb-1">Low</div>
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {incident.affectedStations.filter(s => s.severity === "low").length}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-base text-blue-600 dark:text-blue-400">
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5">
            <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Deploy additional trains to {incident.affectedStations[0]?.name} to absorb crowd overflow
            </p>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5">
            <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Broadcast WAIT status to passengers heading to affected stations
            </p>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5">
            <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Update ETAs for next {incident.affectedStations.length} downstream stations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {onClose && (
        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close Analysis
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            Implement Actions
          </Button>
        </div>
      )}
    </div>
  );
}