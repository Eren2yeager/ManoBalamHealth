import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

/**
 * Emergency sessions reuse the regular SessionRoomPage — once
 * "emergency:matched" or "emergency:assigned" is received, the socket hook
 * navigates to /session/:sessionId, which renders SessionRoomPage.
 *
 * This page serves as a named export for the router entry but simply
 * redirects to the session room using the sessionId param.
 */
export function EmergencySessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  if (!sessionId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto" />
            <h2 className="text-xl font-semibold">Session Not Found</h2>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect immediately to the shared session room
  navigate(`/session/${sessionId}`, { replace: true });
  return null;
}
