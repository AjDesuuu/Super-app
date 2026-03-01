export interface checkpoint {
    id: number;
    trip: { from: number; to: number };
    checkpoints: { destination: string; mode: string }[];
}

export const tripCheckpoints: checkpoint[] = [
    {
        id: 1,
        trip: { from: 1, to: 1 },
        checkpoints: [
            { destination: "SM Masinag", mode: "Jeep" },
            { destination: "Anonas", mode: "LRT" },
            { destination: "Quezon Memorial Circle", mode: "Jeep" },
        ],
    },
    {
        id: 2,
        trip: { from: 1, to: 2 },
        checkpoints: [
            { destination: "SM Masinag", mode: "Jeep" },
            { destination: "Katipunan", mode: "LRT" },
            { destination: "UP Diliman", mode: "Jeep" },
        ],
    },
    {
        id: 3,
        trip: { from: 1, to: 3 },
        checkpoints: [
            { destination: "Ligaya, Pasig", mode: "Jeep" },
            { destination: "Eastwood", mode: "UV Express" },
        ],
    },
    {
        id: 4,
        trip: { from: 2, to: 1 },
        checkpoints: [
            { destination: "Sta. Lucia", mode: "Jeep" },
            { destination: "Anonas", mode: "LRT" },
            { destination: "Quezon Memorial Circle", mode: "Jeep" },
        ],
    },
    {
        id: 5,
        trip: { from: 2, to: 2 },
        checkpoints: [
            { destination: "Sta. Lucia", mode: "Jeep" },
            { destination: "Katipunan", mode: "LRT" },
            { destination: "UP Diliman", mode: "Jeep" },
        ],
    },
    {
        id: 6,
        trip: { from: 2, to: 3 },
        checkpoints: [
            { destination: "Sta. Lucia", mode: "Jeep" },
            { destination: "Ligaya, Pasig", mode: "Jeep" },
            { destination: "Eastwood City", mode: "UV Express" },
        ],
    },
];
