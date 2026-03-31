import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { useAiDiscover } from "../../hooks/aiDiscover/useAiDiscover";
import { useUser } from "../../hooks/user/useUser";
import { useSignInModal } from "../../context/SignInModalContext";
import AiSearchInput from "../../components/aiDiscover/AiSearchInput";
import AiQuickPrompts from "../../components/aiDiscover/AiQuickPrompts";
import AiChatBubble from "../../components/aiDiscover/AiChatBubble";
import AiCinematicBackground from "../../components/aiDiscover/AiCinematicBackground";
import {
  messageContainerVariants,
  idleEntranceVariants,
} from "../../components/aiDiscover/animations";
import type { ChatMessage } from "../../types/aiDiscoverChat";

const ROTATING_PHRASES = [
  "a scene you remember",
  "what mood you're in",
  "a vibe or feeling",
  "a movie you loved",
  "something you saw as a kid",
];

let msgId = 0;
const nextId = () => `msg-${++msgId}`;

export default function AiDiscoverPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { mutateAsync, isPending, reset } = useAiDiscover();
  const { data: user } = useUser();
  const { openSignInModal } = useSignInModal();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isIdle = messages.length === 0;
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Cycle through rotating phrases
  useEffect(() => {
    if (!isIdle) return;
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % ROTATING_PHRASES.length);
    }, 3000);
    return () => clearInterval(id);
  }, [isIdle]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setQuery("");
    reset();
  }, [reset]);

  const submitQuery = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isPending) return;

      const loadingId = nextId();
      setMessages((prev) => [
        ...prev,
        { role: "user", id: nextId(), text: trimmed },
        { role: "loading", id: loadingId },
      ]);
      setQuery("");

      try {
        const data = await mutateAsync(trimmed);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? {
                  role: "ai" as const,
                  id: loadingId,
                  text: data.message,
                  results: data.results,
                  query: trimmed,
                }
              : m
          )
        );
      } catch (err: unknown) {
        const axiosErr = err as import("axios").AxiosError;
        const status = axiosErr?.response?.status;
        const retryAfter = axiosErr?.response?.headers?.["retry-after"]
          ? parseInt(axiosErr.response.headers["retry-after"] as string, 10)
          : null;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? {
                  role: "error" as const,
                  id: loadingId,
                  errorStatus: status,
                  retryAfterSeconds: retryAfter,
                }
              : m
          )
        );
      }
    },
    [isPending, mutateAsync]
  );

  const handleSubmit = () => submitQuery(query);
  const handleQuickPrompt = (prompt: string) => submitQuery(prompt);
  const handleRefine = (newQuery: string) => submitQuery(newQuery);

  const lastAiIndex = messages.reduce(
    (acc, m, i) => (m.role === "ai" ? i : acc),
    -1
  );

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] flex flex-col bg-background">
      <AiCinematicBackground />

      {/* Minimal navbar */}
      <header className="relative z-[1] flex items-center justify-between px-4 lg:px-8 py-4 shrink-0">
        <Link to="/">
          <span
            className="text-xl lg:text-2xl whitespace-nowrap leading-none text-white hover:text-[var(--accent-primary)] transition-colors duration-200"
            style={{ fontFamily: "International", WebkitFontSmoothing: "antialiased" }}
          >
            Cinelas
          </span>
        </Link>

        {user && !isIdle && (
          <button
            type="button"
            onClick={handleClearChat}
            className="flex items-center gap-2 text-sm text-[var(--subtle)] hover:text-white transition-colors duration-200"
          >
            <RotateCcw size={14} />
            New chat
          </button>
        )}
      </header>

      {!user ? (
        /* Auth gate */
        <div className="flex-1 flex flex-col items-center justify-center px-page relative z-[1]">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white text-center">
            Discover movies with AI
          </h1>
          <p className="text-base text-[var(--subtle)] text-center mt-4 max-w-md">
            Sign in to describe what you're in the mood for and get personalized
            recommendations powered by AI.
          </p>
          <button
            type="button"
            onClick={() => openSignInModal()}
            className="mt-6 bg-[var(--action-primary)] hover:bg-[var(--action-hover)] text-white font-semibold rounded-xl px-6 py-3 min-h-11 transition-colors duration-200"
          >
            Sign in to get started
          </button>
        </div>
      ) : (
        <>
          {/* Scrollable chat area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto relative z-[1]">
            <AnimatePresence mode="wait">
              {isIdle ? (
                <motion.div
                  key="idle"
                  variants={idleEntranceVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col items-center text-center h-full justify-center px-page"
                >
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                    Don't know what to watch?
                  </h1>
                  <p className="text-base text-[var(--subtle)] mt-4 max-w-lg">
                    Describe:{" "}
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={phraseIndex}
                        className="inline-block text-white font-medium"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {ROTATING_PHRASES[phraseIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </p>
                  <div className="mt-6">
                    <AiQuickPrompts visible={true} onSelect={handleQuickPrompt} />
                  </div>
                  <p className="text-sm text-[var(--subtle)] mt-3">
                    Searching across 10,000 popular titles
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  variants={messageContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="max-w-2xl mx-auto space-y-4 pt-6 pb-4 px-page"
                >
                  {messages.map((msg, i) => (
                    <AiChatBubble
                      key={msg.id}
                      message={msg}
                      onRefine={i === lastAiIndex ? handleRefine : undefined}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input anchored at bottom */}
          <AiSearchInput
            query={query}
            onQueryChange={setQuery}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        </>
      )}
    </div>
  );
}
