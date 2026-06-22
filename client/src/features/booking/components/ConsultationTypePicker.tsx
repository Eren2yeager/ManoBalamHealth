import { CheckCircle2, MessageSquare, Mic, Video } from "lucide-react";
import { useBookingStore } from "../store/bookingStore";
import type { ConsultationMode } from "@/types/global.types";

const MODES: {
  value: ConsultationMode;
  label: string;
  description: string;
  icon: typeof MessageSquare;
  color: string;
}[] = [
  {
    value: "chat",
    label: "Chat",
    description: "A private text-based conversation at a comfortable pace.",
    icon: MessageSquare,
    color: "bg-violet-100 text-violet-700",
  },
  {
    value: "audio",
    label: "Audio",
    description: "Speak freely without needing to turn on your camera.",
    icon: Mic,
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "video",
    label: "Video",
    description: "A face-to-face online session with secure video.",
    icon: Video,
    color: "bg-emerald-100 text-emerald-700",
  },
];

export const ConsultationTypePicker = () => {
  const { mode, setMode } = useBookingStore();

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
        Session format
      </p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Choose how you feel comfortable connecting
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        You can focus on the conversation—we’ll handle the secure connection.
      </p>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {MODES.map(({ value, label, description, icon: Icon, color }) => {
          const selected = mode === value;
          return (
            <button
              type="button"
              key={value}
              onClick={() => setMode(value)}
              className={`relative rounded-3xl border p-6 text-left transition-all duration-300 ${
                selected
                  ? "border-violet-400 bg-violet-50 shadow-lg shadow-violet-100"
                  : "border-slate-100 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
              }`}
            >
              {selected && (
                <CheckCircle2 className="absolute right-4 top-4 size-5 text-violet-600" />
              )}
              <span className={`grid size-12 place-items-center rounded-2xl ${color}`}>
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-black text-slate-950">{label}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
