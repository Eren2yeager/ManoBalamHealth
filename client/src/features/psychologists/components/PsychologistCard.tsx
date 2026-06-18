import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import type { Psychologist } from "../types/psychologist.types";

interface PsychologistCardProps {
  psychologist: Psychologist;
}

export const PsychologistCard = ({ psychologist }: PsychologistCardProps) => {
  const navigate = useNavigate();

  const formatPrice = (amount: number, currency: string) => {
    // TODO: Use proper currency formatter, smallest unit to actual
    return `${currency} ${(amount / 100).toFixed(2)}`;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/psychologists/${psychologist.id}`)}>
      <CardHeader className="flex flex-row gap-4 items-start">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {psychologist.avatarUrl ? (
              <img
                src={psychologist.avatarUrl}
                alt={psychologist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          {psychologist.isOnline && (
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-success border-2 border-white rounded-full"></span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{psychologist.name}</CardTitle>
            {psychologist.isVerified && <Badge variant="secondary">Verified</Badge>}
          </div>
          <CardDescription>{psychologist.title}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{psychologist.bio || "N/A"}</p>
        <div className="flex flex-wrap gap-2">
          {psychologist.specializations?.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="outline">{spec.replace("-", " ") || "N/A"}</Badge>     
          ))}
          {psychologist.specializations?.length > 3 && (
            <Badge variant="outline">+{psychologist.specializations.length - 3}</Badge>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{formatPrice(psychologist.sessionPrice?.amount || 0, psychologist.sessionPrice?.currency || "N/A")}/session</span> 
          <Button variant="default">View Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
};
