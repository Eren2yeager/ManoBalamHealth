import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  HeartHandshake,
  LoaderCircle,
  MapPin,
  RotateCcw,
  Save,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserProfile, UpdateProfileDto } from "../types/profile.types";
import { updateMe } from "../api/profile.api";
import { useUserStore } from "@/stores/userStore";
import { getViewerTimezone } from "@/lib/timezone";
import { toast } from "sonner";

interface ProfileFormProps {
  profile: UserProfile;
  onUpdated: (profile: UserProfile) => void;
  professional?: boolean;
}

type FormState = {
  name: string;
  age: string;
  gender: UpdateProfileDto["gender"] | "";
  emergencyName: string;
  emergencyPhone: string;
  timezone: string;
};

const toFormState = (profile: UserProfile): FormState => ({
  name: profile.name,
  age: profile.age ? String(profile.age) : "",
  gender: profile.gender ?? "",
  emergencyName: profile.emergencyContact?.name ?? "",
  emergencyPhone: profile.emergencyContact?.phone ?? "",
  timezone: profile.timezone,
});

export const ProfileForm = ({
  profile,
  onUpdated,
  professional = false,
}: ProfileFormProps) => {
  const setUser = useUserStore((state) => state.setUser);
  const [form, setForm] = useState<FormState>(() => toFormState(profile));
  const [isLoading, setIsLoading] = useState(false);
  const initialForm = useMemo(() => toFormState(profile), [profile]);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const deviceTimezone = getViewerTimezone();
  const contactPartiallyFilled =
    Boolean(form.emergencyName.trim()) !== Boolean(form.emergencyPhone.trim());

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isDirty]);

  const update = <Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (contactPartiallyFilled) {
      toast.error("Add both an emergency-contact name and phone number.");
      return;
    }

    const emergencyContact =
      form.emergencyName.trim() && form.emergencyPhone.trim()
        ? {
            name: form.emergencyName.trim(),
            phone: form.emergencyPhone.trim(),
          }
        : null;

    setIsLoading(true);
    try {
      const updated = await updateMe({
        name: form.name.trim(),
        age: form.age ? Number(form.age) : null,
        gender: form.gender || null,
        emergencyContact,
        timezone: form.timezone,
      });
      setUser(updated);
      onUpdated(updated);
      setForm(toFormState(updated));
      toast.success("Your profile changes are saved.");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message
          : undefined;
      toast.error(message || "We could not update your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          icon={UserRound}
          eyebrow={professional ? "Account identity" : "Personal details"}
          title={professional ? "Your personal account details" : "The basics about you"}
          description={
            professional
              ? "These private account details are separate from the clinical information patients see on your public profile."
              : "Keep your account information accurate so care and reminders reach the right person."
          }
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={form.name}
              minLength={2}
              maxLength={50}
              onChange={(event) => update("name", event.target.value)}
              required
              className="h-12 rounded-xl border-slate-200 bg-slate-50/60 px-4 focus-visible:border-violet-400 focus-visible:ring-violet-100"
            />
          </label>

          <label className="grid gap-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min={13}
              max={120}
              value={form.age}
              onChange={(event) => update("age", event.target.value)}
              placeholder="Your age"
              className="h-12 rounded-xl border-slate-200 bg-slate-50/60 px-4"
            />
          </label>

          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={form.gender || "not_set"}
              onValueChange={(value) =>
                update(
                  "gender",
                  value === "not_set"
                    ? ""
                    : (value as Exclude<FormState["gender"], "">),
                )
              }
            >
              <SelectTrigger
                id="gender"
                className="h-12 w-full rounded-xl border-slate-200 bg-slate-50/60 px-4"
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_set">Not specified</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          icon={HeartHandshake}
          eyebrow={professional ? "Personal safety" : "Safety contact"}
          title={
            professional ? "Your private emergency contact" : "Someone you trust"
          }
          description={
            professional
              ? "Optional and private. This contact is part of your personal account, never your public professional listing."
              : "Optional. This gives you a trusted contact on your account; it is not contacted automatically."
          }
          color="rose"
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <Label htmlFor="emergency-name">Contact name</Label>
            <Input
              id="emergency-name"
              value={form.emergencyName}
              onChange={(event) => update("emergencyName", event.target.value)}
              placeholder="Trusted person’s name"
              className="h-12 rounded-xl border-slate-200 bg-slate-50/60 px-4"
            />
          </label>
          <label className="grid gap-2">
            <Label htmlFor="emergency-phone">International phone number</Label>
            <Input
              id="emergency-phone"
              type="tel"
              value={form.emergencyPhone}
              onChange={(event) => update("emergencyPhone", event.target.value)}
              placeholder="+919876543210"
              className="h-12 rounded-xl border-slate-200 bg-slate-50/60 px-4"
            />
          </label>
        </div>
        {contactPartiallyFilled && (
          <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-600">
            <ShieldAlert className="size-4" />
            Complete both fields or clear both to remove the contact.
          </p>
        )}
        {(form.emergencyName || form.emergencyPhone) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setForm((current) => ({
                ...current,
                emergencyName: "",
                emergencyPhone: "",
              }))
            }
            className="mt-3 rounded-xl font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            Remove emergency contact
          </Button>
        )}
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          icon={Clock3}
          eyebrow="Local time"
          title="Timezone and scheduling"
          description="Appointments and reminders use this timezone to show the correct local time."
          color="blue"
        />
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
                <MapPin className="size-4" />
              </span>
              <div>
                <p className="text-sm font-black text-slate-900">
                  {form.timezone}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Device detected: {deviceTimezone}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => update("timezone", deviceTimezone)}
              disabled={form.timezone === deviceTimezone}
              className="rounded-xl border-blue-200 bg-white font-bold text-blue-700"
            >
              <Clock3 className="mr-2 size-4" />
              Use device timezone
            </Button>
          </div>
        </div>
      </section>

      <div className=" bottom-4 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-violet-100 bg-white/90 p-3 shadow-2xl shadow-violet-200/50 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="px-2 text-xs font-semibold text-slate-500">
          {isDirty ? "You have unsaved changes." : "Everything is up to date."}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || isLoading}
            onClick={() => setForm(initialForm)}
            className="h-11 flex-1 rounded-xl px-4 font-bold sm:flex-none"
          >
            <RotateCcw className="mr-2 size-4" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!isDirty || isLoading || contactPartiallyFilled}
            className="h-11 flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 font-black shadow-lg shadow-violet-200 sm:flex-none"
          >
            {isLoading ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
};

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
  color = "violet",
}: {
  icon: typeof UserRound;
  eyebrow: string;
  title: string;
  description: string;
  color?: "violet" | "rose" | "blue";
}) {
  const colors = {
    violet: "bg-violet-100 text-violet-700",
    rose: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="flex gap-4">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-2xl ${colors[color]}`}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}
