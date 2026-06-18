import { useNavigate } from "react-router-dom";
import { MessageSquare, Phone, Video, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatInViewerTz } from "@/lib/timezone";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import type { AppointmentListItem } from "../types/appointment.types";
import type { ConsultationMode } from "@/types/global.types";

const MODE_CONFIG: Record<
  ConsultationMode,
  { label: string; icon: typeof MessageSquare }
> = {
  chat: { label: "Chat", icon: MessageSquare },
  audio: { label: "Audio", icon: Phone },
  video: { label: "Video", icon: Video },
};

interface AppointmentCardProps {
  appointment: AppointmentListItem;
}

export const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  const navigate = useNavigate();
  const modeConfig = MODE_CONFIG[appointment.mode];
  const ModeIcon = modeConfig.icon;

  const initials = appointment.otherParty.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => navigate(`/appointments/${appointment.id}`)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar size="lg" className="size-12">
          {appointment.otherParty.avatarUrl ? (
            <AvatarImage
              src={appointment.otherParty.avatarUrl}
              alt={appointment.otherParty.name}
            />
          ) : null}
          <AvatarFallback>
            {initials || <User className="size-5" />}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-foreground">
              {appointment.otherParty.name}
            </h3>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {formatInViewerTz(appointment.scheduledAt)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1 capitalize">
              <ModeIcon className="size-3" />
              {modeConfig.label}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {appointment.allocationMode}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
