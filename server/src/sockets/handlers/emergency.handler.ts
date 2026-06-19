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

    const patient = await UserModel.findById(socket.user.userId);
    if (!patient) return;

    // Store patientId against requestId so psychologists can notify the right patient on accept
    await redis.set(
      `emergency:patient:${data.requestId}`,
      socket.user.userId,
      "EX",
      5 * 60 // expire after 5 minutes if nobody accepts
    );

    // Find eligible psychologists (online, approved, accepting emergencies)
    const eligiblePsychologists = await PsychologistModel.find({
      verificationStatus: "approved",
      isAcceptingEmergency: true,
    }).populate("userId");

    const onlinePsychologistIds = await redis.smembers("psychologists:online");
    const onlineEligible = eligiblePsychologists.filter((p) =>
      onlinePsychologistIds.includes(p._id.toString())
    );

    // Broadcast the emergency request to all eligible online psychologists
    for (const psychologist of onlineEligible) {
      const psychUserId = (psychologist as any).userId._id.toString();
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

    const psychologist = await PsychologistModel.findOne({ userId: socket.user.userId });
    if (!psychologist) return;

    // Try to acquire a distributed lock — first psychologist to call SET NX wins
    const lockKey = `emergency:lock:${data.requestId}`;
    const lock = await (redis as any).set(
      lockKey,
      psychologist._id.toString(),
      "NX",
      "EX",
      30 // 30-second lock
    );

    if (lock !== "OK") {
      // Another psychologist already accepted
      socket.emit(SocketEvents.EMERGENCY_ALREADY_TAKEN, { requestId: data.requestId });
      return;
    }

    // We hold the lock — broadcast to all other psychologists that this request is taken
    io.emit(SocketEvents.EMERGENCY_ALREADY_TAKEN, { requestId: data.requestId });

    // Notify the patient that their request was accepted
    const patientUserId = await redis.get(`emergency:patient:${data.requestId}`);
    if (patientUserId) {
      const patientSockets = await io.in(`user:${patientUserId}`).fetchSockets();
      for (const s of patientSockets) {
        s.emit(SocketEvents.EMERGENCY_ACCEPT, {
          requestId: data.requestId,
          psychologist: {
            id: psychologist._id.toString(),
            userId: socket.user.userId,
          },
        });
      }
      // Clean up the patient mapping now that it's been used
      await redis.del(`emergency:patient:${data.requestId}`);
    }

    // NOTE: Appointment creation for emergency sessions is handled via the REST API
    // (POST /appointments with allocationMode: "emergency"). The psychologist's client
    // calls that endpoint after accepting here, which creates the appointment and
    // initiates the session flow.
  };

  // Handle emergency decline from psychologist — notify patient so they know to keep waiting
  const handleEmergencyDecline = async (data: EmergencyDeclineData) => {
    if (!socket.user || socket.user.role !== "psychologist") return;

    const patientUserId = await redis.get(`emergency:patient:${data.requestId}`);
    if (!patientUserId) return;

    const patientSockets = await io.in(`user:${patientUserId}`).fetchSockets();
    for (const s of patientSockets) {
      s.emit(SocketEvents.EMERGENCY_DECLINE, {
        requestId: data.requestId,
        psychologistUserId: socket.user.userId,
      });
    }
  };

  socket.on(SocketEvents.EMERGENCY_REQUEST, handleEmergencyRequest);
  socket.on(SocketEvents.EMERGENCY_ACCEPT, handleEmergencyAccept);
  socket.on(SocketEvents.EMERGENCY_DECLINE, handleEmergencyDecline);
};
