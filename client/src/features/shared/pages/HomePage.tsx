import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { logout as logoutApi } from "@/features/auth/api/auth.api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

export const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // clear local state regardless
    }
    logout();
    navigate("/");
    toast.success("Logged out successfully!");
  };

  const patientLinks = (
    <>
      <Button asChild>
        <Link to="/book">Book a Session</Link>
      </Button>
      <Button asChild>
        <Link to="/psychologists">Find a Therapist</Link>
      </Button>
      <Button asChild>
        <Link to="/appointments">My Appointments</Link>
      </Button>
      <Button asChild>
        <Link to="/assessment">Self-Assessment</Link>
      </Button>
      <Button asChild variant="destructive">
        <Link to="/emergency">Emergency</Link>
      </Button>
    </>
  );

  const psychologistLinks = (
    <>
      <Button asChild>
        <Link to="/psychologist/dashboard">Dashboard</Link>
      </Button>
      <Button asChild>
        <Link to="/psychologist/appointments">My Appointments</Link>
      </Button>
      <Button asChild>
        <Link to="/psychologist/availability">My Availability</Link>
      </Button>
    </>
  );

  const adminLinks = (
    <>
      <Button asChild>
        <Link to="/admin/dashboard">Admin Dashboard</Link>
      </Button>
      <Button asChild>
        <Link to="/admin/verifications">Verifications</Link>
      </Button>
      <Button asChild>
        <Link to="/admin/reports">Reports</Link>
      </Button>
      <Button asChild>
        <Link to="/admin/payments">Payments</Link>
      </Button>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground mb-6 capitalize">
        Signed in as {user?.role}
      </p>
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        {user?.role === "patient" && patientLinks}
        {user?.role === "psychologist" && psychologistLinks}
        {user?.role === "admin" && adminLinks}
        <Button asChild variant="outline">
          <Link to="/profile">My Profile</Link>
        </Button>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Log Out
      </Button>
    </div>
  );
};
