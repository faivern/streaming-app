import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { useUser } from "../../hooks/user/useUser";
import { useSignInModal } from "../../context/SignInModalContext";

const DISMISS_KEY = "ai-cta-dismissed";

export default function AiDiscoverCta() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === "1"
  );
  const { data: user } = useUser();
  const { openSignInModal } = useSignInModal();
  const location = useLocation();
  const navigate = useNavigate();

  if (dismissed || location.pathname === "/discover/ai") return null;

  const handleClick = () => {
    if (user) {
      navigate("/discover/ai");
    } else {
      openSignInModal(() => navigate("/discover/ai"));
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-20 right-4 md:bottom-6 z-(--z-overlay) flex items-center gap-2 backdrop-blur-xl bg-[var(--accent-primary)]/8 border border-[var(--accent-primary)]/15 hover:bg-[var(--accent-primary)]/15 text-white font-semibold text-sm rounded-full pl-4 pr-2 py-3 min-h-11 transition-colors duration-200 animate-[scaleIn_0.4s_ease-out] [animation:scaleIn_0.4s_ease-out,glowPulse_3s_ease-in-out_infinite]"
    >
      <Sparkles size={16} className="text-[var(--accent-primary)] animate-[float_3s_ease-in-out_infinite]" />
      Don't know what to watch?
      <span
        role="button"
        onClick={handleDismiss}
        className="ml-1 p-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors duration-150"
      >
        <X size={14} />
      </span>
    </button>
  );
}
