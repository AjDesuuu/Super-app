export interface RiskZone {
    id: string;
    name: string;
    hazards: string[];
    riskLevel: "Critical" | "High" | "Moderate";
    affectedCount: number;
    lat: number;
    lng: number;
    impact: string;     // for map popup compatibility
    time: string;       // for map popup compatibility
    color: string;      // for map popup compatibility
}

export const riskZones: RiskZone[] = [
    { 
        id: "P1", name: "Marcos Hwy Bridge", lat: 14.6218, lng: 121.0865, 
        impact: "Critical", time: "5PM - 8PM", color: "#7c3aed",
        hazards: ["Fast-moving vehicles (60+ kph)", "Poor drainage during rain"], 
        riskLevel: "Critical", affectedCount: 450 
    },
    { 
        id: "P2", name: "Sumulong Bayan Cross", lat: 14.6335, lng: 121.0955, 
        impact: "High", time: "7AM - 9AM", color: "#f59e0b",
        hazards: ["Broken pavement sections", "Inadequate sidewalk width"], 
        riskLevel: "High", affectedCount: 320 
    },
    { 
        id: "P3", name: "Tumana Bridge North", lat: 14.6485, lng: 121.0990, 
        impact: "Critical", time: "6AM - 9AM", color: "#ef4444",
        hazards: ["Fast-moving vehicles (55+ kph)", "Flash flooding risk during typhoons"], 
        riskLevel: "Critical", affectedCount: 280 
    },
    { 
        id: "P4", name: "Barangka Flyover Exit", lat: 14.6280, lng: 121.0815, 
        impact: "High", time: "4PM - 7PM", color: "#f97316",
        hazards: ["Uneven road surface", "High vehicle speeds at exit"], 
        riskLevel: "High", affectedCount: 210 
    },
    { 
        id: "P5", name: "NGI Marikina Heights", lat: 14.6465, lng: 121.1120, 
        impact: "High", time: "6AM - 8AM", color: "#f59e0b",
        hazards: ["Broken steps/stairs", "Wet/slippery surfaces during rain"], 
        riskLevel: "High", affectedCount: 380 
    },
    { 
        id: "P6", name: "Gil Fernando / Sumulong", lat: 14.6348, lng: 121.1008, 
        impact: "Moderate", time: "5PM - 8PM", color: "#7c3aed",
        hazards: ["Unpaved sidewalk sections", "Poor lighting at night"], 
        riskLevel: "Moderate", affectedCount: 150 
    },
    { 
        id: "P7", name: "Fortune Barangay Hall", lat: 14.6685, lng: 121.1235, 
        impact: "Moderate", time: "6:30AM - 8:30AM", color: "#3b82f6",
        hazards: ["Pothole accumulation", "Drainage issues causing water pooling"], 
        riskLevel: "Moderate", affectedCount: 120 
    },
    { 
        id: "P8", name: "Lilac St. Dining Strip", lat: 14.6395, lng: 121.1145, 
        impact: "High", time: "6PM - 9PM", color: "#db2777",
        hazards: ["Parked vehicles blocking walkway", "Fast-moving delivery vehicles (45+ kph)"], 
        riskLevel: "High", affectedCount: 290 
    },
    { 
        id: "P9", name: "Parang Jct (Shoe Ave)", lat: 14.6615, lng: 121.1155, 
        impact: "Critical", time: "11AM - 1PM", color: "#10b981",
        hazards: ["Unpaved road near school", "High-speed traffic zone", "Drainage backup during rains"], 
        riskLevel: "Critical", affectedCount: 520 
    }
];