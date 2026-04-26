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
import nexPathLogo from "@/assets/nexpath.svg";

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

  const defaultCredentials: Record<
    string,
    { email: string; password: string }
  > = {
    passenger: { email: "passenger1@nexstation.com", password: "1" },
    operator: { email: "operator1@nexstation.com", password: "operator123" },
    lgu: { email: "marikinalgu@nexstation.com", password: "marikina" },
    admin: { email: "admin@nexstation.com", password: "admin123" },
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const email = formData.email || defaultCredentials[loginType].email;
    const password =
      formData.password || defaultCredentials[loginType].password;

    const user = authenticateUser(email, password, loginType);

    if (user) {
      onLogin(user);
    } else {
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
    <div className="h-[95vh] w-[430px] flex items-center justify-center bg-white dark:from-slate-950 dark:to-slate-900 p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="pt-8 pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-white rounded-2xl shadow-md border border-[#F0A6B0]/30">
              <img
                src={nexPathLogo}
                className="h-20 w-20 object-contain"
                alt="NexPath Logo"
              />
            </div>
          </div>
          <CardTitle className="text-xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#E9406B] to-[#F68B9B]">
            NexPath
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
                  ? "bg-white dark:bg-slate-950 text-[#E9406B] shadow-sm"
                  : "text-slate-500 hover:text-slate-900",
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
                  ? "bg-white dark:bg-slate-950 text-[#F68B9B] shadow-sm"
                  : "text-slate-500 hover:text-slate-900",
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
                  ? "bg-white dark:bg-slate-950 text-[#F0A6B0] shadow-sm"
                  : "text-slate-500 hover:text-slate-900",
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
                  : "text-slate-500 hover:text-slate-900",
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
              <Label htmlFor="email" className="text-xs font-semibold">
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
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold">
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
                  ? "bg-[#E9406B] hover:bg-[#d13560]"
                  : loginType === "lgu"
                    ? "bg-[#F0A6B0] hover:bg-[#e890a0] text-slate-800"
                    : loginType === "operator"
                      ? "bg-[#F68B9B] hover:bg-[#e07086] text-slate-800"
                      : "bg-[#E9406B] hover:bg-[#d13560]"
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
