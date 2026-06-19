import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AppointmentList } from "../components/AppointmentList";

export function PsychologistAppointmentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Appointments</h1>
        <AppointmentList />
      </div>
    </DashboardLayout>
  );
}
