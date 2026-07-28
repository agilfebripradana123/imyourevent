import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function MyTickets() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const bookingSuccess = location.state?.bookingSuccess;
  const ticketCode = location.state?.ticketCode;
  useEffect(() => {
    if (!bookingSuccess) return;

    // Tampilkan toast
    setShowSuccessToast(true);

    // Scroll ke paling atas
    window.scrollTo(0, 0);

    // Hilang otomatis setelah 3 detik
    const timer = setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [bookingSuccess]);
  // Scroll ke atas setelah berhasil booking
  useEffect(() => {
    if (bookingSuccess) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [bookingSuccess]);

  // fetch tickets...

  // =========================
  // FETCH TICKETS
  // =========================
  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const { data, error } = await supabase
          .from("bookings")
          .select(
            `
            *,
            event:events (
              id,
              title,
              image,
              date,
              location,
              category,
              price,
              status
            )
          `,
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        console.log("TICKETS:", data);

        setTickets(data ?? []);
      } catch (err) {
        console.error("Gagal mengambil tiket:", err);

        setError(err.message || "Tiket gagal dimuat. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchTickets();
    }
  }, [user, authLoading]);

  // =========================
  // FORMAT PRICE
  // =========================
  const formatPrice = (price) => {
    const numericPrice = Number(price);

    if (numericPrice === 0) {
      return "Gratis";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  };

  // =========================
  // STATUS STYLE
  // =========================
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "aktif":
      case "confirmed":
        return "border-success/20 bg-success/10 text-success";

      case "pending":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-500";

      case "cancelled":
      case "dibatalkan":
        return "border-danger/20 bg-danger/10 text-danger";

      case "selesai":
        return "border-border bg-white/5 text-muted";

      default:
        return "border-success/20 bg-success/10 text-success";
    }
  };

  // =========================
  // AUTH LOADING
  // =========================
  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <i className="ri-loader-4-line inline-block animate-spin text-3xl text-primary"></i>

          <p className="mt-4 text-sm text-muted">Memeriksa akun...</p>
        </div>
      </main>
    );
  }

  // =========================
  // NOT LOGIN
  // =========================
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-card border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <i className="ri-ticket-2-line text-2xl"></i>
          </div>

          <h1 className="mt-5 text-2xl font-bold text-heading">
            Login diperlukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            Masuk ke akunmu untuk melihat tiket event yang sudah kamu pesan.
          </p>

          <Link
            to="/login"
            state={{
              from: "/my-tickets",
            }}
            className="
              mt-6
              flex w-full
              items-center justify-center
              gap-2
              rounded-button
              bg-primary
              px-5 py-3
              text-sm font-semibold
              text-white
              transition
              hover:bg-primary-hover
            "
          >
            <i className="ri-login-box-line"></i>
            Masuk
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20 pt-32">
      <div className="container-app">
        {/* =========================
            SUCCESS NOTIFICATION
        ========================== */}
        {showSuccessToast && (
          <div
            className="
      fixed
      right-4
      top-24
      z-[9999]
      w-[calc(100%-2rem)]
      max-w-sm
      rounded-card
      border border-success/30
      bg-card
      p-4
      shadow-[0_20px_60px_rgba(0,0,0,0.35)]
      sm:right-6
    "
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className="
          flex h-10 w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-success/10
          text-success
        "
              >
                <i className="ri-checkbox-circle-fill text-xl"></i>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-heading">
                  Pemesanan berhasil!
                </p>

                <p className="mt-1 text-sm leading-5 text-muted">
                  Tiketmu berhasil dibuat dan sudah tersedia.
                </p>

                {ticketCode && (
                  <div className="mt-3 rounded-input bg-success/5 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      Kode Tiket
                    </p>

                    <p className="mt-0.5 font-mono text-sm font-semibold text-success">
                      {ticketCode}
                    </p>
                  </div>
                )}
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={() => setShowSuccessToast(false)}
                aria-label="Tutup notifikasi"
                className="
          flex h-8 w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          text-muted
          transition
          hover:bg-white/5
          hover:text-heading
        "
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          </div>
        )}

        {/* =========================
            HEADER
        ========================== */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <i className="ri-ticket-2-line text-lg"></i>
            Tiket Saya
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading md:text-4xl">
            Event yang Akan Kamu Hadiri
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
            Kelola dan lihat semua tiket event yang sudah kamu pesan.
          </p>
        </div>

        {/* =========================
            TICKET COUNT
        ========================== */}
        <div
          className="
            mt-10
            flex
            flex-col
            gap-4
            border-b border-border
            pb-5
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <h2 className="text-xl font-semibold text-heading">Tiket Saya</h2>

            {!loading && !error && (
              <p className="mt-1 text-sm text-muted">
                <span className="font-semibold text-heading">
                  {tickets.length}
                </span>{" "}
                pemesanan ditemukan
              </p>
            )}
          </div>

          <Link
            to="/events"
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              text-sm
              font-semibold
              text-primary
              transition
              hover:text-primary-hover
            "
          >
            Cari Event Lain
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>

        {/* =========================
            LOADING
        ========================== */}
        {loading && (
          <div className="mt-7 rounded-card border border-border bg-card px-6 py-16 text-center">
            <i className="ri-loader-4-line inline-block animate-spin text-3xl text-primary"></i>

            <p className="mt-4 text-sm text-muted">Memuat tiketmu...</p>
          </div>
        )}

        {/* =========================
            ERROR
        ========================== */}
        {!loading && error && (
          <div className="mt-7 rounded-card border border-danger/20 bg-danger/5 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
              <i className="ri-error-warning-line text-2xl"></i>
            </div>

            <h2 className="mt-4 text-xl font-semibold text-heading">
              Tiket gagal dimuat
            </h2>

            <p className="mt-2 text-sm text-muted">{error}</p>
          </div>
        )}

        {/* =========================
            TICKETS
        ========================== */}
        {!loading && !error && tickets.length > 0 && (
          <div className="mt-7 grid gap-5">
            {tickets.map((ticket) => {
              const event = ticket.event;

              if (!event) return null;

              return (
                <article
                  key={ticket.id}
                  className="
                    group
                    overflow-hidden
                    rounded-card
                    border border-border
                    bg-card
                    transition-all
                    duration-300
                    hover:border-primary/30
                    hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]
                  "
                >
                  <div className="grid md:grid-cols-[240px_minmax(0,1fr)_auto]">
                    {/* =====================
                        IMAGE
                    ====================== */}
                    <div className="relative h-52 overflow-hidden md:h-full md:min-h-[230px]">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-500
                          group-hover:scale-105
                        "
                      />

                      <div
                        className="
                          pointer-events-none
                          absolute inset-0
                          bg-gradient-to-t
                          from-black/50
                          via-transparent
                          to-transparent
                          md:bg-gradient-to-r
                          md:from-transparent
                          md:to-card/20
                        "
                      />

                      <span
                        className="
                          absolute
                          left-4
                          top-4
                          rounded-full
                          border border-white/10
                          bg-black/50
                          px-3 py-1.5
                          text-xs
                          font-medium
                          text-white
                          backdrop-blur-md
                        "
                      >
                        {event.category}
                      </span>
                    </div>

                    {/* =====================
                        INFORMATION
                    ====================== */}
                    <div className="min-w-0 p-5 md:p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            px-3 py-1
                            text-xs
                            font-semibold
                            ${getStatusStyle(ticket.status)}
                          `}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />

                          {ticket.status}
                        </span>

                        <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
                          <i className="ri-qr-code-line"></i>
                          {ticket.ticket_code}
                        </span>
                      </div>

                      <h2
                        className="
                          mt-4
                          line-clamp-2
                          text-xl
                          font-bold
                          leading-7
                          text-heading
                          md:text-2xl
                        "
                      >
                        {event.title}
                      </h2>

                      <div className="mt-3 flex items-start gap-2 text-sm text-muted">
                        <i className="ri-map-pin-line mt-0.5 shrink-0 text-primary"></i>

                        <span>{event.location}</span>
                      </div>

                      {/* Information */}
                      <div
                        className="
                          mt-6
                          grid
                          gap-4
                          border-t
                          border-border
                          pt-5
                          sm:grid-cols-3
                        "
                      >
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-muted">
                            <i className="ri-calendar-line"></i>
                            Tanggal Event
                          </div>

                          <p className="mt-1.5 text-sm font-medium text-heading">
                            {formatDate(event.date)}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-muted">
                            <i className="ri-ticket-line"></i>
                            Jumlah
                          </div>

                          <p className="mt-1.5 text-sm font-medium text-heading">
                            {ticket.quantity} tiket
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-muted">
                            <i className="ri-wallet-3-line"></i>
                            Total
                          </div>

                          <p className="mt-1.5 text-sm font-semibold text-primary">
                            {formatPrice(ticket.total_price)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* =====================
                        ACTION
                    ====================== */}
                    <div
                      className="
                        flex
                        items-center
                        border-t
                        border-border
                        p-5
                        md:border-l
                        md:border-t-0
                        md:p-6
                      "
                    >
                      <Link
                        to={`/my-tickets/${ticket.id}`}
                        className="
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          whitespace-nowrap
                          rounded-button
                          bg-primary
                          px-5 py-3
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-primary-hover
                          md:w-auto
                        "
                      >
                        <i className="ri-ticket-2-line"></i>
                        Lihat Tiket
                        <i className="ri-arrow-right-line"></i>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =========================
            EMPTY STATE
        ========================== */}
        {!loading && !error && tickets.length === 0 && (
          <div
            className="
              mt-7
              rounded-card
              border border-border
              bg-card
              px-6
              py-16
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex h-16 w-16
                items-center
                justify-center
                rounded-full
                bg-primary/10
                text-primary
              "
            >
              <i className="ri-ticket-2-line text-3xl"></i>
            </div>

            <h2 className="mt-5 text-xl font-semibold text-heading">
              Belum Ada Tiket
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              Kamu belum memiliki tiket event. Temukan event menarik dan pesan
              tiket pertamamu.
            </p>

            <Link
              to="/events"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-button
                bg-primary
                px-5 py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-primary-hover
              "
            >
              <i className="ri-compass-3-line"></i>
              Jelajahi Event
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default MyTickets;
