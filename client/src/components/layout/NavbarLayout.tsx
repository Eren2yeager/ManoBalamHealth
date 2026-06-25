import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function NavbarLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Outlet />
    </div>
  );
}
