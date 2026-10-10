import { useCallback, useEffect, useMemo, useState } from "react";
import { Inbox, LoaderCircle, Mail, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminMetricCard, AdminWorkspaceHeader } from "../components/AdminWorkspaceHeader";
import {
  getAdminContactRequests,
  updateAdminContactRequest,
  type AdminContactRequestItem,
} from "../api/admin.api";

const statusTone: Record<AdminContactRequestItem["status"], string> = {
  new: "bg-violet-100 text-violet-700",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-700",
};

function label(status: string) {
  return status.replaceAll("_", " ");
}

export function AdminContactRequestsPage() {
  const [items, setItems] = useState<AdminContactRequestItem[]>([]);
  const [status, setStatus] = useState<"all" | AdminContactRequestItem["status"]>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAdminContactRequests({
        page: 1,
        limit: 100,
        ...(status !== "all" ? { status } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      });
      setItems(result.items);
    } catch {
      toast.error("Unable to load contact requests.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const summary = useMemo(() => ({
    new: items.filter((item) => item.status === "new").length,
    progress: items.filter((item) => item.status === "in_progress").length,
    resolved: items.filter((item) => item.status === "resolved").length,
  }), [items]);

  const updateStatus = async (item: AdminContactRequestItem, nextStatus: AdminContactRequestItem["status"]) => {
    try {
      setSavingId(item.id);
      await updateAdminContactRequest(item.id, { status: nextStatus });
      toast.success("Contact request status updated.");
      await load();
    } catch {
      toast.error("Unable to update this contact request.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminWorkspaceHeader
          icon={Inbox}
          eyebrow="Support inbox"
          title="Contact requests"
          description="Review public enquiries, move them through a simple support queue, and keep urgent messages visible."
          actions={<Button onClick={() => void load()} className="h-11 rounded-xl bg-white px-5 font-bold text-primary hover:bg-violet-50"><RefreshCw className="mr-2 size-4" />Refresh</Button>}
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <AdminMetricCard icon={Mail} label="New" value={summary.new} note="Waiting for first review" tone="bg-violet-100 text-violet-700" />
          <AdminMetricCard icon={Inbox} label="In progress" value={summary.progress} note="Being handled by the team" tone="bg-amber-100 text-amber-800" />
          <AdminMetricCard icon={RefreshCw} label="Resolved" value={summary.resolved} note="Closed support conversations" tone="bg-emerald-100 text-emerald-700" />
        </section>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 rounded-xl pl-9" placeholder="Search name, email, or subject" />
            </div>
            <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-11 rounded-xl border border-input bg-background px-3 text-sm">
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-100 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="grid min-h-72 place-items-center"><LoaderCircle className="size-8 animate-spin text-primary" /></div>
            ) : items.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-slate-500">No contact requests match these filters.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <article key={item.id} className="grid gap-5 px-6 py-5 transition-colors hover:bg-violet-50/30 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-950">{item.subject}</h3>
                        <Badge className={`capitalize ${statusTone[item.status]}`}>{label(item.status)}</Badge>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-700">{item.name} · {item.email}{item.phone ? ` · ${item.phone}` : ""}</p>
                      <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.message}</p>
                      <p className="mt-3 text-xs text-slate-400">Received {new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {(["new", "in_progress", "resolved"] as const).map((nextStatus) => (
                        <Button
                          key={nextStatus}
                          variant={item.status === nextStatus ? "default" : "outline"}
                          disabled={savingId === item.id || item.status === nextStatus}
                          onClick={() => void updateStatus(item, nextStatus)}
                          className="h-9 rounded-xl text-xs font-bold capitalize"
                        >
                          {savingId === item.id && item.status !== nextStatus ? <LoaderCircle className="mr-1 size-3 animate-spin" /> : null}
                          {label(nextStatus)}
                        </Button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
