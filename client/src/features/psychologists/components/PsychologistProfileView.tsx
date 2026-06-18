import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import type { Psychologist } from "../types/psychologist.types";

interface PsychologistProfileViewProps {
  psychologist: Psychologist;
}

export const PsychologistProfileView = ({ psychologist }: PsychologistProfileViewProps) => {
  const formatPrice = (amount: number, currency: string) => {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
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
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">{psychologist.name}</h2>
                <p className="text-muted-foreground">{psychologist.title}</p>
                {psychologist.isVerified && <Badge>Verified</Badge>}
              </div>
              <Button className="w-full" asChild>
                <Link to={`/booking/${psychologist.id}`}>Book Session</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">{formatPrice(psychologist.sessionPrice?.amount || 0, psychologist.sessionPrice?.currency || "" || "")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Experience</span>
              <span className="font-medium">{psychologist.yearsOfExperience || 0} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timezone</span>
              <span className="font-medium">{psychologist.timezone || "N/A"}</span>
            </div>
            {psychologist.rating && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-medium">{psychologist.rating?.toFixed?.(1)} ({psychologist.reviewCount || 0} reviews)</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{psychologist.bio || "N/A"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {psychologist.specializations?.length ? psychologist.specializations?.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="outline">
                  {spec.replace("-", " ") || "N/A"}
                </Badge>
              )) : (
                <Badge variant="outline">{psychologist.specializations?.length ? "N/A" : "No specializations"}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Modes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {psychologist.consultationModes?.length ? psychologist.consultationModes?.map((mode) => (
                <Badge key={mode} variant="outline" className="capitalize">
                  {mode || "N/A"}
                </Badge>
              )) : (
                <Badge variant="outline" className="capitalize">
                  {psychologist.consultationModes?.length ? "N/A" : "No modes available"}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
