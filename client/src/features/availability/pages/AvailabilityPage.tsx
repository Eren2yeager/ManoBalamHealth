import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Save, 
  Trash2, 
  LoaderCircle, 
  Sparkles, 
  Video, 
  Mic, 
  MessageSquare,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRules, setRecurringRules } from "../api/availability.api";
import type { AvailabilityRuleDto } from "../types/availability.types";
import type { ConsultationMode } from "@/types/global.types";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const DAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const DAY_SHORT_LABELS: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
const MODES: ConsultationMode[] = ["chat", "audio", "video"];
const DURATIONS: Array<30 | 45 | 60> = [30, 45, 60];

const DEFAULT_RULE: AvailabilityRuleDto = {
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "17:00",
  slotDurationMinutes: 60,
  modes: ["chat", "audio"],
};

const ModeIcon = ({ mode }: { mode: ConsultationMode }) => {
  switch (mode) {
    case "video":
      return <Video className="size-3.5" />;
    case "audio":
      return <Mic className="size-3.5" />;
    case "chat":
      return <MessageSquare className="size-3.5" />;
  }
};

export function AvailabilityPage() {
  const [rules, setRules] = useState<AvailabilityRuleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [initialRules, setInitialRules] = useState<AvailabilityRuleDto[]>([]);

  const isDirty = useMemo(() => JSON.stringify(rules) !== JSON.stringify(initialRules), [rules, initialRules]);

  const weeklySchedule = useMemo(() => {
    const schedule: Record<number, AvailabilityRuleDto[]> = {};
    DAYS.forEach(day => {
      schedule[day] = rules.filter(rule => rule.dayOfWeek === day);
    });
    return schedule;
  }, [rules]);

  const loadRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRules();
      setRules(data.length > 0 ? data : [{ ...DEFAULT_RULE }]);
      setInitialRules(data.length > 0 ? data : [{ ...DEFAULT_RULE }]);
    } catch (error) {
      console.error("Failed to load availability rules:", error);
      toast.error("Failed to load availability rules");
      setRules([{ ...DEFAULT_RULE }]);
      setInitialRules([{ ...DEFAULT_RULE }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRules();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadRules]);

  const updateRule = (index: number, patch: Partial<AvailabilityRuleDto>) => {
    setRules((prev) =>
      prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule))
    );
  };

  const toggleMode = (index: number, mode: ConsultationMode) => {
    setRules((prev) =>
      prev.map((rule, i) => {
        if (i !== index) return rule;
        const modes = rule.modes.includes(mode)
          ? rule.modes.filter((m) => m !== mode)
          : [...rule.modes, mode];
        return { ...rule, modes };
      })
    );
  };

  const addRule = () => setRules((prev) => [...prev, { ...DEFAULT_RULE }]);

  const removeRule = (index: number) =>
    setRules((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const invalid = rules.find((r) => r.modes.length === 0);
    if (invalid) {
      toast.error("Each rule must have at least one consultation mode selected.");
      return;
    }

    setIsSaving(true);
    try {
      const { rulesUpdated } = await setRecurringRules(rules);
      toast.success(`${rulesUpdated} availability rule${rulesUpdated !== 1 ? "s" : ""} saved.`);
      setInitialRules([...rules]);
    } catch (error) {
      toast.error("Failed to save availability rules.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid min-h-[65vh] place-items-center">
          <LoaderCircle className="size-8 animate-spin text-violet-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="min-h-[calc(100vh-4.5rem)] bg-[#faf9ff] px-4 py-7 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-900 via-violet-800 to-indigo-900 px-6 py-8 text-white shadow-2xl md:px-10 md:py-10">
            <div className="absolute -right-20 -top-28 size-80 rounded-full bg-violet-500/25 blur-3xl" />
            <div className="absolute left-10 bottom-0 size-40 rounded-full bg-indigo-500/20 blur-2xl" />
            <div className="relative max-w-4xl animate-in fade-in slide-in-from-bottom-3 duration-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-violet-200">
                <Sparkles className="size-3.5" />
                Schedule management
              </span>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Manage your availability
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-violet-100/80">
                Set your recurring weekly schedule with flexible time slots and consultation modes. Patients will only see slots that fall within these rules.
              </p>
            </div>
          </section>

          {/* Weekly Preview & Rules */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Weekly Preview Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="rounded-3xl border-violet-100 shadow-xl shadow-violet-100/40 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-blue-50/70 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-violet-900">
                    <CalendarIcon className="size-5" />
                    Weekly Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {DAYS.map(day => (
                    <div key={day} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">
                          {DAY_SHORT_LABELS[day]}
                        </span>
                        {weeklySchedule[day].length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="size-3.5" />
                            {weeklySchedule[day].length} slot{weeklySchedule[day].length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                            <XCircle className="size-3.5" />
                            No slots
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {weeklySchedule[day].map((rule, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between rounded-xl bg-violet-50 px-3 py-2 border border-violet-100"
                          >
                            <span className="text-xs font-semibold text-violet-800">
                              {rule.startTime} - {rule.endTime}
                            </span>
                            <div className="flex gap-1">
                              {rule.modes.map(mode => (
                                <span 
                                  key={mode} 
                                  className="grid place-items-center size-5 rounded-md bg-violet-200 text-violet-700"
                                >
                                  <ModeIcon mode={mode} />
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Rules Editor */}
            <div className="lg:col-span-2 space-y-4">
              {rules.map((rule, index) => (
                <Card key={index} className="rounded-3xl border-violet-100 shadow-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 bg-gradient-to-r from-violet-50 to-indigo-50/60">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg">
                        <CalendarIcon className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          Rule {index + 1}
                        </CardTitle>
                        <p className="text-xs font-semibold text-slate-500">
                          {DAY_LABELS[rule.dayOfWeek]} • {rule.startTime} - {rule.endTime}
                        </p>
                      </div>
                    </div>
                    {rules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRule(index)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-9 w-9 p-0"
                      >
                        <Trash2 className="size-4.5" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Day of week */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                          Day of Week
                        </Label>
                        <Select
                          value={String(rule.dayOfWeek)}
                          onValueChange={(value) =>
                            updateRule(index, {
                              dayOfWeek: Number(value) as AvailabilityRuleDto["dayOfWeek"],
                            })
                          }
                        >
                          <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold">
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((day) => (
                              <SelectItem key={day} value={String(day)} className="text-sm font-semibold">
                                {DAY_LABELS[day]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Slot duration */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                          Slot Duration
                        </Label>
                        <div className="flex gap-2">
                          {DURATIONS.map((duration) => (
                            <button
                              key={duration}
                              type="button"
                              onClick={() => updateRule(index, { slotDurationMinutes: duration })}
                              className={`flex-1 h-12 rounded-xl border-2 font-bold text-sm transition-all ${
                                rule.slotDurationMinutes === duration 
                                  ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-inner' 
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50/50'
                              }`}
                            >
                              <Clock className="size-4 inline mr-1.5" />
                              {duration} min
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Time range */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500" htmlFor={`startTime-${index}`}>
                          Start Time
                        </Label>
                        <Input
                          id={`startTime-${index}`}
                          type="time"
                          value={rule.startTime}
                          onChange={(e) => updateRule(index, { startTime: e.target.value })}
                          required
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500" htmlFor={`endTime-${index}`}>
                          End Time
                        </Label>
                        <Input
                          id={`endTime-${index}`}
                          type="time"
                          value={rule.endTime}
                          onChange={(e) => updateRule(index, { endTime: e.target.value })}
                          required
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold"
                        />
                      </div>
                    </div>

                    {/* Consultation modes */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                        Consultation Modes
                      </Label>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {MODES.map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => toggleMode(index, mode)}
                            className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-bold text-sm capitalize transition-all ${
                              rule.modes.includes(mode) 
                                ? 'border-violet-500 bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200' 
                                : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50/50'
                            }`}
                          >
                            <ModeIcon mode={mode} />
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Rule Button */}
              <Button
                type="button"
                variant="outline"
                onClick={addRule}
                className="w-full h-14 rounded-2xl border-dashed border-violet-300 bg-white font-bold text-violet-700 hover:bg-violet-50 hover:border-violet-400 transition-all"
              >
                <Plus className="mr-2 size-5" />
                Add new availability rule
              </Button>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="mt-8 bottom-4 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-violet-100 bg-white/95 p-4 shadow-2xl shadow-violet-200/60 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <p className="text-xs font-semibold text-slate-500">
                {isDirty ? "You have unsaved changes to your availability schedule." : "Your availability schedule is up to date and saved."}
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!isDirty || isSaving}
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 font-black text-white shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="mr-2 size-5 animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-5" />
                  Save availability
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}