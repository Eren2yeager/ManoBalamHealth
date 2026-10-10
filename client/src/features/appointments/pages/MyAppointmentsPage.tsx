import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentList } from "../components/AppointmentList";

export const MyAppointmentsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-transparent">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild aria-label="Go back" className="rounded-xl">
              <Link to="/home">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">My Appointments</h1>
              <p className="text-sm text-slate-500">
                Manage upcoming sessions and view your history
              </p>
            </div>
          </div>

        </div>
      </header>



      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <AppointmentList />
      </main>
    </div>
  );
};
