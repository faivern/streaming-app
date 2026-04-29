import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ChatMessage } from "../types/aiDiscoverChat";

const STORAGE_KEY = "ai-discover-session";

interface SessionState {
  messages: ChatMessage[];
  interactions: Record<string, "liked" | "disliked">;
}

interface AiDiscoverSessionContextValue {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  interactions: Record<string, "liked" | "disliked">;
  setInteraction: (key: string, value: "liked" | "disliked") => void;
  clearSession: () => void;
}

const AiDiscoverSessionContext = createContext<AiDiscoverSessionContextValue | null>(null);

function loadSession(): SessionState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: [], interactions: {} };
    const parsed = JSON.parse(raw) as SessionState;
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      interactions: parsed.interactions && typeof parsed.interactions === "object" ? parsed.interactions : {},
    };
  } catch {
    return { messages: [], interactions: {} };
  }
}

export function AiDiscoverSessionProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadSession().messages);
  const [interactions, setInteractions] = useState<Record<string, "liked" | "disliked">>(
    () => loadSession().interactions,
  );

  useEffect(() => {
    const state: SessionState = { messages, interactions };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [messages, interactions]);

  const setInteraction = useCallback((key: string, value: "liked" | "disliked") => {
    setInteractions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearSession = useCallback(() => {
    setMessages([]);
    setInteractions({});
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AiDiscoverSessionContext.Provider
      value={{ messages, setMessages, interactions, setInteraction, clearSession }}
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
