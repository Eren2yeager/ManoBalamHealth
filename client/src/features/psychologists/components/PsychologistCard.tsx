import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { User, Star } from "lucide-react";
import type { PsychologistListItem } from "../types/psychologist.types";

interface PsychologistCardProps {
  psychologist: PsychologistListItem;
}

export const PsychologistCard = ({ psychologist }: PsychologistCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="w-full hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/psychologists/${psychologist.id}`)}
    >
      <CardHeader className="flex flex-row gap-4 items-start">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
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
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg truncate">{psychologist.name}</CardTitle>
          <CardDescription className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>{psychologist.rating.average.toFixed(1)}</span>
            <span className="text-xs">({psychologist.rating.count})</span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{psychologist.bio}</p>
        <div className="flex flex-wrap gap-2">
          {psychologist.specialization.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="outline" className="capitalize">
              {spec.replace(/-/g, " ")}
            </Badge>
          ))}
          {psychologist.specialization.length > 3 && (
            <Badge variant="outline">+{psychologist.specialization.length - 3}</Badge>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            ₹{(psychologist.consultationFee.amount / 100).toLocaleString()}/session
          </span>
          <span className="text-xs text-muted-foreground">
            {psychologist.experienceYears} yrs exp
          </span>
        </div>
        <Button variant="default" className="w-full" onClick={(e) => { e.stopPropagation(); navigate(`/psychologists/${psychologist.id}`); }}>
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};
