import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  // =========================
  // FETCH BOOKINGS
  // =========================
  const fetchBookings = async () => {
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
            price
          )
        `,
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setBookings(data ?? []);
    } catch (err) {
      console.error("Gagal mengambil bookings:", err);

      setError(err.message || "Data pesanan gagal dimuat. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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
  // UPDATE STATUS
  // =========================
  const handleDelete = async () => {
    if (!deleteModal) return;

    try {
      setDeletingId(deleteModal.id);

      const { data, error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", deleteModal.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Pesanan tidak berhasil dihapus.");
      }

      setBookings((prev) => prev.filter((item) => item.id !== deleteModal.id));

      setDeleteModal(null);
    } catch (err) {
      console.error(err);

      alert(err.message);

      await fetchBookings();
    } finally {
      setDeletingId(null);
    }
  };
  // =========================
  // FILTER
  // =========================
  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const ticketCode = booking.ticket_code?.toLowerCase() || "";

      const customerName = booking.customer_name?.toLowerCase() || "";

      const customerEmail = booking.customer_email?.toLowerCase() || "";

      const eventTitle = booking.event?.title?.toLowerCase() || "";

      const matchesSearch =
        !keyword ||
        ticketCode.includes(keyword) ||
        customerName.includes(keyword) ||
        customerEmail.includes(keyword) ||
        eventTitle.includes(keyword);

      const matchesStatus =
        statusFilter === "Semua" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  // =========================
  // STATISTICS
  // =========================
  const statistics = useMemo(() => {
    return {
      total: bookings.length,

      active: bookings.filter(
        (booking) => booking.status?.toLowerCase() === "aktif",
      ).length,

      finished: bookings.filter(
        (booking) => booking.status?.toLowerCase() === "selesai",
      ).length,

      cancelled: bookings.filter(
        (booking) => booking.status?.toLowerCase() === "dibatalkan",
      ).length,
    };
  }, [bookings]);

  return (
    <div>
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
          <p className="text-sm font-semibold text-primary">Pesanan</p>

          <h1 className="mt-2 text-3xl font-bold text-heading">
            Kelola Pesanan
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Lihat dan kelola seluruh pemesanan tiket event dari pengguna.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
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
            className={`ri-refresh-line text-lg ${
              loading ? "animate-spin" : ""
            }`}
          ></i>
          Refresh
        </button>
      </div>

      {/* =========================
          STATISTICS
      ========================== */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="ri-ticket-2-line"
          label="Total Pesanan"
          value={statistics.total}
        />

        <StatCard
          icon="ri-checkbox-circle-line"
          label="Tiket Aktif"
          value={statistics.active}
        />

        <StatCard
          icon="ri-check-double-line"
          label="Selesai"
          value={statistics.finished}
        />

        <StatCard
          icon="ri-close-circle-line"
          label="Dibatalkan"
          value={statistics.cancelled}
        />
      </div>

      {/* =========================
          SEARCH & FILTER
      ========================== */}
      <div
        className="
          mt-8
          grid
          gap-3
          rounded-card
          border border-border
          bg-card
          p-4
          md:grid-cols-[1fr_220px]
        "
      >
        {/* Search */}
        <div className="relative">
          <i
            className="
              ri-search-line
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-lg
              text-muted
            "
          ></i>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode tiket, pemesan, email, atau event..."
            className="
              w-full
              rounded-input
              border border-border
              bg-background
              py-3
              pl-11
              pr-4
              text-sm
              text-heading
              outline-none
              transition
              placeholder:text-muted
              focus:border-primary
            "
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="
                absolute
                right-3
                top-1/2
                flex h-7 w-7
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                text-muted
                transition
                hover:bg-white/5
                hover:text-heading
              "
            >
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="
            w-full
            rounded-input
            border border-border
            bg-background
            px-4 py-3
            text-sm
            text-heading
            outline-none
            transition
            focus:border-primary
          "
        >
          <option value="Semua">Semua Status</option>

          <option value="Aktif">Aktif</option>

          <option value="Selesai">Selesai</option>

          <option value="Dibatalkan">Dibatalkan</option>
        </select>
      </div>

      {/* RESULT INFO */}
      {!loading && !error && bookings.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">
            Menampilkan{" "}
            <span className="font-semibold text-heading">
              {filteredBookings.length}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-heading">
              {bookings.length}
            </span>{" "}
            pesanan
          </p>

          {(search || statusFilter !== "Semua") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("Semua");
              }}
              className="text-xs font-semibold text-primary hover:text-primary-hover"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}

      {/* =========================
          LOADING
      ========================== */}
      {loading && (
        <div className="mt-6 rounded-card border border-border bg-card px-6 py-16 text-center">
          <i className="ri-loader-4-line inline-block animate-spin text-3xl text-primary"></i>

          <p className="mt-4 text-sm text-muted">Memuat data pesanan...</p>
        </div>
      )}

      {/* =========================
          ERROR
      ========================== */}
      {!loading && error && (
        <div className="mt-6 rounded-card border border-danger/20 bg-danger/5 px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <i className="ri-error-warning-line text-2xl"></i>
          </div>

          <h2 className="mt-4 font-semibold text-heading">
            Data pesanan gagal dimuat
          </h2>

          <p className="mt-2 text-sm text-muted">{error}</p>

          <button
            type="button"
            onClick={fetchBookings}
            className="
              mt-5
              rounded-button
              bg-primary
              px-5 py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-primary-hover
            "
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* =========================
          DESKTOP TABLE
      ========================== */}
      {!loading && !error && filteredBookings.length > 0 && (
        <div
          className="
              mt-6
              hidden
              overflow-hidden
              rounded-card
              border border-border
              bg-card
              lg:block
            "
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-white/[0.02]">
                <tr>
                  <TableHeader>Tiket</TableHeader>

                  <TableHeader>Pemesan</TableHeader>

                  <TableHeader>Event</TableHeader>

                  <TableHeader>Qty</TableHeader>

                  <TableHeader>Total</TableHeader>

                  <TableHeader>Status</TableHeader>

                  <TableHeader>Dipesan</TableHeader>

                  <TableHeader>Aksi</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="
                          transition
                          hover:bg-white/[0.02]
                        "
                  >
                    {/* TICKET */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="
                                flex h-9 w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-input
                                bg-primary/10
                                text-primary
                              "
                        >
                          <i className="ri-ticket-2-line"></i>
                        </div>

                        <div>
                          <p className="whitespace-nowrap font-mono text-xs font-semibold text-heading">
                            {booking.ticket_code || "-"}
                          </p>

                          <p className="mt-1 text-xs text-muted">
                            #{booking.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* CUSTOMER */}
                    <TableCell>
                      <p className="max-w-[180px] truncate text-sm font-medium text-heading">
                        {booking.customer_name || "-"}
                      </p>

                      <p className="mt-1 max-w-[180px] truncate text-xs text-muted">
                        {booking.customer_email || "-"}
                      </p>
                    </TableCell>

                    {/* EVENT */}
                    <TableCell>
                      <div className="flex max-w-[230px] items-center gap-3">
                        {booking.event?.image ? (
                          <img
                            src={booking.event.image}
                            alt={booking.event.title || "Event"}
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
                            <i className="ri-image-line"></i>
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-heading">
                            {booking.event?.title || "Event tidak tersedia"}
                          </p>

                          {booking.event?.date && (
                            <p className="mt-1 whitespace-nowrap text-xs text-muted">
                              {formatDate(booking.event.date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* QUANTITY */}
                    <TableCell>
                      <span className="text-sm font-semibold text-heading">
                        {booking.quantity ?? 0}
                      </span>
                    </TableCell>

                    {/* TOTAL */}
                    <TableCell>
                      <span className="whitespace-nowrap text-sm font-semibold text-primary">
                        {formatPrice(booking.total_price)}
                      </span>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <select
                        value={booking.status || "Aktif"}
                        disabled={
                          updatingId === booking.id || deletingId === booking.id
                        }
                        onChange={(e) =>
                          handleStatusChange(booking.id, e.target.value)
                        }
                        className={`
                              cursor-pointer
                              rounded-full
                              border
                              px-3 py-1.5
                              text-xs
                              font-semibold
                              outline-none
                              transition
                              ${getStatusStyle(booking.status)}
                              ${
                                updatingId === booking.id
                                  ? "cursor-wait opacity-50"
                                  : ""
                              }
                            `}
                      >
                        <option value="Aktif">Aktif</option>

                        <option value="Selesai">Selesai</option>

                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </TableCell>

                    {/* BOOKING DATE */}
                    <TableCell>
                      <span className="whitespace-nowrap text-xs text-muted">
                        {formatBookingDate(booking.created_at)}
                      </span>
                    </TableCell>

                    {/* ACTION */}
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setDeleteModal(booking)}
                        disabled={
                          deletingId === booking.id || updatingId === booking.id
                        }
                        title="Hapus pesanan"
                        aria-label={`Hapus pesanan ${
                          booking.ticket_code || booking.id
                        }`}
                        className="
                              flex h-9 w-9
                              items-center
                              justify-center
                              rounded-button
                              border border-danger/30
                              text-danger
                              transition
                              hover:bg-danger/10
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                      >
                        {deletingId === booking.id ? (
                          <i className="ri-loader-4-line animate-spin text-lg"></i>
                        ) : (
                          <i className="ri-delete-bin-line text-lg"></i>
                        )}
                      </button>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {deleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <button
                className="absolute inset-0"
                onClick={() => setDeleteModal(null)}
              />

              <div className="relative z-10 w-full max-w-md rounded-card border border-border bg-card p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
                  <i className="ri-delete-bin-6-line text-2xl"></i>
                </div>

                <h2 className="mt-5 text-xl font-bold text-heading">
                  Hapus Pesanan?
                </h2>

                <p className="mt-3 text-sm text-muted">
                  Pesanan{" "}
                  <span className="font-semibold text-heading">
                    {deleteModal.ticket_code}
                  </span>{" "}
                  akan dihapus permanen.
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 rounded-button border border-border py-3 font-semibold"
                  >
                    Batal
                  </button>

                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-button bg-danger py-3 font-semibold text-white"
                  >
                    {deletingId ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================
          MOBILE / TABLET
      ========================== */}
      {!loading && !error && filteredBookings.length > 0 && (
        <div className="mt-6 grid gap-4 lg:hidden">
          {filteredBookings.map((booking) => (
            <article
              key={booking.id}
              className="
                  overflow-hidden
                  rounded-card
                  border border-border
                  bg-card
                "
            >
              {/* EVENT IMAGE */}
              <div className="relative h-44 overflow-hidden bg-background">
                {booking.event?.image ? (
                  <img
                    src={booking.event.image}
                    alt={booking.event.title || "Event"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">
                    <i className="ri-image-line text-3xl"></i>
                  </div>
                )}

                <div
                  className="
                      absolute inset-0
                      bg-gradient-to-t
                      from-card
                      via-transparent
                      to-transparent
                    "
                />

                {/* STATUS BADGE */}
                <span
                  className={`
                      absolute
                      right-4
                      top-4
                      rounded-full
                      border
                      px-3 py-1.5
                      text-xs
                      font-semibold
                      backdrop-blur-md
                      ${getStatusStyle(booking.status)}
                    `}
                >
                  {booking.status || "Aktif"}
                </span>
              </div>

              <div className="p-5">
                {/* TICKET CODE */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-muted">Kode Tiket</p>

                    <p className="mt-1 break-all font-mono text-sm font-bold text-primary">
                      {booking.ticket_code || "-"}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-muted">
                    #{booking.id}
                  </span>
                </div>

                {/* EVENT */}
                <div className="mt-5">
                  <p className="text-xs text-muted">Event</p>

                  <h2 className="mt-1 text-lg font-semibold text-heading">
                    {booking.event?.title || "Event tidak tersedia"}
                  </h2>

                  {booking.event?.date && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted">
                      <i className="ri-calendar-line text-primary"></i>

                      {formatDate(booking.event.date)}
                    </div>
                  )}

                  {booking.event?.location && (
                    <div className="mt-1.5 flex items-start gap-2 text-sm text-muted">
                      <i className="ri-map-pin-line mt-0.5 text-primary"></i>

                      <span>{booking.event.location}</span>
                    </div>
                  )}
                </div>

                {/* CUSTOMER */}
                <div
                  className="
                      mt-5
                      rounded-input
                      border border-border
                      bg-background/50
                      p-4
                    "
                >
                  <div className="flex items-start gap-3">
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
                      <i className="ri-user-line"></i>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-muted">Pemesan</p>

                      <p className="mt-1 text-sm font-semibold text-heading">
                        {booking.customer_name || "-"}
                      </p>

                      <p className="mt-1 break-all text-xs text-muted">
                        {booking.customer_email || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted">Jumlah</p>

                    <p className="mt-1 text-sm font-semibold text-heading">
                      {booking.quantity ?? 0} tiket
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted">Total</p>

                    <p className="mt-1 text-sm font-semibold text-primary">
                      {formatPrice(booking.total_price)}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs text-muted">Tanggal Pemesanan</p>

                    <p className="mt-1 text-sm font-medium text-heading">
                      {formatBookingDate(booking.created_at)}
                    </p>
                  </div>
                </div>

                {/* STATUS */}
                <div className="mt-5 border-t border-border pt-5">
                  <label className="text-xs font-medium text-muted">
                    Status Pesanan
                  </label>

                  <div className="relative mt-2">
                    <select
                      value={booking.status || "Aktif"}
                      disabled={
                        updatingId === booking.id || deletingId === booking.id
                      }
                      onChange={(e) =>
                        handleStatusChange(booking.id, e.target.value)
                      }
                      className="
                          w-full
                          appearance-none
                          rounded-input
                          border border-border
                          bg-background
                          px-4 py-3
                          pr-10
                          text-sm
                          font-semibold
                          text-heading
                          outline-none
                          transition
                          focus:border-primary
                          disabled:cursor-wait
                          disabled:opacity-50
                        "
                    >
                      <option value="Aktif">Aktif</option>

                      <option value="Selesai">Selesai</option>

                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>

                    <i
                      className="
                          ri-arrow-down-s-line
                          pointer-events-none
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-muted
                        "
                    ></i>
                  </div>

                  {updatingId === booking.id && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-primary">
                      <i className="ri-loader-4-line animate-spin"></i>
                      Menyimpan status...
                    </p>
                  )}

                  {/* DELETE */}
                  <button
                    type="button"
                    onClick={() => setDeleteModal(booking)}
                    disabled={
                      deletingId === booking.id || updatingId === booking.id
                    }
                    className="
                        mt-3
                        flex w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-button
                        border border-danger/30
                        px-4 py-3
                        text-sm
                        font-semibold
                        text-danger
                        transition
                        hover:bg-danger/10
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                  >
                    {deletingId === booking.id ? (
                      <>
                        <i className="ri-loader-4-line animate-spin"></i>
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <i className="ri-delete-bin-line"></i>
                        Hapus Pesanan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* =========================
          EMPTY STATE
      ========================== */}
      {!loading && !error && filteredBookings.length === 0 && (
        <div
          className="
            mt-6
            overflow-hidden
            rounded-card
            border border-border
            bg-card
          "
        >
          <div
            className="
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              px-5
              py-10
              text-center
              sm:px-8
              sm:py-12
            "
          >
            {/* ICON */}
            <div className="relative">
              <div
                className="
                  absolute
                  inset-0
                  scale-[1.8]
                  rounded-full
                  bg-primary/10
                  blur-2xl
                "
              />

              <div
                className="
                  relative
                  flex h-16 w-16
                  items-center
                  justify-center
                  rounded-2xl
                  border border-primary/20
                  bg-primary/10
                  text-primary
                "
              >
                <i
                  className={`
                    ${
                      bookings.length === 0
                        ? "ri-ticket-2-line"
                        : "ri-search-line"
                    }
                    text-2xl
                  `}
                ></i>
              </div>
            </div>

            {/* TITLE */}
            <h2 className="mt-6 text-xl font-bold text-heading">
              {bookings.length === 0
                ? "Belum Ada Pesanan"
                : "Pesanan Tidak Ditemukan"}
            </h2>

            {/* DESCRIPTION */}
            <p
              className="
                mt-2
                max-w-md
                text-sm
                leading-6
                text-muted
              "
            >
              {bookings.length === 0
                ? "Belum ada pengguna yang melakukan pemesanan tiket. Pesanan baru akan muncul secara otomatis di halaman ini."
                : "Tidak ada pesanan yang sesuai dengan kata kunci atau filter yang sedang digunakan."}
            </p>

            {/* DATABASE EMPTY */}
            {bookings.length === 0 && (
              <div
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border border-border
                  bg-background
                  px-4
                  py-2
                  text-xs
                  font-medium
                  text-muted
                "
              >
                <span
                  className="
                    h-2 w-2
                    animate-pulse
                    rounded-full
                    bg-primary
                  "
                ></span>
                Menunggu pesanan masuk
              </div>
            )}

            {/* FILTER EMPTY */}
            {bookings.length > 0 && (
              <div
                className="
                  mt-6
                  flex
                  flex-col
                  items-center
                  gap-3
                  sm:flex-row
                "
              >
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("Semua");
                  }}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-button
                    bg-primary
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-primary-hover
                  "
                >
                  <i className="ri-refresh-line text-base"></i>
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {deleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <button
            className="absolute inset-0"
            onClick={() => setDeleteModal(null)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-card border border-border bg-card p-6 animate-fadeIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
              <i className="ri-delete-bin-6-line text-2xl"></i>
            </div>

            <h2 className="mt-5 text-center text-xl font-bold text-heading">
              Hapus Pesanan?
            </h2>

            <p className="mt-3 text-center text-sm text-muted">
              Pesanan
              <span className="font-semibold text-heading">
                {" "}
                {deleteModal.ticket_code}
              </span>{" "}
              akan dihapus permanen.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deletingId}
                className="flex-1 rounded-button border border-border py-3 font-semibold text-heading hover:bg-white/5"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                disabled={deletingId}
                className="flex-1 rounded-button bg-danger py-3 font-semibold text-white hover:opacity-90"
              >
                {deletingId ? (
                  <>
                    <i className="ri-loader-4-line mr-2 animate-spin"></i>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <i className="ri-delete-bin-line mr-2"></i>
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================
// STAT CARD
// =========================
function StatCard({ icon, label, value }) {
  return (
    <div
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
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted">{label}</p>

          <p className="mt-2 text-2xl font-bold text-heading">{value}</p>
        </div>

        <div
          className="
            flex
            h-11
            w-11
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

// =========================
// TABLE HEADER
// =========================
function TableHeader({ children }) {
  return (
    <th
      className="
        whitespace-nowrap
        px-5
        py-4
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

// =========================
// TABLE CELL
// =========================
function TableCell({ children }) {
  return (
    <td
      className="
        px-5
        py-4
        align-middle
      "
    >
      {children}
    </td>
  );
}

export default AdminBookings;
