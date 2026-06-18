import { Server, Socket } from "socket.io";
import { SocketEvents } from "../events";
import redis from "@/config/redis";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { UserModel } from "@/modules/user/user.model";

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

interface EmergencyRequestData {
  requestId: string;
  concernDescription?: string;
  specialization?: string;
}

interface EmergencyAcceptData {
  requestId: string;
}

interface EmergencyDeclineData {
  requestId: string;
}

export const handleEmergency = (io: Server, socket: AuthenticatedSocket) => {
  if (!socket.user) return;

  // Handle emergency request from patient
  const handleEmergencyRequest = async (data: EmergencyRequestData) => {
    if (!socket.user || socket.user.role !== "patient") return;

    // Get patient details
    const patient = await UserModel.findById(socket.user.userId);
    if (!patient) return;

    // Find eligible psychologists (online, approved, accepting emergencies)
    const eligiblePsychologists = await PsychologistModel.find({
      verificationStatus: "approved",
      isAcceptingEmergency: true,
    }).populate("userId");

    // Get online psychologist IDs from presence
    const onlinePsychologistIds = await redis.smembers("psychologists:online");
    const onlineEligiblePsychologists = eligiblePsychologists.filter((p) =>
      onlinePsychologistIds.includes(p._id.toString())
    );

    // Broadcast emergency request to all eligible online psychologists
    for (const psychologist of onlineEligiblePsychologists) {
      const psychUserId = (psychologist as any).userId._id.toString();
      // Get all sockets for this user
      const sockets = await io.in(`user:${psychUserId}`).fetchSockets();
      for (const s of sockets) {
        s.emit(SocketEvents.EMERGENCY_REQUEST, {
          requestId: data.requestId,
          patient: {
            id: patient._id.toString(),
            name: patient.name,
            avatarUrl: patient.avatarUrl,
          },
          concernDescription: data.concernDescription,
        });
      }
    }
  };

  // Handle emergency accept from psychologist
  const handleEmergencyAccept = async (data: EmergencyAcceptData) => {
    if (!socket.user || socket.user.role !== "psychologist") return;

    // Get psychologist
    const psychologist = await PsychologistModel.findOne({
      userId: socket.user.userId,
    });
    if (!psychologist) return;

    // Try to acquire lock on this emergency request (ioredis syntax)
    const lockKey = `emergency:lock:${data.requestId}`;
    const lock = await (redis as any).set(lockKey, psychologist._id.toString(), "NX", "EX", 30); // Lock for 30 seconds

    if (lock === "OK") {
      // We got the lock! First to accept!
      // TODO: Create appointment here? Or let the REST endpoint handle it?
      // For now, we'll just broadcast that this request is taken
      io.emit(SocketEvents.EMERGENCY_ALREADY_TAKEN, { requestId: data.requestId });
      // Also emit to the patient that their request was accepted
      // TODO: Find patient's socket
    } else {
      // Lock already taken by someone else
      socket.emit(SocketEvents.EMERGENCY_ALREADY_TAKEN, { requestId: data.requestId });
    }
  };

  // Handle emergency decline from psychologist
  const handleEmergencyDecline = async (data: EmergencyDeclineData) => {
    // For now, just a no-op
    return;
  };

  socket.on(SocketEvents.EMERGENCY_REQUEST, handleEmergencyRequest);
  socket.on(SocketEvents.EMERGENCY_ACCEPT, handleEmergencyAccept);
  socket.on(SocketEvents.EMERGENCY_DECLINE, handleEmergencyDecline);
};
