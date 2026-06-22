import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  LoaderCircle,
  Send,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getMyPsychologistOnboarding,
  submitPsychologistForReview,
  updateMyPsychologistProfile,
  uploadCredentials,
} from "../api/psychologist.api";
import type {
  PsychologistCredential,
  PsychologistOnboarding,
} from "../types/psychologist.types";

const credentialLabels: Record<PsychologistCredential["type"], string> = {
  license: "Professional license",
  degree: "Degree certificate",
  id_proof: "Government ID proof",
};

export function PsychologistOnboardingPage() {
  const [profile, setProfile] = useState<PsychologistOnboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Partial<Record<PsychologistCredential["type"], File>>>({});
  const [form, setForm] = useState({
    specialization: "",
    languages: "",
    experienceYears: "0",
    fee: "",
    bio: "",
    licensedCountries: "",
    isAcceptingEmergency: false,
  });

  const loadProfile = useCallback(async () => {
    try {
      const data = await getMyPsychologistOnboarding();
      setProfile(data);
      setForm({
        specialization: data.specialization.join(", "),
        languages: data.languages.join(", "),
        experienceYears: String(data.experienceYears),
        fee: data.consultationFee.amount ? String(data.consultationFee.amount) : "",
        bio: data.bio,
        licensedCountries: data.licensedCountries.join(", "),
        isAcceptingEmergency: false,
      });
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
  const missingFields = profile?.missingFields ?? [];
  const canSubmit = profile && !isLocked && !isApproved && missingFields.length === 0;

  const credentialCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    profile?.credentials.forEach((credential) => {
      counts[credential.type] = (counts[credential.type] ?? 0) + 1;
    });
    return counts;
  }, [profile]);

  const splitValues = (value: string) =>
    value.split(",").map((item) => item.trim()).filter(Boolean);

  const saveProgress = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateMyPsychologistProfile({
        specialization: splitValues(form.specialization),
        languages: splitValues(form.languages),
        experienceYears: Number(form.experienceYears),
        consultationFee: { amount: Number(form.fee), currency: "INR" },
        bio: form.bio.trim(),
        licensedCountries: splitValues(form.licensedCountries).map((country) =>
          country.toUpperCase(),
        ),
        isAcceptingEmergency: form.isAcceptingEmergency,
      });

      for (const type of ["license", "degree", "id_proof"] as const) {
        const file = files[type];
        if (file) await uploadCredentials([file], type);
      }

      setFiles({});
      await loadProfile();
      toast.success("Professional onboarding progress saved.");
    } catch {
      toast.error("Unable to save your professional profile.");
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      await submitPsychologistForReview();
      await loadProfile();
      toast.success("Your application has been submitted for admin review.");
    } catch {
      toast.error("Complete all required details and documents before submitting.");
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

        <form onSubmit={saveProgress} className="mt-7 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="rounded-3xl border-violet-100 shadow-sm">
            <CardHeader><CardTitle>Professional details</CardTitle></CardHeader>
            <CardContent className="grid gap-5">
              <label className="grid gap-2 text-sm font-bold">Specializations<input disabled={isLocked} required value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Clinical psychology, anxiety, trauma" className="h-12 rounded-xl border px-4 font-normal outline-none focus:border-primary focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100" /><span className="text-xs font-normal text-slate-500">Separate multiple values with commas.</span></label>
              <label className="grid gap-2 text-sm font-bold">Languages<input disabled={isLocked} required value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="English, Hindi" className="h-12 rounded-xl border px-4 font-normal outline-none focus:border-primary focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100" /></label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">Years of experience<input disabled={isLocked} required min="0" type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} className="h-12 rounded-xl border px-4 font-normal outline-none focus:border-primary focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100" /></label>
                <label className="grid gap-2 text-sm font-bold">Consultation fee (INR)<input disabled={isLocked} required min="1" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} className="h-12 rounded-xl border px-4 font-normal outline-none focus:border-primary focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100" /></label>
              </div>
              <label className="grid gap-2 text-sm font-bold">Licensed countries<input disabled={isLocked} required value={form.licensedCountries} onChange={(e) => setForm({ ...form, licensedCountries: e.target.value })} placeholder="IN" className="h-12 rounded-xl border px-4 font-normal outline-none focus:border-primary focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100" /><span className="text-xs font-normal text-slate-500">Use two-letter country codes, separated by commas.</span></label>
              <label className="grid gap-2 text-sm font-bold">Professional biography<textarea disabled={isLocked} required minLength={50} rows={6} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Describe your clinical approach, qualifications, and areas of support." className="resize-none rounded-xl border p-4 font-normal outline-none focus:border-primary focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100" /><span className="text-xs font-normal text-slate-500">Minimum 50 characters.</span></label>
              <label className="flex items-start gap-3 text-sm text-slate-600"><input disabled={isLocked} type="checkbox" checked={form.isAcceptingEmergency} onChange={(e) => setForm({ ...form, isAcceptingEmergency: e.target.checked })} className="mt-1 size-4 accent-violet-600" /><span>I am qualified and willing to receive urgent support requests after approval.</span></label>
            </CardContent>
          </Card>

          <div className="grid content-start gap-6">
            <Card className="rounded-3xl border-violet-100 shadow-sm">
              <CardHeader><CardTitle>Required credentials</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                {(["license", "degree", "id_proof"] as const).map((type) => (
                  <label key={type} className="block rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-4">
                    <span className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-black text-slate-800"><FileCheck2 className="size-4 text-primary" />{credentialLabels[type]}</span>{credentialCounts[type] ? <span className="text-xs font-bold text-emerald-600">{credentialCounts[type]} uploaded</span> : null}</span>
                    {!isLocked && <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFiles((current) => ({ ...current, [type]: e.target.files?.[0] }))} className="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-bold file:text-primary" />}
                    {files[type] && <p className="mt-2 truncate text-xs font-semibold text-slate-600">{files[type]?.name}</p>}
                  </label>
                ))}
              </CardContent>
            </Card>

            {missingFields.length > 0 && !isLocked && (
              <Card className="rounded-3xl border-amber-200 bg-amber-50">
                <CardContent className="pt-6"><p className="font-black text-amber-900">Still required</p><ul className="mt-3 grid gap-2 text-sm text-amber-800">{missingFields.map((field) => <li key={field}>• {field.replaceAll(/([A-Z])/g, " $1").replaceAll("_", " ")}</li>)}</ul></CardContent>
              </Card>
            )}

            {!isLocked && !isApproved && <Button type="submit" disabled={saving} className="h-12 rounded-xl font-bold">{saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}Save progress</Button>}
            <Button type="button" onClick={submit} disabled={!canSubmit || saving} className="h-12 rounded-xl bg-emerald-600 font-bold hover:bg-emerald-700"><Send className="mr-2 size-4" />Submit for review</Button>
          </div>
        </form>
      </div>
    </main>
  );
}
