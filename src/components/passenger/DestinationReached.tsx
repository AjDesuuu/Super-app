import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Home, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DestinationReachedProps {
    locationName?: string;
    totalDistance: number; // in meters
    totalDuration: number; // in seconds
    onViewRoute: () => void;
    onBackToHome: () => void;
}

export function DestinationReached({
    locationName = "Destination",
    totalDistance,
    totalDuration,
    onViewRoute,
    onBackToHome,
}: DestinationReachedProps) {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Trigger animations after mount
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const distanceKm = (totalDistance / 1000).toFixed(1);
    const durationMin = Math.ceil(totalDuration / 60);

    return (
        <div className="h-[95vh] w-full max-w-[430px] mx-auto bg-background flex flex-col overflow-hidden relative">
            {/* Background Gradient Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-green-50/80 to-transparent" />
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[30%] bg-emerald-300/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[30%] bg-teal-300/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 space-y-8">
                {/* Success Animation Circle */}
                <div
                    className={cn(
                        "relative transition-all duration-700 ease-out transform",
                        animate ? "scale-100 opacity-100" : "scale-50 opacity-0"
                    )}
                >
                    <div className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl" />
                    <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/20">
                        <div
                            className={cn(
                                "bg-white rounded-full p-2 transition-all duration-500 delay-300",
                                animate
                                    ? "scale-100 opacity-100"
                                    : "scale-0 opacity-0"
                            )}
                        >
                            <Check className="h-12 w-12 text-emerald-600 stroke-[3]" />
                        </div>
                    </div>
                    {/* Ring ripple effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-400/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                </div>

                {/* Text Content */}
                <div className="text-center space-y-3">
                    <h1
                        className={cn(
                            "text-3xl font-bold text-foreground tracking-tight transition-all duration-700 delay-200",
                            animate
                                ? "translate-y-0 opacity-100"
                                : "translate-y-4 opacity-0"
                        )}
                    >
                        You've Arrived!
                    </h1>
                    <div
                        className={cn(
                            "flex items-center justify-center gap-2 text-muted-foreground transition-all duration-700 delay-300",
                            animate
                                ? "translate-y-0 opacity-100"
                                : "translate-y-4 opacity-0"
                        )}
                    >
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span className="text-lg font-medium">
                            {locationName}
                        </span>
                    </div>
                </div>

                {/* Log Card */}
                <div
                    className={cn(
                        "w-full max-w-sm bg-card/50 backdrop-blur-sm border rounded-2xl p-6 shadow-sm transition-all duration-700 delay-400",
                        animate
                            ? "translate-y-0 opacity-100"
                            : "translate-y-8 opacity-0"
                    )}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center justify-center space-y-2 p-2 relative">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                                <Clock className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-center">
                                <span className="block text-2xl font-bold tabular-nums">
                                    {durationMin}
                                </span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                    Minutes
                                </span>
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-border/50" />
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-2 p-2">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                                <MapPin className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="text-center">
                                <span className="block text-2xl font-bold tabular-nums">
                                    {distanceKm}
                                </span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                    Kilometers
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div
                className={cn(
                    "p-6 space-y-3 bg-background/80 backdrop-blur-xl border-t transition-all duration-700 delay-500",
                    animate
                        ? "translate-y-0 opacity-100"
                        : "translate-y-full opacity-0"
                )}
            >
                <Button
                    onClick={onViewRoute}
                    variant="default"
                    className="w-full h-14 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Review Route
                </Button>

                <Button
                    onClick={onBackToHome}
                    variant="secondary"
                    className="w-full h-14 rounded-xl text-base font-medium bg-secondary/50 hover:bg-secondary/80 border-0"
                >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                </Button>
            </div>
        </div>
    );
}
