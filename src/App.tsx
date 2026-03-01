import { useState, useEffect } from "react";
import LoginForm from "./components/auth/LoginForm";
import PassengerDashboard from "./components/passenger/PassengerDashboard";
import OperatorDashboard from "./components/operator/OperatorDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import type { User } from "./data/users";
import { getTrafficManager } from "./lib/trafficManager";
import MainLayout from "./components/lgu/MainLayout";

export function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Initialize TrafficManager when app builds
    useEffect(() => {
        const trafficManager = getTrafficManager();

        // Start auto-updates for traffic simulation (Every 2 mins)
        trafficManager.startAutoUpdate(120000);

        const stats = trafficManager.getTrafficStatistics();
        console.log("[App] Traffic Manager initialized:", stats);

        return () => {
            trafficManager.stopAutoUpdate();
        };
    }, []);

    const handleLogin = (user: User) => {
        console.log("Logging in as:", user.role);
        setCurrentUser(user);
    };

    if (currentUser) {
        if (currentUser.role === "passenger") {
            return <PassengerDashboard onLogout={() => setCurrentUser(null)} />;
        } else if (currentUser.role === "operator") {
            return <OperatorDashboard onLogout={() => setCurrentUser(null)} />;
        } else if (currentUser.role === "lgu") {
            return <MainLayout user={currentUser} onLogout={() => setCurrentUser(null)} />;
        } else if (currentUser.role === "admin") {
            return <AdminDashboard onLogout={() => setCurrentUser(null)} />;
        }
    }

    return <LoginForm onLogin={handleLogin} />;
}

export default App;