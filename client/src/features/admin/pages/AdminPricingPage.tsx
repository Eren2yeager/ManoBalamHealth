import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminWorkspaceHeader } from "../components/AdminWorkspaceHeader";
import { AdminUserLink } from "../components/AdminUserLink";
import { bulkSetPsychologistFee, getAdminBookingSettings, getPendingPsychologists, setPsychologistFee, getPsychologistFeeHistory, setPsychologistPriority, updateAdminBookingSettings } from "../api/admin.api";
import type { PendingPsychologistItem } from "../types/admin.types";
import { toast } from "sonner";
import { LoaderCircle, RefreshCw, IndianRupee, History, Search, CheckCircle2, CircleDollarSign, SlidersHorizontal, UsersRound, CalendarClock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formatRupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

interface FeeHistoryItem {
  id: string;
  previousAmount: number;
  newAmount: number;
  changedBy: string;
  changeReason?: string;
  createdAt: string;
}

export function AdminPricingPage() {
  const [psychologists, setPsychologists] = useState<PendingPsychologistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPsychologist, setSelectedPsychologist] = useState<PendingPsychologistItem | null>(null);
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [bulkFeeDialogOpen, setBulkFeeDialogOpen] = useState(false);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [showScheduleSelection, setShowScheduleSelection] = useState(true);
  const [feeHistory, setFeeHistory] = useState<FeeHistoryItem[]>([]);
  
  const [feeForm, setFeeForm] = useState({
    amount: "",
    reason: "",
  });
  const [bulkFeeForm, setBulkFeeForm] = useState({
    amount: "",
    reason: "",
  });
  const [priorityForm, setPriorityForm] = useState({
    bookingPriority: "0",
  });

  const fetchPsychologists = useCallback(async () => {
    try {
      setLoading(true);
      const [reviewQueue, approved, bookingSettings] = await Promise.all([
        getPendingPsychologists({ page: 1, limit: 100 }),
        getPendingPsychologists({ page: 1, limit: 100, status: "approved" }),
        getAdminBookingSettings(),
      ]);
      const psychologistsById = new Map(
        [...reviewQueue.items, ...approved.items].map((psychologist) => [psychologist.id, psychologist]),
      );
      setPsychologists([...psychologistsById.values()]);
      setShowScheduleSelection(bookingSettings.showScheduleSelection);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load psychologists";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPsychologists();
    }, 0);
    return () => window.clearTimeout(timer);
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

  const handleBulkSetFee = async () => {
    try {
      setSaving(true);
      const amountPaise = Math.round(Number(bulkFeeForm.amount) * 100);
      const result = await bulkSetPsychologistFee({
        psychologistIds: filteredPsychologists.map((psychologist) => psychologist.id),
        amount: amountPaise,
        currency: "INR",
        reason: bulkFeeForm.reason || undefined,
      });
      toast.success(`Updated ${result.updatedCount} psychologist fees. ${result.skippedCount} already had this fee.`);
      setBulkFeeDialogOpen(false);
      setBulkFeeForm({ amount: "", reason: "" });
      fetchPsychologists();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update fees";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSetPriority = async (psychologistId: string) => {
    try {
      setSaving(true);
      await setPsychologistPriority(psychologistId, {
        bookingPriority: Number(priorityForm.bookingPriority),
      });
      toast.success("Booking priority updated");
      setPriorityDialogOpen(false);
      setPriorityForm({ bookingPriority: "0" });
      fetchPsychologists();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update priority";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleToggle = async () => {
    const nextValue = !showScheduleSelection;
    try {
      setSettingsSaving(true);
      setShowScheduleSelection(nextValue);
      await updateAdminBookingSettings({ showScheduleSelection: nextValue });
      toast.success(
        nextValue
          ? "Patients can now choose a preferred schedule window."
          : "Schedule selection is hidden. Patients will receive priority-based assigned timing.",
      );
    } catch (err) {
      setShowScheduleSelection(!nextValue);
      const errorMessage = err instanceof Error ? err.message : "Failed to update booking settings";
      toast.error(errorMessage);
    } finally {
      setSettingsSaving(false);
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

  const openFeeDialog = (psychologist: PendingPsychologistItem) => {
    setSelectedPsychologist(psychologist);
    setFeeForm({
      amount: psychologist.consultationFee ? String(psychologist.consultationFee.amount / 100) : "",
      reason: "",
    });
    setFeeDialogOpen(true);
  };

  const openPriorityDialog = (psychologist: PendingPsychologistItem) => {
    setSelectedPsychologist(psychologist);
    setPriorityForm({
      bookingPriority: String(psychologist.bookingPriority ?? 0),
    });
    setPriorityDialogOpen(true);
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
          description="Set controlled base fees and automatic-booking priority. Higher priority psychologists are matched first when suitable slots are available."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setBulkFeeDialogOpen(true)}
                className="h-11 rounded-xl bg-white px-5 font-bold text-primary hover:bg-violet-50"
                disabled={filteredPsychologists.length === 0}
              >
                <UsersRound className="mr-2 size-4" />
                Set fee for all
              </Button>
              <Button onClick={fetchPsychologists} className="h-11 rounded-xl bg-white px-5 font-bold text-primary hover:bg-violet-50"><RefreshCw className="mr-2 size-4" />Refresh pricing</Button>
            </div>
          }
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

        <Card className="overflow-hidden border-violet-100 bg-gradient-to-br from-white to-violet-50/60 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                <CalendarClock className="size-5" />
              </span>
              <div>
                <h2 className="font-black text-slate-950">Patient schedule selection</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  {showScheduleSelection
                    ? "ON: patients can choose a preferred time window. Matching still respects psychologist priority and availability."
                    : "OFF: patients do not choose timing. The app assigns the next suitable session from priority psychologists' published availability."}
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleScheduleToggle}
              disabled={settingsSaving}
              className={`h-11 min-w-36 rounded-xl font-black ${
                showScheduleSelection
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-slate-800 hover:bg-slate-900"
              }`}
            >
              {settingsSaving && <LoaderCircle className="mr-2 size-4 animate-spin" />}
              {showScheduleSelection ? "Schedule ON" : "Schedule OFF"}
            </Button>
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
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-4 text-violet-500" />
                        <span className="font-medium text-violet-700">
                          Priority {psychologist.bookingPriority ?? 0}
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
                      variant="outline"
                      size="sm"
                      onClick={() => openPriorityDialog(psychologist)}
                    >
                      <SlidersHorizontal className="mr-2 size-4" />
                      Priority
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
              <p className="text-xs text-slate-500">Range: ₹50 - ₹1,00,000 per booked session</p>
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

      <Dialog open={bulkFeeDialogOpen} onOpenChange={setBulkFeeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Fee for All Listed Psychologists</DialogTitle>
            <DialogDescription>
              This will update the consultation fee for {filteredPsychologists.length} psychologist{filteredPsychologists.length === 1 ? "" : "s"} currently shown on this page.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              This action records fee history for every psychologist whose fee changes. Use search first if you want to apply the fee to a smaller visible group.
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulkAmount">Fee amount (₹)</Label>
              <Input
                id="bulkAmount"
                type="number"
                min="50"
                max="100000"
                value={bulkFeeForm.amount}
                onChange={(e) => setBulkFeeForm({ ...bulkFeeForm, amount: e.target.value })}
                placeholder="500"
              />
              <p className="text-xs text-slate-500">Range: ₹50 - ₹1,00,000 per booked session</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulkReason">Reason (optional)</Label>
              <Textarea
                id="bulkReason"
                value={bulkFeeForm.reason}
                onChange={(e) => setBulkFeeForm({ ...bulkFeeForm, reason: e.target.value })}
                placeholder="Example: Standard launch pricing for all active professionals"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkFeeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkSetFee} disabled={saving || filteredPsychologists.length === 0}>
              {saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
              Update All Listed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Booking Priority</DialogTitle>
            <DialogDescription>
              Higher priority psychologists are selected first during automatic booking when they have a suitable available slot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm leading-6 text-violet-900">
              <b>{selectedPsychologist?.name}</b> currently has priority{" "}
              <b>{selectedPsychologist?.bookingPriority ?? 0}</b>. Use 0 for normal priority; use a higher number for earlier assignment.
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bookingPriority">Booking priority</Label>
              <Input
                id="bookingPriority"
                type="number"
                min="0"
                max="1000"
                value={priorityForm.bookingPriority}
                onChange={(e) => setPriorityForm({ bookingPriority: e.target.value })}
                placeholder="0"
              />
              <p className="text-xs text-slate-500">Range: 0 - 1000. Higher number means higher automatic-booking priority.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriorityDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedPsychologist && handleSetPriority(selectedPsychologist.id)} disabled={saving}>
              {saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
              Update Priority
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
