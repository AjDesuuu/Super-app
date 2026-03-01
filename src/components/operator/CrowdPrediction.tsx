import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Calendar,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Station {
  id: string;
  name: string;
  line: string;
  currentCrowd: number;
  capacity: number;
}

interface CrowdPredictionProps {
  station: Station;
}

interface PredictionPoint {
  time: string;
  predicted: number;
  confidence: number;
  level: "low" | "moderate" | "high" | "critical";
}

// Generate realistic crowd predictions
const generatePredictions = (station: Station): PredictionPoint[] => {
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentCrowdPercent = (station.currentCrowd / station.capacity) * 100;
  
  // Determine time period (morning rush, midday, evening rush, night)
  let pattern: "morning_rush" | "midday" | "evening_rush" | "night";
  if (currentHour >= 6 && currentHour < 9) pattern = "morning_rush";
  else if (currentHour >= 9 && currentHour < 17) pattern = "midday";
  else if (currentHour >= 17 && currentHour < 20) pattern = "evening_rush";
  else pattern = "night";

  const predictions: PredictionPoint[] = [];
  
  // Generate predictions for next 90 minutes (every 15 mins)
  for (let i = 0; i <= 90; i += 15) {
    const futureTime = new Date();
    futureTime.setMinutes(currentMinute + i);
    
    const hour = futureTime.getHours();
    const minute = futureTime.getMinutes();
    const timeStr = futureTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    let predictedPercent = currentCrowdPercent;
    let confidence = 95;

    // Apply pattern-based predictions
    if (pattern === "morning_rush") {
      // Morning rush: crowds increase until 8:30 AM
      if (hour < 8 || (hour === 8 && minute < 30)) {
        predictedPercent += (i / 15) * 8; // Increase by 8% every 15 mins
      } else {
        predictedPercent -= (i / 15) * 5; // Decrease after peak
      }
    } else if (pattern === "evening_rush") {
      // Evening rush: crowds increase until 6:30 PM
      if (hour < 18 || (hour === 18 && minute < 30)) {
        predictedPercent += (i / 15) * 7;
      } else {
        predictedPercent -= (i / 15) * 6;
      }
    } else if (pattern === "midday") {
      // Midday: gradual increase towards evening rush
      if (hour < 16) {
        predictedPercent += (i / 15) * 2;
      } else {
        predictedPercent += (i / 15) * 5; // Faster increase approaching rush
      }
    } else {
      // Night: gradual decrease
      predictedPercent -= (i / 15) * 4;
    }

    // Add some randomness but keep realistic
    const randomness = (Math.random() - 0.5) * 5;
    predictedPercent += randomness;

    // Clamp between 0-100
    predictedPercent = Math.max(0, Math.min(100, predictedPercent));

    // Confidence decreases with time
    confidence = Math.max(70, 95 - (i / 15) * 3);

    // Determine level
    let level: "low" | "moderate" | "high" | "critical";
    if (predictedPercent >= 90) level = "critical";
    else if (predictedPercent >= 75) level = "high";
    else if (predictedPercent >= 50) level = "moderate";
    else level = "low";

    predictions.push({
      time: timeStr,
      predicted: Math.round(predictedPercent),
      confidence: Math.round(confidence),
      level: level,
    });
  }

  return predictions;
};

// Get color for crowd level (aligned with design guide)
const getLevelColor = (level: string) => {
  switch (level) {
    case "critical":
      return { color: "#EF4444", bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/30" };
    case "high":
      return { color: "#EF4444", bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/30" };
    case "moderate":
      return { color: "#F59E0B", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30" };
    case "low":
      return { color: "#10B981", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30" };
    default:
      return { color: "#6b7280", bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", border: "border-gray-500/30" };
  }
};

export default function CrowdPrediction({ station }: CrowdPredictionProps) {
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(60);
  const allPredictions = generatePredictions(station);
  
  // Filter based on selected time range
  const predictions = allPredictions.filter((_, index) => {
    const minutes = index * 15;
    return minutes <= timeRange;
  });

  const currentCrowdPercent = Math.round((station.currentCrowd / station.capacity) * 100);
  const peakPrediction = predictions.reduce((max, p) => p.predicted > max.predicted ? p : max, predictions[0]);
  const avgConfidence = Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length);

  // Determine trend
  const firstPrediction = predictions[0];
  const lastPrediction = predictions[predictions.length - 1];
  const trend = lastPrediction.predicted > firstPrediction.predicted ? "increasing" : "decreasing";
  const trendChange = Math.abs(lastPrediction.predicted - firstPrediction.predicted);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-purple-500" />
                AI Crowd Prediction
              </CardTitle>
              <CardDescription className="mt-1">
                Machine learning forecast for {station.name}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">
              {avgConfidence}% Confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current vs Peak */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Current</span>
              </div>
              <div className="text-2xl font-bold">{currentCrowdPercent}%</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {station.currentCrowd} / {station.capacity}
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Peak Expected</span>
              </div>
              <div className={cn("text-2xl font-bold", getLevelColor(peakPrediction.level).text)}>
                {peakPrediction.predicted}%
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                at {peakPrediction.time}
              </div>
            </div>
          </div>

          {/* Trend Indicator */}
          <div className={cn(
            "flex items-start gap-3 p-3 rounded-lg border",
            trend === "increasing" ? "bg-orange-500/5 border-orange-500/20" : "bg-green-500/5 border-green-500/20"
          )}>
            {trend === "increasing" ? (
              <TrendingUp className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            ) : (
              <TrendingDown className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className={cn(
                "font-semibold text-sm",
                trend === "increasing" ? "text-orange-700 dark:text-orange-400" : "text-green-700 dark:text-green-400"
              )}>
                {trend === "increasing" ? "Crowds Increasing" : "Crowds Decreasing"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Expected {trend === "increasing" ? "rise" : "drop"} of {trendChange}% over next {timeRange} minutes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {[30, 60, 90].map((mins) => (
          <button
            key={mins}
            onClick={() => setTimeRange(mins as 30 | 60 | 90)}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
              timeRange === mins
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {mins} mins
          </button>
        ))}
      </div>

      {/* Prediction Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Crowd Forecast</CardTitle>
          <CardDescription>Predicted crowd levels over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={predictions}>
              <defs>
                <linearGradient id="crowdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                className="text-xs"
                tick={{ fill: "currentColor", fontSize: 10 }}
              />
              <YAxis
                label={{ value: "Crowd %", angle: -90, position: "insideLeft" }}
                className="text-xs"
                tick={{ fill: "currentColor", fontSize: 10 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number | undefined, name: string | undefined) => {
                  if (value === undefined) return ["N/A", name || ""];
                  if (name === "predicted") return [`${value}%`, "Predicted Crowd"];
                  return [value, name || ""];
                }}
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#crowdGradient)"
              />
              {/* Current level reference line */}
              <Line
                type="monotone"
                dataKey={() => currentCrowdPercent}
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Current"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Predicted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-gray-500" style={{ borderTop: "2px dashed" }} />
              <span className="text-muted-foreground">Current</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detailed Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {predictions.map((prediction, index) => {
              const levelConfig = getLevelColor(prediction.level);
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-xs font-medium">{prediction.time}</span>
                    </div>
                    <div
                      className="w-1 h-12 rounded"
                      style={{ backgroundColor: levelConfig.color }}
                    />
                    <div>
                      <div className="text-sm font-semibold">{prediction.predicted}% Capacity</div>
                      <Badge variant="outline" className={cn("text-xs mt-1", levelConfig.bg, levelConfig.text, levelConfig.border)}>
                        {prediction.level.charAt(0).toUpperCase() + prediction.level.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Confidence</div>
                    <div className="text-lg font-bold">{prediction.confidence}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1">
          <Calendar className="h-4 w-4 mr-2" />
          View Historical Patterns
        </Button>
        <Button variant="outline" className="flex-1">
          Export Forecast
        </Button>
      </div>
    </div>
  );
}