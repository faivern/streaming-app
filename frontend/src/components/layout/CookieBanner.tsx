import { useState } from "react";
import { Link } from "react-router-dom";

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
      className="fixed inset-x-0 bottom-[var(--bottom-nav-height)] md:bottom-0 z-(--z-overlay) bg-component-primary border-t border-border pb-safe"
    >
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center gap-3 px-page py-3">
        <p className="text-sm text-subtle flex-1 leading-relaxed">
          We use only essential cookies to keep you signed in. We don't use tracking
          or advertising cookies.{" "}
          <Link to="/privacy-policy" className="text-accent-primary hover:underline">
            Learn more
          </Link>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 self-end sm:self-auto bg-accent-secondary hover:bg-accent-primary text-white text-sm font-semibold px-5 py-2 min-h-[40px] rounded-md transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
