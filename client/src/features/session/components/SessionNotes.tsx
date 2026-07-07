import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  CloudUpload,
  LoaderCircle,
  Lock,
  NotebookPen,
  Send,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getSession, updateSessionNotes } from "../api/session.api";
import type { SessionNoteEmotion, SessionNoteEntry } from "../types/session.types";

const MAX_NOTE_LENGTH = 2000;

// ── Emotions ─────────────────────────────────────────────────────────────────

const EMOTIONS: Array<{
  value: SessionNoteEmotion;
  emoji: string;
  label: string;
  chipClass: string;
}> = [
  { value: "happy", emoji: "😊", label: "Happy", chipClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { value: "calm", emoji: "😌", label: "Calm", chipClass: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  { value: "neutral", emoji: "😐", label: "Neutral", chipClass: "bg-slate-500/15 text-slate-600 dark:text-slate-400" },
  { value: "anxious", emoji: "😰", label: "Anxious", chipClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  { value: "sad", emoji: "😢", label: "Sad", chipClass: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400" },
  { value: "angry", emoji: "😠", label: "Angry", chipClass: "bg-red-500/15 text-red-600 dark:text-red-400" },
];

const emotionConfig = (value?: SessionNoteEmotion) =>
  EMOTIONS.find((e) => e.value === value);

const formatElapsed = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const formatWallTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// ── Persistence hook ─────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Owns the entry list and persists every mutation (add/delete) by sending
 * the full list to the server. Mutations are optimistic; a failed save keeps
 * the local list and flags the error so nothing typed is ever lost.
 */
const useSessionNotes = (
  sessionId: string,
  initialEntries: SessionNoteEntry[],
  onEntriesChange?: (entries: SessionNoteEntry[]) => void
) => {
  const [entries, setEntries] = useState<SessionNoteEntry[]>(initialEntries);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const pendingRef = useRef(0);

  const persist = useCallback(
    async (next: SessionNoteEntry[]) => {
      setEntries(next);
      onEntriesChange?.(next);
      const ticket = ++pendingRef.current;
      setSaveState("saving");
      try {
        await updateSessionNotes(sessionId, next);
        // Only the latest in-flight save may update the indicator
        if (ticket === pendingRef.current) setSaveState("saved");
      } catch (error) {
        console.error(error);
        if (ticket === pendingRef.current) {
          setSaveState("error");
          toast.error("Failed to save notes — check your connection");
        }
      }
    },
    [sessionId, onEntriesChange]
  );

  const addEntry = useCallback(
    (text: string, emotion?: SessionNoteEmotion, atSeconds?: number) => {
      const entry: SessionNoteEntry = {
        id: crypto.randomUUID(),
        text: text.trim(),
        emotion,
        atSeconds,
        createdAt: new Date().toISOString(),
      };
      void persist([...entries, entry]);
    },
    [entries, persist]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      void persist(entries.filter((e) => e.id !== id));
    },
    [entries, persist]
  );

  const retry = useCallback(() => void persist(entries), [entries, persist]);

  return { entries, saveState, addEntry, deleteEntry, retry };
};

// ── Building blocks ──────────────────────────────────────────────────────────

const SaveIndicator = ({ state, onRetry }: { state: SaveState; onRetry: () => void }) => {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <CloudUpload className="size-3.5 animate-pulse" /> Saving
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Check className="size-3.5 text-emerald-500" /> Saved
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onRetry}
      className="text-xs font-semibold text-destructive underline-offset-2 hover:underline"
    >
      Save failed — retry
    </button>
  );
};

const NoteEntryItem = ({
  entry,
  onDelete,
}: {
  entry: SessionNoteEntry;
  onDelete: (id: string) => void;
}) => {
  const emotion = emotionConfig(entry.emotion);
  return (
    <div className="group rounded-xl border border-border bg-muted/40 p-3">
      <div className="flex items-center gap-2">
        {emotion && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${emotion.chipClass}`}
          >
            <span aria-hidden>{emotion.emoji}</span>
            {emotion.label}
          </span>
        )}
        <span className="flex items-center gap-1 text-[11px] font-medium tabular-nums text-muted-foreground">
          <Timer className="size-3" />
          {typeof entry.atSeconds === "number"
            ? `${formatElapsed(entry.atSeconds)} in`
            : formatWallTime(entry.createdAt)}
        </span>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          aria-label="Delete note"
          className="ml-auto rounded-full p-1 text-muted-foreground/50 opacity-100 transition-colors hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
        {entry.text}
      </p>
    </div>
  );
};

const NotesEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
      <NotebookPen className="size-5" />
    </div>
    <p className="mt-3 text-sm font-medium">No notes yet</p>
    <p className="mt-1 max-w-56 text-xs leading-5 text-muted-foreground">
      Tag the patient's emotion and jot quick observations — each note is
      timestamped for you.
    </p>
  </div>
);

const NoteComposer = ({
  onAdd,
  autoFocus = false,
}: {
  onAdd: (text: string, emotion?: SessionNoteEmotion) => void;
  autoFocus?: boolean;
}) => {
  const [text, setText] = useState("");
  const [emotion, setEmotion] = useState<SessionNoteEmotion | undefined>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    if (!text.trim()) return;
    onAdd(text, emotion);
    setText("");
    setEmotion(undefined);
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Patient's emotion">
        {EMOTIONS.map((e) => {
          const selected = emotion === e.value;
          return (
            <button
              key={e.value}
              type="button"
              title={e.label}
              aria-pressed={selected}
              onClick={() => setEmotion(selected ? undefined : e.value)}
              className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition-all ${
                selected
                  ? `border-primary/50 ring-1 ring-primary/40 ${e.chipClass}`
                  : "border-border bg-transparent text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="text-sm leading-none" aria-hidden>
                {e.emoji}
              </span>
              <span className={selected ? "" : "hidden sm:inline"}>{e.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => setText(e.target.value.slice(0, MAX_NOTE_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Observation, symptom, follow-up... (Enter to add)"
          rows={2}
          className="min-h-16 flex-1 resize-none rounded-xl bg-muted/40 text-sm leading-relaxed"
        />
        <Button
          type="button"
          size="icon"
          onClick={submit}
          disabled={!text.trim()}
          aria-label="Add note"
          className="size-10 shrink-0 rounded-full"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
};

// ── Sidebar panel (session room) ─────────────────────────────────────────────

interface SessionNotesPanelProps {
  sessionId: string;
  initialEntries: SessionNoteEntry[];
  /** Current elapsed seconds in the session, used to timestamp live notes */
  getAtSeconds?: () => number | undefined;
  onEntriesChange?: (entries: SessionNoteEntry[]) => void;
  onClose?: () => void;
}

/**
 * ChatPanel-style notes sidebar for the live session room: scrolling
 * timestamped entry list with the composer pinned at the bottom.
 */
export const SessionNotesPanel = ({
  sessionId,
  initialEntries,
  getAtSeconds,
  onEntriesChange,
  onClose,
}: SessionNotesPanelProps) => {
  const { entries, saveState, addEntry, deleteEntry, retry } = useSessionNotes(
    sessionId,
    initialEntries,
    onEntriesChange
  );
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-card text-card-foreground">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <NotebookPen className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Session notes</h3>
        <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
          <Lock className="size-2.5" /> Private
        </span>
        <div className="ml-auto flex items-center gap-2">
          <SaveIndicator state={saveState} onRetry={retry} />
          {onClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={onClose}
              aria-label="Close notes"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {entries.length === 0 ? (
          <NotesEmptyState />
        ) : (
          entries.map((entry) => (
            <NoteEntryItem key={entry.id} entry={entry} onDelete={deleteEntry} />
          ))
        )}
        <div ref={listEndRef} />
      </div>

      <div className="border-t border-border p-3">
        <NoteComposer
          onAdd={(text, emotion) => addEntry(text, emotion, getAtSeconds?.())}
        />
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Lock className="size-3" /> Only visible to you — never shared with the patient.
        </p>
      </div>
    </div>
  );
};

// ── Collapsible card (appointment detail page) ───────────────────────────────

interface SessionNotesCardProps {
  appointmentId: string;
}

/**
 * Collapsible notes card for the appointment detail page (psychologist only).
 * Fetches the session for the appointment, then lets the psychologist review
 * and extend their timestamped notes.
 */
export const SessionNotesCard = ({ appointmentId }: SessionNotesCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; sessionId: string; entries: SessionNoteEntry[] }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    getSession(appointmentId)
      .then((session) => {
        if (cancelled) return;
        setState({
          status: "ready",
          sessionId: session.sessionId,
          entries: session.psychologistNotes ?? [],
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  if (state.status === "error") return null;

  return (
    <Card className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white py-0 shadow-sm">
      <CardHeader className="p-0">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="w-full bg-gradient-to-br from-slate-50 to-white px-6 py-4 text-left transition-colors hover:bg-slate-50 sm:py-5"
        >
          <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight text-slate-950 sm:text-lg">
            <NotebookPen className="size-4 text-primary sm:size-5" />
            Session notes
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
              <Lock className="size-3" /> Private
            </span>
            {state.status === "ready" && state.entries.length > 0 && (
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                {state.entries.length} {state.entries.length === 1 ? "note" : "notes"}
              </span>
            )}
            <ChevronDown
              className={`ml-auto size-5 shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </CardTitle>
        </button>
      </CardHeader>
      {expanded && (
        <CardContent className="border-t border-slate-100 p-4 sm:p-6">
          {state.status === "loading" ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : (
            <SessionNotesCardBody
              sessionId={state.sessionId}
              initialEntries={state.entries}
              onEntriesChange={(entries) =>
                setState((prev) =>
                  prev.status === "ready" ? { ...prev, entries } : prev
                )
              }
            />
          )}
        </CardContent>
      )}
    </Card>
  );
};

const SessionNotesCardBody = ({
  sessionId,
  initialEntries,
  onEntriesChange,
}: {
  sessionId: string;
  initialEntries: SessionNoteEntry[];
  onEntriesChange: (entries: SessionNoteEntry[]) => void;
}) => {
  const { entries, saveState, addEntry, deleteEntry, retry } = useSessionNotes(
    sessionId,
    initialEntries,
    onEntriesChange
  );

  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <NotesEmptyState />
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <NoteEntryItem key={entry.id} entry={entry} onDelete={deleteEntry} />
          ))}
        </div>
      )}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
        <NoteComposer onAdd={(text, emotion) => addEntry(text, emotion)} />
        <div className="mt-2 flex items-center justify-between">
          <p className="flex items-center gap-1 text-[11px] text-slate-500">
            <Lock className="size-3" /> Only visible to you.
          </p>
          <SaveIndicator state={saveState} onRetry={retry} />
        </div>
      </div>
    </div>
  );
};

/** Loading affordance for places that mount the panel before session data exists */
export const SessionNotesPanelSkeleton = () => (
  <div className="flex h-full items-center justify-center bg-card">
    <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
  </div>
);
