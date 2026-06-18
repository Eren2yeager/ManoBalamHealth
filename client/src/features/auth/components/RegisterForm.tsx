import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { register } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import { getViewerTimezone } from "@/lib/timezone";
import { toast } from "sonner";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const setPendingVerification = useAuthStore((s) => s.setPendingVerification);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [role, setRole] = useState<"patient" | "psychologist">("patient");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await register({
        name,
        ...(contactMethod === "email" ? { email } : { phone }),
        password,
        role,
        country: "US", // TODO: Replace with actual country detection
        timezone: getViewerTimezone(),
      });
      setPendingVerification(result.userId, result.otpSentTo);
      navigate("/verify-otp");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Sign up to start your mental wellness journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          <Tabs defaultValue={contactMethod} onValueChange={(v) => setContactMethod(v as "email" | "phone")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="space-y-2 mt-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </TabsContent>
            <TabsContent value="phone" className="space-y-2 mt-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+1234567890"
              />
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-3">
            <Label>I am a</Label>
            <RadioGroup
              defaultValue={role}
              onValueChange={(v) => setRole(v as "patient" | "psychologist")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="patient" id="patient" />
                <Label htmlFor="patient">Patient</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="psychologist" id="psychologist" />
                <Label htmlFor="psychologist">Psychologist</Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" className="px-1" onClick={() => navigate("/login")}>
            Log in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
