import { useState, useEffect, useCallback, useRef } from "react";

interface SessionTimerProps {
  elapsedSeconds?: number;
  activeStartedAt?: string;
  purchasedDurationSeconds?: number;
  isActive?: boolean;
}

const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number): string => num.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

export function SessionTimer({
  elapsedSeconds = 0,
  activeStartedAt,
  purchasedDurationSeconds,
  isActive = false,
}: SessionTimerProps) {
  const [displaySeconds, setDisplaySeconds] = useState(elapsedSeconds);
  const intervalRef = useRef<number | null>(null);

  const calculateInitialElapsed = useCallback(() => {
    if (!isActive || !activeStartedAt) {
      return elapsedSeconds;
    }

    const activeStartedAtDate = new Date(activeStartedAt);
    const liveDelta = Math.max(
      0,
      Math.floor((Date.now() - activeStartedAtDate.getTime()) / 1000),
    );
    const total = elapsedSeconds + liveDelta;

    if (typeof purchasedDurationSeconds === "number") {
      return Math.min(total, purchasedDurationSeconds);
    }

    return total;
  }, [activeStartedAt, elapsedSeconds, isActive, purchasedDurationSeconds]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;

    setDisplaySeconds(calculateInitialElapsed());

    intervalRef.current = setInterval(() => {
      setDisplaySeconds(calculateInitialElapsed());
    }, 1000);
  }, [calculateInitialElapsed]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      startTimer();
    } else {
      stopTimer();
      setDisplaySeconds(calculateInitialElapsed());
    }

    return () => stopTimer();
  }, [calculateInitialElapsed, isActive, startTimer, stopTimer]);

  useEffect(() => {
    setDisplaySeconds(calculateInitialElapsed());
  }, [calculateInitialElapsed]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1.5 font-mono text-sm text-white shadow-lg backdrop-blur">
      <span className="text-white/65">Session</span>
      <span className="font-semibold tracking-wide">{formatDuration(displaySeconds)}</span>
    </div>
  );
}
