import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mic, Video } from "lucide-react";
import { useBookingStore } from "../store/bookingStore";
import type { ConsultationMode } from "@/types/global.types";

const MODES: {
  value: ConsultationMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "chat",
    label: "Chat",
    icon: <MessageSquare className="h-6 w-6" />,
  },
  {
    value: "audio",
    label: "Audio",
    icon: <Mic className="h-6 w-6" />,
  },
  {
    value: "video",
    label: "Video",
    icon: <Video className="h-6 w-6" />,
  },
];

export const ConsultationTypePicker = () => {
  const { mode, setMode } = useBookingStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {MODES.map((m) => (
        <Button
          key={m.value}
          variant={mode === m.value ? "default" : "outline"}
          className="h-auto p-6 flex flex-col items-center gap-3"
          onClick={() => setMode(m.value)}
        >
          <Badge variant="secondary" className="p-3">
            {m.icon}
          </Badge>
          <div className="font-semibold">{m.label}</div>
        </Button>
      ))}
    </div>
  );
};
