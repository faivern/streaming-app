import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useSignInModal } from "../../context/SignInModalContext";

interface StatusPageProps {
  code: number;
  title: string;
  message: string;
  action?: "home" | "login" | "back";
}

const statusConfig: Record<number, Omit<StatusPageProps, "code"> & { code: number }> = {
  400: {
    code: 400,
    title: "Bad Request",
    message: "The server didn't understand that. Neither did we.",
  },
  401: {
    code: 401,
    title: "Unauthorized",
    message: "You need to log in. Nice try though.",
    action: "login",
  },
  403: {
    code: 403,
    title: "Forbidden",
    message: "Forbidden. Not even please helped.",
  },
  404: {
    code: 404,
    title: "Page Not Found",
    message: "Page not found. It probably never existed.",
    action: "back",
  },
  500: {
    code: 500,
    title: "Internal Server Error",
    message: "Something exploded. We're investigating.",
  },
  503: {
    code: 503,
    title: "Service Unavailable",
    message: "Server is temporarily out getting snacks.",
  },
};

/** Look up a pre-configured status page by code. */
export function getStatusConfig(code: number) {
  return statusConfig[code];
}

export default function StatusPage({
  code,
  title,
  message,
  action = "home",
}: StatusPageProps) {
  const navigate = useNavigate();
  const { openSignInModal } = useSignInModal();

  const handleAction = () => {
    switch (action) {
      case "login":
        openSignInModal();
        break;
      case "back":
        navigate(-1);
        break;
      default:
        navigate("/");
    }
  };

  const actionLabel = action === "login" ? "Log In" : action === "back" ? "Go Back" : "Go Home";

  return (
    <section
      role="alert"
      aria-live="polite"
      className="mt-navbar-offset flex flex-col items-center justify-center min-h-[60dvh] px-page text-center select-none"
    >
      <Helmet>
        <title>{`${code} | ${title} | Cinelas`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Status code — large, translucent accent watermark */}
      <p
        aria-hidden="true"
        className="text-[7rem] sm:text-[9rem] md:text-[11rem] font-extrabold leading-none tracking-tighter text-accent-primary/10"
      >
        {code}
      </p>

      {/* Title */}
      <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-text-h1 tracking-tight">
        {title}
      </h1>

      {/* Humorous one-liner */}
      <p className="mt-3 max-w-sm text-sm sm:text-base text-subtle leading-relaxed">
        {message}
      </p>

      {/* Primary action */}
      <button
        onClick={handleAction}
        className="mt-8 px-6 py-2.5 text-sm font-medium rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 hover:border-accent-primary/40 transition-all duration-200 cursor-pointer"
      >
        {actionLabel}
      </button>

      {/* Home fallback for non-home actions */}
      {action !== "home" && (
        <a
          href="/"
          className="mt-3 text-xs text-subtle hover:text-text-h1 transition-colors duration-200"
        >
          or go home
        </a>
      )}
    </section>
  );
}
