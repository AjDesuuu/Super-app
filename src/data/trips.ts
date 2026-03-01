export interface Trip {
    id: number;
    from: string;
    to: string;
    date: string;
    status: string;
    duration: string;
}

export const recentTrips: Trip[] = [
    {
        id: 1,
        from: "Ortigas Center",
        to: "Cubao",
        date: "Jan 10, 2026",
        status: "completed",
        duration: "32 min",
    },
    {
        id: 2,
        from: "Cainta Junction",
        to: "SM North EDSA",
        date: "Jan 8, 2026",
        status: "completed",
        duration: "18 min",
    },
    {
        id: 3,
        from: "Antipolo City Plaza",
        to: "UP Diliman",
        date: "Jan 5, 2026",
        status: "completed",
        duration: "24 min",
    },
];
