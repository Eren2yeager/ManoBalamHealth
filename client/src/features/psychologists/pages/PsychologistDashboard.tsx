import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { usePsychologistPresenceToggle } from "@/hooks/usePresence";
import { toast } from "sonner";

export const PsychologistDashboard = () => {
  const user = useUserStore((state) => state.user);
  const { toggleOnline } = usePsychologistPresenceToggle();
  const [isOnline, setIsOnline] = useState(false);

  const handleToggleOnline = (checked: boolean) => {
    setIsOnline(checked);
    toggleOnline(checked);
    toast.success(checked ? "You're now online!" : "You're now offline");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Psychologist Dashboard</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Online Status</CardTitle>
            <CardDescription>Control your availability for new sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                variant={isOnline ? "default" : "outline"}
                onClick={() => handleToggleOnline(true)}
                className={isOnline ? "bg-success hover:bg-success/90" : ""}
              >
                Go Online
              </Button>
              <Button
                variant={!isOnline ? "default" : "outline"}
                onClick={() => handleToggleOnline(false)}
                className={!isOnline ? "bg-muted hover:bg-muted/90" : ""}
              >
                Go Offline
              </Button>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isOnline ? "bg-success" : "bg-muted"
                  }`}
                ></span>
                <span className="text-sm text-muted-foreground">
                  {isOnline ? "Patients can see you" : "You're not visible"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.name}!</CardTitle>
            <CardDescription>Manage your practice and sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              More features coming soon: availability scheduling, session management, and analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
