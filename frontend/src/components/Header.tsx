import { Link } from "react-router-dom";
import logo from "../assets/react.svg";
const Header = () => {
  return (
    <div className="wrapper bg-blue-950 p-4">
      <div className="mx-auto max-w-screen-xl flex items-center justify-between">

        {/* Left section (logo + name) */}
        <div className="flex gap-4">
          <img src={logo} alt="logo" className="h-8 w-8 hover:rotate-210 transition duration-450" />
          <p className="text-2xl font-bold text-blue-300">MovieBucket</p>
        </div>

        {/* Center section (nav) */}
        <div className="hidden md:flex gap-8 text-white text-lg font-semibold">
          <Link to="/" className="movies hover:text-sky-300 hover:scale-110 transition duration-150">Movies</Link>
          <Link to="/shows" className="shows hover:text-sky-300 hover:scale-110 transition duration-150">Shows</Link>
        </div>

        {/* Right section (search + login + register) */}
        <div className="flex items-center gap-4 text-white">
          <div className="search-icon">🔍Search</div>
          <div className="hidden sm:block login hover:text-sky-300 hover:scale-110 transition duration-150">Login</div>
          <div className="hidden sm:block register hover:text-sky-300 hover:scale-110 transition duration-150">Register</div>
        </div>

      </div>
    </div>
  );
};

export default Header;
