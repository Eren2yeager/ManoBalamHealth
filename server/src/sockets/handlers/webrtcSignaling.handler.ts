import { Server, Socket } from "socket.io";
import { SocketEvents } from "../events";
import { SessionModel } from "@/modules/session/session.model";
import { AppointmentModel } from "@/modules/appointment/appointment.model";

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

export const handleWebRTCSignaling = (io: Server, socket: AuthenticatedSocket) => {
  if (!socket.user) return;

  const userId = socket.user.userId;

  // Join a WebRTC room for the session
  const handleJoinRoom = async (sessionId: string) => {
    // Verify that user has access to this session
    const session = await SessionModel.findById(sessionId).populate("appointmentId");
    if (!session) return;

    const appointment = session.appointmentId as any;
    if (!appointment) return;

    // Get full appointment to check participants
    const fullAppointment = await AppointmentModel.findById(appointment._id)
      .populate("patientId")
      .populate("psychologistId");
    if (!fullAppointment) return;

    await (fullAppointment as any).populate("psychologistId.userId");

    // Check if user is a participant
    const apptAny = fullAppointment as any;
    const isParticipant =
      apptAny.patientId._id.toString() === userId ||
      apptAny.psychologistId.userId._id.toString() === userId;

    if (!isParticipant) return;

    // Join the room
    socket.join(`webrtc:${sessionId}`);
  };

  // Handle leaving a WebRTC room
  const handleLeaveRoom = async (sessionId: string) => {
    socket.leave(`webrtc:${sessionId}`);
  };

  // Handle sending a WebRTC signal (offer/answer)
  const handleSignal = async (data: {
    sessionId: string;
    signal: any;
    targetUserId: string;
  }) => {
    const { sessionId, signal, targetUserId } = data;

    // Emit to target user in the same room
    io.to(`webrtc:${sessionId}`).emit(SocketEvents.SIGNAL, {
      signal,
      senderUserId: userId,
    });
  };

  // Handle sending an ICE candidate
  const handleIceCandidate = async (data: {
    sessionId: string;
    candidate: any;
    targetUserId: string;
  }) => {
    const { sessionId, candidate, targetUserId } = data;

    io.to(`webrtc:${sessionId}`).emit(SocketEvents.ICE_CANDIDATE, {
      candidate,
      senderUserId: userId,
    });
  };

  // Register event listeners
  socket.on(SocketEvents.ROOM_JOIN, handleJoinRoom);
  socket.on(SocketEvents.ROOM_LEAVE, handleLeaveRoom);
  socket.on(SocketEvents.SIGNAL, handleSignal);
  socket.on(SocketEvents.ICE_CANDIDATE, handleIceCandidate);
};
