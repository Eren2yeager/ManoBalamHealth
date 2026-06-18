import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/types/global.types";

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-success/15 text-success border-success/30",
  },
  pending_payment: {
    label: "Pending payment",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  in_progress: {
    label: "In progress",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  completed: {
    label: "Completed",
    className: "bg-success/15 text-success border-success/30",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
  no_show: {
    label: "No show",
    className: "bg-muted text-muted-foreground border-border",
  },
};

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export const AppointmentStatusBadge = ({ status, className }: AppointmentStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

export const canCancelAppointment = (status: AppointmentStatus): boolean =>
  status === "pending_payment" || status === "confirmed";
