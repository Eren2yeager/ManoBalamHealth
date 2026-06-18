import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCard } from "./AppointmentCard";
import { getMyAppointments } from "../api/appointment.api";
import type { AppointmentListItem } from "../types/appointment.types";

const PAGE_SIZE = 10;

type ListTab = "upcoming" | "past";

const AppointmentListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-xl border p-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

const isPastAppointment = (appointment: AppointmentListItem): boolean => {
  const scheduledAt = DateTime.fromISO(appointment.scheduledAt, { zone: "utc" });
  const isTerminal = ["completed", "cancelled", "no_show"].includes(appointment.status);
  return isTerminal || scheduledAt < DateTime.utc();
};

export const AppointmentList = () => {
  const [activeTab, setActiveTab] = useState<ListTab>("upcoming");
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchAppointments = useCallback(
    async (tab: ListTab, pageNum: number, append: boolean) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const { items, meta } = await getMyAppointments({
          page: pageNum,
          limit: PAGE_SIZE,
          upcoming: tab === "upcoming" ? true : undefined,
        });

        const filtered =
          tab === "past" ? items.filter(isPastAppointment) : items;

        setAppointments((prev) => (append ? [...prev, ...filtered] : filtered));
        setTotalPages(meta.totalPages);
      } catch (error) {
        toast.error("Failed to load appointments");
        console.error(error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    fetchAppointments(activeTab, 1, false);
  }, [activeTab, fetchAppointments]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAppointments(activeTab, nextPage, true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as ListTab);
  };

  const renderContent = () => {
    if (isLoading) {
      return <AppointmentListSkeleton />;
    }

    if (appointments.length === 0) {
      return (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <p className="text-muted-foreground">
            {activeTab === "upcoming"
              ? "No upcoming appointments. Book a session to get started."
              : "No past appointments yet."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}

        {page < totalPages && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="sticky top-0 z-10 w-full">
        <TabsTrigger value="upcoming" className="flex-1">
          Upcoming
        </TabsTrigger>
        <TabsTrigger value="past" className="flex-1">
          Past
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">{renderContent()}</TabsContent>
      <TabsContent value="past">{renderContent()}</TabsContent>
    </Tabs>
  );
};
