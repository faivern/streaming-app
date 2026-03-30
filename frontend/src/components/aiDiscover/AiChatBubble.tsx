import { motion } from "framer-motion";
import { Sparkles, AlertCircle } from "lucide-react";
import { messageBubbleVariants } from "./animations";
import AiTypingIndicator from "./AiTypingIndicator";
import AiResultsGrid from "./AiResultsGrid";
import AiQuickActions from "./AiQuickActions";
import type { ChatMessage } from "../../types/aiDiscoverChat";

type AiChatBubbleProps = {
  message: ChatMessage;
  onRefine?: (newQuery: string) => void;
};

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-[var(--action-primary)] border border-[var(--outline)]/50 rounded-2xl rounded-br-md px-4 py-3">
        <p className="text-white text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function AiBubbleShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start">
      <div className="w-full max-w-full border-l-2 border-[var(--accent-primary)]/40 bg-[var(--component-primary)]/60 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-[var(--accent-primary)]" />
          <span className="text-xs font-semibold text-[var(--accent-primary)] uppercase tracking-wider">
            AI Discovery
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <AiBubbleShell>
      <AiTypingIndicator />
    </AiBubbleShell>
  );
}

function ErrorBubble({
  errorStatus,
  retryAfterSeconds,
}: {
  errorStatus: number | undefined;
  retryAfterSeconds: number | null;
}) {
  let heading = "Something went wrong";
  let description = "Please try again.";

  if (errorStatus === 503) {
    heading = "AI is temporarily unavailable";
    description = "Our discovery service is down. Please try again in a moment.";
  } else if (errorStatus === 429) {
    heading = "You've reached the query limit";
    description = `Try again in ${Math.ceil((retryAfterSeconds ?? 30) / 60)} minutes.`;
  } else if (errorStatus === 400) {
    heading = "Invalid query";
    description =
      "Your query couldn't be processed. Keep it under 500 characters and describe a movie or show.";
  }

  return (
    <AiBubbleShell>
      <div className="flex items-start gap-2">
        <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-white">{heading}</p>
          <p className="text-sm text-[var(--subtle)] mt-1">{description}</p>
        </div>
      </div>
    </AiBubbleShell>
  );
}

function AiResponseBubble({
  text,
  results,
  query,
  onRefine,
}: {
  text: string;
  results: import("../../types/aiDiscover").AiDiscoverResult[];
  query: string;
  onRefine?: (newQuery: string) => void;
}) {
  return (
    <AiBubbleShell>
      <p className="text-sm text-white leading-relaxed">{text}</p>

      {results.length > 0 && (
        <div className="mt-4">
          <AiResultsGrid results={results} />
        </div>
      )}

      {onRefine && results.length > 0 && (
        <div className="mt-3">
          <AiQuickActions
            onRefine={onRefine}
            currentQuery={query}
            resultTitles={results.map((r) => r.title)}
          />
        </div>
      )}
    </AiBubbleShell>
  );
}

export default function AiChatBubble({ message, onRefine }: AiChatBubbleProps) {
  return (
    <motion.div variants={messageBubbleVariants} layout>
      {message.role === "user" && <UserBubble text={message.text} />}
      {message.role === "loading" && <LoadingBubble />}
      {message.role === "error" && (
        <ErrorBubble
          errorStatus={message.errorStatus}
          retryAfterSeconds={message.retryAfterSeconds}
        />
      )}
      {message.role === "ai" && (
        <AiResponseBubble
          text={message.text}
          results={message.results}
          query={message.query}
          onRefine={onRefine}
        />
      )}
    </motion.div>
  );
}
