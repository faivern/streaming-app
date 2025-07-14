import { Link } from "react-router-dom";
import logo from "../../assets/react.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full p-4 backdrop-blur-lg transition-colors duration-400 ease-linear
      ${isScrolled 
        // gradient background color
        ? "bg-gradient-to-r from-blue-950 via-blue-900 to-blue-900 shadow-md shadow-blue-900/50" 
        : "bg-gradient-to-b from-blue-950/90 via-blue-900/60 to-transparent"
      }`}
    >
      <nav className="mx-auto max-w-screen-xl flex items-center justify-between">
          <Link to="/">
        {/* Left: Logo */}
        <div className="flex gap-4">
          
          <img src={logo} alt="logo" className="h-8 w-8 hover:rotate-210 transition duration-450" />

            <h1 className="text-2xl font-bold">
            <span className="text-white">Movie</span>
            <span className="text-blue-300">Bucket</span>
            </h1>
        </div>
          </Link>

      <div className="gap-8 hidden sm:flex items-center">
          <label className="flex items-center gap-2">
            <span className="sr-only">Search</span>
            <FontAwesomeIcon icon={faSearch} size="lg" className="text-gray-400 hover:text-sky-300 transition duration-150" />
          <input
            type="text"
            placeholder="Search movies or shows..."
            className="bg-white/10 text-white placeholder-gray-400 rounded-full px-4 py-2 w-40 focus:w-64 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>
            </div>

        {/* Right: Search + Auth */}
        <div className="flex items-center gap-4 text-white">
          <button className="hidden sm:block bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-1 rounded-md transition cursor-pointer">
  Login
</button>
<button className="hidden sm:block border border-sky-500 text-sky-300 hover:bg-sky-500/20 font-semibold px-4 py-1 rounded-md transition cursor-pointer">
  Register
</button>

        </div>
      </nav>
    </header>
  );
}
