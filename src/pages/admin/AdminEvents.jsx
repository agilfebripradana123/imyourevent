import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function AdminEvents() {
  const location = useLocation();
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // =========================
  // FETCH EVENTS
  // =========================
  useEffect(() => {
    fetchEvents();
  }, []);

  // Ambil notification dari Create / Edit
  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.success);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location, navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        throw error;
      }

      setEvents(data ?? []);
    } catch (err) {
      console.error("Gagal mengambil event:", err);

      setError("Data event gagal dimuat.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORMAT PRICE
  // =========================
  const formatPrice = (price) => {
    if (Number(price) === 0) {
      return "Gratis";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
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
  // GET STORAGE PATH
  // =========================
  const getStoragePathFromUrl = (url) => {
    if (!url) return null;

    const marker = "/event-images/";
    const markerIndex = url.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(url.substring(markerIndex + marker.length));
  };

  // =========================
  // OPEN DELETE MODAL
  // =========================
  const openDeleteModal = (event) => {
    setDeleteTarget(event);
    setDeleteError("");
  };

  // =========================
  // CLOSE DELETE MODAL
  // =========================
  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setDeleteTarget(null);
    setDeleteError("");
  };

  // =========================
  // DELETE EVENT
  // =========================
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      setDeleteError("");

      const eventToDelete = deleteTarget;

      // Hapus event dari database
      const { error: deleteEventError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventToDelete.id);

      if (deleteEventError) {
        throw deleteEventError;
      }

      // Hilangkan event dari state
      setEvents((prev) =>
        prev.filter((event) => event.id !== eventToDelete.id),
      );

      // Hapus gambar dari Supabase Storage
      const imagePath = getStoragePathFromUrl(eventToDelete.image);

      if (imagePath) {
        const { error: imageDeleteError } = await supabase.storage
          .from("event-images")
          .remove([imagePath]);

        if (imageDeleteError) {
          console.error(
            "Event berhasil dihapus, tetapi gambar gagal dihapus:",
            imageDeleteError,
          );
        }
      }

      // Tutup modal
      setDeleteTarget(null);

      // Notification
      setSuccessMessage(`Event "${eventToDelete.title}" berhasil dihapus.`);
    } catch (err) {
      console.error("Gagal menghapus event:", err);

      setDeleteError(err.message || "Event gagal dihapus. Silakan coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* =========================
          HEADER
      ========================== */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Manajemen Event</p>

          <h1 className="mt-2 text-3xl font-bold text-heading">Kelola Event</h1>

          <p className="mt-2 text-sm text-muted">
            Tambah, edit, dan kelola event yang tersedia di platform.
          </p>
        </div>

        <Link
          to="/admin/events/create"
          className="
            inline-flex
            items-center
            justify-center
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
          <i className="ri-add-line text-lg"></i>
          Tambah Event
        </Link>
      </div>

      {/* =========================
          SUCCESS NOTIFICATION
      ========================== */}
      {successMessage && (
        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            gap-4
            rounded-card
            border
            border-success/30
            bg-success/10
            px-4 py-3
          "
        >
          <div className="flex items-center gap-3">
            <i className="ri-checkbox-circle-line text-lg text-success"></i>

            <p className="text-sm font-medium text-success">{successMessage}</p>
          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Tutup notifikasi"
            className="
              flex h-8 w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              text-success/70
              transition
              hover:bg-success/10
              hover:text-success
            "
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>
      )}

      {/* =========================
          SUMMARY
      ========================== */}
      <div className="mt-8 rounded-card border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Total Event</p>

            <p className="mt-2 text-3xl font-bold text-heading">
              {events.length}
            </p>
          </div>

          <div
            className="
              flex h-12 w-12
              items-center
              justify-center
              rounded-xl
              bg-primary/10
              text-primary
            "
          >
            <i className="ri-calendar-event-line text-2xl"></i>
          </div>
        </div>
      </div>

      {/* =========================
          ERROR
      ========================== */}
      {error && (
        <div className="mt-6 rounded-card border border-danger/30 bg-danger/10 p-4">
          <div className="flex items-start gap-3">
            <i className="ri-error-warning-line mt-0.5 text-lg text-danger"></i>

            <div>
              <p className="text-sm text-danger">{error}</p>

              <button
                type="button"
                onClick={fetchEvents}
                className="mt-3 text-sm font-semibold text-primary"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          LOADING
      ========================== */}
      {loading && (
        <div className="mt-8 rounded-card border border-border bg-card px-6 py-16 text-center">
          <i className="ri-loader-4-line inline-block animate-spin text-2xl text-primary"></i>

          <p className="mt-3 text-sm text-muted">Memuat data event...</p>
        </div>
      )}

      {/* =========================
          EMPTY STATE
      ========================== */}
      {!loading && !error && events.length === 0 && (
        <div className="mt-8 rounded-card border border-border bg-card px-6 py-16 text-center">
          <div
            className="
              mx-auto
              flex h-14 w-14
              items-center
              justify-center
              rounded-full
              bg-primary/10
              text-primary
            "
          >
            <i className="ri-calendar-event-line text-2xl"></i>
          </div>

          <p className="mt-4 text-lg font-semibold text-heading">
            Belum ada event
          </p>

          <p className="mt-2 text-sm text-muted">
            Tambahkan event pertama untuk mulai mengelola event.
          </p>

          <Link
            to="/admin/events/create"
            className="
              mt-5
              inline-flex
              items-center
              gap-2
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
            <i className="ri-add-line"></i>
            Tambah Event
          </Link>
        </div>
      )}

      {/* =========================
          DESKTOP TABLE
      ========================== */}
      {!loading && !error && events.length > 0 && (
        <div className="mt-8 hidden overflow-hidden rounded-card border border-border bg-card md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="border-b border-border bg-surface">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Event
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Kategori
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Tanggal
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Lokasi
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Harga
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    {/* Event */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="h-12 w-16 rounded-lg object-cover"
                        />

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-sm font-semibold text-heading">
                            {event.title}
                          </p>

                          {event.featured && (
                            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-primary">
                              <i className="ri-star-fill"></i>
                              Featured
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 text-sm text-text">
                      {event.category}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-text">
                      {formatDate(event.date)}
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4 text-sm text-text">
                      {event.location}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 text-sm font-medium text-heading">
                      {formatPrice(event.price)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/events/${event.id}/edit`}
                          title="Edit event"
                          aria-label={`Edit ${event.title}`}
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-button
                            border
                            border-border
                            bg-surface
                            px-3.5 py-2
                            text-xs
                            font-semibold
                            text-text
                            transition
                            hover:border-primary
                            hover:bg-primary/10
                            hover:text-primary
                            active:scale-[0.98]
                          "
                        >
                          <i className="ri-edit-line text-base"></i>
                          <span>Edit</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(event)}
                          title="Hapus event"
                          aria-label={`Hapus ${event.title}`}
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-button
                            border
                            border-danger/30
                            bg-danger/5
                            px-3.5 py-2
                            text-xs
                            font-semibold
                            text-danger
                            transition
                            hover:bg-danger/10
                            active:scale-[0.98]
                          "
                        >
                          <i className="ri-delete-bin-line text-base"></i>
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================
          MOBILE CARDS
      ========================== */}
      {!loading && !error && events.length > 0 && (
        <div className="mt-6 grid gap-4 md:hidden">
          {events.map((event) => (
            <article
              key={event.id}
              className="
                overflow-hidden
                rounded-card
                border
                border-border
                bg-card
                shadow-[0_12px_35px_rgba(0,0,0,0.15)]
              "
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="aspect-[16/9] w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Featured */}
                {event.featured && (
                  <span
                    className="
                      absolute right-3 top-3
                      flex items-center gap-1
                      rounded-full
                      border border-primary/20
                      bg-primary/90
                      px-2.5 py-1
                      text-[10px]
                      font-semibold
                      text-white
                      backdrop-blur-md
                    "
                  >
                    <i className="ri-star-fill text-xs"></i>
                    Featured
                  </span>
                )}

                {/* Category */}
                <span
                  className="
                    absolute bottom-3 left-3
                    rounded-full
                    border border-white/10
                    bg-black/50
                    px-3 py-1
                    text-[11px]
                    font-semibold
                    text-white
                    backdrop-blur-md
                  "
                >
                  {event.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h2 className="line-clamp-2 text-base font-semibold leading-6 text-heading">
                  {event.title}
                </h2>

                {/* Information */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-muted">
                    <i className="ri-calendar-line text-base text-primary"></i>

                    <span>{formatDate(event.date)}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-sm text-muted">
                    <i className="ri-map-pin-line text-base text-primary"></i>

                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                    Harga Tiket
                  </p>

                  <p className="mt-1 text-lg font-bold text-heading">
                    {formatPrice(event.price)}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    to={`/admin/events/${event.id}/edit`}
                    aria-label={`Edit ${event.title}`}
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-button
                      border
                      border-border
                      bg-surface
                      px-4 py-2.5
                      text-sm
                      font-semibold
                      text-text
                      transition
                      hover:border-primary
                      hover:bg-primary/10
                      hover:text-primary
                      active:scale-[0.98]
                    "
                  >
                    <i className="ri-edit-line text-base"></i>
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => openDeleteModal(event)}
                    aria-label={`Hapus ${event.title}`}
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-button
                      border
                      border-danger/30
                      bg-danger/5
                      px-4 py-2.5
                      text-sm
                      font-semibold
                      text-danger
                      transition
                      hover:bg-danger/10
                      active:scale-[0.98]
                    "
                  >
                    <i className="ri-delete-bin-line text-base"></i>
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* =========================
          DELETE MODAL
          Global: desktop + mobile
      ========================== */}
      {deleteTarget && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/70
            px-4
            backdrop-blur-sm
          "
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-md
              rounded-card
              border
              border-border
              bg-card
              p-6
              shadow-[0_25px_80px_rgba(0,0,0,0.5)]
            "
          >
            {/* Icon */}
            <div
              className="
                flex h-12 w-12
                items-center
                justify-center
                rounded-full
                bg-danger/10
                text-danger
              "
            >
              <i className="ri-delete-bin-line text-xl"></i>
            </div>

            {/* Content */}
            <h2 className="mt-5 text-xl font-bold text-heading">
              Hapus Event?
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted">
              Event{" "}
              <span className="font-semibold text-heading">
                {deleteTarget.title}
              </span>{" "}
              akan dihapus secara permanen.
            </p>

            <p className="mt-2 text-xs text-danger">
              Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Error */}
            {deleteError && (
              <div className="mt-5 rounded-input border border-danger/30 bg-danger/10 px-4 py-3">
                <div className="flex items-start gap-2">
                  <i className="ri-error-warning-line mt-0.5 text-danger"></i>

                  <p className="text-sm text-danger">{deleteError}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={closeDeleteModal}
                className="
                  rounded-button
                  border
                  border-border
                  px-5 py-2.5
                  text-sm
                  font-semibold
                  text-text
                  transition
                  hover:bg-white/5
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDelete}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-button
                  bg-danger
                  px-5 py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:opacity-90
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {deleteLoading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <i className="ri-delete-bin-line"></i>
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminEvents;
