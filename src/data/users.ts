export interface User {
    id: number;
    email: string;
    password: string;
    role: "passenger" | "operator" | "lgu" | "admin";
    name: string;
}

export const mockUsers: User[] = [
    // Passenger accounts
    {
        id: 1,
        email: "passenger1@nexstation.com",
        password: "1",
        role: "passenger",
        name: "John Passenger",
    },
    {
        id: 2,
        email: "passenger2@nexstation.com",
        password: "passenger123",
        role: "passenger",
        name: "Sarah Traveler",
    },
    {
        id: 3,
        email: "passenger3@nexstation.com",
        password: "passenger123",
        role: "passenger",
        name: "Mike Commuter",
    },
    // Operator accounts
    {
        id: 4,
        email: "operator1@nexstation.com",
        password: "operator123",
        role: "operator",
        name: "Jane Operator",
    },
    {
        id: 5,
        email: "operator2@nexstation.com",
        password: "operator123",
        role: "operator",
        name: "Tom Driver",
    },
    {
        id: 6,
        email: "operator3@nexstation.com",
        password: "operator123",
        role: "operator",
        name: "Lisa Transport",
    },
    {
        id: 7,
        email: "marikinalgu@nexstation.com",
        password: "marikina",
        role: "lgu",
        name: "Marikina LGU Admin",
    },
    // Admin accounts
    {
        id: 8,
        email: "admin@nexstation.com",
        password: "admin123",
        role: "admin",
        name: "System Administrator",
    },
];

// Helper function to authenticate user
export const authenticateUser = (
    email: string,
    password: string,
    role: "passenger" | "operator" | "lgu" | "admin"
): User | null => {
    const user = mockUsers.find(
        (u) => u.email === email && u.password === password && u.role === role
    );
    return user || null;
};
