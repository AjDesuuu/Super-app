// Mock data for LRT/MRT Operator Dashboard

export interface Station {
    id: string;
    name: string;
    line: "LRT-1" | "LRT-2" | "MRT-3";
    coordinates: [number, number];
    currentCrowd: number;
    capacity: number;
    waitTime: string;
    nextTrain: string;
    status: "operational" | "delayed" | "maintenance" | "incident" | "closed";
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

// Mock Stations Data - Comprehensive Metro Manila LRT/MRT stations
export const mockStations: Station[] = [
    // LRT-1 Stations (North to South)
    { id: "lrt1-1", name: "Fernando Poe Jr.", line: "LRT-1", coordinates: [14.6576, 121.0211], currentCrowd: 850, capacity: 1000, waitTime: "6-8 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt1-2", name: "Balintawak", line: "LRT-1", coordinates: [14.6575, 121.0007], currentCrowd: 920, capacity: 1000, waitTime: "8-10 mins", nextTrain: "4 mins", status: "operational" },
    { id: "lrt1-3", name: "Monumento", line: "LRT-1", coordinates: [14.6575, 120.9841], currentCrowd: 780, capacity: 1000, waitTime: "10-15 mins", nextTrain: "6 mins", status: "operational" },
    { id: "lrt1-4", name: "5th Avenue", line: "LRT-1", coordinates: [14.6503, 120.9837], currentCrowd: 650, capacity: 1000, waitTime: "5-7 mins", nextTrain: "2 mins", status: "operational" },
    { id: "lrt1-5", name: "R. Papa", line: "LRT-1", coordinates: [14.6360, 120.9827], currentCrowd: 480, capacity: 1000, waitTime: "4-6 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt1-6", name: "Abad Santos", line: "LRT-1", coordinates: [14.6305, 120.9813], currentCrowd: 520, capacity: 1000, waitTime: "5-7 mins", nextTrain: "4 mins", status: "operational" },
    { id: "lrt1-7", name: "Blumentritt", line: "LRT-1", coordinates: [14.6227, 120.9829], currentCrowd: 890, capacity: 1000, waitTime: "7-9 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt1-8", name: "Tayuman", line: "LRT-1", coordinates: [14.6167, 120.9830], currentCrowd: 710, capacity: 1000, waitTime: "6-8 mins", nextTrain: "2 mins", status: "operational" },
    { id: "lrt1-9", name: "Bambang", line: "LRT-1", coordinates: [14.6111, 120.9821], currentCrowd: 620, capacity: 1000, waitTime: "5-7 mins", nextTrain: "4 mins", status: "operational" },
    { id: "lrt1-10", name: "Doroteo Jose", line: "LRT-1", coordinates: [14.6053, 120.9817], currentCrowd: 950, capacity: 1000, waitTime: "9-12 mins", nextTrain: "5 mins", status: "operational" },
    { id: "lrt1-11", name: "Carriedo", line: "LRT-1", coordinates: [14.5996, 120.9814], currentCrowd: 830, capacity: 1000, waitTime: "7-9 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt1-12", name: "Central Terminal", line: "LRT-1", coordinates: [14.5927, 120.9816], currentCrowd: 920, capacity: 1200, waitTime: "8-11 mins", nextTrain: "4 mins", status: "operational" },
    { id: "lrt1-13", name: "UN Avenue", line: "LRT-1", coordinates: [14.5825, 120.9845], currentCrowd: 750, capacity: 1000, waitTime: "6-8 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt1-14", name: "Pedro Gil", line: "LRT-1", coordinates: [14.5768, 120.9881], currentCrowd: 680, capacity: 1000, waitTime: "5-7 mins", nextTrain: "2 mins", status: "operational" },
    { id: "lrt1-15", name: "Quirino", line: "LRT-1", coordinates: [14.5702, 120.9914], currentCrowd: 590, capacity: 1000, waitTime: "5-7 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt1-16", name: "Vito Cruz", line: "LRT-1", coordinates: [14.5633, 120.9947], currentCrowd: 720, capacity: 1000, waitTime: "6-8 mins", nextTrain: "4 mins", status: "operational" },
    { id: "lrt1-17", name: "Gil Puyat", line: "LRT-1", coordinates: [14.5541, 120.9970], currentCrowd: 810, capacity: 1000, waitTime: "7-9 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt1-18", name: "Libertad", line: "LRT-1", coordinates: [14.5476, 120.9985], currentCrowd: 540, capacity: 1000, waitTime: "4-6 mins", nextTrain: "2 mins", status: "operational" },
    { id: "lrt1-19", name: "EDSA", line: "LRT-1", coordinates: [14.5375, 121.0013], currentCrowd: 970, capacity: 1200, waitTime: "9-12 mins", nextTrain: "5 mins", status: "operational" },
    { id: "lrt1-20", name: "Baclaran", line: "LRT-1", coordinates: [14.5343, 121.0001], currentCrowd: 930, capacity: 1200, waitTime: "8-11 mins", nextTrain: "4 mins", status: "operational" },

    // LRT-2 Stations (West to East)
    { id: "lrt2-1", name: "Recto", line: "LRT-2", coordinates: [14.6033, 120.9838], currentCrowd: 880, capacity: 1000, waitTime: "7-10 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt2-2", name: "Legarda", line: "LRT-2", coordinates: [14.6015, 120.9922], currentCrowd: 720, capacity: 1000, waitTime: "6-8 mins", nextTrain: "2 mins", status: "operational" },
    { id: "lrt2-3", name: "Pureza", line: "LRT-2", coordinates: [14.6011, 121.0050], currentCrowd: 650, capacity: 1000, waitTime: "5-7 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt2-4", name: "V. Mapa", line: "LRT-2", coordinates: [14.6025, 121.0185], currentCrowd: 590, capacity: 1000, waitTime: "5-7 mins", nextTrain: "4 mins", status: "operational" },
    { id: "lrt2-5", name: "J. Ruiz", line: "LRT-2", coordinates: [14.6105, 121.0298], currentCrowd: 530, capacity: 1000, waitTime: "4-6 mins", nextTrain: "2 mins", status: "operational" },
    { id: "lrt2-6", name: "Gilmore", line: "LRT-2", coordinates: [14.6135, 121.0343], currentCrowd: 760, capacity: 1000, waitTime: "6-8 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt2-7", name: "Betty Go-Belmonte", line: "LRT-2", coordinates: [14.6186, 121.0426], currentCrowd: 90, capacity: 1000, waitTime: "2-4 mins", nextTrain: "1 min", status: "operational" },
    { id: "lrt2-8", name: "Araneta Center-Cubao", line: "LRT-2", coordinates: [14.6219, 121.0514], currentCrowd: 920, capacity: 1200, waitTime: "8-11 mins", nextTrain: "4 mins", status: "operational" },
    { id: "lrt2-9", name: "Anonas", line: "LRT-2", coordinates: [14.6281, 121.0645], currentCrowd: 780, capacity: 1000, waitTime: "6-9 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt2-10", name: "Katipunan", line: "LRT-2", coordinates: [14.6310, 121.0734], currentCrowd: 850, capacity: 1000, waitTime: "3-5 mins", nextTrain: "4 mins", status: "operational" },
    { id: "lrt2-11", name: "Santolan", line: "LRT-2", coordinates: [14.6222, 121.0862], currentCrowd: 740, capacity: 1000, waitTime: "5-8 mins", nextTrain: "2 mins", status: "operational" },
    { id: "lrt2-12", name: "Marikina-Pasig", line: "LRT-2", coordinates: [14.6247, 121.1011], currentCrowd: 810, capacity: 1000, waitTime: "7-9 mins", nextTrain: "3 mins", status: "operational" },
    { id: "lrt2-13", name: "Antipolo", line: "LRT-2", coordinates: [14.6242, 121.1213], currentCrowd: 950, capacity: 1200, waitTime: "9-12 mins", nextTrain: "5 mins", status: "operational" },

    // MRT-3 Stations (North to South)
    { id: "mrt3-1", name: "North Avenue", line: "MRT-3", coordinates: [14.6534, 121.0331], currentCrowd: 1050, capacity: 1200, waitTime: "10-14 mins", nextTrain: "6 mins", status: "operational" },
    { id: "mrt3-2", name: "Quezon Avenue", line: "MRT-3", coordinates: [14.6436, 121.0371], currentCrowd: 920, capacity: 1200, waitTime: "8-12 mins", nextTrain: "3 mins", status: "operational" },
    { id: "mrt3-3", name: "Kamuning", line: "MRT-3", coordinates: [14.6352, 121.0433], currentCrowd: 780, capacity: 1000, waitTime: "6-9 mins", nextTrain: "4 mins", status: "operational" },
    { id: "mrt3-4", name: "Araneta Center-Cubao", line: "MRT-3", coordinates: [14.6195, 121.0511], currentCrowd: 1100, capacity: 1500, waitTime: "15-20 mins", nextTrain: "5 mins", status: "delayed" },
    { id: "mrt3-5", name: "Santolan-Annapolis", line: "MRT-3", coordinates: [14.6074, 121.0564], currentCrowd: 850, capacity: 1000, waitTime: "7-10 mins", nextTrain: "3 mins", status: "operational" },
    { id: "mrt3-6", name: "Ortigas", line: "MRT-3", coordinates: [14.5878, 121.0566], currentCrowd: 990, capacity: 1200, waitTime: "9-12 mins", nextTrain: "4 mins", status: "operational" },
    { id: "mrt3-7", name: "Shaw Boulevard", line: "MRT-3", coordinates: [14.5813, 121.0536], currentCrowd: 870, capacity: 1000, waitTime: "7-10 mins", nextTrain: "3 mins", status: "operational" },
    { id: "mrt3-8", name: "Boni", line: "MRT-3", coordinates: [14.5739, 121.0483], currentCrowd: 740, capacity: 1000, waitTime: "6-8 mins", nextTrain: "2 mins", status: "operational" },
    { id: "mrt3-9", name: "Guadalupe", line: "MRT-3", coordinates: [14.5672, 121.0454], currentCrowd: 910, capacity: 1200, waitTime: "8-11 mins", nextTrain: "4 mins", status: "operational" },
    { id: "mrt3-10", name: "Buendia", line: "MRT-3", coordinates: [14.5543, 121.0335], currentCrowd: 820, capacity: 1000, waitTime: "7-9 mins", nextTrain: "3 mins", status: "operational" },
    { id: "mrt3-11", name: "Ayala", line: "MRT-3", coordinates: [14.5490, 121.0281], currentCrowd: 1080, capacity: 1500, waitTime: "10-13 mins", nextTrain: "5 mins", status: "operational" },
    { id: "mrt3-12", name: "Magallanes", line: "MRT-3", coordinates: [14.5420, 121.0195], currentCrowd: 750, capacity: 1000, waitTime: "6-8 mins", nextTrain: "3 mins", status: "operational" },
    { id: "mrt3-13", name: "Taft Avenue", line: "MRT-3", coordinates: [14.5376, 121.0021], currentCrowd: 1020, capacity: 1500, waitTime: "10-14 mins", nextTrain: "6 mins", status: "operational" },
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

// Helper function to calculate crowd level from numeric values
export const getCrowdLevel = (current: number, capacity: number): "low" | "moderate" | "high" | "critical" => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return "critical";
    if (percentage >= 75) return "high";
    if (percentage >= 50) return "moderate";
    return "low";
};

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