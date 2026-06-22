import { CheckCircle2 } from "lucide-react";

export function ContentSection({
  title,
  body,
  points,
  index,
}: {
  title: string;
  body: string;
  points?: string[];
  index: number;
}) {
  return (
    <article className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(31,21,70,.06)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-100 hover:shadow-xl md:p-8">
      <div className="flex items-start gap-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-sm font-black text-primary ring-1 ring-violet-100">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#111631]">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
          {points && (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-slate-600">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-500" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

