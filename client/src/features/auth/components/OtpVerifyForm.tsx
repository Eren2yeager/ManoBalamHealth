import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyOtp } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";

export const OtpVerifyForm = () => {
  const navigate = useNavigate();
  const { pendingUserId, otpSentTo, clear } = useAuthStore();
  const setUser = useUserStore((s) => s.setUser);
  const setAccessToken = useUserStore((s) => s.setAccessToken);
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!pendingUserId || !otpSentTo) {
    navigate("/register");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await verifyOtp({ userId: pendingUserId, otp });
      setAccessToken(result.accessToken);
      setUser(result.user);
      clear();
      navigate("/home");
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Your Account</CardTitle>
        <CardDescription>
          We've sent a verification code to your {otpSentTo}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="123456"
              maxLength={6}
              inputMode="numeric"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify & Continue"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <Button variant="link" className="px-1" onClick={() => toast.info("Resent! Please check your inbox.")}>
            Resend
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
