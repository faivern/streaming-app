import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import logo from "../../assets/react.svg";
import { FaRegUser } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import SearchBar from "../layout/SearchBar";
import "../../style/TitleHover.css";
import GenreList from "../filters/GenreList";
import { GOOGLE_LOGIN_URL } from "../../lib/config";
import { useUser } from "../../hooks/user/useUser";
import { useLogout } from "../../hooks/user/useLogout";
import { UserModal } from "./UserModal";
import { useGenres } from "../../hooks/genres/useGenres";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faListUl,
  faMasksTheater,
} from "@fortawesome/free-solid-svg-icons";
import BrandLogo from "../common/BrandLogo";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: genres = [] } = useGenres();
  const [showGenres, setShowGenres] = useState(false); // desktop hover dropdown
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // NEW
  const [showMobileGenres, setShowMobileGenres] = useState(false); // NEW
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const userPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userPanelRef.current &&
        !userPanelRef.current.contains(e.target as Node)
      ) {
        setIsUserModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserModalOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-(--z-sticky) w-full backdrop-blur-lg transition-colors duration-700 ease-in-out
        ${
          isScrolled
            ? "bg-gradient-to-b from-primary via-primary to-primary shadow-xl"
            : "bg-gradient-to-b from-primary/90 via-primary/60 to-transparent"
        }`}
      >
        {/* Full-width container - no max-width constraint */}
        <div className="w-full px-4 lg:px-8 xl:px-12">
          {/* Three-column grid layout with equal-width outer columns for true centering */}
          <nav className="grid grid-cols-[1fr_auto_1fr] items-center py-4 gap-4 xl:gap-8">
            {/* LEFT: Logo + Nav Links */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex-shrink-0 mr-4">
                <BrandLogo />
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden xl:flex items-center gap-6">
                <Link to="/">
                  <span className="underline-hover !text-base !font-semibold !mb-0 whitespace-nowrap flex items-center gap-2">
                    <FontAwesomeIcon icon={faHouse} className="text-sm" />
                    Home
                    <span className="underline-bar"></span>
                  </span>
                </Link>
                <Link to="/lists">
                  <span className="underline-hover !text-base !font-semibold !mb-0 whitespace-nowrap flex items-center gap-2">
                    <FontAwesomeIcon icon={faListUl} className="text-sm" />
                    Lists
                    <span className="underline-bar"></span>
                  </span>
                </Link>

                <div
                  className="relative"
                  onMouseEnter={() => setShowGenres(true)}
                  onMouseLeave={() => setShowGenres(false)}
                >
                  <div className="underline-hover !text-base !font-semibold !mb-0 cursor-pointer flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faMasksTheater}
                      className="text-sm"
                    />
                    Genres
                    <span className="underline-bar"></span>
                  </div>

                  {showGenres && (
                    <div className="absolute left-0 top-full pt-2 z-(--z-drawer)">
                      <div className="w-96 bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl p-6 shadow-2xl">
                        <GenreList genres={genres} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CENTER: Search Bar (hidden on mobile) - truly centered */}
            <div className="hidden md:block w-2xl">
              <SearchBar />
            </div>

            {/* RIGHT: User Actions */}
            <div className="flex items-center justify-end gap-4">
              {/* Mobile search icon (only icon < md) */}
              <div className="md:hidden">
                <SearchBar
                  isMobile={true}
                  isExpanded={isMobileSearchOpen}
                  onToggle={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                />
              </div>

              {/* Mobile menu button for nav links */}
              <div className="xl:hidden">
                <button
                  aria-label="Open menu"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-3 text-white hover:text-accent-primary transition"
                >
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Login Button or User Profile Dropdown */}
              {user ? (
                <div className="relative" ref={userPanelRef}>
                  <button
                    onClick={() => setIsUserModalOpen(!isUserModalOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
                  >
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="hidden lg:inline text-sm font-medium text-white">
                      {user.name}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                        isUserModalOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <UserModal
                    show={isUserModalOpen}
                    userName={user.name}
                    onLogout={handleLogout}
                    onClose={() => setIsUserModalOpen(false)}
                  />
                </div>
              ) : (
                <a href={GOOGLE_LOGIN_URL}>
                  <button className="flex items-center bg-accent-secondary hover:bg-accent-primary text-white font-semibold px-4 lg:px-6 py-2 rounded-full transition cursor-pointer whitespace-nowrap">
                    <FaRegUser className="mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Log in</span>
                  </button>
                </a>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile search overlay */}
      {isMobileSearchOpen && (
        <SearchBar
          isMobile={true}
          isExpanded={true}
          onToggle={() => setIsMobileSearchOpen(false)}
        />
      )}

      {/* Mobile nav drawer — Headless UI Dialog for correct iOS scroll lock */}
      <Transition.Root show={isMobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-(--z-dialog)"
          onClose={() => setIsMobileMenuOpen(false)}
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>

          {/* Drawer panel */}
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-[250ms]"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel
              as="aside"
              className="fixed inset-y-0 left-0 w-72 max-w-[calc(100vw-3rem)] bg-gray-900/95 backdrop-blur-lg border-r border-gray-700 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <button
                  aria-label="Close menu"
                  autoFocus
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 text-gray-300 hover:text-white transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full text-left text-base font-medium text-white hover:text-accent-primary transition"
                >
                  <FontAwesomeIcon icon={faHouse} className="text-sm w-5" />
                  Home
                </Link>
                <Link
                  to="/lists"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full text-left text-base font-medium text-white hover:text-accent-primary transition"
                >
                  <FontAwesomeIcon icon={faListUl} className="text-sm w-5" />
                  My Lists
                </Link>

                <div>
                  <button
                    onClick={() => setShowMobileGenres((p) => !p)}
                    className="flex items-center justify-between w-full text-left text-base font-medium text-white hover:text-accent-primary transition"
                    aria-expanded={showMobileGenres}
                    aria-controls="mobile-genres-panel"
                  >
                    <span className="flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={faMasksTheater}
                        className="text-sm w-5"
                      />
                      Genres
                    </span>
                    <svg
                      className={`w-5 h-5 transform transition ${
                        showMobileGenres ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showMobileGenres && (
                    <div
                      id="mobile-genres-panel"
                      className="mt-3 max-h-72 overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
                    >
                      <GenreList genres={genres} />
                    </div>
                  )}
                </div>
              </nav>

              <div className="px-5 py-4 border-t border-gray-700">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {user.picture && (
                        <img
                          src={user.picture}
                          alt="Profile"
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-green-500 font-medium">
                        {user.name}
                      </span>
                    </div>
                    <button
                      onClick={() => logout()}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-full transition"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <a href={GOOGLE_LOGIN_URL} className="block">
                    <button className="w-full flex items-center justify-center bg-accent-secondary hover:bg-accent-primary text-white font-semibold px-4 py-2 rounded-full transition">
                      <FaRegUser className="mr-2" />
                      Login
                    </button>
                  </a>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
    </>
  );
}
