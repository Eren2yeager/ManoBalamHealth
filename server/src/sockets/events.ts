export const SocketEvents = {
  // Presence events
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:Offline",
  PRESENCE_UPDATE: "presence:update",

  // Chat events
  MESSAGE: "chat:message",
  MESSAGE_READ: "chat:read",

  // WebRTC events
  ROOM_JOIN: "webrtc:join",
  ROOM_LEAVE: "webrtc:leave",
  SIGNAL: "webrtc:signal",
  ICE_CANDIDATE: "webrtc:ice-candidate",

  // Emergency events
  EMERGENCY_REQUEST: "emergency:request",
  EMERGENCY_ACCEPT: "emergency:accept",
  EMERGENCY_DECLINE: "emergency:decline",
  EMERGENCY_ALREADY_TAKEN: "emergency:already-taken",
} as const;
