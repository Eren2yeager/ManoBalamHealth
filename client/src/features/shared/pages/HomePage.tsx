import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { logout } from "@/features/auth/api/auth.api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

export const HomePage = () => {
  const user = useUserStore((s) => s.user);
  const logoutStore = useUserStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      logoutStore();
      navigate("/");
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground mb-4">You are logged in as a {user?.role}.</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link to="/booking">Book a Session</Link>
        </Button>
        <Button asChild>
          <Link to="/psychologists">Find a Therapist</Link>
        </Button>
        <Button asChild>
          <Link to="/appointments">My Appointments</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/profile">View Profile</Link>
        </Button>
        <Button onClick={handleLogout}>Log Out</Button>
      </div>
    </div>
  );
};
