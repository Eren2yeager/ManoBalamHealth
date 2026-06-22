import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PublicPageLayout } from "../components/PublicPageLayout";
import { servicesContent } from "../content/services.content";

export function ServiceDetailPage() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const page = servicesContent[slug];
  if (!page) return <Navigate to="/services/mental-health-counselling" replace />;

  const destination = user ? page.actionTo : `/login?redirect=${encodeURIComponent(page.actionTo)}`;

  return (
    <PublicPageLayout page={page} section="Services">
      <section className={`mt-3 overflow-hidden rounded-3xl p-7 text-white shadow-xl md:p-9 ${page.urgent ? "bg-gradient-to-r from-rose-600 to-orange-500 shadow-rose-200" : "bg-gradient-to-r from-primary to-blue-600 shadow-violet-200"}`}>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15">
              {page.urgent ? <AlertTriangle className="size-6" /> : <ShieldCheck className="size-6" />}
            </span>
            <div>
              <h2 className="text-xl font-black">{page.urgent ? "Need help right now?" : "Ready to explore support?"}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                {user ? "Continue into the secure ManoBalam application." : "Log in or create an account to continue into the secure care experience."}
              </p>
            </div>
          </div>
          <Button asChild className="h-12 shrink-0 rounded-xl bg-white px-6 font-bold text-primary hover:bg-violet-50">
            <Link to={destination}>{page.actionLabel}<ArrowRight className="ml-1 size-4" /></Link>
          </Button>
        </div>
      </section>
    </PublicPageLayout>
  );
}

