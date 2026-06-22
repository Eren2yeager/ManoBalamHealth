import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  getPendingPsychologists,
  verifyPsychologist,
  getAdminReports,
  getAdminAppointments,
  refundPayment,
} from "../api/admin.api";
import { ReportsChart } from "../components/ReportsChart";
import { PsychologistVerificationCard } from "../components/PsychologistVerificationCard";
import { RefundModal } from "../components/RefundModal";
import type {
  PendingPsychologistItem,
  VerifyPsychologistDto,
  AdminReport,
  AdminAppointmentItem,
} from "../types/admin.types";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, FileText, RefreshCw } from "lucide-react";

export function AdminDashboardPage() {
  const [pendingPsychologists, setPendingPsychologists] = useState<PendingPsychologistItem[]>([]);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointmentItem | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();
      const [psychologists, reportData, appointmentsData] = await Promise.all([
        getPendingPsychologists({ page: 1, limit: 50 }),
        getAdminReports(from, to),
        getAdminAppointments({ page: 1, limit: 100 }),
      ]);
      setPendingPsychologists(psychologists.items);
      setReport(reportData);
      setAppointments(appointmentsData.items);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  const handleVerify = async (id: string, payload: VerifyPsychologistDto) => {
    try {
      setIsProcessing(true);
      await verifyPsychologist(id, payload);
      toast.success(
        payload.decision === "approved"
          ? "Psychologist approved!"
          : "Psychologist rejected!"
      );
      fetchData();
    } catch {
      toast.error("Failed to process verification");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessRefund = async (paymentId: string, reason: string) => {
    try {
      setIsProcessing(true);
      await refundPayment(paymentId, { reason });
      toast.success("Refund issued successfully!");
      fetchData();
      setShowRefundModal(false);
      setSelectedAppointment(null);
      setSelectedPaymentId(null);
    } catch {
      toast.error("Failed to process refund");
    } finally {
      setIsProcessing(false);
    }
  };

  const openRefundModal = (appointment: AdminAppointmentItem) => {
    // The payment ID would typically come from the appointment data.
    // Using the appointment ID as the payment reference until payment details are available.
    setSelectedAppointment(appointment);
    setSelectedPaymentId(appointment.id);
    setShowRefundModal(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <ReportsChart data={null} isLoading />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const cancelledAppointments = appointments.filter(
    (a) => a.status === "cancelled"
  );

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 flex flex-wrap gap-2 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verifications">
            Verifications
            {pendingPsychologists.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {pendingPsychologists.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="refunds">
            Refunds
            {cancelledAppointments.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {cancelledAppointments.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Pending Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pendingPsychologists.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Cancelled Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{cancelledAppointments.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Appointments (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{appointments.length}</p>
              </CardContent>
            </Card>
          </div>

          <ReportsChart data={report} />
        </TabsContent>

        <TabsContent value="verifications">
          {pendingPsychologists.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending verifications</h3>
                  <p className="text-muted-foreground">
                    Great job keeping up with new signups!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingPsychologists.map((psych) => (
                <PsychologistVerificationCard
                  key={psych.id}
                  psychologist={psych}
                  onVerify={handleVerify}
                  isProcessing={isProcessing}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Scheduled</th>
                      <th className="text-left py-3 px-2">Patient</th>
                      <th className="text-left py-3 px-2">Psychologist</th>
                      <th className="text-left py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No appointments found for this period
                        </td>
                      </tr>
                    ) : (
                      appointments.map((appt) => (
                        <tr
                          key={appt.id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-2">
                            {new Date(appt.scheduledAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-2">{appt.patient.name}</td>
                          <td className="py-3 px-2">{appt.psychologist.name}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-1 rounded text-xs capitalize ${
                                appt.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : appt.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {appt.status.replace(/_/g, " ")}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds">
          {cancelledAppointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No cancelled appointments</h3>
                  <p className="text-muted-foreground">Looks like everyone's happy!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cancelledAppointments.map((appt) => (
                <Card key={appt.id} className="mb-4">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <p className="font-semibold">{appt.patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Psychologist: {appt.psychologist.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Scheduled:{" "}
                          {new Date(appt.scheduledAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => openRefundModal(appt)}>
                          Issue Refund
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <RefundModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setSelectedAppointment(null);
          setSelectedPaymentId(null);
        }}
        appointment={selectedAppointment}
        paymentId={selectedPaymentId}
        onProcess={handleProcessRefund}
        isProcessing={isProcessing}
      />
    </DashboardLayout>
  );
}
