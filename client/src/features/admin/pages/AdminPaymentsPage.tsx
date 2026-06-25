import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefundModal } from "../components/RefundModal";
import { getAdminAppointments, refundPayment } from "../api/admin.api";
import type { AdminAppointmentItem } from "../types/admin.types";
import { formatInViewerTz } from "@/lib/timezone";
import { toast } from "sonner";

export function AdminPaymentsPage() {
  const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AdminAppointmentItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const { items } = await getAdminAppointments({ status: "completed", limit: 50 });
        setAppointments(items);
      } catch {
        toast.error("Failed to load payment records.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleProcessRefund = async (paymentId: string, reason: string) => {
    try {
      setIsProcessing(true);
      await refundPayment(paymentId, { reason });
      toast.success("Refund processed successfully.");
      setSelectedAppointment(null);
      // Refresh the list
      const { items } = await getAdminAppointments({ status: "completed", limit: 50 });
      setAppointments(items);
    } catch {
      toast.error("Failed to process refund.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review completed appointment payments and process refunds.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <p className="text-muted-foreground">No payment records found.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Card key={appt.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {appt.patient.name} → {appt.psychologist.name}
                  </CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {appt.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatInViewerTz(appt.scheduledAt)}
                </span>
                <button
                  className="text-sm text-primary underline hover:text-primary/80"
                  onClick={() => setSelectedAppointment(appt)}
                >
                  Refund
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <RefundModal
          isOpen
          appointment={selectedAppointment}
          paymentId={selectedAppointment.id}
          isProcessing={isProcessing}
          onClose={() => setSelectedAppointment(null)}
          onProcess={async (appointmentId, reason) => {
            try {
              setIsProcessing(true);
              await refundPayment(appointmentId, { reason });
              toast.success("Refund processed successfully.");
              setAppointments((current) =>
                current.filter((appointment) => appointment.id !== appointmentId),
              );
              setSelectedAppointment(null);
            } catch {
              toast.error("Failed to process refund.");
            } finally {
              setIsProcessing(false);
            }
          }}
        />
      )}
    </div>
  );
}
