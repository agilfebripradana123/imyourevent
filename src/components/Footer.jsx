import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container-app">
        <div
          className="
            grid
            gap-10
            py-12
            sm:grid-cols-2
            lg:grid-cols-[1.5fr_1fr_1fr]
          "
        >
          {/* Brand */}
          <div className="max-w-sm">
            <Link to="/" className="flex items-center">
              <img
                src="/assets/imyourevent-logo.png"
                alt="I'm Your Event"
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="mt-4 text-sm leading-7 text-muted">
              Temukan event menarik, pesan tiket dengan mudah, dan kelola semua
              tiketmu dalam satu tempat.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-heading">Navigasi</h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/"
                className="text-sm text-muted transition hover:text-primary"
              >
                Beranda
              </Link>

              <Link
                to="/events"
                className="text-sm text-muted transition hover:text-primary"
              >
                Event
              </Link>

              <Link
                to="/my-tickets"
                className="text-sm text-muted transition hover:text-primary"
              >
                Tiket Saya
              </Link>

              <Link
                to="/about"
                className="text-sm text-muted transition hover:text-primary"
              >
                Tentang
              </Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-heading">Akun</h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/login"
                className="text-sm text-muted transition hover:text-primary"
              >
                Masuk
              </Link>

              <Link
                to="/register"
                className="text-sm text-muted transition hover:text-primary"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-border
            py-6
            text-sm
            text-muted
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>© {currentYear} IMYOUR event. All rights reserved.</p>

          <p>Temukan. Pesan. Hadiri.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
