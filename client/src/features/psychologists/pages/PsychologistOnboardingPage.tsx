import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Hourglass,
  LoaderCircle,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentViewerDialog } from "@/components/shared/DocumentViewerDialog";
import {
  deleteCredential,
  getMyPsychologistOnboarding,
  submitPsychologistForReview,
  updateMyPsychologistProfile,
  uploadCredentials,
} from "../api/psychologist.api";
import type {
  PsychologistCredential,
  PsychologistOnboarding,
} from "../types/psychologist.types";
import {
  SPECIALIZATIONS,
  LANGUAGES,
  SESSION_MODES,
  SESSION_DURATIONS,
  computeSessionFee,
} from "../constants/psychologist.constants";
import { COUNTRIES } from "../constants/countries.constants";
import { MultiSelectPicker } from "../components/MultiSelectPicker";

const credentialLabels: Record<PsychologistCredential["type"], string> = {
  license: "Professional license",
  degree: "Degree certificate",
  id_proof: "Government ID proof",
};

const modeLabels: Record<(typeof SESSION_MODES)[number], string> = {
  chat: "Chat",
  audio: "Voice",
  video: "Video",
};

const specializationOptions = SPECIALIZATIONS.map(({ value, label }) => ({ value, label }));
const languageOptions = LANGUAGES.map((language) => ({ value: language, label: language }));
const countryOptions = COUNTRIES.map(({ code, name }) => ({ value: code, label: name }));

/** Drop legacy free-text values that predate the fixed option lists — the server rejects them. */
const onlyAllowed = (values: string[] | undefined, options: { value: string }[]) => {
  const allowed = new Set(options.map((option) => option.value));
  return (values ?? []).filter((value) => allowed.has(value));
};

/** Surface the server's validation detail (field + message) instead of a generic toast. */
function describeApiError(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string; details?: Array<{ path?: Array<string | number>; message?: string }> } } })?.response;
  const issue = response?.data?.details?.[0];
  if (issue?.message) {
    const field = issue.path?.join(".") ?? "";
    return field ? `${field}: ${issue.message}` : issue.message;
  }
  return response?.data?.message ?? fallback;
}

const formatRupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

export function PsychologistOnboardingPage() {
  const [profile, setProfile] = useState<PsychologistOnboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Partial<Record<PsychologistCredential["type"], File>>>({});
  const emptyForm = {
    specialization: [] as string[],
    languages: [] as string[],
    experienceYears: "0",
    feeRupees: "",
    bio: "",
    licensedCountries: [] as string[],
    isAcceptingEmergency: false,
  };
  const [form, setForm] = useState(emptyForm);
  // Snapshot of the form as loaded from the server — used to disable saving
  // when nothing has actually changed.
  const [baseline, setBaseline] = useState(emptyForm);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<{ url: string; title: string } | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getMyPsychologistOnboarding();
      setProfile(data);
      // Pending changes (if any) are what the psychologist last submitted —
      // pre-fill from them so re-editing continues where they left off.
      const pending = data.pendingChanges;
      const feePaise = pending?.consultationFee?.amount ?? data.consultationFee.amount;
      const nextForm = {
        specialization: onlyAllowed(pending?.specialization ?? data.specialization, specializationOptions),
        languages: onlyAllowed(pending?.languages ?? data.languages, languageOptions),
        experienceYears: String(pending?.experienceYears ?? data.experienceYears),
        feeRupees: feePaise ? String(feePaise / 100) : "",
        bio: pending?.bio ?? data.bio,
        licensedCountries: onlyAllowed(pending?.licensedCountries ?? data.licensedCountries, countryOptions),
        isAcceptingEmergency: data.isAcceptingEmergency ?? false,
      };
      setForm(nextForm);
      setBaseline(nextForm);
    } catch {
      toast.error("Unable to load your professional onboarding profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadProfile]);

  const isLocked = profile?.onboardingStatus === "under_review";
  const isApproved = profile?.onboardingStatus === "approved";
  const hasPendingChanges = profile?.changeReviewStatus === "pending";
  const missingFields = profile?.missingFields ?? [];
  const canSubmit = profile && !isLocked && !isApproved && missingFields.length === 0;
  const canDeleteCredentials = !isLocked && !isApproved;

  const feePaise = Math.round(Number(form.feeRupees || 0) * 100);

  const hasStagedFiles = Object.values(files).some(Boolean);
  // Anything different from what the server last gave us (or a new file staged)?
  const isDirty =
    hasStagedFiles ||
    JSON.stringify({ ...form, bio: form.bio.trim() }) !==
      JSON.stringify({ ...baseline, bio: baseline.bio.trim() });

  const priceMatrix = useMemo(() => {
    if (!feePaise) return null;
    return SESSION_MODES.map((mode) => ({
      mode,
      prices: SESSION_DURATIONS.map((duration) => ({
        duration,
        amount: computeSessionFee(feePaise, mode, duration),
      })),
    }));
  }, [feePaise]);

  const credentialsByType = useMemo(() => {
    const groups: Record<string, PsychologistCredential[]> = {};
    profile?.credentials.forEach((credential) => {
      (groups[credential.type] ??= []).push(credential);
    });
    return groups;
  }, [profile]);

  const saveProgress = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      // All fields are optional server-side — omit anything still empty so a
      // partial save doesn't fail validation (empty arrays / zero fee are rejected).
      const bio = form.bio.trim();
      await updateMyPsychologistProfile({
        ...(form.specialization.length ? { specialization: form.specialization } : {}),
        ...(form.languages.length ? { languages: form.languages } : {}),
        experienceYears: Number(form.experienceYears) || 0,
        ...(feePaise > 0 ? { consultationFee: { amount: feePaise, currency: "INR" } } : {}),
        ...(bio ? { bio } : {}),
        ...(form.licensedCountries.length ? { licensedCountries: form.licensedCountries } : {}),
        isAcceptingEmergency: form.isAcceptingEmergency,
      });

      for (const type of ["license", "degree", "id_proof"] as const) {
        const file = files[type];
        if (file) await uploadCredentials([file], type);
      }

      setFiles({});
      await loadProfile();
      toast.success(
        isApproved
          ? "Changes submitted for review. Your live profile stays unchanged until approval."
          : "Professional onboarding progress saved.",
      );
    } catch (error) {
      toast.error(describeApiError(error, "Unable to save your professional profile."));
    } finally {
      setSaving(false);
    }
  };

  const removeCredential = async (credential: PsychologistCredential) => {
    try {
      await deleteCredential(credential.id);
      await loadProfile();
      toast.success("Credential removed.");
    } catch {
      toast.error("Unable to remove this credential.");
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      await submitPsychologistForReview();
      await loadProfile();
      toast.success("Your application has been submitted for admin review.");
    } catch (error) {
      toast.error(describeApiError(error, "Complete all required details and documents before submitting."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-[65vh] place-items-center"><LoaderCircle className="size-8 animate-spin text-primary" /></div>;
  }

  if (!profile) {
    return <div className="mx-auto max-w-xl p-8 text-center text-slate-600">Professional onboarding could not be loaded.</div>;
  }

  return (
    <main className="min-h-screen bg-[#faf9ff] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-gradient-to-r from-[#17162e] to-violet-900 p-7 text-white shadow-2xl md:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-violet-300">Professional onboarding</p>
              <h1 className="mt-3 text-3xl font-black">Complete your psychologist profile</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-violet-100/75">Your professional details and credentials must be reviewed before you can publish availability, appear online, or receive appointments.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold capitalize">
              {isApproved ? <CheckCircle2 className="size-4 text-emerald-300" /> : <ShieldCheck className="size-4 text-violet-300" />}
              {profile.onboardingStatus.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        {profile.rejectionReason && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div><p className="font-black">Changes requested by the reviewer</p><p className="mt-1 text-sm leading-6">{profile.rejectionReason}</p></div>
          </div>
        )}

        {isApproved && hasPendingChanges && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <Hourglass className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-black">Your profile changes are awaiting review</p>
              <p className="mt-1 text-sm leading-6">Patients still see your previously approved profile. Your updates will go live once an admin approves them. You can keep editing — new saves replace the pending changes.</p>
            </div>
          </div>
        )}

        {isApproved && profile.changeReviewStatus === "rejected" && profile.changeRejectionReason && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div><p className="font-black">Your recent profile changes were not approved</p><p className="mt-1 text-sm leading-6">{profile.changeRejectionReason} Your previously approved profile remains live.</p></div>
          </div>
        )}

        <form onSubmit={saveProgress} className="mt-7 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="rounded-3xl border-violet-100 shadow-sm">
            <CardHeader><CardTitle>Professional details</CardTitle></CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2 text-sm font-bold">
                Specializations
                <MultiSelectPicker options={specializationOptions} selected={form.specialization} onChange={(specialization) => setForm({ ...form, specialization })} disabled={isLocked} />
              </div>
              <div className="grid gap-2 text-sm font-bold">
                Languages
                <MultiSelectPicker options={languageOptions} selected={form.languages} onChange={(languages) => setForm({ ...form, languages })} disabled={isLocked} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">Years of experience<input disabled={isLocked} required min="0" type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} className="h-12 rounded-xl border px-4 font-normal outline-none focus:border-primary focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100" /></label>
                <label className="grid gap-2 text-sm font-bold">Base fee (₹, per 30-min video session)<input disabled={isLocked} required min="50" type="number" value={form.feeRupees} onChange={(e) => setForm({ ...form, feeRupees: e.target.value })} className="h-12 rounded-xl border px-4 font-normal outline-none focus:border-primary focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100" /></label>
              </div>
       
              {priceMatrix && (
                <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                  <p className="text-sm font-black text-slate-800">Session price preview</p>
                  <p className="mt-1 text-xs text-slate-500">What patients will pay per session, derived from your base fee.</p>
                  <table className="mt-3 w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        <th className="py-1">Mode</th>
                        {SESSION_DURATIONS.map((duration) => <th key={duration} className="py-1">{duration} min</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {priceMatrix.map(({ mode, prices }) => (
                        <tr key={mode} className="border-t border-violet-100">
                          <td className="py-2 font-bold text-slate-700">{modeLabels[mode]}</td>
                          {prices.map(({ duration, amount }) => (
                            <td key={duration} className="py-2 text-slate-600">{formatRupees(amount)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="grid gap-2 text-sm font-bold">
                Licensed countries
                <MultiSelectPicker options={countryOptions} selected={form.licensedCountries} onChange={(licensedCountries) => setForm({ ...form, licensedCountries })} disabled={isLocked} searchable searchPlaceholder="Search countries…" />
              </div>
              <label className="grid gap-2 text-sm font-bold">Professional biography<textarea disabled={isLocked} required minLength={50} rows={6} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Describe your clinical approach, qualifications, and areas of support." className="resize-none rounded-xl border p-4 font-normal outline-none focus:border-primary focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100" /><span className="text-xs font-normal text-slate-500">Minimum 50 characters.</span></label>
              <label className="flex items-start gap-3 text-sm text-slate-600"><input disabled={isLocked} type="checkbox" checked={form.isAcceptingEmergency} onChange={(e) => setForm({ ...form, isAcceptingEmergency: e.target.checked })} className="mt-1 size-4 accent-violet-600" /><span>I am qualified and willing to receive urgent support requests after approval.</span></label>
            </CardContent>
          </Card>

          <div className="grid content-start gap-6">
            <Card className="rounded-3xl border-violet-100 shadow-sm">
              <CardHeader><CardTitle>Required credentials</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                {(["license", "degree", "id_proof"] as const).map((type) => (
                  <div key={type} className="block rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-4">
                    <span className="flex items-center gap-2 text-sm font-black text-slate-800"><FileCheck2 className="size-4 text-primary" />{credentialLabels[type]}</span>
                    {(credentialsByType[type] ?? []).map((credential) => (
                      <div key={credential.id} className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setViewerDoc({ url: credential.docUrl, title: credentialLabels[credential.type] })}
                          className="flex min-w-0 items-center gap-2 text-xs font-semibold text-primary hover:underline"
                        >
                          <ExternalLink className="size-3.5 shrink-0" />
                          <span className="truncate">View document</span>
                        </button>
                        <span className="flex items-center gap-2">
                          {credential.uploadedAt && <span className="text-[11px] text-slate-400">{new Date(credential.uploadedAt).toLocaleDateString()}</span>}
                          {credential.verified ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Verified</span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">Pending</span>
                          )}
                          {canDeleteCredentials && !credential.verified && (
                            <button type="button" onClick={() => void removeCredential(credential)} aria-label="Delete credential" className="rounded-lg p-1 text-rose-500 hover:bg-rose-50">
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </span>
                      </div>
                    ))}
                    {!isLocked && <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFiles((current) => ({ ...current, [type]: e.target.files?.[0] }))} className="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-bold file:text-primary" />}
                    {files[type] && <p className="mt-2 truncate text-xs font-semibold text-slate-600">{files[type]?.name}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>

            {missingFields.length > 0 && !isLocked && (
              <Card className="rounded-3xl border-amber-200 bg-amber-50">
                <CardContent className="pt-6"><p className="font-black text-amber-900">Still required</p><ul className="mt-3 grid gap-2 text-sm text-amber-800">{missingFields.map((field) => <li key={field}>• {field.replaceAll(/([A-Z])/g, " $1").replaceAll("_", " ")}</li>)}</ul></CardContent>
              </Card>
            )}

            {!isLocked && <Button type="submit" disabled={saving || !isDirty} className="h-12 rounded-xl font-bold">{saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}{isApproved ? "Submit changes for review" : "Save progress"}</Button>}
            {!isLocked && !isDirty && <p className="text-center text-xs text-slate-400">No unsaved changes.</p>}
            {!isApproved && <Button type="button" onClick={() => setConfirmSubmitOpen(true)} disabled={!canSubmit || saving} className="h-12 rounded-xl bg-emerald-600 font-bold hover:bg-emerald-700"><Send className="mr-2 size-4" />Submit for review</Button>}
          </div>
        </form>
      </div>

      <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit for review?</DialogTitle>
            <DialogDescription>
              Your profile and credentials will be sent to the ManoBalamHealthCare team for
              verification. While under review you won't be able to edit your profile.
              {isDirty && (
                <span className="mt-2 block font-semibold text-amber-600">
                  You have unsaved changes — save your progress first, or they won't be included.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSubmitOpen(false)} className="rounded-xl font-bold">
              Keep editing
            </Button>
            <Button
              onClick={() => {
                setConfirmSubmitOpen(false);
                void submit();
              }}
              disabled={saving}
              className="rounded-xl bg-emerald-600 font-bold hover:bg-emerald-700"
            >
              <Send className="mr-2 size-4" />
              Confirm & submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DocumentViewerDialog
        open={viewerDoc !== null}
        onOpenChange={(open) => !open && setViewerDoc(null)}
        url={viewerDoc?.url ?? null}
        title={viewerDoc?.title}
      />
    </main>
  );
}
