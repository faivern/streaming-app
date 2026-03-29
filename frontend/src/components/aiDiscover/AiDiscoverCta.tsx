import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useUser } from "../../hooks/user/useUser";
import { useSignInModal } from "../../context/SignInModalContext";

export default function AiDiscoverCta() {
  const { data: user } = useUser();
  const { openSignInModal } = useSignInModal();
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/discover/ai") return null;

  const handleClick = () => {
    if (user) {
      navigate("/discover/ai");
    } else {
      openSignInModal(() => navigate("/discover/ai"));
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-20 right-4 md:bottom-6 z-(--z-overlay) flex items-center gap-2 bg-[var(--action-primary)] hover:bg-[var(--action-hover)] text-white font-semibold text-sm rounded-full px-4 py-3 min-h-11 shadow-lg transition-colors duration-200 animate-[fadeIn_0.15s_ease-out]"
    >
      <Sparkles size={16} className="text-[var(--accent-primary)]" />
      Don't know what to watch?
    </button>
  );
}
