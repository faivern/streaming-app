import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Listbox, Transition } from "@headlessui/react";
import { FaSignOutAlt, FaPalette } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useTheme, THEME_OPTIONS } from "../../hooks/useTheme";
import type { ThemePreset } from "../../hooks/useTheme";

interface UserModalProps {
  userName: string;
  onLogout: () => void;
  show: boolean;
}

export const UserModal = ({ userName, onLogout, show }: UserModalProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-2xl py-3 z-50 border border-gray-700
        transition-all duration-300 ease-out origin-top-right
        ${show
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
    >
      {/* User name header */}
      <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700/50 mb-1">
        {userName}
      </div>

      {/* Lists link */}
      <Link
        to="/lists"
        className="block px-4 py-2 text-sm text-gray-200 hover:bg-sky-500/20 hover:text-white transition-colors"
      >
        Lists
      </Link>

      {/* Theme selector */}
      <div className="px-4 py-2 border-t border-gray-700/50 mt-1">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <FaPalette className="text-accent-primary" />
          <span>Theme</span>
        </div>
        <Listbox value={theme} onChange={(value: ThemePreset) => setTheme(value)}>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-800 border border-gray-600 py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm">
              <span className="block truncate">
                {THEME_OPTIONS.find((t) => t.value === theme)?.label}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="h-3 w-3 text-gray-400"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-50 mt-1 w-full overflow-auto rounded-lg bg-gray-800 border border-gray-600 py-1 text-sm shadow-lg focus:outline-none">
                {THEME_OPTIONS.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-9 pr-4 ${
                        active ? "bg-accent-primary/20 text-white" : "text-gray-300"
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex flex-col">
                          <span
                            className={`block truncate ${
                              selected ? "font-medium text-white" : "font-normal"
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {option.description}
                          </span>
                        </div>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent-primary">
                            <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
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
      <button
        onClick={onLogout}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-sky-500/20 hover:text-white transition-colors cursor-pointer border-t border-gray-700/50 mt-1"
      >
        <FaSignOutAlt className="mr-2" />
        Sign Out
      </button>
    </div>
  );
};
