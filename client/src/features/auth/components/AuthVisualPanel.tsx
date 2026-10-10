import type { LucideIcon } from "lucide-react";
import { BrainCircuit, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function AuthVisualPanel({
  image,
  eyebrow,
  title,
  description,
  points,
}: {
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  points: Array<{ icon: LucideIcon; label: string }>;
}) {
  const floatingIcons = [
    { icon: Heart, className: "left-7 top-[31%] animation-delay-500" },
    { icon: BrainCircuit, className: "right-8 top-[22%] animation-delay-1000" },
    { icon: Sparkles, className: "right-12 bottom-[27%] animation-delay-1500" },
  ];

  return (
    <aside className="relative max-h-screen overflow-hidden rounded-b-[2.25rem] bg-[#17142c] text-white shadow-[0_32px_90px_rgba(41,24,88,.25)] lg:rounded-[2.25rem]">
      <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-b from-[#17142c]/25 via-transparent to-[#17142c]/95" />
      <div className="absolute inset-0 bg-linear-to-r from-[#17142c]/40 via-transparent to-transparent" />
      <div className="absolute -left-20 top-10 size-52 rounded-full bg-violet-400/25 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col justify-between p-6 lg:min-h-160 lg:p-8 xl:p-10">
        <BrandLogo dark />

        {floatingIcons.map(({ icon: Icon, className }) => (
          <span
            key={className}
            className={`absolute z-10 hidden size-11 animate-[bounce_4s_ease-in-out_infinite] place-items-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-xl backdrop-blur-md lg:grid ${className}`}
          >
            <Icon className="size-5" />
          </span>
        ))}

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-[.16em] backdrop-blur">
            <Sparkles className="size-3.5 text-violet-200" />
            {eyebrow}
          </span>
          <h2 className="mt-5 max-w-lg text-balance text-3xl font-black leading-tight tracking-[-.04em] lg:text-4xl xl:text-5xl">
            {title}
          </h2>
          <p className="mt-4 hidden max-w-lg text-sm leading-7 text-white lg:block">{description}</p>
          <div className="mt-7 hidden flex-wrap gap-2 lg:flex">
            {points.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold backdrop-blur">
                <Icon className="size-3.5 text-violet-200" />
                {label}
              </span>
            ))}
          </div>
          <div className="mt-7 hidden items-center gap-3  border-white/15 pt-5 text-xs text-white/65 lg:flex">
            <ShieldCheck className="size-5 text-emerald-300" />
            Role-based access and secure account verification
          </div>
        </div>
      </div>
    </aside>
  );
}
