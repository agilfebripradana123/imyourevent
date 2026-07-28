import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const location = useLocation();
  const { user, profile, isAdmin, loading, logout } = useAuth();
  const username =
    profile?.username ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "User";

  // =========================
  // NAVIGATION
  // =========================
  const navLinks = [
    {
      label: "Beranda",
      path: "/",
    },
    {
      label: "Event",
      path: "/events",
    },
    {
      label: "Tiket Saya",
      path: "/my-tickets",
    },
    {
      label: "Tentang",
      path: "/about",
    },
  ];

  const checkActive = (path) => {
    const currentPath = location.pathname;

    if (path === "/") {
      return currentPath === "/";
    }

    if (path === "/events") {
      return (
        currentPath.startsWith("/events") || currentPath.startsWith("/booking")
      );
    }

    if (path === "/my-tickets") {
      return currentPath.startsWith("/my-tickets");
    }

    if (path === "/about") {
      return currentPath === "/about";
    }

    return false;
  };

  const navClass = (path) => {
    const active = checkActive(path);

    return `
      rounded-full
      px-4
      py-2
      text-sm
      font-medium
      transition-all
      duration-300

      ${
        active
          ? "bg-gradient-to-r from-primary to-violet text-white shadow-[0_0_20px_rgba(232,62,156,0.35)]"
          : "text-white/80 hover:bg-white/5 hover:text-white"
      }
    `;
  };

  // =========================
  // MOBILE MENU
  // =========================
  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // =========================
  // LOGOUT
  // =========================
  const openLogoutModal = () => {
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    if (!logoutLoading) {
      setShowLogoutModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      const success = await logout();

      if (success) {
        setShowLogoutModal(false);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Logout gagal:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <>
      <header className="absolute left-0 top-0 z-50 w-full">
        <div className="container-app">
          {/* =========================
              NAVBAR
          ========================== */}
          <div className="flex h-20 items-center justify-between">
            {/* LOGO */}
            <Link to="/" onClick={closeMenu} className="shrink-0">
              <img
                src="/assets/imyourevent-logo.png"
                alt="I'm Your Event"
                className="
                  h-9
                  w-auto
                  max-w-[150px]
                  object-contain
                  sm:h-10
                  sm:max-w-[180px]
                "
              />
            </Link>

            {/* =========================
                DESKTOP MENU
            ========================== */}
            <nav className="hidden items-center gap-2 md:flex">
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={() => navClass(item.path)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* =========================
                DESKTOP AUTH
            ========================== */}
            <div className="hidden items-center gap-3 md:flex">
              {!loading &&
                (user ? (
                  <>
                    {/* USER */}
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-full
                        border
                        border-white/10
                        bg-white/5
                        px-3
                        py-2
                        backdrop-blur-sm
                      "
                    >
                      {/* AVATAR */}
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-gradient-to-br
                          from-primary
                          to-violet
                          text-xs
                          font-bold
                          text-white
                        "
                      >
                        {username.charAt(0).toUpperCase()}
                      </div>

                      <span
                        className="
                          max-w-[130px]
                          truncate
                          text-sm
                          font-medium
                          text-white
                        "
                      >
                        {username}
                      </span>
                    </div>

                    {/* LOGOUT */}
                    <button
                      type="button"
                      onClick={openLogoutModal}
                      className="
                        rounded-full
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-white/70
                        transition
                        hover:bg-white/5
                        hover:text-white
                      "
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    {/* LOGIN */}
                    <Link
                      to="/login"
                      className={`
                        px-3
                        py-2
                        text-sm
                        font-medium
                        transition

                        ${
                          location.pathname === "/login"
                            ? "text-primary"
                            : "text-white/80 hover:text-white"
                        }
                      `}
                    >
                      Masuk
                    </Link>

                    {/* REGISTER */}
                    <Link
                      to="/register"
                      className={`
                        rounded-full
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-white
                        backdrop-blur-sm
                        transition

                        ${
                          location.pathname === "/register"
                            ? "bg-primary"
                            : "bg-white/10 hover:bg-white/20"
                        }
                      `}
                    >
                      Daftar
                    </Link>
                  </>
                ))}
            </div>

            {/* =========================
                MOBILE HAMBURGER
            ========================== */}
            <button
              type="button"
              onClick={toggleMenu}
              className="
                relative
                z-[60]
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                text-white
                transition
                hover:bg-white/10
                md:hidden
              "
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isOpen}
            >
              <div className="relative h-5 w-5">
                {/* TOP */}
                <span
                  className={`
                    absolute
                    left-0
                    h-[2px]
                    w-5
                    rounded-full
                    bg-white
                    transition-all
                    duration-300

                    ${isOpen ? "top-[9px] rotate-45" : "top-[3px]"}
                  `}
                />

                {/* MIDDLE */}
                <span
                  className={`
                    absolute
                    left-0
                    top-[9px]
                    h-[2px]
                    w-5
                    rounded-full
                    bg-white
                    transition-all
                    duration-300

                    ${
                      isOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
                    }
                  `}
                />

                {/* BOTTOM */}
                <span
                  className={`
                    absolute
                    left-0
                    h-[2px]
                    w-5
                    rounded-full
                    bg-white
                    transition-all
                    duration-300

                    ${isOpen ? "top-[9px] -rotate-45" : "top-[15px]"}
                  `}
                />
              </div>
            </button>
          </div>

          {/* =========================
              MOBILE DROPDOWN
          ========================== */}
          {isOpen && (
            <div
              className="
                relative
                z-50
                overflow-hidden
                rounded-card
                border
                border-white/10
                bg-surface/95
                p-4
                shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                backdrop-blur-xl
                md:hidden
              "
            >
              {/* MENU */}
              <nav className="flex flex-col gap-1">
                {navLinks.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={() => navClass(item.path)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              {/* =========================
                  MOBILE AUTH
              ========================== */}
              {!loading && (
                <div className="mt-4 border-t border-border pt-4">
                  {user ? (
                    <div>
                      {/* USER INFO */}
                      <div
                        className="
                          mb-3
                          flex
                          items-center
                          gap-3
                          rounded-input
                          border
                          border-white/5
                          bg-white/5
                          p-3
                        "
                      >
                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-gradient-to-br
                            from-primary
                            to-violet
                            text-sm
                            font-bold
                            text-white
                          "
                        >
                          {username.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {username}
                          </p>

                          <p className="truncate text-xs text-muted">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* MOBILE LOGOUT */}
                      <button
                        type="button"
                        onClick={openLogoutModal}
                        className="
                          w-full
                          rounded-button
                          border
                          border-border
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:border-danger
                          hover:bg-danger/5
                          hover:text-danger
                        "
                      >
                        Keluar
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to="/login"
                        onClick={closeMenu}
                        className="
                          rounded-button
                          border
                          border-border
                          py-2.5
                          text-center
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:border-primary
                        "
                      >
                        Masuk
                      </Link>

                      <Link
                        to="/register"
                        onClick={closeMenu}
                        className="
                          rounded-button
                          bg-primary
                          py-2.5
                          text-center
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-primary-hover
                        "
                      >
                        Daftar
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* =========================
          LOGOUT CONFIRMATION MODAL
      ========================== */}
      {showLogoutModal && (
        <div
          className="
            fixed
            inset-0
            z-[999]
            flex
            items-center
            justify-center
            px-4
          "
        >
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Tutup konfirmasi logout"
            onClick={closeLogoutModal}
            className="
              absolute
              inset-0
              cursor-default
              bg-black/70
              backdrop-blur-sm
            "
          />

          {/* MODAL */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="
              relative
              z-10
              w-full
              max-w-md
              overflow-hidden
              rounded-card
              border
              border-border
              bg-card
              p-6
              shadow-[0_25px_80px_rgba(0,0,0,0.55)]
              sm:p-7
            "
          >
            {/* GLOW */}
            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-40
                w-40
                rounded-full
                bg-danger/10
                blur-[70px]
              "
            />

            {/* ICON */}
            <div
              className="
                relative
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-danger/20
                bg-danger/10
                text-danger
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              </svg>
            </div>

            {/* CONTENT */}
            <div className="relative mt-5">
              <h2 id="logout-title" className="text-xl font-bold text-heading">
                Keluar dari akun?
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Kamu yakin ingin keluar dari akun I'm Your Event? Kamu perlu
                masuk kembali untuk mengakses tiket dan melakukan pemesanan.
              </p>
            </div>

            {/* USER INFO */}
            {user && (
              <div
                className="
                  relative
                  mt-5
                  flex
                  items-center
                  gap-3
                  rounded-input
                  border
                  border-border
                  bg-surface
                  p-3
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-primary
                    to-violet
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  {username.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-heading">
                    {username}
                  </p>

                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="relative mt-7 grid grid-cols-2 gap-3">
              {/* CANCEL */}
              <button
                type="button"
                disabled={logoutLoading}
                onClick={closeLogoutModal}
                className="
                  rounded-button
                  border
                  border-border
                  bg-surface
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-heading
                  transition
                  hover:border-white/20
                  hover:bg-white/5
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Batal
              </button>

              {/* CONFIRM */}
              <button
                type="button"
                disabled={logoutLoading}
                onClick={handleLogout}
                className="
                  rounded-button
                  bg-danger
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:brightness-110
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {logoutLoading ? "Keluar..." : "Ya, Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
