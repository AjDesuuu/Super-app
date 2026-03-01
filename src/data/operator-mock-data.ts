// Mock data for LRT/MRT Operator Dashboard

export interface Station {
    id: number;
    name: string;
    line: "LRT-1" | "LRT-2" | "MRT-3";
    coordinates: [number, number];
    currentCrowd: "low" | "moderate" | "high" | "critical";
    waitTime: string;
    nextTrain: string;
    status: "operational" | "delayed" | "maintenance" | "incident";
}

export interface Alert {
    id: number;
    type: "crowd" | "delay" | "incident" | "maintenance";
    severity: "low" | "medium" | "high" | "critical";
    station: string;
    line: string;
    message: string;
    timestamp: string;
    status: "active" | "resolved";
}

export interface CrowdPrediction {
    stationId: number;
    stationName: string;
    timeSlot: string;
    predictedCrowd: "low" | "moderate" | "high" | "critical";
    confidence: number;
}

export interface OperatorStats {
    activeLine: string;
    totalStations: number;
    operationalStations: number;
    activeIncidents: number;
    avgWaitTime: string;
    dailyPassengers: number;
    peakHourLoad: string;
    systemStatus: "normal" | "delayed" | "critical";
}

export interface IncidentReport {
    id: number;
    line: string;
    station: string;
    type: "technical" | "crowd" | "security" | "medical";
    description: string;
    reportedAt: string;
    resolvedAt?: string;
    status: "ongoing" | "resolved";
    impact: "minor" | "moderate" | "severe";
}

// Mock Stations Data
export const mockStations: Station[] = [
    {
        id: 1,
        name: "Quezon Avenue",
        line: "MRT-3",
        coordinates: [14.6237, 121.0293],
        currentCrowd: "high",
        waitTime: "8-12 mins",
        nextTrain: "3 mins",
        status: "operational",
    },
    {
        id: 2,
        name: "Cubao",
        line: "MRT-3",
        coordinates: [14.6195, 121.0507],
        currentCrowd: "critical",
        waitTime: "15-20 mins",
        nextTrain: "5 mins",
        status: "delayed",
    },
    {
        id: 3,
        name: "Santolan",
        line: "LRT-2",
        coordinates: [14.6311, 121.0856],
        currentCrowd: "moderate",
        waitTime: "5-8 mins",
        nextTrain: "2 mins",
        status: "operational",
    },
    {
        id: 4,
        name: "Katipunan",
        line: "LRT-2",
        coordinates: [14.6383, 121.0722],
        currentCrowd: "low",
        waitTime: "3-5 mins",
        nextTrain: "4 mins",
        status: "operational",
    },
    {
        id: 5,
        name: "Monumento",
        line: "LRT-1",
        coordinates: [14.6542, 120.9842],
        currentCrowd: "high",
        waitTime: "10-15 mins",
        nextTrain: "6 mins",
        status: "operational",
    },
];

// Mock Alerts
export const mockAlerts: Alert[] = [
    {
        id: 1,
        type: "crowd",
        severity: "critical",
        station: "Cubao",
        line: "MRT-3",
        message: "Critical crowd density detected. Platform capacity at 95%.",
        timestamp: "2:45 PM",
        status: "active",
    },
    {
        id: 2,
        type: "delay",
        severity: "medium",
        station: "Quezon Avenue",
        line: "MRT-3",
        message: "Train delay due to signal issue. +5 mins expected.",
        timestamp: "2:30 PM",
        status: "active",
    },
    {
        id: 3,
        type: "incident",
        severity: "high",
        station: "Santolan",
        line: "LRT-2",
        message: "Medical emergency reported. Platform cleared.",
        timestamp: "1:15 PM",
        status: "resolved",
    },
];

// Mock Crowd Predictions (Next 4 hours)
export const mockCrowdPredictions: CrowdPrediction[] = [
    {
        stationId: 2,
        stationName: "Cubao",
        timeSlot: "3:00 PM - 4:00 PM",
        predictedCrowd: "critical",
        confidence: 92,
    },
    {
        stationId: 1,
        stationName: "Quezon Avenue",
        timeSlot: "4:00 PM - 5:00 PM",
        predictedCrowd: "high",
        confidence: 88,
    },
    {
        stationId: 5,
        stationName: "Monumento",
        timeSlot: "5:00 PM - 6:00 PM",
        predictedCrowd: "critical",
        confidence: 95,
    },
    {
        stationId: 3,
        stationName: "Santolan",
        timeSlot: "3:00 PM - 4:00 PM",
        predictedCrowd: "moderate",
        confidence: 85,
    },
];

// Mock Operator Stats
export const mockOperatorStats: OperatorStats = {
    activeLine: "MRT-3",
    totalStations: 13,
    operationalStations: 12,
    activeIncidents: 2,
    avgWaitTime: "8-12 mins",
    dailyPassengers: 287500,
    peakHourLoad: "95%",
    systemStatus: "delayed",
};

// Mock Incident Reports
export const mockIncidentReports: IncidentReport[] = [
    {
        id: 1,
        line: "MRT-3",
        station: "Cubao",
        type: "crowd",
        description: "Platform overcrowding during rush hour. Temporary entry control activated.",
        reportedAt: "2:45 PM",
        status: "ongoing",
        impact: "severe",
    },
    {
        id: 2,
        line: "LRT-2",
        station: "Santolan",
        type: "medical",
        description: "Passenger required medical assistance. Emergency response completed.",
        reportedAt: "1:15 PM",
        resolvedAt: "1:35 PM",
        status: "resolved",
        impact: "moderate",
    },
    {
        id: 3,
        line: "MRT-3",
        station: "Quezon Avenue",
        type: "technical",
        description: "Signal system malfunction causing 5-minute delays.",
        reportedAt: "2:30 PM",
        status: "ongoing",
        impact: "moderate",
    },
];

// Historical data for analytics (weekly)
export const mockWeeklyData = [
    { day: "Mon", passengers: 245000, incidents: 3, avgWait: 7 },
    { day: "Tue", passengers: 268000, incidents: 2, avgWait: 8 },
    { day: "Wed", passengers: 282000, incidents: 4, avgWait: 9 },
    { day: "Thu", passengers: 276000, incidents: 2, avgWait: 8 },
    { day: "Fri", passengers: 295000, incidents: 5, avgWait: 11 },
    { day: "Sat", passengers: 198000, incidents: 1, avgWait: 5 },
    { day: "Sun", passengers: 287500, incidents: 2, avgWait: 6 },
];