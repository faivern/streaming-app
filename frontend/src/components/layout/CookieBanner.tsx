import { useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "cinelas-cookie-consent";

export default function CookieBanner() {
  const [acknowledged, setAcknowledged] = useState(
    () => localStorage.getItem(CONSENT_KEY) === "1"
  );

  if (acknowledged) return null;

  const handleDismiss = () => {
    localStorage.setItem(CONSENT_KEY, "1");
    setAcknowledged(true);
  };

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] md:bottom-0 z-(--z-overlay) px-page py-3"
    >
      <div className="mx-auto max-w-4xl flex flex-col sm:flex-row sm:items-center gap-3 bg-component-primary/95 backdrop-blur-lg border border-outline rounded-xl shadow-2xl px-4 py-3">
        <Cookie className="w-5 h-5 text-accent-primary flex-shrink-0" />
        <p className="text-sm text-text-h1 flex-1 leading-relaxed">
          We use only essential cookies to keep you signed in. We don't use
          tracking or advertising cookies.{" "}
          <Link to="/privacy-policy" className="text-accent-primary hover:underline">
            Learn more
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 bg-accent-secondary hover:bg-accent-primary text-white font-semibold px-4 py-2 min-h-[40px] rounded-full transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
