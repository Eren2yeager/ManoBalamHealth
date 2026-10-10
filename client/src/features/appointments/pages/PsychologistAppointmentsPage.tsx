import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AppointmentList } from "../components/AppointmentList";

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function PsychologistAppointmentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        <SectionHeader
          title="My Appointments"
          description="Manage your upcoming and past sessions with clients"
        />
        <AppointmentList />
      </div>
    </DashboardLayout>
  );
}
