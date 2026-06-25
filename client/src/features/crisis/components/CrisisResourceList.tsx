import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Phone, Globe } from "lucide-react";
import type { CrisisResource, CrisisResourceItem as CrisisCrisisResourceItem } from "../types/crisis.types";
import type { CrisisResourceItem as AssessmentCrisisResourceItem } from "../../assessment/types/assessment.types";

// Helper to normalize resource data
const normalizeResource = (resource: CrisisResource | CrisisCrisisResourceItem | AssessmentCrisisResourceItem) => {
  const r = resource as any;
  if ("id" in resource && resource.id) {
    return {
      id: resource.id,
      name: r.name || r.helplineName || "Crisis Hotline",
      description: r.description || r.availableHours || "Available 24/7 for support",
      phone: r.phone || r.phoneNumber || "",
      website: resource.website,
    };
  } else if ("phoneNumber" in resource) {
    return {
      id: resource.phoneNumber, // Use phone as ID for backward compatibility
      name: r.helplineName || r.name || "Crisis Hotline",
      description: r.availableHours || r.description || "Available 24/7 for support",
      phone: r.phoneNumber || r.phone || "",
      website: resource.website,
    };
  } else {
    return {
      id: "unknown",
      name: "Crisis Hotline",
      description: "Available 24/7 for support",
      phone: "",
      website: undefined,
    };
  }
};

interface CrisisResourceListProps {
  resources: (CrisisResource | CrisisCrisisResourceItem | AssessmentCrisisResourceItem)[];
}

export function CrisisResourceList({ resources }: CrisisResourceListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {resources.map((resource, index) => {
        const normalized = normalizeResource(resource);
        return (
          <Card 
            key={normalized.id || index} 
            className="bg-white border-rose-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardHeader className="bg-gradient-to-r from-rose-50 to-rose-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center rounded-xl bg-rose-500 text-white shadow">
                  <Phone className="size-4" />
                </div>
                <h3 className="text-base font-bold text-rose-900">
                  {normalized.name}
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {normalized.description && (
                <p className="text-xs text-rose-700 leading-relaxed">
                  {normalized.description}
                </p>
              )}
              <a
                href={`tel:${normalized.phone}`}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:from-rose-600 hover:to-pink-700 transition-all shadow-sm"
              >
                <Phone className="size-4" />
                Call {normalized.phone}
              </a>
              {normalized.website && (
                <a
                  href={normalized.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-700 rounded-xl font-bold hover:bg-rose-50 hover:border-rose-300 transition-all"
                >
                  <Globe className="size-4" />
                  Visit Website
                </a>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}