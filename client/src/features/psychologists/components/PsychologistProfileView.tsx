import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { PsychologistDetail } from "../types/psychologist.types";

interface PsychologistProfileViewProps {
  psychologist: PsychologistDetail;
}

export const PsychologistProfileView = ({ psychologist }: PsychologistProfileViewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {psychologist.avatarUrl ? (
                    <img
                      src={psychologist.avatarUrl}
                      alt={psychologist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
                {psychologist.isOnline && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">{psychologist.name}</h2>
                {psychologist.verificationStatus === "approved" && (
                  <Badge variant="secondary">Verified</Badge>
                )}
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{psychologist.rating.average.toFixed(1)}</span>
                  <span>({psychologist.rating.count} reviews)</span>
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link to={`/book?psychologistId=${psychologist.id}`}>Book Session</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-medium">
                ₹{(psychologist.consultationFee.amount / 100).toLocaleString()}/session
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Experience</span>
              <span className="font-medium">{psychologist.experienceYears} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Languages</span>
              <span className="font-medium">{psychologist.languages.join(", ") || "—"}</span>
            </div>
            {psychologist.licensedCountries.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Licensed in</span>
                <span className="font-medium text-right">
                  {psychologist.licensedCountries.join(", ")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{psychologist.bio || "No bio provided."}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {psychologist.specialization.length > 0 ? (
                psychologist.specialization.map((spec) => (
                  <Badge key={spec} variant="outline" className="capitalize">
                    {spec.replace(/-/g, " ")}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No specializations listed.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
