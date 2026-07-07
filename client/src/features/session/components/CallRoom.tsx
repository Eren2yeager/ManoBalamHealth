import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SessionTimer } from "./SessionTimer";
import { useWebRTC } from "../hooks/useWebRTC";
import { useSpeakingIndicator } from "../hooks/useSpeakingIndicator";
import { useUserStore } from "@/stores/userStore";
import {
  ArrowLeft,
  Camera,
  Gauge,
  LoaderCircle,
  MessageSquareText,
  Mic,
  MicOff,
  MonitorUp,
  NotebookPen,
  Phone,
  PhoneOff,
  Settings2,
  User,
  Video,
  VideoOff,
} from "lucide-react";
import type { IceServer } from "../types/session.types";

interface CallRoomProps {
  sessionId: string;
  mode: "video" | "audio";
  iceServers?: IceServer[];
  elapsedSeconds?: number;
  activeTimingStartedAt?: string;
  purchasedDurationSeconds?: number;
  counterpartLabel: string;
  counterpartOnline: boolean;
  chatOpen: boolean;
  onToggleChat: () => void;
  /** Rendered only when provided (psychologist-only private notes) */
  notesOpen?: boolean;
  onToggleNotes?: () => void;
  onLeave?: () => void;
}

// ── Small building blocks ────────────────────────────────────────────────────

function ControlButton({
  active = true,
  activeIcon,
  inactiveIcon,
  label,
  onClick,
  danger = false,
}: {
  active?: boolean;
  activeIcon: React.ReactNode;
  inactiveIcon?: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-11 place-items-center rounded-full transition-colors sm:size-12 ${
        danger
          ? "bg-destructive text-white hover:bg-destructive/90"
          : active
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-destructive/90 text-white hover:bg-destructive"
      }`}
    >
      {active ? activeIcon : (inactiveIcon ?? activeIcon)}
    </button>
  );
}

function PersonTile({
  name,
  speaking,
  size = "lg",
}: {
  name: string;
  speaking: boolean;
  size?: "lg" | "sm";
}) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className={`grid place-items-center rounded-full bg-primary/15 text-primary transition-shadow ${
          size === "lg" ? "size-24 sm:size-32" : "size-10 sm:size-14"
        } ${speaking ? "ring-4 ring-primary/70" : ""}`}
      >
        {name ? (
          <span className={`font-semibold ${size === "lg" ? "text-3xl sm:text-4xl" : "text-sm sm:text-lg"}`}>
            {name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <User className={size === "lg" ? "size-10" : "size-5"} />
        )}
      </div>
    </div>
  );
}

function DeviceSettings({
  open,
  onOpenChange,
  microphones,
  cameras,
  selectedMicId,
  selectedCameraId,
  onSelectMic,
  onSelectCamera,
  dataSaver,
  onDataSaverChange,
  showCamera,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  microphones: MediaDeviceInfo[];
  cameras: MediaDeviceInfo[];
  selectedMicId: string;
  selectedCameraId: string;
  onSelectMic: (id: string) => void;
  onSelectCamera: (id: string) => void;
  dataSaver: boolean;
  onDataSaverChange: (on: boolean) => void;
  showCamera: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* "dark" opts the portal into dark tokens — the session UI is always dark */}
      <DialogContent className="dark max-w-md border-border bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Call settings</DialogTitle>
          <DialogDescription>Devices and data usage for this call.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Mic className="size-4 text-muted-foreground" /> Microphone
            </Label>
            <Select value={selectedMicId || undefined} onValueChange={onSelectMic}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Default microphone" />
              </SelectTrigger>
              <SelectContent className="dark">
                {microphones.map((d, i) => (
                  <SelectItem key={d.deviceId} value={d.deviceId}>
                    {d.label || `Microphone ${i + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showCamera && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Camera className="size-4 text-muted-foreground" /> Camera
              </Label>
              <Select value={selectedCameraId || undefined} onValueChange={onSelectCamera}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Default camera" />
                </SelectTrigger>
                <SelectContent className="dark">
                  {cameras.map((d, i) => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
            <Checkbox
              checked={dataSaver}
              onCheckedChange={(v) => onDataSaverChange(v === true)}
              className="mt-0.5"
            />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Gauge className="size-4 text-muted-foreground" /> Data saver
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Lowers video quality to use roughly a quarter of the data. Good for
                mobile networks.
              </span>
            </span>
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function CallRoom({
  sessionId,
  mode,
  iceServers,
  elapsedSeconds,
  activeTimingStartedAt,
  purchasedDurationSeconds,
  counterpartLabel,
  counterpartOnline,
  chatOpen,
  onToggleChat,
  notesOpen = false,
  onToggleNotes,
  onLeave,
}: CallRoomProps) {
  const {
    localStream,
    remoteStream,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    remoteMicOn,
    remoteCameraOn,
    dataSaver,
    callState,
    error,
    callStartedAt,
    microphones,
    cameras,
    selectedMicId,
    selectedCameraId,
    joinCall,
    leaveCall,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    setDataSaver,
    setMicrophone,
    setCamera,
  } = useWebRTC({ sessionId, iceServers, type: mode });

  const userName = useUserStore((s) => s.user?.name ?? "You");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const lobbyVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const localSpeaking = useSpeakingIndicator(localStream);
  const remoteSpeaking = useSpeakingIndicator(remoteStream);

  // The <video> elements are rendered conditionally (camera toggle, screen
  // share, connection state), so srcObject must be reattached whenever any
  // of those conditions remounts them — not just when the stream changes.
  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = localStream;
  }, [localStream, callState, isCameraOn, isScreenSharing]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream, callState, mode, remoteCameraOn]);

  const handleLeave = () => {
    leaveCall();
    onLeave?.();
  };

  const isConnected = callState === "connected";

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-950 p-4">
        <div className="w-full max-w-sm text-center text-white">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-destructive/15">
            <VideoOff className="size-6 text-destructive" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Can't access your devices</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">{error}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={onLeave}>
              Go back
            </Button>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Lobby ────────────────────────────────────────────────────────────────
  if (callState === "lobby") {
    return (
      <div className="relative flex h-full flex-col bg-neutral-950 text-white">
        <div className="flex items-center px-3 py-3 sm:px-5">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            onClick={onLeave}
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4">
          <div className="grid w-full max-w-4xl items-center gap-8 lg:grid-cols-[3fr_2fr]">
            {/* Preview */}
            <div className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-2xl bg-neutral-900">
              {mode === "video" && localStream && isCameraOn ? (
                <video
                  ref={lobbyVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
              ) : localStream ? (
                <PersonTile name={userName} speaking={localSpeaking} />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <LoaderCircle className="size-8 animate-spin text-white/30" />
                </div>
              )}

              {localStream && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
                  <ControlButton
                    active={isMicOn}
                    activeIcon={<Mic className="size-5" />}
                    inactiveIcon={<MicOff className="size-5" />}
                    label={isMicOn ? "Turn off microphone" : "Turn on microphone"}
                    onClick={toggleMic}
                  />
                  {mode === "video" && (
                    <ControlButton
                      active={isCameraOn}
                      activeIcon={<Video className="size-5" />}
                      inactiveIcon={<VideoOff className="size-5" />}
                      label={isCameraOn ? "Turn off camera" : "Turn on camera"}
                      onClick={toggleCamera}
                    />
                  )}
                  <ControlButton
                    activeIcon={<Settings2 className="size-5" />}
                    label="Call settings"
                    onClick={() => setSettingsOpen(true)}
                  />
                </div>
              )}
            </div>

            {/* Join panel */}
            <div className="text-center lg:text-left">
              <h1 className="text-xl font-semibold sm:text-2xl">Ready to join?</h1>
              <p className="mt-2 flex items-center justify-center gap-2 text-sm text-white/60 lg:justify-start">
                <span
                  className={`inline-block size-2 rounded-full ${counterpartOnline ? "bg-success" : "bg-white/30"}`}
                />
                {counterpartOnline
                  ? `${counterpartLabel} is here`
                  : `No one else is here yet`}
              </p>

              <Button
                onClick={joinCall}
                disabled={!localStream}
                size="lg"
                className="mt-6 h-11 rounded-full px-8"
              >
                {mode === "audio" ? (
                  <Phone className="size-4" />
                ) : (
                  <Video className="size-4" />
                )}
                Join now
              </Button>
              <p className="mt-3 text-xs text-white/40">
                The call connects automatically once you're both in.
              </p>
            </div>
          </div>
        </div>

        <DeviceSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          microphones={microphones}
          cameras={cameras}
          selectedMicId={selectedMicId}
          selectedCameraId={selectedCameraId}
          onSelectMic={setMicrophone}
          onSelectCamera={setCamera}
          dataSaver={dataSaver}
          onDataSaverChange={setDataSaver}
          showCamera={mode === "video"}
        />
      </div>
    );
  }

  // ── In call ──────────────────────────────────────────────────────────────
  const statusText =
    callState === "waiting"
      ? `Waiting for ${counterpartLabel.toLowerCase()} to join`
      : callState === "reconnecting"
        ? "Reconnecting"
        : "Connecting";

  return (
    <div className="relative flex h-full flex-col bg-neutral-950">
      {/* Stage */}
      <div className="relative m-2 mb-0 min-h-0 flex-1 overflow-hidden rounded-xl bg-neutral-900 sm:m-3 sm:mb-0">
        {mode === "video" ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`h-full w-full object-contain ${
                remoteStream && isConnected && remoteCameraOn ? "" : "hidden"
              }`}
            />
            {/* Peer's camera is off: their track still delivers black frames,
                so cover the stage with an avatar tile like Meet does. */}
            {remoteStream && isConnected && !remoteCameraOn && (
              <PersonTile name={counterpartLabel} speaking={remoteSpeaking} />
            )}
            {remoteStream && isConnected && (
              <div
                className={`pointer-events-none absolute inset-0 rounded-xl transition-all ${remoteSpeaking ? "ring-4 ring-inset ring-primary/70" : ""}`}
              />
            )}
            {remoteStream && isConnected && !remoteMicOn && (
              <div className="absolute left-2 bottom-2 grid size-7 place-items-center rounded-full bg-black/60 sm:left-3 sm:bottom-3">
                <MicOff className="size-3.5 text-white/80" />
              </div>
            )}
          </>
        ) : (
          isConnected && <PersonTile name={counterpartLabel} speaking={remoteSpeaking} />
        )}

        {!(isConnected && (mode === "audio" || remoteStream)) && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 text-white">
            <PersonTile name={counterpartOnline ? counterpartLabel : ""} speaking={false} />
            <div className="flex items-center gap-2 text-sm text-white/60">
              {callState !== "waiting" && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              <span>
                {statusText}
                {callState === "waiting" && (
                  <span className="inline-block w-6 animate-pulse text-left">...</span>
                )}
              </span>
            </div>
          </div>
        )}

        <audio ref={remoteAudioRef} autoPlay className="hidden" />

        {/* Local PiP */}
        {localStream && (
          <div
            className={`absolute bottom-2 right-2 aspect-video w-28 overflow-hidden rounded-lg bg-neutral-800 shadow-lg transition-all sm:bottom-3 sm:right-3 sm:w-44 ${
              localSpeaking ? "ring-2 ring-primary/70" : "ring-1 ring-white/10"
            }`}
          >
            {mode === "video" && isCameraOn && !isScreenSharing ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : isScreenSharing ? (
              <div className="grid h-full w-full place-items-center text-white/60">
                <div className="text-center">
                  <MonitorUp className="mx-auto size-5" />
                  <span className="mt-1 hidden text-[10px] sm:block">Presenting</span>
                </div>
              </div>
            ) : (
              <PersonTile name={userName} speaking={localSpeaking} size="sm" />
            )}
            {!isMicOn && (
              <div className="absolute left-1 top-1 grid size-5 place-items-center rounded-full bg-destructive/90 sm:size-6">
                <MicOff className="size-3 text-white" />
              </div>
            )}
          </div>
        )}

        {/* Top-left status */}
        <div className="absolute left-2 top-2 flex items-center gap-2 sm:left-3 sm:top-3">
          <SessionTimer
            elapsedSeconds={elapsedSeconds}
            activeStartedAt={activeTimingStartedAt ?? callStartedAt}
            purchasedDurationSeconds={purchasedDurationSeconds}
            isActive={isConnected}
          />
          {callState === "reconnecting" && (
            <span className="flex items-center gap-1.5 rounded-full bg-warning/20 px-2.5 py-1 text-xs font-medium text-warning">
              <LoaderCircle className="size-3 animate-spin" />
              Reconnecting
            </span>
          )}
          {dataSaver && (
            <span className="hidden items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70 sm:flex">
              <Gauge className="size-3" />
              Data saver
            </span>
          )}
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-5">
        {/* <div className="hidden min-w-0 text-sm text-white/50 sm:block">
          {counterpartLabel} session
        </div> */}

        <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3">
          <ControlButton
            active={isMicOn}
            activeIcon={<Mic className="size-5" />}
            inactiveIcon={<MicOff className="size-5" />}
            label={isMicOn ? "Turn off microphone" : "Turn on microphone"}
            onClick={toggleMic}
          />
          {mode === "video" && (
            <ControlButton
              active={isCameraOn}
              activeIcon={<Video className="size-5" />}
              inactiveIcon={<VideoOff className="size-5" />}
              label={isCameraOn ? "Turn off camera" : "Turn on camera"}
              onClick={toggleCamera}
            />
          )}
          {mode === "video" && (
            <button
              type="button"
              onClick={toggleScreenShare}
              aria-label={isScreenSharing ? "Stop presenting" : "Present your screen"}
              title={isScreenSharing ? "Stop presenting" : "Present your screen"}
              className={`hidden size-11 place-items-center rounded-full transition-colors sm:grid sm:size-12 ${
                isScreenSharing
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <MonitorUp className="size-5" />
            </button>
          )}
          <ControlButton
            activeIcon={<Settings2 className="size-5" />}
            label="Call settings"
            onClick={() => setSettingsOpen(true)}
          />
          <button
            type="button"
            onClick={handleLeave}
            aria-label="Leave call"
            title="Leave call"
            className="grid h-11 w-14 place-items-center rounded-full bg-destructive text-white transition-colors hover:bg-destructive/90 sm:h-12 sm:w-16"
          >
            <PhoneOff className="size-5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 sm:min-w-24 sm:gap-3">
          {onToggleNotes && (
            <button
              type="button"
              onClick={onToggleNotes}
              aria-label={notesOpen ? "Close notes" : "Open notes"}
              title={notesOpen ? "Close notes" : "Open session notes"}
              className={`grid size-11 place-items-center rounded-full transition-colors sm:size-12 ${
                notesOpen
                  ? "bg-primary/20 text-primary"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <NotebookPen className="size-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleChat}
            aria-label={chatOpen ? "Close chat" : "Open chat"}
            title={chatOpen ? "Close chat" : "Open chat"}
            className={`grid size-11 place-items-center rounded-full transition-colors sm:size-12 ${
              chatOpen
                ? "bg-primary/20 text-primary"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <MessageSquareText className="size-5" />
          </button>
        </div>
      </div>

      <DeviceSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        microphones={microphones}
        cameras={cameras}
        selectedMicId={selectedMicId}
        selectedCameraId={selectedCameraId}
        onSelectMic={setMicrophone}
        onSelectCamera={setCamera}
        dataSaver={dataSaver}
        onDataSaverChange={setDataSaver}
        showCamera={mode === "video"}
      />
    </div>
  );
}
