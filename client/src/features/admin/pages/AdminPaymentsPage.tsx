import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RefundModal } from "../components/RefundModal";
import { AdminWorkspaceHeader } from "../components/AdminWorkspaceHeader";
import { AdminUserLink } from "../components/AdminUserLink";
import { getAdminAppointments, refundPayment } from "../api/admin.api";
import type { AdminAppointmentItem } from "../types/admin.types";
import { formatInViewerTz } from "@/lib/timezone";
import { toast } from "sonner";
import { CheckCircle2, RefreshCw, Users, Calendar, CircleDollarSign, ReceiptText } from "lucide-react";

const statusTone: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-violet-100 text-violet-700",
  cancelled: "bg-rose-100 text-rose-700",
  refunded: "bg-amber-100 text-amber-700",
  pending_payment: "bg-orange-100 text-orange-700",
};

export function AdminPaymentsPage() {
  const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AdminAppointmentItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const fetchAppointments = async () => {
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-[2rem]" />
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-[2rem]" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminWorkspaceHeader
          icon={ReceiptText}
          eyebrow="Payments & refunds"
          title="Payment operations"
          description="Review completed-session payments and issue a documented refund when the care outcome requires it."
          actions={<Button onClick={fetchAppointments} className="h-11 rounded-xl bg-white px-5 font-bold text-primary hover:bg-violet-50"><RefreshCw className="mr-2 size-4" />Refresh records</Button>}
        />

        {/* Content Section */}
        {appointments.length === 0 ? (
          <Card className="rounded-[2rem] border border-slate-100 bg-white shadow-sm">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
              <h3 className="mt-4 text-lg font-black text-slate-900">
                No payment records
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                There are no completed appointment payments to display yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-all hover:border-violet-100 hover:shadow-xl"
              >
                <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white pb-4 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-violet-700 shadow-sm">
                        <Users className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-black text-slate-950">
                          <span className="flex flex-wrap items-center gap-1"><AdminUserLink {...appointment.patient} compact /><span className="text-slate-400">→</span><AdminUserLink {...appointment.psychologist} compact /></span>
                        </CardTitle>
                      </div>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ${
                        statusTone[appointment.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {appointment.status.replace("_", " ")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 pb-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="size-4" />
                        <span>{formatInViewerTz(appointment.scheduledAt)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setSelectedPaymentId(appointment.id);
                        setShowRefundModal(true);
                      }}
                      className="h-11 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 font-bold shadow-md hover:from-rose-700 hover:to-red-700"
                    >
                      <CircleDollarSign className="mr-2 size-4" />
                      Refund
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <RefundModal
          isOpen={showRefundModal}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedAppointment(null);
            setSelectedPaymentId(null);
          }}
          appointment={selectedAppointment}
          paymentId={selectedPaymentId}
          isProcessing={isProcessing}
          onProcess={async (appointmentId, reason) => {
            try {
              setIsProcessing(true);
              await refundPayment(appointmentId, { reason });
              toast.success("Refund processed successfully.");
              fetchAppointments();
              setShowRefundModal(false);
              setSelectedAppointment(null);
              setSelectedPaymentId(null);
            } catch {
              toast.error("Failed to process refund.");
            } finally {
              setIsProcessing(false);
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
}
