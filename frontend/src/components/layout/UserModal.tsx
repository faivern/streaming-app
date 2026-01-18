import { Link } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

interface UserModalProps {
  userName: string;
  onLogout: () => void;
  show: boolean;
}

export const UserModal = ({ userName, onLogout, show }: UserModalProps) => {
  if (!show) {
    return null;
  }

  return (
    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-accent-primary/75">
      <div className="px-4 py-2 text-sm text-gray-400">{userName}</div>
      <Link
        to="/watchlist"
        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
      >
        Watch List
      </Link>
      <button
        onClick={onLogout}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer"
      >
        <FaSignOutAlt className="mr-2" />
        Sign Out
      </button>
    </div>
  );
};
