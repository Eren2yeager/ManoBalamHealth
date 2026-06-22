import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReportsChart } from "../components/ReportsChart";
import { getAdminReports, getAdminAppointments } from "../api/admin.api";
import type { AdminReport, AdminAppointmentItem } from "../types/admin.types";
import { toast } from "sonner";
import { AlertCircle, RefreshCw } from "lucide-react";

const initialEndDate = new Date().toISOString().split("T")[0];
const initialStartDate = new Date(
  new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
).toISOString().split("T")[0];

export function AdminReportsPage() {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const [report, setReport] = useState<AdminReport | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [reportData, appointmentsData] = await Promise.all([
        getAdminReports(startDate, endDate),
        getAdminAppointments({ page: 1, limit: 100 }),
      ]);
      setReport(reportData);
      setAppointments(appointmentsData.items);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load reports";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
            <label className="text-sm text-muted-foreground">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
            <label className="text-sm text-muted-foreground">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <ReportsChart data={report} />

        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
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
      </div>
    </DashboardLayout>
  );
}
