import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { FaGoogle, FaApple } from "react-icons/fa";
import { GOOGLE_LOGIN_URL } from "../../lib/config";
import { useSignInModal } from "../../context/SignInModalContext";

interface AuthProvider {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  enabled: boolean;
  className: string;
}

const AUTH_PROVIDERS: AuthProvider[] = [
  {
    id: "apple",
    label: "Continue with Apple",
    icon: <FaApple className="text-lg" />,
    // href: APPLE_LOGIN_URL, — uncomment when backend endpoint is ready
    enabled: true,
    className:
      "bg-white text-black active:bg-gray-200 hover:bg-gray-100",
  },
  {
    id: "google",
    label: "Continue with Google",
    icon: <FaGoogle className="text-base" />,
    href: GOOGLE_LOGIN_URL,
    enabled: true,
    className:
      "bg-component-secondary text-text-h1 border border-outline active:bg-[var(--action-primary)] hover:bg-[var(--action-hover)]",
  },
];

export default function SignInModal() {
  const { isOpen, closeSignInModal } = useSignInModal();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-(--z-modal)"
        onClose={closeSignInModal}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
            {/* Mobile: slide up from bottom — Desktop: fade + scale */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-component-primary border border-outline shadow-xl">
                {/* Drag handle (mobile only) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-10 h-1 rounded-full bg-[var(--subtle)]/30" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-2 sm:pt-5 pb-2">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-text-h1">
                      Sign in to Cinelas
                    </Dialog.Title>
                    <p className="text-sm text-subtle mt-0.5">
                      Track, rate, and organize what you watch
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeSignInModal}
                    className="p-2 min-w-11 min-h-11 flex items-center justify-center text-subtle hover:text-text-h1 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Provider buttons */}
                <div className="px-5 pt-3 pb-5 pb-safe-or-4 sm:pb-5 space-y-3">
                  {AUTH_PROVIDERS.filter((p) => p.enabled).map((provider) => {
                    const sharedClass = `flex items-center justify-center gap-3 w-full px-4 py-3 min-h-[48px] font-semibold rounded-xl transition-colors ${provider.className}`;

                    return provider.href ? (
                      <a
                        key={provider.id}
                        href={provider.href}
                        className={sharedClass}
                      >
                        {provider.icon}
                        {provider.label}
                      </a>
                    ) : (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={provider.onClick}
                        className={sharedClass}
                      >
                        {provider.icon}
                        {provider.label}
                      </button>
                    );
                  })}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
