import { useState, useEffect, useCallback, useRef } from "react";

interface SessionTimerProps {
  startTime?: string;
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

export function SessionTimer({ startTime, isActive = false }: SessionTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const calculateInitialElapsed = useCallback(() => {
    if (!startTime) return 0;
    const start = new Date(startTime);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / 1000);
  }, [startTime]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;

    setElapsedSeconds(calculateInitialElapsed());

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
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
    }

    return () => stopTimer();
  }, [isActive, startTimer, stopTimer]);

  return (
    <div className="flex items-center gap-2 font-mono text-lg">
      <span className="text-muted-foreground">Session:</span>
      <span className="font-semibold">{formatDuration(elapsedSeconds)}</span>
    </div>
  );
}
