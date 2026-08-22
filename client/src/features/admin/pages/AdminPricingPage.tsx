import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminWorkspaceHeader } from "../components/AdminWorkspaceHeader";
import { AdminUserLink } from "../components/AdminUserLink";
import { getPendingPsychologists, setPsychologistFee, getPsychologistFeeHistory } from "../api/admin.api";
import { toast } from "sonner";
import { LoaderCircle, RefreshCw, IndianRupee, History, Search, CheckCircle2, CircleDollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formatRupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

export function AdminPricingPage() {
  const [psychologists, setPsychologists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPsychologist, setSelectedPsychologist] = useState<any | null>(null);
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feeHistory, setFeeHistory] = useState<any[]>([]);
  
  const [feeForm, setFeeForm] = useState({
    amount: "",
    reason: "",
  });

  const fetchPsychologists = useCallback(async () => {
    try {
      setLoading(true);
      const [reviewQueue, approved] = await Promise.all([
        getPendingPsychologists({ page: 1, limit: 100 }),
        getPendingPsychologists({ page: 1, limit: 100, status: "approved" }),
      ]);
      const psychologistsById = new Map(
        [...reviewQueue.items, ...approved.items].map((psychologist) => [psychologist.id, psychologist]),
      );
      setPsychologists([...psychologistsById.values()]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load psychologists";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPsychologists();
  }, [fetchPsychologists]);

  const filteredPsychologists = psychologists.filter((psych) =>
    psych.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    psych.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSetFee = async (psychologistId: string) => {
    try {
      setSaving(true);
      const amountPaise = Math.round(Number(feeForm.amount) * 100);
      await setPsychologistFee(psychologistId, {
        amount: amountPaise,
        currency: "INR",
        reason: feeForm.reason || undefined,
      });
      toast.success("Fee updated successfully");
      setFeeDialogOpen(false);
      setFeeForm({ amount: "", reason: "" });
      fetchPsychologists();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update fee";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleViewHistory = async (psychologistId: string) => {
    try {
      const { data } = await getPsychologistFeeHistory(psychologistId, { page: 1, limit: 10 });
      setFeeHistory(data);
      setHistoryDialogOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load fee history";
      toast.error(errorMessage);
    }
  };

  const openFeeDialog = (psychologist: any) => {
    setSelectedPsychologist(psychologist);
    setFeeForm({
      amount: psychologist.consultationFee ? String(psychologist.consultationFee.amount / 100) : "",
      reason: "",
    });
    setFeeDialogOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <LoaderCircle className="size-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminWorkspaceHeader
          icon={CircleDollarSign}
          eyebrow="Pricing controls"
          title="Consultation pricing"
          description="Set a controlled base fee, review its audit history, and make approval-ready pricing decisions."
          actions={<Button onClick={fetchPsychologists} className="h-11 rounded-xl bg-white px-5 font-bold text-primary hover:bg-violet-50"><RefreshCw className="mr-2 size-4" />Refresh pricing</Button>}
        />

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredPsychologists.map((psychologist) => (
            <Card key={psychologist.id} className="border-slate-100 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <AdminUserLink id={psychologist.userId} name={psychologist.name} avatarUrl={psychologist.avatarUrl} />
                      <span className="text-xs text-slate-500">{psychologist.email}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${psychologist.onboardingStatus === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{psychologist.onboardingStatus === "approved" ? "Active" : "Fee review"}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="size-4 text-slate-500" />
                        <span className="font-medium">
                          {psychologist.consultationFee
                            ? formatRupees(psychologist.consultationFee.amount)
                            : "Not set"}
                        </span>
                      </div>
                      <div className="text-slate-500">
                        {psychologist.specialization?.slice(0, 2).join(", ")}
                        {psychologist.specialization?.length > 2 && "..."}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewHistory(psychologist.id)}
                    >
                      <History className="mr-2 size-4" />
                      History
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openFeeDialog(psychologist)}
                    >
                      <IndianRupee className="mr-2 size-4" />
                      Set Fee
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPsychologists.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-slate-500">
              No psychologists found matching your search.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Consultation Fee</DialogTitle>
            <DialogDescription>
              Set the consultation fee for {selectedPsychologist?.name}. This will be recorded in the fee history.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Fee amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min="50"
                max="100000"
                value={feeForm.amount}
                onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                placeholder="500"
              />
              <p className="text-xs text-slate-500">Range: ₹50 - ₹1,00,000 per 30-minute session</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={feeForm.reason}
                onChange={(e) => setFeeForm({ ...feeForm, reason: e.target.value })}
                placeholder="Why is this fee being changed?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedPsychologist && handleSetFee(selectedPsychologist.id)} disabled={saving}>
              {saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
              Update Fee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fee Change History</DialogTitle>
            <DialogDescription>Track all fee changes for this psychologist</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {feeHistory.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No fee history available</p>
            ) : (
              feeHistory.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-violet-100 p-2">
                        <IndianRupee className="size-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {formatRupees(entry.previousAmount)} → {formatRupees(entry.newAmount)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Changed by {entry.changedBy} on {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {entry.changeReason && (
                      <p className="text-sm text-slate-600 max-w-xs truncate">{entry.changeReason}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
