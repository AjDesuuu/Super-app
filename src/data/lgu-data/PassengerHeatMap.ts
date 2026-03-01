export interface HeatmapLocation {
    id: number;
    name: string;      // Specific location name (e.g., "Marikina Bayan")
    area: string;      // Broader area (e.g., "Marikina City")
    coordinates: [number, number]; // [Latitude, Longitude]
    paxCount: number;  // Number of passengers waiting
    waitTime: number;  // Average wait time in minutes
    radius: number;    // Heatmap radius size
    level: "Critical" | "High" | "Moderate" | "Low";
    type: string;      // Classification (e.g., "Passenger Surge")
    trend: string;     // e.g., "Rising", "Stable"
    status: string;    // Display status text
    action: string;    // Recommended LGU action
}

// All 14 Marikina Data Points
export const passengerHeatmaps: HeatmapLocation[] = [
    {
        id: 1,
        name: "Marikina Bayan",
        area: "Marikina City",
        coordinates: [14.6335, 121.0955],
        paxCount: 520,
        waitTime: 45,
        radius: 675,
        level: "Critical",
        type: "Passenger Surge",
        trend: "Rising",
        status: "Wait > 45 mins",
        action: "Dispatch Traffic Enforcers"
    },
    {
        id: 2,
        name: "Riverbanks Center",
        area: "Barangka",
        coordinates: [14.6300, 121.0880],
        paxCount: 410,
        waitTime: 35,
        radius: 525,
        level: "Critical",
        type: "Queue Spillover",
        trend: "Rising",
        status: "Wait > 35 mins",
        action: "Monitor Queue Length"
    },
    {
        id: 3,
        name: "Barangka Flyover",
        area: "Barangka",
        coordinates: [14.6285, 121.0825],
        paxCount: 440,
        waitTime: 40,
        radius: 600,
        level: "Critical",
        type: "Chokepoint",
        trend: "Stable",
        status: "Traffic Buildup",
        action: "Check Merging Lane"
    },
    {
        id: 4,
        name: "LRT-2 Santolan Station",
        area: "Santolan/Calumpang",
        coordinates: [14.6220, 121.0850],
        paxCount: 480,
        waitTime: 32,
        radius: 480,
        level: "High",
        type: "Intermodal Bottleneck",
        trend: "Stable",
        status: "Heavy Volume",
        action: "Coord with LRTA"
    },
    {
        id: 5,
        name: "Concepcion Uno",
        area: "Concepcion",
        coordinates: [14.6515, 121.1040],
        paxCount: 390,
        waitTime: 28,
        radius: 420,
        level: "High",
        type: "Loading Violation",
        trend: "Stable",
        status: "Congested",
        action: "Clear Market Entrance"
    },
    {
        id: 6,
        name: "SM Marikina Area",
        area: "Calumpang",
        coordinates: [14.6250, 121.0910],
        paxCount: 310,
        waitTime: 25,
        radius: 375,
        level: "Moderate",
        type: "Mall Traffic",
        trend: "Decreasing",
        status: "Moderate Queue",
        action: "Monitor Mall Traffic"
    },
    {
        id: 7,
        name: "Marcos Hwy - Gil Fernando",
        area: "San Roque",
        coordinates: [14.6232, 121.1000],
        paxCount: 350,
        waitTime: 22,
        radius: 330,
        level: "Moderate",
        type: "Intersection Block",
        trend: "Stable",
        status: "Signal Timing Issue",
        action: "Adjust Signal Timing"
    },
    {
        id: 8,
        name: "Tumana Bridge Access",
        area: "Tumana",
        coordinates: [14.6480, 121.0995],
        paxCount: 210,
        waitTime: 18,
        radius: 270,
        level: "Moderate",
        type: "Narrow Access",
        trend: "Rising",
        status: "Slow Moving",
        action: "Flood Watch Required"
    },
    {
        id: 9,
        name: "Parang-Fortune Jct",
        area: "Parang",
        coordinates: [14.6610, 121.1150],
        paxCount: 220,
        waitTime: 15,
        radius: 225,
        level: "Moderate",
        type: "School Zone",
        trend: "Decreasing",
        status: "Student Surge",
        action: "School Zone Alert"
    },
    {
        id: 10,
        name: "Kalumpang (J.P. Rizal)",
        area: "Kalumpang",
        coordinates: [14.6200, 121.0920],
        paxCount: 190,
        waitTime: 14,
        radius: 210,
        level: "Low",
        type: "Flowing",
        trend: "Stable",
        status: "Normal",
        action: "No Action Needed"
    },
    {
        id: 11,
        name: "Marikina Heights (NGI)",
        area: "Marikina Heights",
        coordinates: [14.6465, 121.1120],
        paxCount: 250,
        waitTime: 12,
        radius: 180,
        level: "Low",
        type: "Terminal Queue",
        trend: "Stable",
        status: "Organized",
        action: "Monitor Tricycle Terminal"
    },
    {
        id: 12,
        name: "Concepcion Dos (Lilac St)",
        area: "Concepcion Dos",
        coordinates: [14.6390, 121.1150],
        paxCount: 180,
        waitTime: 9,
        radius: 135,
        level: "Low",
        type: "Commercial Strip",
        trend: "Stable",
        status: "Light Traffic",
        action: "Check Illegal Parking"
    },
    {
        id: 13,
        name: "Fortune Barangay Hall",
        area: "Fortune",
        coordinates: [14.6680, 121.1230],
        paxCount: 140,
        waitTime: 7,
        radius: 105,
        level: "Low",
        type: "Local Traffic",
        trend: "Decreasing",
        status: "Clear",
        action: "No Action Needed"
    },
    {
        id: 14,
        name: "SSS Village (Panorama)",
        area: "Concepcion Dos",
        coordinates: [14.6360, 121.1250],
        paxCount: 130,
        waitTime: 5,
        radius: 75,
        level: "Low",
        type: "Residential Access",
        trend: "Stable",
        status: "Clear",
        action: "No Action Needed"
    }
];