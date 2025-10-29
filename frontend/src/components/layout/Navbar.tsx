import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/react.svg";
import { FaRegUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import SearchBar from "../layout/SearchBar";
import "../../style/TitleHover.css";
import GenreList from "../filters/GenreList";
import axios from "axios";
import { GOOGLE_LOGIN_URL } from "../../lib/config";
import { toast } from 'react-hot-toast';

type Genre = {
  id: number;
  name: string;
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [showGenres, setShowGenres] = useState(false); // desktop hover dropdown
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // NEW
  const [showMobileGenres, setShowMobileGenres] = useState(false); // NEW

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieGenreRes, tvGenreRes] = await Promise.all([
          axios.get(
            `${
              import.meta.env.VITE_BACKEND_API_URL
            }/api/Movies/genre/movie/list`
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_API_URL}/api/Movies/genre/tv/list`
          ),
        ]);

        const allGenres = [
          ...movieGenreRes.data.genres,
          ...tvGenreRes.data.genres,
        ];
        const uniqueGenres = allGenres.filter(
          (genre, index, self) =>
            index === self.findIndex((g) => g.id === genre.id)
        );

        setGenres(uniqueGenres);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };

    fetchGenres();
  }, []);

  const navigate = useNavigate();
  const handleSelectGenre = (genre: Genre) => {
    navigate(`/discover?genre=${genre.id}`);
    setShowGenres(false);
    setIsMobileMenuOpen(false); // close drawer on mobile
    setShowMobileGenres(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-colors duration-700 ease-in-out
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
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <span
                  aria-label="logo"
                  role="img"
                  className="h-8 w-8 inline-block bg-gradient-to-r from-accent-primary to-accent-secondary hover:rotate-210 transition duration-450"
                  style={{
                    WebkitMaskImage: `url(${logo})`,
                    maskImage: `url(${logo})`,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }}
                />
                <h1 className="text-xl lg:text-2xl font-bold whitespace-nowrap">
                  <span className="text-white">Movie</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
                    Bucket
                  </span>
                </h1>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden xl:flex items-center gap-6">
                <Link to="/my-list">
                  <span className="underline-hover !text-base !font-semibold !mb-0 whitespace-nowrap">
                    My List
                    <span className="underline-bar"></span>
                  </span>
                </Link>

                <div
                  className="relative"
                  onMouseEnter={() => setShowGenres(true)}
                  onMouseLeave={() => setShowGenres(false)}
                >
                  <div className="underline-hover !text-base !font-semibold !mb-0 cursor-pointer">
                    Genres
                    <span className="underline-bar"></span>
                  </div>

                  {showGenres && (
                    <div className="absolute left-0 top-full pt-2 z-[100]">
                      <div className="w-96 bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl p-6 shadow-2xl">
                        <GenreList
                          genres={genres}
                          onGenreSelect={handleSelectGenre}
                        />
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
                  className="p-2 text-white hover:text-accent-primary transition"
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

              {/* Login Button */}
              <a href={GOOGLE_LOGIN_URL}>
                <button className="flex items-center bg-accent-secondary hover:bg-accent-primary text-white font-semibold px-4 lg:px-6 py-2 rounded-full transition cursor-pointer whitespace-nowrap">
                  <FaRegUser className="mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Login</span>


                </button>
              </a>
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

      {/* Mobile nav drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[140]"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside
            className="fixed inset-y-0 left-0 w-72 bg-gray-900/95 backdrop-blur-lg border-r border-gray-700 z-[150] flex flex-col shadow-2xl animate-[slideIn_.25s_ease]"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                aria-label="Close menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-300 hover:text-white transition"
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
                to="/my-list"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left text-base font-medium text-white hover:text-accent-primary transition"
              >
                My List
              </Link>

              <div>
                <button
                  onClick={() => setShowMobileGenres((p) => !p)}
                  className="flex items-center justify-between w-full text-left text-base font-medium text-white hover:text-accent-primary transition"
                  aria-expanded={showMobileGenres}
                  aria-controls="mobile-genres-panel"
                >
                  <span>Genres</span>
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
                    <GenreList
                      genres={genres}
                      onGenreSelect={handleSelectGenre}
                    />
                  </div>
                )}
              </div>
            </nav>

            <div className="px-5 py-4 border-t border-gray-700">
              <a href={GOOGLE_LOGIN_URL} className="block">
                <button className="w-full flex items-center justify-center bg-accent-secondary hover:bg-accent-primary text-white font-semibold px-4 py-2 rounded-full transition">
                  <FaRegUser className="mr-2" />
                  Login
                </button>
              </a>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
