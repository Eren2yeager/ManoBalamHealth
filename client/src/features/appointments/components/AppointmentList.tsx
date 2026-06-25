import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { Calendar, Clock3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCard } from "./AppointmentCard";
import { getMyAppointments } from "../api/appointment.api";
import { useUserStore } from "@/stores/userStore";
import type { AppointmentListItem } from "../types/appointment.types";
import { getSessionAccessState } from "../utils/sessionAccess";

const PAGE_SIZE = 10;

type ListTab = "upcoming" | "past";

const AppointmentListSkeleton = () => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="h-64 rounded-[1.75rem] border border-slate-100 bg-white p-4 sm:h-72 sm:p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-2xl sm:size-16" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24 sm:h-5 sm:w-32" />
            <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <Skeleton className="h-3 w-full sm:h-4" />
          <Skeleton className="h-3 w-3/4 sm:h-4" />
        </div>
        <div className="mt-auto pt-5">
          <Skeleton className="h-9 w-full rounded-xl sm:h-10" />
        </div>
      </div>
    ))}
  </div>
);

const isPastAppointment = (appointment: AppointmentListItem): boolean => {
  const isTerminal = ["completed", "cancelled", "no_show"].includes(appointment.status);
  const { accessEndsAt } = getSessionAccessState(appointment);
  return isTerminal || accessEndsAt < DateTime.now();
};


export const AppointmentList = () => {
  const user = useUserStore((state) => state.user);
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
      // Only show book button for patients, not psychologists
      const isPatient = user?.role !== "psychologist";

      return (
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[2rem] border border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 text-center sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-violet-200/30 blur-2xl" />
          <span className="relative grid size-16 place-items-center rounded-[2rem] bg-violet-100 text-primary sm:size-20">
            {activeTab === "upcoming" ? (
              <Calendar className="size-8 sm:size-10" />
            ) : (
              <Clock3 className="size-8 sm:size-10" />
            )}
          </span>
          <div className="relative">
            <h3 className="text-lg font-black text-slate-900">
              {activeTab === "upcoming"
                ? "No upcoming sessions yet"
                : "No past appointments yet"}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {activeTab === "upcoming"
                ? (isPatient
                    ? "Ready to start your mental wellness journey? Book a session with a verified professional."
                    : "You don't have any upcoming sessions scheduled yet.")
                : "Once you complete your first session, it will appear here."}
            </p>
            {activeTab === "upcoming" && isPatient && (
              <Button
                asChild
                className="mt-6 h-10 w-full rounded-xl bg-gradient-to-r from-primary to-violet-600 px-6 font-bold sm:w-auto"
              >
                <Link to="/book">
                  <Plus className="mr-1.5 size-4" /> Book your first session
                </Link>
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>

        {page < totalPages && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="h-10 w-full rounded-xl px-6 font-semibold sm:w-auto"
            >
              {isLoadingMore ? "Loading more..." : "Load more appointments"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-6 sm:space-y-8">
      {/* <SectionHeader
        title="Your sessions"
        description="View and manage all your appointments"
      /> */}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col space-y-6 sm:space-y-8">
        <div className="flex justify-center">
          <TabsList className="inline-flex h-10 w-full max-w-md gap-1 rounded-[2rem] bg-slate-100 p-1">
            <TabsTrigger
              value="upcoming"
              className="flex-1 rounded-[1.5rem] px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="flex-1 rounded-[1.5rem] px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Past
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="mt-0">
          {renderContent()}
        </TabsContent>
        <TabsContent value="past" className="mt-0">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
