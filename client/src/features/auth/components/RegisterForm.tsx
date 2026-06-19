import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { register } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import { useGeoCountry } from "@/hooks/useGeoCountry";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  // Detect if contact is email or phone
  const isEmail = contact.includes("@");

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
        ...(isEmail ? { email: contact } : { phone: contact }),
        password,
        role,
        country: country || "US",
        timezone: timezone || detectedTimezone,
      });
      console.log(result)
      setPendingVerification(result.userId, result.otpSentTo);
      navigate("/verify-otp");
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Role Selection */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold text-foreground">
          I am registering as a:
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {/* Patient */}
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all cursor-pointer",
              role === "patient"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted/40"
            )}
          >
            <User
              className={cn("h-5 w-5", role === "patient" ? "fill-primary/20" : "")}
            />
            <span className="text-sm font-semibold">Patient</span>
          </button>
          {/* Psychologist */}
          <button
            type="button"
            onClick={() => setRole("psychologist")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all cursor-pointer",
              role === "psychologist"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted/40"
            )}
          >
            <Stethoscope
              className={cn("h-5 w-5", role === "psychologist" ? "fill-primary/20" : "")}
            />
            <span className="text-sm font-semibold">Psychologist</span>
          </button>
        </div>
      </div>

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="fullName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your full legal name"
            className="pl-10 py-3 h-auto bg-background border-border rounded-lg focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Email / Phone */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact" className="text-xs font-medium text-muted-foreground">
          Email Address or Phone Number
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            placeholder="email@example.com or +1 234 567 8900"
            className="pl-10 py-3 h-auto bg-background border-border rounded-lg focus-visible:ring-primary"
          />
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <Info className="h-3 w-3 shrink-0" />
          An OTP will be sent to verify this contact method.
        </p>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a strong password"
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

      {/* Country & Timezone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="country" className="text-xs font-medium text-muted-foreground">
            Country
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Select value={country} onValueChange={handleCountryChange}>
              <SelectTrigger
                id="country"
                className="w-full h-auto py-3 pl-10 pr-3 rounded-lg border border-input bg-background text-sm data-placeholder:text-muted-foreground focus-visible:ring-primary"
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
          <Label htmlFor="timezone" className="text-xs font-medium text-muted-foreground">
            Timezone
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Select
              value={timezone}
              onValueChange={setTimezone}
              disabled={isTimezoneDisabled}
            >
              <SelectTrigger
                id="timezone"
                className="w-full h-auto py-3 pl-10 pr-3 rounded-lg border border-input bg-background text-sm data-placeholder:text-muted-foreground focus-visible:ring-primary"
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
      <label className="flex items-start gap-3 mt-1 cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 bg-background shrink-0 cursor-pointer"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I agree to the{" "}
          <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>,{" "}
          <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>, and
          understand the{" "}
          <a href="#" className="text-primary hover:underline font-medium">Emergency Protocol</a>.
        </span>
      </label>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 py-3 h-auto rounded-lg font-semibold text-sm shadow-[0px_4px_12px_rgba(99,14,212,0.15)] flex items-center justify-center gap-2"
      >
        {isLoading ? "Creating account..." : "Register Account"}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>

      {/* Login link */}
      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-primary font-semibold hover:underline"
        >
          Log in here
        </button>
      </p>
    </form>
  );
};
