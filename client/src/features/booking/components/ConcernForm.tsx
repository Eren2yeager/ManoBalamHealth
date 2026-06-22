import { Heart, LockKeyhole } from "lucide-react";
import { useBookingStore } from "../store/bookingStore";

const prompts = ["Anxiety or stress", "Low mood", "Relationships", "Sleep", "Work pressure"];

export const ConcernForm = () => {
  const { concernDescription, setConcern } = useBookingStore();

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
        Optional context
      </p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">
        What would you like support with?
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        A short note can help your psychologist prepare. You can also leave this blank.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            type="button"
            key={prompt}
            onClick={() =>
              setConcern(
                concernDescription
                  ? `${concernDescription.trim()} ${prompt}.`
                  : `${prompt}.`,
              )
            }
            className="rounded-full border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
          >
            + {prompt}
          </button>
        ))}
      </div>

      <div className="relative mt-5">
        <Heart className="absolute left-4 top-4 size-5 text-violet-400" />
        <textarea
          id="concern"
          value={concernDescription}
          maxLength={1000}
          onChange={(event) => setConcern(event.target.value)}
          placeholder="Share what has been on your mind, what you hope to work on, or anything your psychologist should know..."
          className="min-h-52 w-full resize-none rounded-3xl border border-violet-100 bg-slate-50/60 py-4 pl-12 pr-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
        />
        <span className="absolute bottom-4 right-4 text-[11px] font-bold text-slate-400">
          {concernDescription.length}/1000
        </span>
      </div>

      <div className="mt-4 flex gap-3 rounded-2xl bg-emerald-50 p-4 text-xs leading-5 text-emerald-800">
        <LockKeyhole className="mt-0.5 size-4 shrink-0" />
        This note is treated as private care information and is shown only where
        required to provide your consultation.
      </div>
    </div>
  );
};
