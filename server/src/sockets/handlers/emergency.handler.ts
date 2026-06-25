import { Server, Socket } from "socket.io";
import { SocketEvents } from "../events";
import redis from "@/config/redis";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { UserModel } from "@/modules/user/user.model";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { SessionModel } from "@/modules/session/session.model";

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
    console.log("[EMERGENCY] Received emergency request from patient:", socket.user?.userId);
    if (!socket.user || socket.user.role !== "patient") return;

    const patient = await UserModel.findById(socket.user.userId);
    if (!patient) {
      console.log("[EMERGENCY] Patient not found!");
      return;
    }

    // Store patientId against requestId so psychologists can notify the right patient on accept
    await redis.set(
      `emergency:patient:${data.requestId}`,
      socket.user.userId,
      "EX",
      5 * 60 // expire after 5 minutes if nobody accepts
    );

    // Also store concernDescription for later use in appointment
    if (data.concernDescription) {
      await redis.set(
        `emergency:concern:${data.requestId}`,
        data.concernDescription,
        "EX",
        5 * 60
      );
    }

    // Find eligible psychologists (online, approved, accepting emergencies)
    const eligiblePsychologists = await PsychologistModel.find({
      verificationStatus: "approved",
      isAcceptingEmergency: true,
    }).populate("userId");

    console.log("[EMERGENCY] Found eligible psychologists:", eligiblePsychologists.map(p => ({
      _id: p._id.toString(),
      name: (p as any).userId?.name
    })));

    const onlinePsychologistIds = await redis.smembers("psychologists:online");
    console.log("[EMERGENCY] Online psychologist IDs from Redis:", onlinePsychologistIds);

    const onlineEligible = eligiblePsychologists.filter((p) =>
      onlinePsychologistIds.includes(p._id.toString())
    );

    console.log("[EMERGENCY] Online and eligible psychologists:", onlineEligible.map(p => ({
      _id: p._id.toString(),
      userId: (p as any).userId?._id.toString(),
      name: (p as any).userId?.name
    })));

    // Broadcast the emergency request to all eligible online psychologists
    for (const psychologist of onlineEligible) {
      const psychUserId = (psychologist as any).userId._id.toString();
      console.log(`[EMERGENCY] Sending emergency to psychologist user ID: ${psychUserId}`);
      const sockets = await io.in(`user:${psychUserId}`).fetchSockets();
      console.log(`[EMERGENCY] Found ${sockets.length} socket(s) in user:${psychUserId} room`);
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

    const psychologist = await PsychologistModel.findOne({ userId: socket.user.userId }).populate("userId");
    if (
      !psychologist ||
      psychologist.verificationStatus !== "approved" ||
      psychologist.onboardingStatus !== "approved" ||
      !psychologist.isAcceptingEmergency
    ) return;

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

    // Get patientId from redis
    const patientUserId = await redis.get(`emergency:patient:${data.requestId}`);
    if (!patientUserId) return;

    // Get concernDescription from redis
    const concernDescription = await redis.get(`emergency:concern:${data.requestId}`);

    // Get patient
    const patient = await UserModel.findById(patientUserId);
    if (!patient) return;

    // Create appointment for emergency
    const appointment = await AppointmentModel.create({
      patientId: patient._id,
      psychologistId: psychologist._id,
      allocationMode: "emergency",
      mode: "video", // default to video
      concernDescription: concernDescription || undefined,
      status: "confirmed", // Emergency goes straight to confirmed
      scheduledAt: new Date(),
    });

    // Create session (optional, but sessionService will create it anyway)
    await SessionModel.create({
      appointmentId: appointment._id,
      roomId: `room-${appointment._id.toString()}`,
      mode: "video",
      status: "not_started",
      durationSeconds: 0,
    });

    // Get psychologist user data
    const psychUser = (psychologist as any).userId;

    // Notify the patient that their request was accepted
    const patientSockets = await io.in(`user:${patientUserId}`).fetchSockets();
    for (const s of patientSockets) {
      s.emit(SocketEvents.EMERGENCY_ACCEPT, {
        requestId: data.requestId,
        psychologist: {
          id: psychologist._id.toString(),
          userId: socket.user.userId,
          name: psychUser?.name || "Psychologist",
          avatarUrl: psychUser?.avatarUrl,
          specialization: psychologist.specialization,
          languages: psychologist.languages,
          experienceYears: psychologist.experienceYears,
          consultationFee: psychologist.consultationFee,
          rating: psychologist.rating,
          bio: psychologist.bio,
          isOnline: psychologist.isOnline,
        },
        appointmentId: appointment._id.toString(),
      });
    }

    // Notify the psychologist that they got it
    socket.emit("emergency:assigned", {
      sessionId: appointment._id.toString(),
      appointmentId: appointment._id.toString(),
    });

    // Clean up redis keys
    await redis.del(`emergency:patient:${data.requestId}`);
    await redis.del(`emergency:concern:${data.requestId}`);
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
