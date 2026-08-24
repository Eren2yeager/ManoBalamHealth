import { useCallback, useEffect, useState } from "react";
import { FileClock, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminWorkspaceHeader } from "../components/AdminWorkspaceHeader";
import { getAdminAuditLogs, type AdminAuditLogItem } from "../api/admin.api";

function label(action: string) {
  return action.replaceAll("_", " ");
}

export function AdminAuditLogsPage() {
  const [items, setItems] = useState<AdminAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAdminAuditLogs({ page: 1, limit: 100 });
      setItems(result.items);
    } catch {
      toast.error("Unable to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminWorkspaceHeader
          icon={FileClock}
          eyebrow="Governance"
          title="Audit logs"
          description="Review traceable account-safety decisions. This page should expand as more money and approval actions are audited."
          actions={<Button onClick={() => void load()} className="h-11 rounded-xl bg-white px-5 font-bold text-primary hover:bg-violet-50"><RefreshCw className="mr-2 size-4" />Refresh</Button>}
        />

        <Card className="overflow-hidden border-slate-100 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="grid min-h-72 place-items-center"><LoaderCircle className="size-8 animate-spin text-primary" /></div>
            ) : items.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <ShieldCheck className="mx-auto size-12 text-violet-300" />
                <h3 className="mt-4 text-lg font-black text-slate-950">No audit records yet</h3>
                <p className="mt-2 text-sm text-slate-500">Account activation and suspension actions will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <article key={item.id} className="grid gap-3 px-6 py-5 transition-colors hover:bg-violet-50/30 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-violet-100 text-violet-700 capitalize">{label(item.action)}</Badge>
                        <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{item.reason}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Admin: <span className="font-bold text-slate-700">{item.admin?.name ?? "Unknown"}</span>
                        {item.targetUser ? <> · Target: <span className="font-bold text-slate-700">{item.targetUser.name}</span></> : null}
                      </p>
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
