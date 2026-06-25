import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicFooter } from "../components/PublicFooter";

export function PublicNotFoundPage() {
  return (
    <div className="min-h-screen bg-[#fcfbff]">
      <main className="grid min-h-[70vh] place-items-center px-4 py-20 text-center">
        <div><span className="mx-auto grid size-20 place-items-center rounded-3xl bg-violet-100 text-primary"><SearchX className="size-9" /></span><p className="mt-7 text-xs font-black uppercase tracking-[.2em] text-primary">Page not found</p><h1 className="mt-3 text-4xl font-black text-[#111631]">This path does not exist</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600">The page may have moved, or the address may be incomplete.</p><Button asChild className="mt-7 h-12 rounded-xl px-6"><Link to="/"><ArrowLeft className="mr-1 size-4" />Return home</Link></Button></div>
      </main>
      <PublicFooter />
    </div>
  );
}

