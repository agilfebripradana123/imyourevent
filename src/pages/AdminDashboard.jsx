import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function AdminDashboard() {
  const { profile } = useAuth();

  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [profiles, setProfiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH DASHBOARD DATA
  // =========================
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [eventsResponse, bookingsResponse, profilesResponse] =
        await Promise.all([
          supabase.from("events").select("*").order("created_at", {
            ascending: false,
          }),

          supabase
            .from("bookings")
            .select(
              `
            *,
            event:events (
              id,
              title,
              image,
              date,
              location
            )
          `,
            )
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("profiles")
            .select("id, username, name, role, created_at")
            .order("created_at", {
              ascending: false,
            }),
        ]);

      if (eventsResponse.error) {
        throw eventsResponse.error;
      }

      if (bookingsResponse.error) {
        throw bookingsResponse.error;
      }

      if (profilesResponse.error) {
        throw profilesResponse.error;
      }

      setEvents(eventsResponse.data ?? []);
      setBookings(bookingsResponse.data ?? []);
      setProfiles(profilesResponse.data ?? []);
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);

      setError(err.message || "Data dashboard gagal dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =========================
  // FORMAT PRICE
  // =========================
  const formatPrice = (price) => {
    const number = Number(price) || 0;

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
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
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // =========================
  // DASHBOARD STATISTICS
  // =========================
  const statistics = useMemo(() => {
    // Booking dibatalkan tidak dihitung
    const validBookings = bookings.filter(
      (booking) => booking.status?.toLowerCase() !== "dibatalkan",
    );

    const totalTickets = validBookings.reduce(
      (total, booking) => total + Number(booking.quantity || 0),
      0,
    );

    const revenue = validBookings.reduce(
      (total, booking) => total + Number(booking.total_price || 0),
      0,
    );

    const totalUsers = profiles.filter(
      (item) => item.role?.toLowerCase() === "user",
    ).length;

    return {
      events: events.length,
      tickets: totalTickets,
      users: totalUsers,
      revenue,
    };
  }, [events, bookings, profiles]);

  // =========================
  // LATEST EVENTS
  // =========================
  const latestEvents = events.slice(0, 5);

  // =========================
  // LATEST BOOKINGS
  // =========================
  const latestBookings = bookings.slice(0, 5);

  // =========================
  // STATUS STYLE
  // =========================
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "aktif":
        return "bg-success/10 text-success";

      case "selesai":
        return "bg-blue-500/10 text-blue-400";

      case "dibatalkan":
        return "bg-danger/10 text-danger";

      default:
        return "bg-white/5 text-muted";
    }
  };

  const stats = [
    {
      label: "Total Event",
      value: statistics.events,
      description: "Event tersedia",
      icon: "ri-calendar-event-line",
    },
    {
      label: "Total Tiket",
      value: statistics.tickets,
      description: "Tiket terjual",
      icon: "ri-ticket-2-line",
    },
    {
      label: "Pengguna",
      value: statistics.users,
      description: "Akun terdaftar",
      icon: "ri-user-3-line",
    },
    {
      label: "Pendapatan",
      value: formatPrice(statistics.revenue),
      description: "Total transaksi",
      icon: "ri-wallet-3-line",
    },
  ];

  return (
    <>
      {/* =========================
          HEADER
      ========================== */}
      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p className="text-sm font-semibold text-primary">Dashboard</p>

          <h1 className="mt-2 text-3xl font-bold text-heading">
            Selamat datang
            {profile?.name ? `, ${profile.name}` : ""}
          </h1>

          <p className="mt-2 text-sm text-muted">
            Pantau event, tiket, pengguna, dan transaksi I'm Your Event.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboard}
          disabled={loading}
          className="
            inline-flex
            w-fit
            items-center
            justify-center
            gap-2
            rounded-button
            border border-border
            bg-card
            px-4 py-2.5
            text-sm
            font-semibold
            text-heading
            transition
            hover:border-primary
            hover:text-primary
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <i
            className={`
              ri-refresh-line
              text-lg
              ${loading ? "animate-spin" : ""}
            `}
          ></i>
          Refresh
        </button>
      </div>

      {/* =========================
          ERROR
      ========================== */}
      {error && (
        <div
          className="
            mt-6
            flex
            items-start
            gap-3
            rounded-card
            border border-danger/20
            bg-danger/5
            p-4
          "
        >
          <i className="ri-error-warning-line mt-0.5 text-xl text-danger"></i>

          <div>
            <p className="text-sm font-semibold text-heading">
              Dashboard gagal dimuat
            </p>

            <p className="mt-1 text-xs text-muted">{error}</p>
          </div>
        </div>
      )}

      {/* =========================
          STATISTICS
      ========================== */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="
              rounded-card
              border border-border
              bg-card
              p-5
              transition
              duration-300
              hover:border-primary/30
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted">{item.label}</p>

                {loading ? (
                  <div className="mt-3 h-9 w-20 animate-pulse rounded bg-white/5" />
                ) : (
                  <p
                    className={`
                      mt-2
                      font-bold
                      text-heading
                      ${item.label === "Pendapatan" ? "text-2xl" : "text-3xl"}
                    `}
                  >
                    {item.value}
                  </p>
                )}

                <p className="mt-2 text-xs text-muted">{item.description}</p>
              </div>

              <div
                className="
                  flex h-11 w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-input
                  bg-primary/10
                  text-primary
                "
              >
                <i className={`${item.icon} text-xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          CONTENT
      ========================== */}
      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        {/* =========================
            EVENT TERBARU
        ========================== */}
        <section
          className="
            overflow-hidden
            rounded-card
            border border-border
            bg-card
            xl:col-span-3
          "
        >
          {/* Header */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-border
              px-5
              py-5
              sm:px-6
            "
          >
            <div>
              <h2 className="font-semibold text-heading">Event Terbaru</h2>

              <p className="mt-1 text-xs text-muted">
                Event yang baru ditambahkan
              </p>
            </div>

            <Link
              to="/admin/events"
              className="
                flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-primary
                transition
                hover:text-primary-hover
              "
            >
              Lihat Semua
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3 p-5 sm:p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="
                    h-16
                    animate-pulse
                    rounded-input
                    bg-white/5
                  "
                />
              ))}
            </div>
          )}

          {/* Events */}
          {!loading && latestEvents.length > 0 && (
            <div className="divide-y divide-border">
              {latestEvents.map((event) => (
                <div
                  key={event.id}
                  className="
                    flex
                    items-center
                    gap-4
                    px-5
                    py-4
                    transition
                    hover:bg-white/[0.02]
                    sm:px-6
                  "
                >
                  {/* Image */}
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="
                        h-12 w-12
                        shrink-0
                        rounded-input
                        object-cover
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex h-12 w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-input
                        bg-background
                        text-muted
                      "
                    >
                      <i className="ri-image-line"></i>
                    </div>
                  )}

                  {/* Information */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">
                      {event.title}
                    </p>

                    <div
                      className="
                        mt-1
                        flex
                        flex-wrap
                        items-center
                        gap-x-3
                        gap-y-1
                        text-xs
                        text-muted
                      "
                    >
                      <span className="flex items-center gap-1">
                        <i className="ri-calendar-line"></i>

                        {formatDate(event.date)}
                      </span>

                      {event.location && (
                        <span className="hidden items-center gap-1 sm:flex">
                          <i className="ri-map-pin-line"></i>

                          <span className="max-w-[180px] truncate">
                            {event.location}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Edit */}
                  <Link
                    to={`/admin/events/${event.id}/edit`}
                    title="Edit event"
                    className="
                      flex h-9 w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-button
                      border border-border
                      text-muted
                      transition
                      hover:border-primary
                      hover:bg-primary/10
                      hover:text-primary
                    "
                  >
                    <i className="ri-edit-line"></i>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && latestEvents.length === 0 && (
            <div
              className="
                flex
                min-h-[260px]
                flex-col
                items-center
                justify-center
                px-6
                py-10
                text-center
              "
            >
              <div
                className="
                  flex h-14 w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-primary/10
                  text-primary
                "
              >
                <i className="ri-calendar-event-line text-2xl"></i>
              </div>

              <p className="mt-4 font-semibold text-heading">Belum Ada Event</p>

              <p className="mt-2 text-sm text-muted">
                Tambahkan event pertama untuk mulai menerima pesanan.
              </p>

              <Link
                to="/admin/events/create"
                className="
                  mt-5
                  rounded-button
                  bg-primary
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-primary-hover
                "
              >
                Tambah Event
              </Link>
            </div>
          )}
        </section>

        {/* =========================
            PESANAN TERBARU
        ========================== */}
        <section
          className="
            overflow-hidden
            rounded-card
            border border-border
            bg-card
            xl:col-span-2
          "
        >
          {/* Header */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-border
              px-5
              py-5
            "
          >
            <div>
              <h2 className="font-semibold text-heading">Pesanan Terbaru</h2>

              <p className="mt-1 text-xs text-muted">
                Transaksi terbaru pengguna
              </p>
            </div>

            <Link
              to="/admin/bookings"
              className="
                flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-primary
                transition
                hover:text-primary-hover
              "
            >
              Lihat Semua
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="
                    h-20
                    animate-pulse
                    rounded-input
                    bg-white/5
                  "
                />
              ))}
            </div>
          )}

          {/* Booking */}
          {!loading && latestBookings.length > 0 && (
            <div className="divide-y divide-border">
              {latestBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="
                    px-5
                    py-4
                    transition
                    hover:bg-white/[0.02]
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-heading">
                        {booking.event?.title || "Event tidak tersedia"}
                      </p>

                      <p
                        className="
                          mt-1
                          truncate
                          font-mono
                          text-xs
                          text-muted
                        "
                      >
                        {booking.ticket_code || "-"}
                      </p>
                    </div>

                    <span
                      className={`
                        shrink-0
                        rounded-full
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        ${getStatusStyle(booking.status)}
                      `}
                    >
                      {booking.status || "Aktif"}
                    </span>
                  </div>

                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <span className="text-xs text-muted">
                      {formatBookingDate(booking.created_at)}
                    </span>

                    <span className="text-sm font-semibold text-primary">
                      {formatPrice(booking.total_price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && latestBookings.length === 0 && (
            <div
              className="
                flex
                min-h-[260px]
                flex-col
                items-center
                justify-center
                px-6
                py-10
                text-center
              "
            >
              <div
                className="
                  flex h-14 w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-primary/10
                  text-primary
                "
              >
                <i className="ri-ticket-2-line text-2xl"></i>
              </div>

              <p className="mt-4 font-semibold text-heading">
                Belum Ada Pesanan
              </p>

              <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
                Pesanan pengguna akan muncul di sini.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default AdminDashboard;
