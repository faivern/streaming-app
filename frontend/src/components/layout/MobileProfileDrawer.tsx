import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Link } from "react-router-dom";
import { X, List, Palette, LogOut, Check } from "lucide-react";
import { useUser } from "../../hooks/user/useUser";
import { useLogout } from "../../hooks/user/useLogout";
import { useTheme, THEME_OPTIONS } from "../../hooks/useTheme";

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
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* My Lists */}
              <Link
                to="/lists"
                onClick={onClose}
                className="w-full flex items-center gap-4 px-5 py-3 min-h-[48px] text-text-h1 active:bg-[var(--action-primary)] transition-colors"
              >
                <List className="w-5 h-5" />
                <span className="text-sm font-medium">My Lists</span>
              </Link>

              <div className="border-t border-border" />

              {/* Theme section */}
              <div className="flex items-center gap-2 px-5 pt-4 pb-2">
                <Palette className="w-4 h-4 text-subtle" />
                <span className="text-xs uppercase tracking-wider text-subtle font-medium">
                  Theme
                </span>
              </div>

              {THEME_OPTIONS.map((option) => {
                const isActive = theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className="w-full flex items-center gap-4 px-5 py-3 min-h-[48px] text-text-h1 active:bg-[var(--action-primary)] transition-colors"
                  >
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-subtle">{option.description}</span>
                    </div>
                    {isActive && (
                      <Check className="w-5 h-5 text-accent-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}

              <div className="border-t border-border" />

              {/* Log out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-5 py-3 min-h-[48px] text-red-400 active:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Log out</span>
              </button>

              {/* Safe area bottom padding */}
              <div className="pb-safe-or-4" />
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
}
