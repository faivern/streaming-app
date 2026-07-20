import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Listbox, Transition } from "@headlessui/react";
import { FaSignOutAlt, FaPalette } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronDown, faListUl } from "@fortawesome/free-solid-svg-icons";
import { useTheme, THEME_OPTIONS } from "../../hooks/useTheme";
import type { ThemePreset } from "../../hooks/useTheme";
import { FaRegUser } from "react-icons/fa";
interface UserModalProps {
  userName: string;
  onLogout: () => void;
  onClose: () => void;
  show: boolean;
}

export const UserModal = ({ userName, onLogout, onClose, show }: UserModalProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`absolute right-0 mt-2 w-56 bg-component-primary/95 backdrop-blur-lg rounded-xl shadow-2xl py-3 z-(--z-dropdown) border border-outline
        transition-all duration-300 ease-out origin-top-right
        ${
          show
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
    >
      {/* User name header */}
      <div className="px-4 py-2 text-sm text-subtle border-b border-border/25 mb-1 flex items-center gap-2">
        <FaRegUser className="text-subtle" />
        {userName}
      </div>

      {/* Lists link */}
      <div className="px-2">
        <Link
          to="/lists"
          onClick={onClose}
          className="flex items-center gap-2 w-full px-2 py-2 text-sm text-text-h1 rounded-md hover:bg-accent-primary/20 hover:text-text-h1 transition-colors"
        >
          <FontAwesomeIcon icon={faListUl} className="text-sm" />
          <span>Lists</span>
        </Link>
      </div>

      {/* Theme selector */}
      <div className="px-4 py-2 border-t border-border/25 mt-1">
        <div className="flex items-center gap-2 text-sm text-subtle mb-2">
          <FaPalette className="text-accent-primary" />
          <span>Theme</span>
        </div>
        <Listbox
          value={theme}
          onChange={(value: ThemePreset) => setTheme(value)}
        >
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-input border border-outline py-2 pl-3 pr-10 text-left text-text-h1 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm">
              <span className="block truncate">
                {THEME_OPTIONS.find((t) => t.value === theme)?.label}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="h-3 w-3 text-subtle"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-(--z-dropdown) mt-1 w-full overflow-auto rounded-lg bg-action-primary border border-outline px-1 py-1 text-sm shadow-lg focus:outline-none">
                {THEME_OPTIONS.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none rounded-md py-2 pl-9 pr-4 ${
                        active
                          ? "bg-accent-primary/20 text-text-h1"
                          : "text-subtle"
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex flex-col">
                          <span
                            className={`block truncate ${
                              selected
                                ? "font-medium text-text-h1"
                                : "font-normal"
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="text-xs text-subtle">
                            {option.description}
                          </span>
                        </div>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent-primary">
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="h-3 w-3"
                            />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      {/* Sign out button */}
      <div className="border-t border-border/25 mt-1 px-2 pt-1">
        <button
          onClick={onLogout}
          className="flex items-center w-full text-left px-2 py-2 text-sm text-text-h1 rounded-md hover:bg-accent-primary/20 hover:text-text-h1 transition-colors cursor-pointer"
        >
          <FaSignOutAlt className="mr-2" />
          Log out
        </button>
      </div>
    </div>
  );
};
