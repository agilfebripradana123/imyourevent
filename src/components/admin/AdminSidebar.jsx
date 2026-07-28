import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminSidebar({ isOpen, onClose }) {
  const { profile } = useAuth();

  const menu = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: "ri-dashboard-line",
      end: true,
    },
    {
      label: "Kelola Event",
      path: "/admin/events",
      icon: "ri-calendar-event-line",
    },
    {
      label: "Pesanan",
      path: "/admin/bookings",
      icon: "ri-ticket-2-line",
    },
    {
      label: "Pengguna",
      path: "/admin/users",
      icon: "ri-user-3-line",
    },
  ];

  const menuClass = ({ isActive }) =>
    `flex items-center rounded-input px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-primary text-white"
        : "text-muted hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup menu admin"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-72
          border-r border-border
          bg-card
          transition-transform duration-300
          lg:w-64
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-border px-5">
            <Link to="/admin" onClick={onClose} className="flex items-center">
              <img
                src="/assets/imyourevent-logo.png"
                alt="I'm Your Event"
                className="h-9 w-auto"
              />
            </Link>

            {/* Close Mobile */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-muted hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Tutup menu"
            >
              ×
            </button>
          </div>

          {/* Admin Profile */}
          <div className="border-b border-border p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Admin Panel
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                {profile?.username?.charAt(0).toUpperCase() || "A"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-heading">
                  @{profile?.username || "admin"}
                </p>

                <p className="text-xs text-muted">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {menu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={menuClass}
              >
                <i className={`${item.icon} mr-3 text-lg`}></i>

                {item.label}
              </NavLink>
            ))}
          </nav>
          {/* Back */}
          <div className="border-t border-border p-4">
            <Link
              to="/"
              onClick={onClose}
              className="
      flex
      items-center
      gap-3
      rounded-input
      px-4 py-3
      text-sm
      font-medium
      text-muted
      transition
      hover:bg-white/5
      hover:text-white
    "
            >
              <i className="ri-arrow-left-line text-lg"></i>
              Kembali ke Website
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
