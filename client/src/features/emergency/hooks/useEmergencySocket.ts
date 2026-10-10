import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEmergencyStore } from "../store/emergencyStore";
import { connectSocket } from "@/lib/socket";
import { useUserStore } from "@/stores/userStore";
import type {
  EmergencyIncomingPayload,
  EmergencyAcceptPayload,
  EmergencyAlreadyTakenPayload,
} from "../types/emergency.types";

const TIMEOUT_SECONDS = 60;

export function useEmergencySocket() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const {
    phase,
    requestSentAt,
    countdownSeconds,
    setPhase,
    setCurrentRequestId,
    setConcernDescription,
    setRequestSentAt,
    setCountdownSeconds,
    setMatchedPsychologist,
    setIncomingRequest,
    addIgnoredRequestId,
    setRequestAlreadyTaken,
    reset,
    ignoredRequestIds,
    incomingRequest,
  } = useEmergencyStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore countdown if request was already sent
  useEffect(() => {
    if (phase === "waiting" && requestSentAt) {
      const elapsed = Math.floor(
        (Date.now() - requestSentAt) / 1000
      );
      const remaining = Math.max(0, TIMEOUT_SECONDS - elapsed);
      setCountdownSeconds(remaining);
    }
  }, [phase, requestSentAt, setCountdownSeconds]);

  // Handle countdown timer
  useEffect(() => {
    if (phase === "waiting" && countdownSeconds > 0) {
      timerRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            setPhase("idle");
            reset();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, countdownSeconds, setCountdownSeconds, setPhase, reset]);

  useEffect(() => {
    const socket = connectSocket();

    // ── Patient listeners ───────────────────────────────────────────
    const onAccept = (payload: EmergencyAcceptPayload) => {
      if (phase === "waiting" || phase === "requesting") {
        setMatchedPsychologist({
          id: payload.psychologist.id,
          userId: payload.psychologist.userId,
          name: payload.psychologist.name,
          avatarUrl: payload.psychologist.avatarUrl,
          specialization: payload.psychologist.specialization,
          languages: payload.psychologist.languages,
          experienceYears: payload.psychologist.experienceYears,
          consultationFee: payload.psychologist.consultationFee,
          rating: payload.psychologist.rating,
          bio: payload.psychologist.bio,
          isOnline: payload.psychologist.isOnline,
          appointmentId: payload.appointmentId,
        });
        setPhase("matched_waiting_confirm");
      }
    };

    // ── Psychologist listeners ──────────────────────────────────────
    const onIncoming = (payload: EmergencyIncomingPayload) => {
      if (
        !incomingRequest &&
        !ignoredRequestIds.includes(payload.requestId)
      ) {
        setIncomingRequest({
          requestId: payload.requestId,
          patientId: payload.patient.id,
          patientName: payload.patient.name,
          patientAvatarUrl: payload.patient.avatarUrl,
          concern: payload.concernDescription,
          concernDescription: payload.concernDescription,
          receivedAt: new Date().toISOString(),
        });
      }
    };

    const onAssigned = (payload: { appointmentId: string }) => {
      navigate(`/session/${payload.appointmentId}`);
    };

    const onAlreadyTaken = (_payload: EmergencyAlreadyTakenPayload) => {
      setIncomingRequest(null);
      setRequestAlreadyTaken(true);
    };

    socket.on("emergency:accept", onAccept);
    socket.on("emergency:request", onIncoming);
    socket.on("emergency:assigned", onAssigned);
    socket.on("emergency:already-taken", onAlreadyTaken);

    return () => {
      socket.off("emergency:accept", onAccept);
      socket.off("emergency:request", onIncoming);
      socket.off("emergency:assigned", onAssigned);
      socket.off("emergency:already-taken", onAlreadyTaken);
    };
  }, [
    user,
    phase,
    incomingRequest,
    ignoredRequestIds,
    setPhase,
    setMatchedPsychologist,
    setIncomingRequest,
    addIgnoredRequestId,
    setRequestAlreadyTaken,
    navigate,
  ]);

  /**
   * Patient: emit emergency:request via socket.
   */
  const requestEmergency = useCallback(
    (concernDescription: string) => {
      if (!user) return;
      const socket = connectSocket();
      const requestId = crypto.randomUUID();

      setConcernDescription(concernDescription.trim() || null);
      setCurrentRequestId(requestId);
      setRequestSentAt(Date.now());
      setCountdownSeconds(TIMEOUT_SECONDS);
      setPhase("waiting");

      socket.emit("emergency:request", {
        requestId,
        concernDescription: concernDescription.trim() || undefined,
      });
    },
    [user, setConcernDescription, setCurrentRequestId, setRequestSentAt, setCountdownSeconds, setPhase]
  );

  /**
   * Psychologist: emit emergency:accept via socket.
   */
  const acceptEmergency = useCallback(
    (requestId: string) => {
      const socket = connectSocket();
      socket.emit("emergency:accept", { requestId });
    },
    []
  );

  /**
   * Patient: Cancel the current request
   */
  const cancelRequest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    reset();
  }, [reset]);

  /**
   * Patient: Confirm the matched session
   */
  const confirmSession = useCallback(() => {
    const store = useEmergencyStore.getState();
    if (store.matchedPsychologist) {
      navigate(
        `/session/${store.matchedPsychologist.appointmentId}`
      );
    }
  }, [navigate]);

  return {
    requestEmergency,
    acceptEmergency,
    cancelRequest,
    confirmSession,
    reset,
  };
}
