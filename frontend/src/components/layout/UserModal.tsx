import { Link } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

interface UserModalProps {
  userName: string;
  onLogout: () => void;
  show: boolean;
}

export const UserModal = ({ userName, onLogout, show }: UserModalProps) => {
  return (
    <div
      className={`absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-2xl py-3 z-50 border border-gray-700
        transition-all duration-300 ease-out origin-top-right
        ${show
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
    >
      <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700/50 mb-1">
        {userName}
      </div>
      <Link
        to="/lists"
        className="block px-4 py-2 text-sm text-gray-200 hover:bg-sky-500/20 hover:text-white transition-colors"
      >
        Lists
      </Link>
      <button
        onClick={onLogout}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-sky-500/20 hover:text-white transition-colors cursor-pointer"
      >
        <FaSignOutAlt className="mr-2" />
        Sign Out
      </button>
    </div>
  );
};
