import { useState, useRef, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useAiDiscover } from "../../hooks/aiDiscover/useAiDiscover";
import { useUser } from "../../hooks/user/useUser";
import { useSignInModal } from "../../context/SignInModalContext";
import { useAiDiscoverSession } from "../../context/AiDiscoverSessionContext";
import AiSearchInput from "../../components/aiDiscover/AiSearchInput";
import AiQuickPrompts from "../../components/aiDiscover/AiQuickPrompts";
import AiChatBubble from "../../components/aiDiscover/AiChatBubble";
import AiCinematicBackground from "../../components/aiDiscover/AiCinematicBackground";
import {
  messageContainerVariants,
  idleEntranceVariants,
} from "../../components/aiDiscover/animations";

const ROTATING_PHRASES = [
  "a scene you remember",
  "what mood you're in",
  "a vibe or feeling",
  "a movie you loved",
  "something you saw as a kid",
  "an actor you can't get enough of",
  "a genre you're craving",
  "a place you want to escape to",
  "a soundtrack that stuck with you",
  "a story that made you cry",
  "something weird and wonderful",
  "a film your friend recommended",
  "a classic you never got around to",
];

let msgId = 0;
const nextId = () => `msg-${++msgId}`;

export default function AiDiscoverPage() {
  const [query, setQuery] = useState("");
  const { messages, setMessages, clearSession } = useAiDiscoverSession();
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
    clearSession();
    setQuery("");
    reset();
  }, [clearSession, reset]);

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
                  alternates: data.alternates ?? [],
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
    [isPending, mutateAsync, setMessages]
  );

  const handleSubmit = () => submitQuery(query);
  const handleQuickPrompt = (prompt: string) => submitQuery(prompt);
  const handleRefine = (newQuery: string) => submitQuery(newQuery);

  const lastAiIndex = messages.reduce(
    (acc, m, i) => (m.role === "ai" ? i : acc),
    -1
  );

  return (
    <div className="flex flex-col overflow-x-hidden h-[calc(100dvh-var(--navbar-height)-var(--bottom-nav-height))] md:h-[calc(100dvh-var(--navbar-height))]">
      <Helmet>
        <title>AI Discover | Cinelas</title>
        <meta name="description" content="Describe what you're in the mood for and get personalized movie and TV show recommendations powered by AI." />
        <meta property="og:title" content="AI Discover | Cinelas" />
        <meta property="og:description" content="Describe what you're in the mood for and get personalized movie and TV show recommendations powered by AI." />
        <meta property="og:url" content="https://cinelas.com/discover/ai" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <AiCinematicBackground />

      {!user ? (
        /* Auth gate — reuses the idle hero with rotating phrases */
        <div className="flex-1 flex flex-col items-center justify-center relative z-[1] px-page">
          <motion.div
            key="auth-gate"
            variants={idleEntranceVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center w-full"
          >
            <h1 className="text-[clamp(1.55rem,5.5vw,3rem)] sm:text-4xl md:text-5xl font-bold text-text-h1 whitespace-nowrap">
              Don't Know What to Watch?
            </h1>
            <div className="mt-3 flex flex-col items-center">
              <p className="text-base sm:text-lg md:text-xl text-text-h1/70">
                Describe
              </p>
              <div className="h-8 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phraseIndex}
                    className="text-base sm:text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary font-semibold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {ROTATING_PHRASES[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <p className="mt-4 text-sm sm:text-base text-text-h1/60 max-w-md">
              We will find the best recommendations for you.
            </p>
            <button
              type="button"
              onClick={() => openSignInModal()}
              className="mt-6 bg-[var(--action-primary)] hover:bg-[var(--action-hover)] text-white font-semibold rounded-xl px-6 py-3 min-h-11 transition-colors duration-200"
            >
              Sign in to get started
            </button>
          </motion.div>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {isIdle ? (
              /* Idle hero — fills viewport, no scroll needed */
              <>
                <div className="flex-1 flex flex-col items-center justify-center relative z-[1] px-page">
                  <motion.div
                    key="idle"
                    variants={idleEntranceVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col items-center text-center w-full"
                  >
                    <h1 className="text-[clamp(1.55rem,5.5vw,3rem)] sm:text-4xl md:text-5xl font-bold text-text-h1 whitespace-nowrap">
                      Don't Know What to Watch?
                    </h1>
                    <div className="mt-3 flex flex-col items-center">
                      <p className="text-base sm:text-lg md:text-xl text-text-h1/70">
                        Describe
                      </p>
                      <div className="h-8 flex items-center">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={phraseIndex}
                            className="text-base sm:text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary font-semibold"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            {ROTATING_PHRASES[phraseIndex]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="mt-6 w-full max-w-full">
                      <AiQuickPrompts visible={true} onSelect={handleQuickPrompt} />
                    </div>
                  </motion.div>
                </div>

                {/* Input anchored at bottom */}
                <AiSearchInput
                  query={query}
                  onQueryChange={setQuery}
                  onSubmit={handleSubmit}
                  isPending={isPending}
                />
              </>
            ) : (
              /* Active chat — scrollable */
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto relative z-[1]">
                  <div className="max-w-2xl mx-auto flex justify-end px-page pt-4 pb-2">
                    <button
                      type="button"
                      onClick={handleClearChat}
                      className="flex items-center gap-2 text-sm text-[var(--subtle)] hover:text-white transition-colors duration-200"
                    >
                      <RotateCcw size={14} />
                      Clear chat and restart
                    </button>
                  </div>

                  <motion.div
                    key="chat"
                    variants={messageContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-2xl mx-auto space-y-4 pt-2 pb-24 px-page"
                  >
                    {messages.map((msg, i) => (
                      <AiChatBubble
                        key={msg.id}
                        message={msg}
                        onRefine={i === lastAiIndex ? handleRefine : undefined}
                      />
                    ))}
                  </motion.div>
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
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
