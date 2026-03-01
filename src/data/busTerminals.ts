export interface BusTerminal {
    id: number;
    name: string;
    area: string;
    coordinates: [number, number];
    routes: string[]; // Areas or regions this terminal serves
}

// Major bus terminals in Metro Manila
export const busTerminals: BusTerminal[] = [
    {
        id: 1,
        name: "PITX (Parañaque Integrated Terminal Exchange)",
        area: "Parañaque City",
        coordinates: [14.4594, 121.0118],
        routes: ["Cavite", "Batangas", "Laguna", "Southern Luzon"],
    },
    {
        id: 2,
        name: "Araneta City Bus Terminal",
        area: "Quezon City",
        coordinates: [14.6199, 121.0516],
        routes: ["Northern Luzon", "Bulacan", "Pampanga", "Baguio"],
    },
    {
        id: 3,
        name: "Cubao Bus Terminal",
        area: "Quezon City",
        coordinates: [14.6191, 121.0515],
        routes: ["Northern Luzon", "Bulacan", "Nueva Ecija", "Pangasinan"],
    },
    {
        id: 4,
        name: "Pasay Bus Terminal",
        area: "Pasay City",
        coordinates: [14.5378, 121.0014],
        routes: ["Cavite", "Batangas", "Southern Luzon"],
    },
];

/**
 * Determines if a route should use bus transportation based on distance
 * and whether it crosses major regional boundaries
 */
export function shouldUseBusRoute(
    startCoords: [number, number],
    endCoords: [number, number],
    distance: number // in meters
): BusTerminal | null {
    // Only consider bus routes for distances over 15km
    if (distance < 15000) {
        return null;
    }

    const [startLat, startLng] = startCoords;
    const [endLat, endLng] = endCoords;

    // Check if route crosses major boundaries that would require bus transport
    // PITX serves southern routes (Cavite, Batangas, Laguna)
    // Northern terminals serve northern routes (Bulacan, Pampanga, etc.)

    // Rough boundaries for Metro Manila (approximate)
    const metroManilaBounds = {
        north: 14.77,
        south: 14.35,
        east: 121.15,
        west: 120.9,
    };

    const startInMetro =
        startLat >= metroManilaBounds.south &&
        startLat <= metroManilaBounds.north &&
        startLng >= metroManilaBounds.west &&
        startLng <= metroManilaBounds.east;

    const endInMetro =
        endLat >= metroManilaBounds.south &&
        endLat <= metroManilaBounds.north &&
        endLng >= metroManilaBounds.west &&
        endLng <= metroManilaBounds.east;

    // If both are in Metro Manila, no bus needed
    if (startInMetro && endInMetro) {
        return null;
    }

    // Determine which terminal to use based on direction
    // South: PITX
    if (
        endLat < metroManilaBounds.south ||
        (endInMetro === false && endLat < startLat)
    ) {
        return busTerminals[0]; // PITX
    }

    // North: Araneta or Cubao
    if (
        endLat > metroManilaBounds.north ||
        (endInMetro === false && endLat > startLat)
    ) {
        return busTerminals[1]; // Araneta City Bus Terminal
    }

    return null;
}
