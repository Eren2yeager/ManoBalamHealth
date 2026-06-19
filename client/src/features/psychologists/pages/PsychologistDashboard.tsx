import { useAuth } from "@/hooks/useAuth";
import { usePsychologistPresenceToggle } from "@/features/psychologists/hooks/usePresence";
import { useEmergencyStore } from "@/features/emergency/store/emergencyStore";
import { EmergencyRequestModal } from "@/features/emergency/components/EmergencyRequestModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const PsychologistDashboard = () => {
  const { user } = useAuth();
  const { toggleOnline } = usePsychologistPresenceToggle();
  const [isOnline, setIsOnline] = useState(false);

  // Incoming emergency requests (psychologist side) — wired from useEmergencySocket
  const incomingRequest = useEmergencyStore((s) => s.incomingRequest);

  const handleToggleOnline = (online: boolean) => {
    setIsOnline(online);
    toggleOnline(online);
    toast.success(online ? "You're now online and visible to patients" : "You're now offline");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>

      {/* Online status toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Control whether patients can see and book you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant={isOnline ? "default" : "outline"}
              onClick={() => handleToggleOnline(true)}
            >
              Go Online
            </Button>
            <Button
              variant={!isOnline ? "default" : "outline"}
              onClick={() => handleToggleOnline(false)}
            >
              Go Offline
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
              />
              {isOnline ? "Patients can see you" : "You're not visible to patients"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex flex-col items-center gap-3 text-center">
            <Calendar className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">My Appointments</h3>
            <p className="text-sm text-muted-foreground">View upcoming and past sessions</p>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link to="/psychologist/appointments">View Appointments</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex flex-col items-center gap-3 text-center">
            <Clock className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Availability</h3>
            <p className="text-sm text-muted-foreground">Set your weekly schedule and slots</p>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link to="/psychologist/availability">Manage Availability</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex flex-col items-center gap-3 text-center">
            <Users className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Profile</h3>
            <p className="text-sm text-muted-foreground">Update your profile and credentials</p>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link to="/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Emergency request modal — shown when an incoming emergency arrives via socket */}
      {incomingRequest && <EmergencyRequestModal request={incomingRequest} />}
    </div>
  );
};
