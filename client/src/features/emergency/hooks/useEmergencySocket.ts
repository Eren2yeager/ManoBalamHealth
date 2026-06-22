import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useEmergencyStore } from "../store/emergencyStore";
import { connectSocket } from "@/lib/socket";
import { useUserStore } from "@/stores/userStore";
import { useGeoCountry } from "@/hooks/useGeoCountry";
import type {
  EmergencyIncomingPayload,
  EmergencyMatchedPayload,
  EmergencyAssignedPayload,
} from "../types/emergency.types";

/**
 * Matches socket event contracts from FRONTEND_PLAN.md § 6.4 exactly.
 *
 * Patient flow:
 *   emit  "emergency:request"       { patientId, concern, country }
 *   on    "emergency:matched"       { psychologistId, sessionId }  → navigate to /session/:sessionId
 *
 * Psychologist flow:
 *   on    "emergency:incoming"      { patientId, concern, requestId }
 *   emit  "emergency:accept"        { requestId }
 *   on    "emergency:assigned"      { sessionId }                  → navigate to /session/:sessionId
 *   on    "emergency:already_taken" { requestId }
 */
export function useEmergencySocket() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { detectedCountryCode } = useGeoCountry();

  const {
    setIncomingRequest,
    setRequestAlreadyTaken,
    setRequestTimedOut,
    setIsWaiting,
    reset,
  } = useEmergencyStore();

  useEffect(() => {
    const socket = connectSocket();

    // ── Patient listeners ────────────────────────────────────────────────
    const onMatched = (payload: EmergencyMatchedPayload) => {
      setIsWaiting(false);
      navigate(`/session/${payload.sessionId}`);
    };

    // ── Psychologist listeners ───────────────────────────────────────────
    const onIncoming = (payload: EmergencyIncomingPayload) => {
      setIncomingRequest({
        requestId: payload.requestId,
        patientId: payload.patientId,
        concern: payload.concern,
        receivedAt: new Date().toISOString(),
      });
    };

    const onAssigned = (payload: EmergencyAssignedPayload) => {
      navigate(`/session/${payload.sessionId}`);
    };

    const onAlreadyTaken = () => {
      setIncomingRequest(null);
      setRequestAlreadyTaken(true);
    };

    socket.on("emergency:matched", onMatched);
    socket.on("emergency:incoming", onIncoming);
    socket.on("emergency:assigned", onAssigned);
    socket.on("emergency:already_taken", onAlreadyTaken);

    return () => {
      socket.off("emergency:matched", onMatched);
      socket.off("emergency:incoming", onIncoming);
      socket.off("emergency:assigned", onAssigned);
      socket.off("emergency:already_taken", onAlreadyTaken);
    };
  }, [setIncomingRequest, setRequestAlreadyTaken, setIsWaiting, navigate]);

  /**
   * Patient: emit emergency:request via socket.
   * Plan § 6.4: payload is { patientId, concern, country }
   */
  const requestEmergency = useCallback(
    (concern: string) => {
      if (!user) return;
      const socket = connectSocket();
      setIsWaiting(true);
      setRequestTimedOut(false);
      setRequestAlreadyTaken(false);
      socket.emit("emergency:request", {
        patientId: user.id,
        concern,
        country: detectedCountryCode ?? "",
      });
    },
    [user, detectedCountryCode, setIsWaiting, setRequestTimedOut, setRequestAlreadyTaken]
  );

  /**
   * Psychologist: emit emergency:accept via socket.
   * Plan § 6.4: payload is { requestId }
   */
  const acceptEmergency = useCallback((requestId: string) => {
    const socket = connectSocket();
    socket.emit("emergency:accept", { requestId });
  }, []);

  /**
   * Patient: client-side timeout path — no server event, just clear local state.
   * Plan § 6.4: "Frontend must also handle a client-side timeout (e.g. 60s with no
   * emergency:matched received) — this is a frontend-only concern, not a separate backend event"
   */
  const cancelRequest = useCallback(() => {
    setIsWaiting(false);
    setRequestTimedOut(true);
  }, [setIsWaiting, setRequestTimedOut]);

  return { requestEmergency, acceptEmergency, cancelRequest, reset };
}
