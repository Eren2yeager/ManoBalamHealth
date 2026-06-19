import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CrisisResource } from "../types/crisis.types";

interface CrisisResourceListProps {
  resources: CrisisResource[];
}

export function CrisisResourceList({ resources }: CrisisResourceListProps) {
  return (
    <div className="grid gap-3">
      {resources.map((resource, index) => (
        <Card key={index} className="bg-white border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-red-800">
              {resource.helplineName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-red-700">
              <span className="font-semibold">Phone:</span>
              <a
                href={`tel:${resource.phoneNumber}`}
                className="underline hover:text-red-900"
              >
                {resource.phoneNumber}
              </a>
            </div>
            <p className="text-sm text-red-600">
              <span className="font-semibold">Available:</span> {resource.availableHours}
            </p>
            {resource.website && (
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-600 underline hover:text-red-900 inline-block"
              >
                Visit Website
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
