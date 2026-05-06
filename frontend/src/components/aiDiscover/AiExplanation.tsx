import { Sparkles } from "lucide-react";

type AiExplanationProps = {
  message: string;
};

export default function AiExplanation({ message }: AiExplanationProps) {
  return (
    <div className="border-l-4 border-[var(--accent-primary)] bg-[var(--component-primary)] rounded-r-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-[var(--accent-primary)]" />
        <span className="text-sm font-semibold text-white">AI Discovery</span>
      </div>
      <p className="text-base text-white mt-2">{message}</p>
    </div>
  );
}
