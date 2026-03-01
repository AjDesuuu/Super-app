import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  Train,
  Activity,
  ArrowLeft,
} from "lucide-react";
import CrowdPrediction from "@/components/operator/trains/CrowdPrediction";

interface Station {
  id: string;
  name: string;
  line: string;
  currentCrowd: number;
  capacity: number;
  status: string;
  waitTime: string;
}

interface StationDetailsProps {
  station: Station;
  onBack: () => void;
}

// Generate wait-time predictions based on station pattern
const generatePredictions = (station: Station) => {
  const crowdPercentage = (station.currentCrowd / station.capacity) * 100;

  // Different patterns based on crowd level
  if (crowdPercentage > 80) {
    return [
      { timeRange: "0-3 mins", probability: 15, likelihood: "Unlikely" as const },
      { timeRange: "3-6 mins", probability: 30, likelihood: "Possible" as const },
      { timeRange: "6-10 mins", probability: 40, likelihood: "Likely" as const },
      { timeRange: "10+ mins", probability: 15, likelihood: "Possible" as const },
    ];
  } else if (crowdPercentage > 50) {
    return [
      { timeRange: "0-3 mins", probability: 25, likelihood: "Possible" as const },
      { timeRange: "3-6 mins", probability: 45, likelihood: "Very Likely" as const },
      { timeRange: "6-10 mins", probability: 20, likelihood: "Likely" as const },
      { timeRange: "10+ mins", probability: 10, likelihood: "Unlikely" as const },
    ];
  } else {
    return [
      { timeRange: "0-3 mins", probability: 50, likelihood: "Very Likely" as const },
      { timeRange: "3-6 mins", probability: 30, likelihood: "Likely" as const },
      { timeRange: "6-10 mins", probability: 15, likelihood: "Possible" as const },
      { timeRange: "10+ mins", probability: 5, likelihood: "Unlikely" as const },
    ];
  }
};

const getProbabilityColor = (probability: number): string => {
  if (probability >= 40) return "#22c55e";
  if (probability >= 25) return "#eab308";
  if (probability >= 15) return "#f97316";
  return "#ef4444";
};

const getLikelihoodBadgeColor = (likelihood: string): string => {
  switch (likelihood) {
    case "Very Likely":
      return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
    case "Likely":
      return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
    case "Possible":
      return "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30";
    case "Unlikely":
      return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30";
  }
};

const getCrowdLevelColor = (percentage: number): string => {
  if (percentage >= 90) return "text-red-600 dark:text-red-400";
  if (percentage >= 75) return "text-orange-600 dark:text-orange-400";
  if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
};

const getCrowdLevelLabel = (percentage: number): string => {
  if (percentage >= 90) return "Critical";
  if (percentage >= 75) return "High";
  if (percentage >= 50) return "Moderate";
  return "Low";
};

export default function StationDetails({ station, onBack }: StationDetailsProps) {
  // Safety check
  if (!station) {
    return (
      <div className="p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stations
        </button>
        <p className="text-muted-foreground">Station data not available</p>
      </div>
    );
  }

  const predictions = generatePredictions(station);
  const crowdPercentage = Math.round((station.currentCrowd / station.capacity) * 100);
  const mostLikely = predictions.reduce((prev, current) =>
    current.probability > prev.probability ? current : prev
  );
  const confidence = Math.floor(Math.random() * 10) + 85;

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stations
          </button>
          <div className="flex items-center gap-2">
            <Train className="h-6 w-6 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold">{station.name}</h1>
              <p className="text-sm text-muted-foreground">{station.line}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Station Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Current Crowd */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Current Crowd</span>
              </div>
              <div className="text-xl font-bold">{station.currentCrowd}</div>
              <div className={`text-xs font-medium mt-0.5 ${getCrowdLevelColor(crowdPercentage)}`}>
                {getCrowdLevelLabel(crowdPercentage)} ({crowdPercentage}%)
              </div>
            </CardContent>
          </Card>

          {/* Capacity */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Capacity</span>
              </div>
              <div className="text-xl font-bold">{station.capacity}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Max capacity</div>
            </CardContent>
          </Card>

          {/* Current Wait */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Current Wait</span>
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {station.waitTime}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Live update</div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Train className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Status</span>
              </div>
              <div className="text-xl font-bold">{station.status}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Operational</div>
            </CardContent>
          </Card>
        </div>

        {/* Wait-Time Probability Analysis */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Wait-Time Probability
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Based on current crowd and patterns
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{confidence}%</span>
              </div>
            </div>

            {/* Most Likely Range */}
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-xs text-muted-foreground mb-0.5">Most Likely</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {mostLikely.timeRange}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {mostLikely.probability}% • {mostLikely.likelihood}
              </div>
            </div>

            {/* Chart */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={predictions}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="timeRange"
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 10 }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number | undefined) => {
                      if (value === undefined) return ["N/A", "Probability"];
                      return [`${value}%`, "Probability"];
                    }}
                  />
                  <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
                    {predictions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getProbabilityColor(entry.probability)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Breakdown</h4>
              <div className="space-y-2">
                {predictions.map((pred, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-1.5 h-8 rounded"
                        style={{ backgroundColor: getProbabilityColor(pred.probability) }}
                      />
                      <div>
                        <div className="text-sm font-medium">{pred.timeRange}</div>
                        <Badge
                          variant="outline"
                          className={`text-xs mt-0.5 ${getLikelihoodBadgeColor(pred.likelihood)}`}
                        >
                          {pred.likelihood}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{pred.probability}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning */}
            {mostLikely.timeRange.includes("10+") && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-orange-700 dark:text-orange-400">
                    Extended Wait Times
                  </div>
                  <div className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-0.5">
                    Consider deploying additional trains or crowd control measures.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🆕 AI Crowd Prediction Section */}
        <div className="pt-2">
          <CrowdPrediction station={station} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pb-4">
          <Button variant="outline" className="flex-1" size="sm">
            View History
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
}