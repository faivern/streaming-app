import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { ChatMessage } from "../types/aiDiscoverChat";

const STORAGE_KEY = "ai-discover-session";
const SESSION_TTL_MS = 7 * 60 * 1000;

interface SessionState {
  messages: ChatMessage[];
  interactions: Record<string, "liked" | "disliked">;
  startedAt: number | null;
}

interface AiDiscoverSessionContextValue {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  interactions: Record<string, "liked" | "disliked">;
  setInteraction: (key: string, value: "liked" | "disliked") => void;
  removeInteraction: (key: string) => void;
  clearSession: () => void;
}

const AiDiscoverSessionContext = createContext<AiDiscoverSessionContextValue | null>(null);

const EMPTY_SESSION: SessionState = { messages: [], interactions: {}, startedAt: null };

function loadSession(): SessionState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_SESSION;
    const parsed = JSON.parse(raw) as SessionState;
    if (parsed.startedAt && Date.now() - parsed.startedAt >= SESSION_TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return EMPTY_SESSION;
    }
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      interactions: parsed.interactions && typeof parsed.interactions === "object" ? parsed.interactions : {},
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
    };
  } catch {
    return EMPTY_SESSION;
  }
}

export function AiDiscoverSessionProvider({ children }: { children: React.ReactNode }) {
  const initial = loadSession();
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [interactions, setInteractions] = useState<Record<string, "liked" | "disliked">>(
    initial.interactions,
  );
  const [startedAt, setStartedAt] = useState<number | null>(initial.startedAt);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = useCallback(() => {
    setMessages([]);
    setInteractions({});
    setStartedAt(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && startedAt === null) {
      setStartedAt(Date.now());
    }
  }, [messages.length, startedAt]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (startedAt === null) return;
    const remaining = SESSION_TTL_MS - (Date.now() - startedAt);
    if (remaining <= 0) {
      clearSession();
      return;
    }
    timerRef.current = setTimeout(clearSession, remaining);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [startedAt, clearSession]);

  useEffect(() => {
    const state: SessionState = { messages, interactions, startedAt };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [messages, interactions, startedAt]);

  const setInteraction = useCallback((key: string, value: "liked" | "disliked") => {
    setInteractions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeInteraction = useCallback((key: string) => {
    setInteractions((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return (
    <AiDiscoverSessionContext.Provider
      value={{ messages, setMessages, interactions, setInteraction, removeInteraction, clearSession }}
    >
      {children}
    </AiDiscoverSessionContext.Provider>
  );
}

export function useAiDiscoverSession() {
  const ctx = useContext(AiDiscoverSessionContext);
  if (!ctx) {
    throw new Error("useAiDiscoverSession must be used within an AiDiscoverSessionProvider");
  }
  return ctx;
}
