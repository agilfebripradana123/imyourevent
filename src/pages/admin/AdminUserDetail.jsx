import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function AdminUserDetail() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH USER DETAIL
  // =========================
  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResponse, bookingsResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, name, role, created_at")
          .eq("id", id)
          .single(),

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
                location,
                category
              )
            `,
          )
          .eq("user_id", id)
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (profileResponse.error) {
        throw profileResponse.error;
      }

      if (bookingsResponse.error) {
        throw bookingsResponse.error;
      }

      setProfile(profileResponse.data);
      setBookings(bookingsResponse.data ?? []);
    } catch (err) {
      console.error("Gagal mengambil detail pengguna:", err);

      setError(err.message || "Detail pengguna gagal dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  // =========================
  // FORMAT PRICE
  // =========================
  const formatPrice = (price) => {
    const number = Number(price) || 0;

    if (number === 0) {
      return "Gratis";
    }

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
    }).format(new Date(date));
  };

  // =========================
  // EVENT DATE
  // =========================
  const formatEventDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  };

  // =========================
  // STATUS
  // =========================
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "aktif":
        return "border-success/20 bg-success/10 text-success";

      case "selesai":
        return "border-blue-500/20 bg-blue-500/10 text-blue-400";

      case "dibatalkan":
        return "border-danger/20 bg-danger/10 text-danger";

      default:
        return "border-border bg-white/5 text-muted";
    }
  };

  // =========================
  // STATISTICS
  // =========================
  const statistics = useMemo(() => {
    const validBookings = bookings.filter(
      (booking) => booking.status?.toLowerCase() !== "dibatalkan",
    );

    const totalTickets = validBookings.reduce(
      (total, booking) => total + Number(booking.quantity || 0),
      0,
    );

    const totalTransaction = validBookings.reduce(
      (total, booking) => total + Number(booking.total_price || 0),
      0,
    );

    return {
      bookings: bookings.length,
      tickets: totalTickets,
      transaction: totalTransaction,
    };
  }, [bookings]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div
        className="
          flex min-h-[450px]
          items-center
          justify-center
          rounded-card
          border border-border
          bg-card
        "
      >
        <div className="text-center">
          <i className="ri-loader-4-line inline-block animate-spin text-3xl text-primary"></i>

          <p className="mt-4 text-sm text-muted">Memuat detail pengguna...</p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error || !profile) {
    return (
      <div>
        <Link
          to="/admin/users"
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
          Kembali ke Pengguna
        </Link>

        <div
          className="
            mt-6
            flex min-h-[350px]
            flex-col
            items-center
            justify-center
            rounded-card
            border border-danger/20
            bg-card
            px-6
            text-center
          "
        >
          <div
            className="
              flex h-14 w-14
              items-center
              justify-center
              rounded-2xl
              bg-danger/10
              text-danger
            "
          >
            <i className="ri-user-unfollow-line text-2xl"></i>
          </div>

          <h2 className="mt-5 text-xl font-bold text-heading">
            Pengguna Tidak Ditemukan
          </h2>

          <p className="mt-2 max-w-sm text-sm text-muted">
            {error || "Data pengguna yang kamu cari tidak tersedia."}
          </p>
        </div>
      </div>
    );
  }

  const initial = (profile.name || profile.username || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div>
      {/* BACK */}
      <Link
        to="/admin/users"
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
        Kembali ke Pengguna
      </Link>

      {/* =========================
          PROFILE
      ========================== */}
      <section
        className="
          mt-6
          rounded-card
          border border-border
          bg-card
          p-5
          sm:p-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="
                flex h-16 w-16
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-primary/10
                text-2xl
                font-bold
                text-primary
              "
            >
              {initial}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold text-heading sm:text-2xl">
                  {profile.name || "Tanpa nama"}
                </h1>

                <span
                  className={`
                    rounded-full
                    border
                    px-2.5 py-1
                    text-[10px]
                    font-semibold
                    uppercase
                    ${
                      profile.role === "admin"
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border bg-white/5 text-muted"
                    }
                  `}
                >
                  {profile.role || "user"}
                </span>
              </div>

              <p className="mt-1 text-sm text-muted">
                @{profile.username || "-"}
              </p>
            </div>
          </div>

          {/* Active */}
          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border border-success/20
              bg-success/10
              px-3 py-2
              text-xs
              font-semibold
              text-success
            "
          >
            <span className="h-2 w-2 rounded-full bg-success"></span>
            Aktif
          </div>
        </div>

        {/* PROFILE INFO */}
        <div
          className="
            mt-6
            grid
            gap-5
            border-t
            border-border
            pt-6
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          <div>
            <p className="text-xs text-muted">Username</p>

            <p className="mt-1 text-sm font-semibold text-heading">
              @{profile.username || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">Role</p>

            <p className="mt-1 text-sm font-semibold capitalize text-heading">
              {profile.role || "user"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">Bergabung</p>

            <p className="mt-1 text-sm font-semibold text-heading">
              {formatDate(profile.created_at)}
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          STATISTICS
      ========================== */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="ri-file-list-3-line"
          label="Total Pesanan"
          value={statistics.bookings}
        />

        <StatCard
          icon="ri-ticket-2-line"
          label="Total Tiket"
          value={statistics.tickets}
        />

        <StatCard
          icon="ri-wallet-3-line"
          label="Total Transaksi"
          value={formatPrice(statistics.transaction)}
        />
      </div>

      {/* =========================
          BOOKING HISTORY
      ========================== */}
      <section
        className="
          mt-6
          overflow-hidden
          rounded-card
          border border-border
          bg-card
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
            <h2 className="font-semibold text-heading">Riwayat Pesanan</h2>

            <p className="mt-1 text-xs text-muted">
              Semua pemesanan milik pengguna ini
            </p>
          </div>

          <span
            className="
              rounded-full
              bg-primary/10
              px-3 py-1
              text-xs
              font-semibold
              text-primary
            "
          >
            {bookings.length} Pesanan
          </span>
        </div>

        {/* BOOKINGS */}
        {bookings.length > 0 ? (
          <>
            {/* DESKTOP */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead className="border-b border-border bg-white/[0.02]">
                  <tr>
                    <TableHeader>Tiket</TableHeader>

                    <TableHeader>Event</TableHeader>

                    <TableHeader>Jumlah</TableHeader>

                    <TableHeader>Total</TableHeader>

                    <TableHeader>Status</TableHeader>

                    <TableHeader>Dipesan</TableHeader>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <TableCell>
                        <span className="whitespace-nowrap font-mono text-xs font-semibold text-primary">
                          {booking.ticket_code || "-"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex max-w-[260px] items-center gap-3">
                          {booking.event?.image ? (
                            <img
                              src={booking.event.image}
                              alt={booking.event.title}
                              className="
                                h-10 w-10
                                shrink-0
                                rounded-input
                                object-cover
                              "
                            />
                          ) : (
                            <div
                              className="
                                flex h-10 w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-input
                                bg-background
                                text-muted
                              "
                            >
                              <i className="ri-calendar-event-line"></i>
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-heading">
                              {booking.event?.title || "Event tidak tersedia"}
                            </p>

                            {booking.event?.date && (
                              <p className="mt-1 text-xs text-muted">
                                {formatEventDate(booking.event.date)}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm font-medium text-heading">
                          {booking.quantity || 0} tiket
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="whitespace-nowrap text-sm font-semibold text-primary">
                          {formatPrice(booking.total_price)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`
                            inline-flex
                            rounded-full
                            border
                            px-3 py-1
                            text-xs
                            font-semibold
                            ${getStatusStyle(booking.status)}
                          `}
                        >
                          {booking.status || "Aktif"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="whitespace-nowrap text-xs text-muted">
                          {formatDate(booking.created_at)}
                        </span>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="divide-y divide-border md:hidden">
              {bookings.map((booking) => (
                <article key={booking.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-primary">
                        {booking.ticket_code || "-"}
                      </p>

                      <h3 className="mt-2 font-semibold text-heading">
                        {booking.event?.title || "Event tidak tersedia"}
                      </h3>
                    </div>

                    <span
                      className={`
                        shrink-0
                        rounded-full
                        border
                        px-2.5 py-1
                        text-[10px]
                        font-semibold
                        ${getStatusStyle(booking.status)}
                      `}
                    >
                      {booking.status || "Aktif"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted">Jumlah</p>

                      <p className="mt-1 text-sm font-semibold text-heading">
                        {booking.quantity || 0} tiket
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted">Total</p>

                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatPrice(booking.total_price)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted">Tanggal Event</p>

                      <p className="mt-1 text-sm text-heading">
                        {formatEventDate(booking.event?.date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted">Dipesan</p>

                      <p className="mt-1 text-sm text-heading">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          /* EMPTY BOOKING */
          <div
            className="
              flex min-h-[260px]
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

            <h3 className="mt-4 font-semibold text-heading">
              Belum Ada Pesanan
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
              Pengguna ini belum pernah melakukan pemesanan tiket.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div
      className="
        rounded-card
        border border-border
        bg-card
        p-5
        transition
        hover:border-primary/30
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">{label}</p>

          <p className="mt-2 truncate text-2xl font-bold text-heading">
            {value}
          </p>
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
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}

function TableHeader({ children }) {
  return (
    <th
      className="
        whitespace-nowrap
        px-5 py-4
        text-left
        text-xs
        font-semibold
        uppercase
        tracking-wider
        text-muted
      "
    >
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return <td className="px-5 py-4 align-middle">{children}</td>;
}

export default AdminUserDetail;
