import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../ui/NotificationBell"; // NEW

interface NavbarProps {
  title: string;
  sidebarWidth?: string; // optional, default "left-64"
  isSidebarOpen?: boolean;
  onMenuClick?: () => void;
}

const Navbar = ({
  title,
  sidebarWidth = "lg:left-64",
  isSidebarOpen,
  onMenuClick,
}: NavbarProps) => {
  const { user } = useAuth();

  return (
    <header
      className={`
        h-14 bg-white border-b border-gray-200
        flex items-center justify-between px-4 sm:px-6
        fixed top-0 right-0 z-20
        left-0 ${sidebarWidth}
        transition-all duration-300
      `}
    >
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — only visible on mobile/tablet */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex-shrink-0 p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        <h1 className="text-gray-800 font-semibold text-sm sm:text-base truncate">
          {title}
        </h1>
      </div>

      {/* Right: user info */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Notification Bell - NEW */}
        <NotificationBell />

        {/* Email — hidden on very small screens */}
        <span className="hidden sm:block text-sm text-gray-500 truncate max-w-[160px] md:max-w-xs">
          {user?.email}
        </span>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#1e3a6e] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
