import { useEffect } from "react";
import { usePresenceStore } from "@/stores/presenceStore";
import { getSocket, connectSocket } from "@/lib/socket";

export const usePresence = () => {
  const setOnline = usePresenceStore((state) => state.setOnline);
  const setOffline = usePresenceStore((state) => state.setOffline);
  const setOnlinePsychologists = usePresenceStore((state) => state.setOnlinePsychologists);

  useEffect(() => {
    const socket = connectSocket();

    const handlePsychologistOnline = (psychologistId: string) => {
      setOnline(psychologistId);
    };

    const handlePsychologistOffline = (psychologistId: string) => {
      setOffline(psychologistId);
    };

    const handleOnlineList = (psychologistIds: string[]) => {
      setOnlinePsychologists(psychologistIds);
    };

    socket.on("psychologist:online", handlePsychologistOnline);
    socket.on("psychologist:offline", handlePsychologistOffline);
    socket.on("presence:list", handleOnlineList);

    // Request the initial list of online psychologists
    socket.emit("presence:get-list");

    return () => {
      socket.off("psychologist:online", handlePsychologistOnline);
      socket.off("psychologist:offline", handlePsychologistOffline);
      socket.off("presence:list", handleOnlineList);
    };
  }, [setOnline, setOffline, setOnlinePsychologists]);
};

export const usePsychologistPresenceToggle = () => {
  const toggleOnline = (isOnline: boolean) => {
    const socket = getSocket();
    socket.emit(isOnline ? "psychologist:set-online" : "psychologist:set-offline");
  };

  return { toggleOnline };
};
