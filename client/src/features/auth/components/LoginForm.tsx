import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { useAuthStore } from "../store/authStore";

const roleHome: Record<Role, string> = {
  patient: "/home",
  psychologist: "/psychologist/dashboard",
  admin: "/admin/dashboard",
};

export const LoginForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useUserStore((s) => s.setUser);
  const setAccessToken = useUserStore((s) => s.setAccessToken);
  const setPendingVerification = useAuthStore((s) => s.setPendingVerification);

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
      const requestedPath = searchParams.get("redirect");
      const safeRedirect =
        requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : null;
      navigate(safeRedirect ?? roleHome[result.user.role]);
    } catch (error) {
      if (isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
        const details = error.response.data.details;
        if (
          error.response.data.message === "Account not verified" &&
          typeof details === "object" &&
          details !== null &&
          "userId" in details &&
          typeof details.userId === "string"
        ) {
          setPendingVerification(details.userId, "email");
          navigate("/verify-otp");
          toast.info("Verify your email before logging in.");
          return;
        }
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
      <Link
        to="/services/first-aid-support"
        className="group flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-orange-50/60 p-4 transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-rose-600 shadow-sm">
          <AlertTriangle className="size-5" />
        </span>
        <div className="grow">
          <p className="text-sm font-black text-rose-700">Need urgent support?</p>
          <p className="mt-0.5 text-xs leading-5 text-rose-600/75">
            Open first-aid guidance and emergency resources.
          </p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-rose-500 transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Email or Phone */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="emailOrPhone" className="text-xs font-bold text-slate-700">
          Email or Phone Number
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-violet-400" />
          <Input
            id="emailOrPhone"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
            placeholder="Enter your email or phone"
            autoComplete="username"
            className="h-13 rounded-xl border-slate-200 bg-slate-50/50 pl-11 text-sm transition focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-violet-100"
          />
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-bold text-slate-700">
            Password
          </Label>
          <button
            type="button"
            className="text-xs font-bold text-primary transition hover:text-violet-700 hover:underline"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-violet-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
            className="h-13 rounded-xl border-slate-200 bg-slate-50/50 pl-11 pr-11 text-sm transition focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-violet-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-primary"
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
            "h-13 w-full rounded-xl bg-gradient-to-r from-primary via-violet-600 to-blue-600 text-sm font-black",
            "flex items-center justify-center gap-2",
            "shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/25"
          )}
        >
          {isLoading ? "Signing in..." : "Sign In"}
          {!isLoading && <LogIn className="h-4 w-4" />}
        </Button>
      </div>

      {/* Register link */}
      <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="ml-1 font-black text-primary hover:underline"
        >
          Create an account
        </button>
      </p>
    </form>
  );
};
