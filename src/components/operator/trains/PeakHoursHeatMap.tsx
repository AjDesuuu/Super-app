import { cn } from "@/lib/utils";

// Mock data for hourly crowd patterns (0-100 scale)
const hourlyPattern = [
    { hour: "6 AM", intensity: 35, label: "Early" },
    { hour: "7 AM", intensity: 75, label: "Rush" },
    { hour: "8 AM", intensity: 95, label: "Peak" },
    { hour: "9 AM", intensity: 80, label: "Rush" },
    { hour: "10 AM", intensity: 45, label: "Normal" },
    { hour: "11 AM", intensity: 40, label: "Normal" },
    { hour: "12 PM", intensity: 55, label: "Lunch" },
    { hour: "1 PM", intensity: 50, label: "Normal" },
    { hour: "2 PM", intensity: 40, label: "Normal" },
    { hour: "3 PM", intensity: 45, label: "Normal" },
    { hour: "4 PM", intensity: 60, label: "Rising" },
    { hour: "5 PM", intensity: 85, label: "Rush" },
    { hour: "6 PM", intensity: 100, label: "Peak" },
    { hour: "7 PM", intensity: 75, label: "Rush" },
    { hour: "8 PM", intensity: 50, label: "Evening" },
    { hour: "9 PM", intensity: 30, label: "Late" },
];

// Weekly pattern (Mon-Sun)
const weeklyPattern = [
    { day: "Mon", intensity: 90 },
    { day: "Tue", intensity: 95 },
    { day: "Wed", intensity: 92 },
    { day: "Thu", intensity: 88 },
    { day: "Fri", intensity: 100 },
    { day: "Sat", intensity: 60 },
    { day: "Sun", intensity: 45 },
];

export default function PeakHoursHeatMap() {
    const getIntensityColor = (intensity: number) => {
        if (intensity >= 90) return "bg-destructive";
        if (intensity >= 70) return "bg-orange-500";
        if (intensity >= 50) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getTextColor = (intensity: number) => {
        if (intensity >= 90) return "text-destructive";
        if (intensity >= 70) return "text-orange-500";
        if (intensity >= 50) return "text-yellow-600";
        return "text-green-600";
    };

    return (
        <div className="space-y-6">
            {/* Hourly Heat Map */}
            <div>
                <h3 className="font-semibold text-sm mb-3">Today's Crowd Pattern</h3>
                <div className="space-y-1.5">
                    {hourlyPattern.map((slot) => (
                        <div key={slot.hour} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-12 text-right">
                                {slot.hour}
                            </span>
                            <div className="flex-1 h-6 bg-muted rounded overflow-hidden relative">
                                <div
                                    className={cn(
                                        "h-full transition-all",
                                        getIntensityColor(slot.intensity)
                                    )}
                                    style={{ width: `${slot.intensity}%` }}
                                />
                                <div className="absolute inset-0 flex items-center px-2">
                                    <span className="text-xs font-medium text-foreground/90">
                                        {slot.label}
                                    </span>
                                </div>
                            </div>
                            <span className={cn(
                                "text-xs font-semibold w-8 text-right",
                                getTextColor(slot.intensity)
                            )}>
                                {slot.intensity}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Pattern */}
            <div>
                <h3 className="font-semibold text-sm mb-3">Weekly Average</h3>
                <div className="grid grid-cols-7 gap-1">
                    {weeklyPattern.map((day) => (
                        <div key={day.day} className="text-center">
                            <div
                                className={cn(
                                    "aspect-square rounded-lg mb-1",
                                    getIntensityColor(day.intensity)
                                )}
                                style={{ opacity: day.intensity / 100 }}
                            />
                            <p className="text-xs text-muted-foreground">{day.day}</p>
                            <p className={cn(
                                "text-xs font-bold",
                                getTextColor(day.intensity)
                            )}>
                                {day.intensity}%
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Peak Hours Summary */}
            <div className="bg-muted/50 border rounded-lg p-3 space-y-2">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase">
                    Peak Hours Identified
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-card border rounded p-2">
                        <p className="text-xs text-muted-foreground">Morning Peak</p>
                        <p className="text-sm font-bold text-destructive">8:00 AM</p>
                        <p className="text-xs text-muted-foreground">95% capacity</p>
                    </div>
                    <div className="bg-card border rounded p-2">
                        <p className="text-xs text-muted-foreground">Evening Peak</p>
                        <p className="text-sm font-bold text-destructive">6:00 PM</p>
                        <p className="text-xs text-muted-foreground">100% capacity</p>
                    </div>
                </div>
                <div className="bg-card border rounded p-2">
                    <p className="text-xs text-muted-foreground">Busiest Day</p>
                    <p className="text-sm font-bold">Friday</p>
                    <p className="text-xs text-muted-foreground">Avg 100% capacity during rush hours</p>
                </div>
            </div>
        </div>
    );
}