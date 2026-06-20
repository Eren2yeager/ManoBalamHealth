import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, KeyRound, Eye, EyeOff, LogIn, AlertTriangle, ArrowRight } from "lucide-react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "../api/auth.api";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ApiErrorResponse, Role } from "@/types/global.types";

const roleHome: Record<Role, string> = {
  patient: "/home",
  psychologist: "/psychologist/dashboard",
  admin: "/admin/dashboard",
};

export const LoginForm = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const setAccessToken = useUserStore((s) => s.setAccessToken);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login({ emailOrPhone, password });
      setAccessToken(result.accessToken);
      setUser(result.user);
      navigate(roleHome[result.user.role]);
    } catch (error) {
      if (isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Login failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Crisis Banner */}
      <a
        href="#"
        className="w-full bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 hover:bg-red-100/60 transition-colors group"
        onClick={(e) => e.preventDefault()}
      >
        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
        <div className="grow">
          <p className="text-sm font-semibold text-red-600">In crisis? Get help now</p>
          <p className="text-xs text-red-500/80 mt-0.5">
            Connect immediately to our emergency support team.
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-red-600 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
      </a>

      {/* Email or Phone */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="emailOrPhone" className="text-xs font-medium text-muted-foreground">
          Email or Phone Number
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="emailOrPhone"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
            placeholder="Enter your email or phone"
            autoComplete="username"
            className="pl-10 py-3 h-auto bg-background border-border rounded-lg focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
            Password
          </Label>
          <button
            type="button"
            className="text-xs font-semibold text-primary hover:underline"
            onClick={() => toast.info("Password reset coming soon.")}
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
            className="pl-10 pr-10 py-3 h-auto bg-background border-border rounded-lg focus-visible:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-1">
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-3 h-auto rounded-lg font-semibold text-sm",
            "flex items-center justify-center gap-2",
            "shadow-[0px_4px_12px_rgba(99,14,212,0.15)]"
          )}
        >
          {isLoading ? "Signing in..." : "Sign In"}
          {!isLoading && <LogIn className="h-4 w-4" />}
        </Button>
      </div>

      {/* Register link */}
      <p className="text-center text-xs text-muted-foreground pt-1 border-t border-border">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="text-primary font-semibold hover:underline ml-1"
        >
          Create an account
        </button>
      </p>
    </form>
  );
};
