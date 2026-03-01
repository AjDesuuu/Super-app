import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { mockWeeklyData } from "@/data/operator-data";
import LeafletStationHeatMap from "@/components/operator/trains/StationHeatMap";
import PeakHoursHeatMap from "@/components/operator/trains/PeakHoursHeatMap";
import RouteCongestionMap from "@/components/operator/trains/RouteCongestionMap";

type ViewType = "overview" | "heatmaps" | "trends";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    valueColor?: string;
}

function MetricCard({ title, value, subtitle, valueColor }: MetricCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${valueColor || ''}`}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {subtitle}
                </p>
            </CardContent>
        </Card>
    );
}

export default function AnalyticsTab() {
    const [view, setView] = useState<ViewType>("overview");

    // Calculate total weekly passengers
    const totalPassengers = mockWeeklyData.reduce((sum, day) => sum + (day.passengers || 0), 0);
    const avgDailyPassengers = Math.round(totalPassengers / 7);
    const peakDay = mockWeeklyData.reduce((max, day) => 
        (day.passengers || 0) > (max.passengers || 0) ? day : max
    );

    return (
        <div className="p-4 space-y-4">
            {/* View Switcher */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                    size="sm"
                    variant={view === "overview" ? "default" : "outline"}
                    onClick={() => setView("overview")}
                    className="whitespace-nowrap"
                >
                    Overview
                </Button>
                <Button
                    size="sm"
                    variant={view === "heatmaps" ? "default" : "outline"}
                    onClick={() => setView("heatmaps")}
                    className="whitespace-nowrap"
                >
                    Heat Maps
                </Button>
                <Button
                    size="sm"
                    variant={view === "trends" ? "default" : "outline"}
                    onClick={() => setView("trends")}
                    className="whitespace-nowrap"
                >
                    Trends
                </Button>
            </div>

            {/* Overview View */}
            {view === "overview" && (
                <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard
                            title="Weekly Total"
                            value={totalPassengers}
                            subtitle="passengers"
                        />
                        <MetricCard
                            title="Daily Average"
                            value={avgDailyPassengers}
                            subtitle="passengers"
                        />
                    </div>

                    {/* Weekly Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Weekly Passenger Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={mockWeeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="day" 
                                        tick={{ fontSize: 11 }}
                                        stroke="#9ca3af"
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 11 }}
                                        stroke="#9ca3af"
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            fontSize: 12,
                                            borderRadius: 8,
                                            border: "1px solid #e5e7eb"
                                        }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="passengers" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        dot={{ fill: "#3b82f6", r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                                <p className="text-sm">
                                    <span className="font-semibold">Peak Day:</span> {peakDay.day}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {(peakDay.passengers || 0).toLocaleString()} passengers
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Heat Maps View - NEW LEAFLET MAP */}
            {view === "heatmaps" && (
                <div className="space-y-6">
                    {/* Main Interactive Leaflet Heat Map */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Live Station Crowd Map</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                Interactive radius heat map showing real-time crowd density by station
                            </p>
                        </CardHeader>
                        <CardContent>
                            <LeafletStationHeatMap />
                        </CardContent>
                    </Card>

                    {/* Peak Hours Heat Map */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Peak Hours Analysis</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                Hourly and weekly crowd patterns
                            </p>
                        </CardHeader>
                        <CardContent>
                            <PeakHoursHeatMap />
                        </CardContent>
                    </Card>

                    {/* Route Congestion Map */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Route Congestion Analysis</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                Identify bottlenecks and high-traffic segments
                            </p>
                        </CardHeader>
                        <CardContent>
                            <RouteCongestionMap />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Trends View */}
            {view === "trends" && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Historical Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <MetricCard
                                    title="Month-over-Month Growth"
                                    value="+12.4%"
                                    subtitle="Compared to last month"
                                    valueColor="text-green-600"
                                />
                                <MetricCard
                                    title="Peak Hour Efficiency"
                                    value="87.3%"
                                    subtitle="Train frequency optimization"
                                    valueColor="text-blue-600"
                                />
                                <MetricCard
                                    title="Incident Response Time"
                                    value="4.2 min"
                                    subtitle="Average resolution time"
                                    valueColor="text-orange-600"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}