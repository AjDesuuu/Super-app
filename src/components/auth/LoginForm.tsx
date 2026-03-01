import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authenticateUser, type User } from "@/data/users";
import trainLogo from "/train.svg";

interface LoginFormProps {
    onLogin: (user: User) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
    const [loginType, setLoginType] = useState<
        "passenger" | "operator" | "lgu" | "admin"
    >("passenger");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const { email, password } = formData;

        // Use the authenticateUser function from users.ts
        const user = authenticateUser(email, password, loginType);

        if (user) {
            // Successfully authenticated
            onLogin(user);
        } else {
            // Authentication failed
            setError("Invalid credentials. Please try again.");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="h-[95vh] w-[430px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="pt-8 pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-600/10 rounded-2xl">
                            <img src={trainLogo} alt="NexStation Logo" className="h-10 w-10" />
                        </div>
                    </div>
                    <CardTitle className="text-xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        NexStation
                    </CardTitle>
                    <CardDescription className="text-center text-xs font-medium">
                        Welcome Back • Sign in to your journey
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Login Type Toggle */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setLoginType("passenger")}
                            className={cn(
                                "rounded-md px-1 py-2 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-tight sm:tracking-normal transition-all whitespace-nowrap",
                                loginType === "passenger"
                                    ? "bg-white dark:bg-slate-950 text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            Passenger
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginType("operator")}
                            className={cn(
                                "rounded-md px-1 py-2 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-tight sm:tracking-normal transition-all whitespace-nowrap",
                                loginType === "operator"
                                    ? "bg-white dark:bg-slate-950 text-emerald-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            Operator
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginType("lgu")}
                            className={cn(
                                "rounded-md px-1 py-2 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-tight sm:tracking-normal transition-all whitespace-nowrap",
                                loginType === "lgu"
                                    ? "bg-white dark:bg-slate-950 text-indigo-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            LGU
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginType("admin")}
                            className={cn(
                                "rounded-md px-1 py-2 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-tight sm:tracking-normal transition-all whitespace-nowrap",
                                loginType === "admin"
                                    ? "bg-white dark:bg-slate-950 text-red-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            Admin
                        </button>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive font-medium border border-destructive/20">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="email"
                                className="text-xs font-semibold"
                            >
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={
                                    loginType === "admin"
                                        ? "admin@nexstation.com"
                                        : loginType === "lgu"
                                        ? "marikinalgu@nexstation.com"
                                        : loginType === "operator"
                                        ? "operator1@nexstation.com"
                                        : "passenger1@nexstation.com"
                                }
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="h-9 text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-xs font-semibold"
                                >
                                    Password
                                </Label>
                                <button
                                    type="button"
                                    className="text-[10px] text-primary hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="h-9 text-sm pr-9"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                {loginType === "passenger" && "Hint: Use password '1'"}
                                {loginType === "operator" && "Hint: Use password 'operator123'"}
                                {loginType === "lgu" && "Hint: Use password 'marikina'"}
                                {loginType === "admin" && "Hint: Use password 'admin123'"}
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className={`w-full font-bold ${
                                loginType === "admin"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : loginType === "lgu"
                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                    : loginType === "operator"
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                            size="sm"
                        >
                            {loginType === "admin"
                                ? "Administrative Access"
                                : loginType === "lgu"
                                ? "Access Command Center"
                                : loginType === "operator"
                                ? "Start Shift"
                                : "Sign In"}
                        </Button>
                    </form>

                    <div className="text-center text-xs text-muted-foreground">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            className="text-primary hover:underline font-medium"
                        >
                            Sign up
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
