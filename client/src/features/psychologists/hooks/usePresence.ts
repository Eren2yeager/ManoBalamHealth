import { useEffect } from "react";
import { usePresenceStore } from "@/features/psychologists/store/presenceStore";
import { connectSocket } from "@/lib/socket";

/**
 * Matches socket event contracts from FRONTEND_PLAN.md § 6.1 exactly.
 *
 * emit   "presence:online"  — announce self as online (called once on connect)
 * listen "presence:update"  { psychologistId: string; isOnline: boolean }
 */
export const usePresence = () => {
  const setOnline = usePresenceStore((state) => state.setOnline);
  const setOffline = usePresenceStore((state) => state.setOffline);

  useEffect(() => {
    const socket = connectSocket();

    // Announce this client as online
    socket.emit("presence:online");

    const handlePresenceUpdate = (payload: {
      psychologistId: string;
      isOnline: boolean;
    }) => {
      if (payload.isOnline) {
        setOnline(payload.psychologistId);
      } else {
        setOffline(payload.psychologistId);
      }
    };

    socket.on("presence:update", handlePresenceUpdate);

    return () => {
      socket.off("presence:update", handlePresenceUpdate);
    };
  }, [setOnline, setOffline]);
};

/**
 * Used by the psychologist dashboard to toggle their own availability.
 * Re-emits "presence:online" to signal the server — the server broadcasts
 * "presence:update" back to all connected clients.
 */
export const usePsychologistPresenceToggle = () => {
  const toggleOnline = (isOnline: boolean) => {
    const socket = connectSocket();
    if (isOnline) {
      socket.emit("presence:online");
    }
    // Going offline: the server tracks disconnections automatically;
    // no explicit "go offline" emit is defined in the plan contract.
  };

  return { toggleOnline };
};
