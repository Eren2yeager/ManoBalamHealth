import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminReport } from "../types/admin.types";

interface ReportsChartProps {
  data: AdminReport | null;
  isLoading?: boolean;
}

export function ReportsChart({ data, isLoading = false }: ReportsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-7 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const statusEntries = Object.entries(data.appointmentsByStatus);
  const maxCount = Math.max(...statusEntries.map(([, count]) => count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {statusEntries.length > 0 && (
          <div className="h-48 sm:h-64 flex items-end gap-2 mb-4">
            {statusEntries.map(([status, count]) => (
              <div key={status} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                <div
                  className="w-full bg-primary rounded-t-lg transition-all duration-500"
                  style={{ height: `${(count / maxCount) * 100}%`, minHeight: "4px" }}
                  title={`${status}: ${count}`}
                />
                <span className="text-[10px] sm:text-xs text-muted-foreground capitalize">
                  {status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold">{data.totalAppointments}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Appointments</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold">
              ₹{(data.totalRevenue.amount / 100).toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold">{data.newUsers}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">New Users</p>
          </div>
        </div>

        {data.topSpecializations.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm font-semibold mb-3 text-muted-foreground">Top Specializations</p>
            <div className="space-y-2">
              {data.topSpecializations.map((item) => (
                <div key={item.specialization} className="flex justify-between text-sm">
                  <span className="capitalize">{item.specialization}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
