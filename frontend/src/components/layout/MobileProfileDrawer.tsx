import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../../hooks/user/useUser";
import { useLogout } from "../../hooks/user/useLogout";
import { useTheme, THEME_OPTIONS } from "../../hooks/useTheme";
import type { ThemePreset } from "../../hooks/useTheme";

interface MobileProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileProfileDrawer({
  isOpen,
  onClose,
}: MobileProfileDrawerProps) {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-(--z-dialog)"
        onClose={onClose}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />
        </Transition.Child>

        {/* Drawer panel — slides in from right */}
        <Transition.Child
          as={Fragment}
          enter="transform transition ease-out duration-[250ms]"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel
            as="aside"
            className="fixed inset-y-0 right-0 w-[90vw] bg-component-primary/95 backdrop-blur-lg border-l border-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <Dialog.Title className="text-lg font-semibold text-text-h1">
                    {user?.name}
                  </Dialog.Title>
                  {user?.email && (
                    <p className="text-sm text-subtle">{user.email}</p>
                  )}
                </div>
              </div>
              <button
                aria-label="Close profile"
                onClick={onClose}
                className="p-3 text-subtle hover:text-text-h1 transition"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-sm text-subtle mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value as ThemePreset)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                      theme === option.value
                        ? "border-accent-primary bg-accent-primary/20 text-text-h1"
                        : "border-outline bg-input text-subtle hover:text-text-h1"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border pb-safe-or-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-xl transition"
              >
                Log out
              </button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
}
