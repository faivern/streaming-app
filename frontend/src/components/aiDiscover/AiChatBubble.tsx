import { motion } from "framer-motion";
import { AlertCircle, Sparkles } from "lucide-react";
import { messageBubbleVariants } from "./animations";
import AiTypingIndicator from "./AiTypingIndicator";
import AiResultsGrid from "./AiResultsGrid";
import AiQuickPrompts from "./AiQuickPrompts";
import type { ChatMessage } from "../../types/aiDiscoverChat";

type AiChatBubbleProps = {
  message: ChatMessage;
  onRefine?: (newQuery: string) => void;
};

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-white/[0.08] border border-white/[0.12] backdrop-blur-md rounded-2xl rounded-br-md px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
        <p className="text-white text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function AiBubbleShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start min-w-0">
      <div className="w-full min-w-0 border-l-2 border-[var(--accent-primary)]/30 bg-white/[0.05] backdrop-blur-md rounded-2xl rounded-bl-md px-4 py-4 shadow-[0_2px_16px_rgba(0,0,0,0.15)]">
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
      <div role="alert" className="flex items-start gap-2">
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
  messageId,
  onRefine,
}: {
  text: string;
  results: import("../../types/aiDiscover").AiDiscoverResult[];
  messageId: string;
  onRefine?: (newQuery: string) => void;
}) {
  if (results.length === 0) {
    return (
      <AiBubbleShell>
        <div className="flex items-start gap-2">
          <Sparkles
            size={16}
            className="text-[var(--accent-primary)] mt-0.5 shrink-0"
          />
          <p className="text-sm text-white leading-relaxed">{text}</p>
        </div>

        {onRefine && (
          <div className="mt-4">
            <p className="text-xs text-[var(--subtle)] mb-2">
              Try one of these instead:
            </p>
            <AiQuickPrompts visible={true} onSelect={onRefine} />
          </div>
        )}
      </AiBubbleShell>
    );
  }

  return (
    <>
      <AiBubbleShell>
        <p className="text-sm text-white leading-relaxed">{text}</p>
      </AiBubbleShell>

      <div className="mt-4">
        <AiResultsGrid results={results} messageId={messageId} />
      </div>
    </>
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
          messageId={message.id}
          onRefine={onRefine}
        />
      )}
    </motion.div>
  );
}
