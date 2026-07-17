import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AC_SOCKET_EVENT } from "../../context/SocketContext";
import { getAlumniConnectionsApi } from "../../api/connectionApi";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const IconDashboard = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconJobs = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const IconEvents = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconMessages = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconUsers = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconBell = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconProfile = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconLogout = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconGradCap = () => (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
  </svg>
);
const IconChevronRight = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconChevronLeft = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconMenu = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// ── Nav items point directly to role-specific paths ───────────────────────────
// This avoids the /dashboard → /student/dashboard double-redirect flicker.
const studentNav: NavItem[] = [
  { label: "Dashboard", path: "/student/dashboard", icon: <IconDashboard /> },
  { label: "Jobs", path: "/jobs", icon: <IconJobs /> },
  { label: "Events", path: "/events", icon: <IconEvents /> },
  { label: "Messages", path: "/messages", icon: <IconMessages /> },
  { label: "Alumni", path: "/alumni", icon: <IconUsers /> },
  { label: "Profile", path: "/profile", icon: <IconProfile /> },
  { label: "Notifications", path: "/notifications", icon: <IconBell /> },
];

const alumniNav: NavItem[] = [
  { label: "Dashboard", path: "/alumni/dashboard", icon: <IconDashboard /> },
  { label: "Post Jobs", path: "/jobs", icon: <IconJobs /> },
  { label: "Events", path: "/events", icon: <IconEvents /> },
  { label: "Messages", path: "/messages", icon: <IconMessages /> },
  { label: "Students", path: "/students", icon: <IconUsers /> },
  { label: "Profile", path: "/profile", icon: <IconProfile /> },
  { label: "Notifications", path: "/notifications", icon: <IconBell /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: <IconDashboard /> },
  { label: "Users", path: "/admin/users", icon: <IconUsers /> },
  { label: "Jobs", path: "/admin/jobs", icon: <IconJobs /> },
  { label: "Events", path: "/admin/events", icon: <IconEvents /> },
];

// ── Extracted as a module-level component (NOT defined inside Sidebar) ────────
// Defining it inside Sidebar caused React to treat it as a new component type
// on every render, fully unmounting/remounting it and causing the flicker.
interface SidebarContentProps {
  user: ReturnType<typeof useAuth>["user"];
  navItems: NavItem[];
  pendingStudentRequests: number;
  onNavigate: () => void;
  onLogout: () => void;
}

const SidebarContent = ({
  user,
  navItems,
  pendingStudentRequests,
  onNavigate,
  onLogout,
}: SidebarContentProps) => (
  <aside className="w-64 min-h-screen bg-[#1e3a6e] flex flex-col h-full">
    {/* Logo */}
    <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
      <div className="flex items-center gap-2.5">
        <IconGradCap />
        <span className="text-white font-bold text-lg tracking-wide">
          Alumni Connect
        </span>
      </div>
    </div>

    {/* User info */}
    <Link
      to="/profile"
      onClick={onNavigate}
      className="flex items-center gap-3 px-5 py-4 border-b border-white/10 hover:bg-white/5 transition-colors"
    >
      <div className="w-9 h-9 rounded-full bg-[#d2621a] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
        {user?.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          user?.name?.charAt(0).toUpperCase() || "U"
        )}
      </div>
      <div className="min-w-0">
        <p className="text-white text-sm font-semibold truncate">
          {user?.name}
        </p>
        <p className="text-blue-200 text-xs capitalize">{user?.role}</p>
      </div>
    </Link>

    {/* Nav */}
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? "bg-white/15 text-white"
                : "text-blue-200 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          {item.icon}
          <span className="flex-1">{item.label}</span>
          {item.path === "/students" && pendingStudentRequests > 0 && (
            <span
              className="min-w-[1.25rem] rounded-full bg-[#d2621a] px-1.5 py-0.5 text-center text-[10px] font-bold text-white"
              title="Pending connection requests"
            >
              {pendingStudentRequests > 9 ? "9+" : pendingStudentRequests}
            </span>
          )}
        </NavLink>
      ))}
    </nav>

    {/* Logout */}
    <div className="px-3 py-4 border-t border-white/10">
      <Link
        to="/login"
        onClick={onLogout}
        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-all duration-150"
      >
        <IconLogout />
        Logout
      </Link>
    </div>
  </aside>
);

// ── Sidebar shell (handles mobile state only) ─────────────────────────────────
const Sidebar = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingStudentRequests, setPendingStudentRequests] = useState(0);

  useEffect(() => {
    if (user?.role !== "alumni") {
      setPendingStudentRequests(0);
      return;
    }
    const load = () => {
      getAlumniConnectionsApi()
        .then((d) => setPendingStudentRequests(d.pending.length))
        .catch(() => setPendingStudentRequests(0));
    };
    load();
    window.addEventListener(AC_SOCKET_EVENT, load);
    return () => window.removeEventListener(AC_SOCKET_EVENT, load);
  }, [user?.role]);

  const navItems =
    user?.role === "admin"
      ? adminNav
      : user?.role === "alumni"
        ? alumniNav
        : studentNav;

  const closeOnMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeOnMobile();
  };

  const sharedProps = {
    user,
    navItems,
    pendingStudentRequests,
    onNavigate: closeOnMobile,
    onLogout: handleLogout,
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 z-30 h-screen w-64">
        <SidebarContent {...sharedProps} />
      </div>

      {/* Mobile: collapsed tab */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-[#1e3a6e] text-white px-1.5 py-4 rounded-r-xl shadow-lg flex flex-col items-center gap-2"
          aria-label="Open sidebar"
        >
          <IconMenu />
          <span className="text-[10px] font-semibold tracking-wide [writing-mode:vertical-lr] rotate-180">
            MENU
          </span>
          <IconChevronRight />
        </button>
      )}

      {/* Mobile: backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile: drawer */}
      <div
        className={`md:hidden fixed left-0 top-0 z-50 h-full transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <SidebarContent {...sharedProps} />
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-1/2 -translate-y-1/2 -right-6 bg-[#1e3a6e] text-white px-1.5 py-4 rounded-r-xl shadow-lg flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <IconChevronLeft />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
