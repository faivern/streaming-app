import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaTimes, FaGoogle } from "react-icons/fa";
import { GOOGLE_LOGIN_URL } from "../../lib/config";
import { useSignInModal } from "../../context/SignInModalContext";

interface AuthProvider {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  enabled: boolean;
}

const AUTH_PROVIDERS: AuthProvider[] = [
  {
    id: "google",
    label: "Continue with Google",
    icon: <FaGoogle />,
    href: GOOGLE_LOGIN_URL,
    enabled: true,
  },
  // Apple — uncomment + add href when backend endpoint is ready:
  // { id: "apple", label: "Continue with Apple", icon: <FaApple />, href: APPLE_LOGIN_URL, enabled: true },
];

export default function SignInModal() {
  const { isOpen, closeSignInModal } = useSignInModal();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-(--z-modal)" onClose={closeSignInModal}>
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

        {/* Centering container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-component-primary border border-outline p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-semibold text-[var(--text-h1)]">
                    Sign in to Cinelas
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={closeSignInModal}
                    className="p-2 min-w-11 min-h-11 flex items-center justify-center text-[var(--subtle)] hover:text-[var(--text-h1)] rounded-lg hover:bg-[var(--action-hover)] transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Provider buttons */}
                <div className="space-y-3">
                  {AUTH_PROVIDERS.filter((p) => p.enabled).map((provider) =>
                    provider.href ? (
                      <a
                        key={provider.id}
                        href={provider.href}
                        className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-accent-secondary hover:bg-accent-primary text-white font-semibold rounded-xl transition-colors"
                      >
                        {provider.icon}
                        {provider.label}
                      </a>
                    ) : (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={provider.onClick}
                        className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-accent-secondary hover:bg-accent-primary text-white font-semibold rounded-xl transition-colors"
                      >
                        {provider.icon}
                        {provider.label}
                      </button>
                    )
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
