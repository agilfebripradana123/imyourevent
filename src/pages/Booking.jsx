import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function Booking() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { user, profile, loading: authLoading } = useAuth();

  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // ISI DATA PEMESAN
  // =========================
  useEffect(() => {
    if (!user) return;

    setForm({
      name: profile?.name || user.user_metadata?.name || "",
      email: user.email || "",
    });
  }, [user, profile]);

  // =========================
  // FETCH EVENT
  // =========================
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .maybeSingle();

        if (error) throw error;

        setEvent(data);
      } catch (err) {
        console.error("Gagal mengambil event:", err);
        setError("Event gagal dimuat. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // =========================
  // FORMAT
  // =========================
  const formatPrice = (price) => {
    const numericPrice = Number(price);

    if (numericPrice === 0) return "Gratis";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  };

  const totalPrice = event ? Number(event.price) * quantity : 0;

  // =========================
  // QUANTITY
  // =========================
  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(10, prev + 1));
  };

  // =========================
  // FORM
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =========================
  // SUBMIT BOOKING
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login", {
        state: {
          from: `/booking/${eventId}`,
        },
      });

      return;
    }

    if (!event) return;

    if (!form.name.trim()) {
      setError("Nama pemesan wajib diisi.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email pemesan wajib diisi.");
      return;
    }

    if (event.status === "Habis" || event.status === "Selesai") {
      setError("Event ini sudah tidak dapat dipesan.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const { data, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          event_id: event.id,
          customer_name: form.name.trim(),
          customer_email: form.email.trim(),
          quantity,
        })
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      console.log("BOOKING BERHASIL:", data);

      navigate("/my-tickets", {
        replace: true,
        state: {
          bookingSuccess: true,
          ticketCode: data.ticket_code,
        },
      });
    } catch (err) {
      console.error("Booking gagal:", err);

      setError(err.message || "Pemesanan tiket gagal. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
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

          <p className="mt-3 text-sm text-muted">Memeriksa akun...</p>
        </div>
      </main>
    );
  }

  // =========================
  // BELUM LOGIN
  // =========================
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-card border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <i className="ri-user-line text-2xl"></i>
          </div>

          <h1 className="mt-5 text-2xl font-bold text-heading">
            Login diperlukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            Kamu harus masuk ke akun terlebih dahulu sebelum memesan tiket.
          </p>

          <Link
            to="/login"
            state={{
              from: `/booking/${eventId}`,
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-button bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <i className="ri-login-box-line"></i>
            Masuk
          </Link>

          <Link
            to={`/events/${eventId}`}
            className="mt-3 inline-block text-sm font-medium text-muted transition hover:text-primary"
          >
            Kembali ke event
          </Link>
        </div>
      </main>
    );
  }

  // =========================
  // EVENT LOADING
  // =========================
  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-32">
        <div className="container-app text-center">
          <i className="ri-loader-4-line inline-block animate-spin text-3xl text-primary"></i>

          <p className="mt-4 text-sm text-muted">Memuat informasi event...</p>
        </div>
      </main>
    );
  }

  // =========================
  // EVENT NOT FOUND
  // =========================
  if (!event) {
    return (
      <main className="min-h-screen bg-background pt-32">
        <div className="container-app text-center">
          <p className="text-sm font-semibold text-primary">404</p>

          <h1 className="mt-2 text-3xl font-bold text-heading">
            Event tidak ditemukan
          </h1>

          <p className="mt-3 text-sm text-muted">
            Event mungkin sudah dihapus atau tidak tersedia.
          </p>

          <Link
            to="/events"
            className="mt-6 inline-flex items-center gap-2 rounded-button bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <i className="ri-arrow-left-line"></i>
            Kembali ke Event
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20 pt-28">
      <div className="container-app">
        {/* BACK */}
        <Link
          to={`/events/${event.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
        >
          <i className="ri-arrow-left-line"></i>
          Kembali ke Detail Event
        </Link>

        {/* HEADER */}
        <div className="mt-7 max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <i className="ri-ticket-2-line text-lg"></i>
            Pemesanan Tiket
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading md:text-4xl">
            Selesaikan Pemesananmu
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            Pilih jumlah tiket dan pastikan informasi pemesan sudah benar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
        >
          {/* =====================
              LEFT
          ====================== */}
          <div className="space-y-6">
            {/* EVENT */}
            <section className="overflow-hidden rounded-card border border-border bg-card">
              <div className="grid sm:grid-cols-[220px_1fr]">
                <div className="relative h-52 sm:h-full">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent sm:hidden" />
                </div>

                <div className="p-5 sm:p-6">
                  <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {event.category}
                  </span>

                  <h2 className="mt-3 text-xl font-bold leading-7 text-heading">
                    {event.title}
                  </h2>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <i className="ri-calendar-line text-primary"></i>
                      {formatDate(event.date)}
                    </div>

                    <div className="flex items-start gap-2 text-sm text-muted">
                      <i className="ri-map-pin-line mt-0.5 text-primary"></i>
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* QUANTITY */}
            <section className="rounded-card border border-border bg-card p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <i className="ri-ticket-line text-xl"></i>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-heading">
                    Jumlah Tiket
                  </h2>

                  <p className="mt-1 text-sm text-muted">
                    Maksimal 10 tiket dalam satu pemesanan.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-5 rounded-input border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-heading">Tiket Reguler</p>

                  <p className="mt-1 text-sm font-semibold text-primary">
                    {formatPrice(event.price)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-start">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity === 1}
                    aria-label="Kurangi tiket"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-heading transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <i className="ri-subtract-line"></i>
                  </button>

                  <span className="min-w-6 text-center text-lg font-bold text-heading">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity === 10}
                    aria-label="Tambah tiket"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-heading transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <i className="ri-add-line"></i>
                  </button>
                </div>
              </div>
            </section>

            {/* CUSTOMER */}
            <section className="rounded-card border border-border bg-card p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <i className="ri-user-line text-xl"></i>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-heading">
                    Informasi Pemesan
                  </h2>

                  <p className="mt-1 text-sm text-muted">
                    Tiket akan diterbitkan menggunakan informasi berikut.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Nama Lengkap
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-input border border-border bg-surface px-4 py-3 text-sm text-heading outline-none transition placeholder:text-muted focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="nama@email.com"
                    className="w-full rounded-input border border-border bg-surface px-4 py-3 text-sm text-heading outline-none transition placeholder:text-muted focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-input border border-primary/10 bg-primary/5 p-3">
                <i className="ri-information-line mt-0.5 text-primary"></i>

                <p className="text-xs leading-5 text-muted">
                  Nama dan email otomatis diambil dari akunmu, tetapi masih
                  dapat disesuaikan untuk pemesan.
                </p>
              </div>
            </section>
          </div>

          {/* =====================
              ORDER SUMMARY
          ====================== */}
          <aside>
            <div className="overflow-hidden rounded-card border border-border bg-card lg:sticky lg:top-28">
              <div className="border-b border-border p-6">
                <h2 className="text-lg font-semibold text-heading">
                  Ringkasan Pesanan
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Periksa kembali pesananmu.
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between gap-5">
                    <span className="text-sm text-muted">Harga tiket</span>

                    <span className="text-sm font-medium text-heading">
                      {formatPrice(event.price)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-5">
                    <span className="text-sm text-muted">Jumlah</span>

                    <span className="text-sm font-medium text-heading">
                      {quantity} tiket
                    </span>
                  </div>

                  <div className="flex justify-between gap-5">
                    <span className="text-sm text-muted">Biaya layanan</span>

                    <span className="text-sm font-medium text-success">
                      Gratis
                    </span>
                  </div>
                </div>

                <div className="my-6 h-px bg-border" />

                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="font-medium text-text">Total</p>

                    <p className="mt-1 text-xs text-muted">
                      {quantity} × {formatPrice(event.price)}
                    </p>
                  </div>

                  <span className="text-right text-2xl font-bold text-heading">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="mt-5 flex items-start gap-2 rounded-input border border-danger/20 bg-danger/10 p-3">
                    <i className="ri-error-warning-line mt-0.5 text-danger"></i>

                    <p className="text-sm text-danger">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-button bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(232,62,156,0.2)] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-lg"></i>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <i className="ri-secure-payment-line text-lg"></i>
                      Konfirmasi Pesanan
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-start justify-center gap-2">
                  <i className="ri-shield-check-line mt-0.5 text-sm text-success"></i>

                  <p className="text-center text-xs leading-5 text-muted">
                    Pastikan informasi pemesanan sudah benar sebelum
                    melanjutkan.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Booking;
