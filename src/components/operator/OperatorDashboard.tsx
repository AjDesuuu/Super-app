import { useState } from "react";
import DashboardSelector from "@/components/operator/DashboardSelector";
import RailOperatorDashboard from "@/components/operator/trains/OperatorDashboard";
import BusOperatorDashboard from "@/components/operator/bus/BusOperatorDashboard";

type OperatorType = "selector" | "rail" | "bus";

interface OperatorDashboardProps {
    onLogout: () => void;
}

export default function OperatorDashboard({ onLogout }: OperatorDashboardProps) {
    const [operatorType, setOperatorType] = useState<OperatorType>("selector");



    if (operatorType === "rail") {
        return (
            <RailOperatorDashboard 
                onBack={() => setOperatorType("selector")} 
                onLogout={onLogout} 
            />
        );
    }

    if (operatorType === "bus") {
        return (
            <BusOperatorDashboard 
                onBack={() => setOperatorType("selector")} 
                onLogout={onLogout} 
            />
        );
    }

    return (
        <DashboardSelector
            onLogout={onLogout}
            onSelectDashboard={(type) => {
                setOperatorType(type === "rail" ? "rail" : "bus");
            }}
        />
    );
}
