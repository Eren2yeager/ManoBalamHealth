export interface SetRulesRequest {
  rules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDurationMinutes: 30 | 45 | 60;
    modes: Array<"chat" | "audio" | "video">;
  }>;
}

export interface SlotResponse {
  slotId: string;
  startTime: string;
  endTime: string;
  mode: "chat" | "audio" | "video";
  isBooked: boolean;
}

export interface RulesUpdatedResponse {
  rulesUpdated: number;
}

export interface SlotBlockedResponse {
  slotId: string;
  isBlocked: boolean;
}
