import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function TicketDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH TICKET
  // =========================
  useEffect(() => {
    const fetchTicket = async () => {
      if (!user || !id) {
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
          .eq("id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        console.log("TICKET DETAIL:", data);

        setTicket(data);
      } catch (err) {
        console.error("Gagal mengambil detail tiket:", err);

        setError(
          err.message || "Detail tiket gagal dimuat. Silakan coba lagi.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchTicket();
    }
  }, [id, user, authLoading]);

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
  // FORMAT EVENT DATE
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
  // FORMAT BOOKING DATE
  // =========================
  const formatBookingDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
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
        return "border-border bg-black/30 text-white/70";

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
            <i className="ri-lock-line text-2xl"></i>
          </div>

          <h1 className="mt-5 text-2xl font-bold text-heading">
            Login diperlukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            Masuk ke akunmu untuk melihat detail tiket.
          </p>

          <Link
            to="/login"
            state={{
              from: `/my-tickets/${id}`,
            }}
            className="
              mt-6
              flex w-full
              items-center justify-center
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
            <i className="ri-login-box-line"></i>
            Masuk
          </Link>
        </div>
      </main>
    );
  }

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-32">
        <div className="container-app text-center">
          <i className="ri-loader-4-line inline-block animate-spin text-3xl text-primary"></i>

          <p className="mt-4 text-sm text-muted">Memuat tiket...</p>
        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <main className="min-h-screen bg-background pt-32">
        <div className="container-app text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
            <i className="ri-error-warning-line text-2xl"></i>
          </div>

          <h1 className="mt-5 text-2xl font-bold text-heading">
            Tiket gagal dimuat
          </h1>

          <p className="mt-3 text-sm text-muted">{error}</p>

          <Link
            to="/my-tickets"
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
              hover:bg-primary-hover
            "
          >
            <i className="ri-arrow-left-line"></i>
            Kembali ke Tiket Saya
          </Link>
        </div>
      </main>
    );
  }

  // =========================
  // NOT FOUND
  // =========================
  if (!ticket || !ticket.event) {
    return (
      <main className="min-h-screen bg-background pt-32">
        <div className="container-app text-center">
          <p className="text-sm font-semibold text-primary">404</p>

          <h1 className="mt-2 text-3xl font-bold text-heading">
            Tiket tidak ditemukan
          </h1>

          <p className="mt-3 text-muted">
            Tiket tidak tersedia atau bukan milik akunmu.
          </p>

          <Link
            to="/my-tickets"
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
              hover:bg-primary-hover
            "
          >
            <i className="ri-arrow-left-line"></i>
            Kembali ke Tiket Saya
          </Link>
        </div>
      </main>
    );
  }

  const event = ticket.event;

  return (
    <main className="min-h-screen bg-background pb-20 pt-28">
      <div className="container-app">
        {/* =========================
            BACK
        ========================== */}
        <Link
          to="/my-tickets"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-muted
            transition
            hover:text-primary
          "
        >
          <i className="ri-arrow-left-line"></i>
          Kembali ke Tiket Saya
        </Link>

        {/* =========================
            HEADER
        ========================== */}
        <div className="mt-7 max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <i className="ri-ticket-2-line text-lg"></i>
            E-Ticket
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading md:text-4xl">
            Detail Tiket
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            Simpan tiket ini dan tunjukkan saat memasuki lokasi event.
          </p>
        </div>

        {/* =========================
            TICKET
        ========================== */}
        <div className="mx-auto mt-10 max-w-4xl">
          <article
            className="
              overflow-hidden
              rounded-card
              border border-border
              bg-card
              shadow-[0_25px_70px_rgba(0,0,0,0.3)]
            "
          >
            {/* =====================
                POSTER
            ====================== */}
            <div className="relative h-[260px] overflow-hidden md:h-[340px]">
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover"
              />

              <div
                className="
                  absolute inset-0
                  bg-gradient-to-t
                  from-card
                  via-black/30
                  to-transparent
                "
              />

              {/* STATUS */}
              <span
                className={`
                  absolute
                  right-5
                  top-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4 py-2
                  text-xs
                  font-semibold
                  backdrop-blur-md
                  ${getStatusStyle(ticket.status)}
                `}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                {ticket.status}
              </span>

              {/* EVENT */}
              <div className="absolute bottom-6 left-6 right-6">
                <span
                  className="
                    inline-flex
                    rounded-full
                    bg-primary/20
                    px-3 py-1
                    text-xs
                    font-semibold
                    text-primary
                    backdrop-blur-md
                  "
                >
                  {event.category}
                </span>

                <h2
                  className="
                    mt-3
                    max-w-2xl
                    text-2xl
                    font-bold
                    leading-tight
                    text-white
                    md:text-3xl
                  "
                >
                  {event.title}
                </h2>
              </div>
            </div>

            {/* =====================
                TICKET CODE
            ====================== */}
            <div
              className="
                relative
                border-b
                border-dashed
                border-border
                px-6
                py-8
                text-center
                md:px-10
              "
            >
              {/* ticket cut left */}
              <div
                className="
                  absolute
                  -bottom-3
                  -left-3
                  h-6 w-6
                  rounded-full
                  border border-border
                  bg-background
                "
              />

              {/* ticket cut right */}
              <div
                className="
                  absolute
                  -bottom-3
                  -right-3
                  h-6 w-6
                  rounded-full
                  border border-border
                  bg-background
                "
              />

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <i className="ri-qr-code-line text-2xl"></i>
              </div>

              <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted">
                Kode Tiket
              </p>

              <p
                className="
                  mt-3
                  break-all
                  font-mono
                  text-2xl
                  font-bold
                  tracking-wider
                  text-heading
                  sm:text-3xl
                "
              >
                {ticket.ticket_code}
              </p>

              <p className="mt-2 text-xs text-muted">
                Gunakan kode ini saat proses check-in event.
              </p>
            </div>

            {/* =====================
                INFORMATION
            ====================== */}
            <div className="p-6 md:p-10">
              <div className="flex items-center gap-2">
                <i className="ri-information-line text-lg text-primary"></i>

                <h3 className="text-lg font-semibold text-heading">
                  Informasi Event
                </h3>
              </div>

              <div
                className="
                  mt-6
                  grid
                  gap-6
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >
                {/* DATE */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <i className="ri-calendar-line"></i>
                    Tanggal
                  </div>

                  <p className="mt-2 text-sm font-semibold text-heading">
                    {formatDate(event.date)}
                  </p>
                </div>

                {/* LOCATION */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <i className="ri-map-pin-line"></i>
                    Lokasi
                  </div>

                  <p className="mt-2 text-sm font-semibold text-heading">
                    {event.location}
                  </p>
                </div>

                {/* QUANTITY */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <i className="ri-ticket-line"></i>
                    Jumlah Tiket
                  </div>

                  <p className="mt-2 text-sm font-semibold text-heading">
                    {ticket.quantity} tiket
                  </p>
                </div>

                {/* TOTAL */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <i className="ri-wallet-3-line"></i>
                    Total
                  </div>

                  <p className="mt-2 text-sm font-semibold text-primary">
                    {formatPrice(ticket.total_price)}
                  </p>
                </div>
              </div>

              {/* =====================
                  CUSTOMER
              ====================== */}
              <div className="my-8 h-px bg-border" />

              <div className="flex items-center gap-2">
                <i className="ri-user-line text-lg text-primary"></i>

                <h3 className="text-lg font-semibold text-heading">
                  Informasi Pemesan
                </h3>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted">Nama Pemesan</p>

                  <p className="mt-2 text-sm font-semibold text-heading">
                    {ticket.customer_name || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted">Email</p>

                  <p className="mt-2 break-all text-sm font-semibold text-heading">
                    {ticket.customer_email || "-"}
                  </p>
                </div>
              </div>

              {/* =====================
                  BOOKING
              ====================== */}
              <div className="my-8 h-px bg-border" />

              <div
                className="
                  flex
                  flex-col
                  gap-6
                  sm:flex-row
                  sm:items-end
                  sm:justify-between
                "
              >
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <i className="ri-time-line"></i>
                    Tanggal Pemesanan
                  </p>

                  <p className="mt-2 text-sm font-medium text-heading">
                    {formatBookingDate(ticket.created_at)}
                  </p>
                </div>

                <Link
                  to={`/events/${event.id}`}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-button
                    border border-border
                    bg-surface
                    px-5 py-3
                    text-center
                    text-sm
                    font-semibold
                    text-heading
                    transition
                    hover:border-primary
                    hover:text-primary
                  "
                >
                  <i className="ri-calendar-event-line"></i>
                  Lihat Detail Event
                  <i className="ri-arrow-right-line"></i>
                </Link>
              </div>
            </div>
          </article>

          {/* =========================
              NOTICE
          ========================== */}
          <div
            className="
              mt-5
              flex
              items-start
              gap-3
              rounded-card
              border border-primary/20
              bg-primary/5
              p-5
            "
          >
            <div
              className="
                flex h-9 w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-primary/10
                text-primary
              "
            >
              <i className="ri-information-line text-lg"></i>
            </div>

            <div>
              <p className="text-sm font-semibold text-heading">
                Informasi penting
              </p>

              <p className="mt-1.5 text-sm leading-6 text-muted">
                Pastikan kode tiket dapat terlihat dengan jelas saat check-in.
                Setiap kode tiket hanya berlaku untuk pemesanan yang terdaftar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default TicketDetail;
