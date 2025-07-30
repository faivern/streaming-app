import { Link } from "react-router-dom";
import logo from "../../assets/react.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FaRegUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import SearchBar from "../layout/SearchBar";
import "../../style/TitleHover.css";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full p-4 backdrop-blur-lg transition-colors duration-700 ease-in-out
      ${
        isScrolled
          ? "bg-gradient-to-r from-blue-950 via-blue-900 to-blue-900 shadow-md shadow-blue-900/50"
          : "bg-gradient-to-b from-blue-950/90 via-blue-900/60 to-transparent"
      }`}
    >
      <nav className="flex items-center justify-between w-full mx-auto">
        
        {/* LEFT SIDE: Logo + Nav Links */}
        <div className="flex items-center gap-2">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="logo"
              className="h-8 w-8 hover:rotate-210 transition duration-450"
            />
            <h1 className="text-2xl font-bold whitespace-nowrap">
              <span className="text-white">Movie</span>
              <span className="text-blue-300">Bucket</span>
            </h1>
          </Link>

          {/* Nav Links - Very close to logo */}
          <div className="hidden lg:flex items-center ml-6 gap-6">
            <Link to="/my-list">
              <span className="underline-hover !text-base !font-semibold !mb-0">
                My list
                <span className="underline-bar"></span>
              </span>
            </Link>
            <Link to="/movies">
              <span className="underline-hover !text-base !font-semibold !mb-0">
                Movies
                <span className="underline-bar"></span>
              </span>
            </Link>
            <Link to="/shows">
              <span className="underline-hover !text-base !font-semibold !mb-0">
                Shows
                <span className="underline-bar"></span>
              </span>
            </Link>
            <Link to="/genres">
              <span className="underline-hover !text-base !font-semibold !mb-0">
                Genres
                <span className="underline-bar"></span>
              </span>
            </Link>
          </div>
        </div>

        {/* CENTER: Search Bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <SearchBar />
        </div>

        {/* RIGHT SIDE: Login Button */}
          <button className="flex items-center bg-blue-500/80 hover:bg-sky-400 text-white font-semibold px-6 py-2 rounded-full transition cursor-pointer">
          {/*person silouette icon */}
          <FaRegUser className="mr-1" />
            Login
          </button>

      </nav>
    </header>
  );
}
