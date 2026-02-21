import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faListUl, faUser } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../../hooks/user/useUser";
import { GOOGLE_LOGIN_URL } from "../../lib/config";

export default function BottomNav() {
  const { data: user } = useUser();

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-(--z-sticky) bg-primary/95 backdrop-blur-lg border-t border-gray-700 pb-safe-or-4"
    >
      <div className="flex items-center justify-around h-16">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors ${
              isActive ? "text-accent-primary" : "text-gray-400 hover:text-white"
            }`
          }
        >
          <FontAwesomeIcon icon={faHouse} className="text-lg" />
          <span>Home</span>
        </NavLink>

        {/* My Lists */}
        <NavLink
          to="/lists"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors ${
              isActive ? "text-accent-primary" : "text-gray-400 hover:text-white"
            }`
          }
        >
          <FontAwesomeIcon icon={faListUl} className="text-lg" />
          <span>My Lists</span>
        </NavLink>

        {/* Profile / Login */}
        {user ? (
          <div className="flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium text-gray-400">
            <img
              src={user.picture ?? ""}
              alt=""
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>Profile</span>
          </div>
        ) : (
          <a
            href={GOOGLE_LOGIN_URL}
            className="flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faUser} className="text-lg" />
            <span>Log in</span>
          </a>
        )}
      </div>
    </nav>
  );
}
