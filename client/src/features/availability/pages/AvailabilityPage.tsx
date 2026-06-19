import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AvailabilityRuleForm } from "../components/AvailabilityRuleForm";
import { toast } from "sonner";

export function AvailabilityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Availability</h1>
          <p className="mt-1 text-muted-foreground">
            Set your recurring weekly schedule. Patients will only see slots that
            fall within these rules.
          </p>
        </div>
        <AvailabilityRuleForm onSuccess={() => toast.success("Availability saved.")} />
      </div>
    </DashboardLayout>
  );
}
