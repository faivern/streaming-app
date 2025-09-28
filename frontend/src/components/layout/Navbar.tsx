import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/react.svg";
import { FaRegUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import SearchBar from "../layout/SearchBar";
import "../../style/TitleHover.css";
import GenreList from "../filters/GenreList";
import axios from "axios";

type Genre = {
  id: number;
  name: string;
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [showGenres, setShowGenres] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
          {/* Three-column grid layout spanning full width */}
          <nav className="grid grid-cols-[auto_1fr_auto] items-center py-4 gap-8 xl:gap-12">
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

            {/* CENTER: Search Bar - Takes remaining space, perfectly centered */}
            <div className="w-xl md:w-md absolute left-1/2 transform -translate-x-1/2">
              <SearchBar />
            </div>

            {/* RIGHT: User Actions */}
            <div className="flex items-center justify-end gap-4">
              {/* Mobile search icon */}
              <div className="md:hidden">
                <SearchBar
                  isMobile={true}
                  isExpanded={isMobileSearchOpen}
                  onToggle={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                />
              </div>

              {/* Mobile menu button for nav links */}
              <div className="xl:hidden">
                <button className="p-2 text-white hover:text-blue-300 transition">
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
              {/* Login Button */}
              <a href="https://localhost:7124/auth/google">
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
    </>
  );
}
