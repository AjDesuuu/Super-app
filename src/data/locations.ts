export interface Location {
    id: number;
    name: string;
    area: string;
    coordinates: [number, number];
    vehicleWaitTime?: number; // Vehicle waiting time in seconds (0-30)
}

// Starting points in Rizal and nearby areas
export const startingPoints: Location[] = [
    {
        id: 1,
        name: "Antipolo City Plaza",
        area: "Antipolo, Rizal",
        coordinates: [14.5866, 121.1756],
        vehicleWaitTime: Math.floor(Math.random() * 31), // 0-30 seconds
    },
    {
        id: 2,
        name: "Cainta Junction",
        area: "Cainta, Rizal",
        coordinates: [14.5865, 121.1137],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 3,
        name: "Marikina City Hall",
        area: "Marikina, Rizal",
        coordinates: [14.6507, 121.1029],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 4,
        name: "Dasmariñas City Hall",
        area: "Dasmariñas, Cavite",
        coordinates: [14.3294, 120.9366],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 5,
        name: "Alabang Town Center",
        area: "Muntinlupa",
        coordinates: [14.4253, 121.0275],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 6,
        name: "Monumento Circle",
        area: "Caloocan",
        coordinates: [14.6538, 120.9822],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 7,
        name: "PITX",
        area: "Parañaque",
        coordinates: [14.5122, 120.9932],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
];

// Destination points in Quezon City and nearby areas
export const destinationPoints: Location[] = [
    {
        id: 1,
        name: "Quezon Memorial Circle",
        area: "Quezon City",
        coordinates: [14.6522, 121.0498],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 2,
        name: "UP Diliman",
        area: "Quezon City",
        coordinates: [14.6537, 121.0685],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 4,
        name: "SM North EDSA",
        area: "Quezon City",
        coordinates: [14.655579, 121.030187],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 5,
        name: "Malolos City Hall",
        area: "Malolos, Bulacan",
        coordinates: [14.8433, 120.8114],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 6,
        name: "BGC High Street",
        area: "Taguig",
        coordinates: [14.5507, 121.0506],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 7,
        name: "Greenhills Shopping Center",
        area: "San Juan",
        coordinates: [14.6015, 121.0484],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 8,
        name: "Cubao Expo",
        area: "Quezon City",
        coordinates: [14.6195, 121.0594],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
    {
        id: 9,
        name: "SM Mall of Asia",
        area: "Pasay",
        coordinates: [14.5355, 120.9847],
        vehicleWaitTime: Math.floor(Math.random() * 31),
    },
];
