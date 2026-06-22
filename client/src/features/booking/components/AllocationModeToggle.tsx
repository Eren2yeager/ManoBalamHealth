import { CheckCircle2, Sparkles, UserRoundSearch } from "lucide-react";
import { useBookingStore } from "../store/bookingStore";

const MODES = [
  {
    value: "manual" as const,
    label: "Choose my psychologist",
    description:
      "Explore verified profiles and choose the professional who feels right for you.",
    icon: UserRoundSearch,
    accent: "from-violet-100 to-purple-50 text-violet-700",
  },
  {
    value: "auto" as const,
    label: "Match me automatically",
    description:
      "Tell us your preferred time and focus area, and we’ll find an available professional.",
    icon: Sparkles,
    accent: "from-blue-100 to-cyan-50 text-blue-700",
  },
];

export const AllocationModeToggle = () => {
  const { allocationMode, setAllocationMode } = useBookingStore();

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
        Start your booking
      </p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">
        How would you like to find support?
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        You can choose directly or let the platform find the earliest suitable match.
      </p>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {MODES.map(({ value, label, description, icon: Icon, accent }) => {
          const selected = allocationMode === value;
          return (
            <button
              type="button"
              key={value}
              onClick={() => setAllocationMode(value)}
              className={`group relative min-h-60 rounded-3xl border p-6 text-left transition-all duration-300 ${
                selected
                  ? "border-violet-400 bg-violet-50 shadow-xl shadow-violet-100"
                  : "border-slate-100 bg-white hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
              }`}
            >
              {selected && (
                <CheckCircle2 className="absolute right-5 top-5 size-5 text-violet-600" />
              )}
              <span
                className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${accent}`}
              >
                <Icon className="size-6" />
              </span>
              <h3 className="mt-7 text-xl font-black text-slate-950">{label}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
              <span className="mt-5 inline-flex rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                {value === "manual" ? "More personal control" : "Fastest suitable option"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
