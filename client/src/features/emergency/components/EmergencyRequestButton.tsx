import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface EmergencyRequestButtonProps {
  className?: string;
}

export function EmergencyRequestButton({ className }: EmergencyRequestButtonProps) {
  return (
    <Button
      variant="destructive"
      className={`gap-2 ${className ?? ""}`}
      asChild
    >
      <Link to="/emergency">
        <AlertCircle className="h-5 w-5" />
        Emergency
      </Link>
    </Button>
  );
}
