import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Clock,
  ArrowRight,
  Info,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isAxiosError } from "axios";
import { register } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import { useGeoCountry } from "@/hooks/useGeoCountry";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ApiErrorResponse } from "@/types/global.types";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const setPendingVerification = useAuthStore((s) => s.setPendingVerification);

  const {
    allCountries,
    detectedCountryCode,
    detectedTimezone,
    getTimezonesForCountry,
  } = useGeoCountry();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"patient" | "psychologist">("patient");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize country & timezone directly from geo detection —
  // no useEffect needed since hook values are stable from first render.
  const [country, setCountry] = useState<string>(() => detectedCountryCode ?? "");
  const [timezone, setTimezone] = useState<string>(() => {
    if (!detectedCountryCode) return detectedTimezone; // tz only, no country
    const tzs = getTimezonesForCountry(detectedCountryCode);
    if (tzs.includes(detectedTimezone)) return detectedTimezone;
    return tzs[0] ?? detectedTimezone;
  });

  // When country changes, reset timezone smartly
  const handleCountryChange = (code: string) => {
    setCountry(code);
    const tzs = getTimezonesForCountry(code);
    if (tzs.length === 1) {
      // Only one option — auto-select it, user doesn't need to pick
      setTimezone(tzs[0]);
    } else if (tzs.length > 1) {
      // Keep current tz if still valid, otherwise take the first
      setTimezone((prev) => (tzs.includes(prev) ? prev : tzs[0]));
    } else {
      setTimezone("");
    }
  };

  // Timezones available for the currently selected country
  const availableTimezones = country ? getTimezonesForCountry(country) : [];
  // Disable tz picker when there's nothing to pick (no country) or only one option
  const isTimezoneDisabled = availableTimezones.length <= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service to continue.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await register({
        name,
        email: contact,
        password,
        role,
        country: country || "IN",
        timezone: timezone || detectedTimezone,
      });
      setPendingVerification(result.userId, result.otpSentTo);

      navigate("/verify-otp");

    } catch (error) {
      if (isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Role Selection */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-black uppercase tracking-[.12em] text-slate-600">
          I am registering as a:
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {/* Patient */}
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={cn(
              "group flex items-center justify-center gap-3 rounded-2xl border px-4 py-4 transition-all duration-300 cursor-pointer",
              role === "patient"
                ? "border-primary bg-gradient-to-br from-violet-50 to-white text-primary shadow-md shadow-violet-100"
                : "border-slate-200 bg-slate-50/60 text-slate-500 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white"
            )}
          >
            <User
              className={cn("h-5 w-5", role === "patient" ? "fill-primary/20" : "")}
            />
            <span className="text-sm font-black">Patient</span>
          </button>
          {/* Psychologist */}
          <button
            type="button"
            onClick={() => setRole("psychologist")}
            className={cn(
              "group flex items-center justify-center gap-3 rounded-2xl border px-4 py-4 transition-all duration-300 cursor-pointer",
              role === "psychologist"
                ? "border-primary bg-gradient-to-br from-violet-50 to-white text-primary shadow-md shadow-violet-100"
                : "border-slate-200 bg-slate-50/60 text-slate-500 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white"
            )}
          >
            <Stethoscope
              className={cn("h-5 w-5", role === "psychologist" ? "fill-primary/20" : "")}
            />
            <span className="text-sm font-black">Psychologist</span>
          </button>
        </div>
      </div>

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">
          Full Name
        </Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-violet-400" />
          <Input
            id="fullName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your full legal name"
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-11 transition focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-violet-100"
          />
        </div>
      </div>

      {/* Email / Phone */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact" className="text-xs font-bold text-slate-700">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-violet-400" />
          <Input
            id="contact"
            type="email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            placeholder="email@example.com"
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-11 transition focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-violet-100"
          />
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <Info className="h-3 w-3 shrink-0" />
          A verification code will be sent to this email address.
        </p>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-xs font-bold text-slate-700">
          Password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-violet-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a strong password"
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-11 pr-11 transition focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-violet-100"
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
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Use at least 8 characters with one uppercase letter and one number.
        </p>
      </div>

      {/* Country & Timezone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="country" className="text-xs font-bold text-slate-700">
            Country
          </Label>
          <div className="relative">
            <Globe className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-violet-400" />
            <Select value={country} onValueChange={handleCountryChange}>
              <SelectTrigger
                id="country"
                className="h-12 w-full rounded-xl border-slate-200 bg-slate-50/50 pl-11 pr-3 text-sm focus-visible:ring-4 focus-visible:ring-violet-100"
              >
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="w-[--radix-select-trigger-width] rounded-sm max-h-60"
              >
                {allCountries.map((c) => (
                  <SelectItem className="rounded-sm" key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="timezone" className="text-xs font-bold text-slate-700">
            Timezone
          </Label>
          <div className="relative">
            <Clock className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-violet-400" />
            <Select
              value={timezone}
              onValueChange={setTimezone}
              disabled={isTimezoneDisabled}
            >
              <SelectTrigger
                id="timezone"
                className="h-12 w-full rounded-xl border-slate-200 bg-slate-50/50 pl-11 pr-3 text-sm focus-visible:ring-4 focus-visible:ring-violet-100"
              >
                <SelectValue placeholder={country ? "Select Timezone" : "Select country first"} />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="w-[--radix-select-trigger-width] max-h-60"
              >
                {availableTimezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Terms */}
      <label className="mt-1 flex cursor-pointer items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/45 p-4">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-violet-600"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I agree to the{" "}
          <Link to="/legal/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>,{" "}
          <Link to="/legal/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>, and
          understand the{" "}
          <Link to="/services/first-aid-support" className="text-primary hover:underline font-medium">Emergency Protocol</Link>.
        </span>
      </label>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-violet-600 to-blue-600 text-sm font-black shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/25"
      >
        {isLoading ? "Creating account..." : "Register Account"}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>

      {/* Login link */}
      <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="font-black text-primary hover:underline"
        >
          Log in here
        </button>
      </p>
    </form>
  );
};
