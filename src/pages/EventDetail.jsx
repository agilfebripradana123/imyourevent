import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function EventDetail() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          .eq("id", id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setEvent(data);
      } catch (err) {
        console.error("Gagal mengambil detail event:", err);

        setError("Detail event gagal dimuat. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

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
    switch (status) {
      case "Tersedia":
        return "bg-success/10 text-success border-success/20";

      case "Habis":
        return "bg-danger/10 text-danger border-danger/20";

      case "Selesai":
        return "bg-white/5 text-muted border-border";

      default:
        return "bg-success/10 text-success border-success/20";
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="min-h-screen bg-background pb-20 pt-32">
        <div className="container-app">
          <div className="rounded-card border border-border bg-card px-6 py-20 text-center">
            <i className="ri-loader-4-line inline-block animate-spin text-3xl text-primary"></i>

            <p className="mt-4 text-sm text-muted">Memuat detail event...</p>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <main className="min-h-screen bg-background pb-20 pt-32">
        <div className="container-app">
          <div className="rounded-card border border-danger/20 bg-danger/5 px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
              <i className="ri-error-warning-line text-2xl"></i>
            </div>

            <h1 className="mt-5 text-2xl font-bold text-heading">
              Gagal memuat event
            </h1>

            <p className="mt-2 text-sm text-muted">{error}</p>

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
              <i className="ri-arrow-left-line"></i>
              Kembali ke Event
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // NOT FOUND
  // =========================
  if (!event) {
    return (
      <main className="min-h-screen bg-background pb-20 pt-32">
        <div className="container-app">
          <div className="rounded-card border border-border bg-card px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <i className="ri-calendar-close-line text-2xl"></i>
            </div>

            <p className="mt-5 text-sm font-semibold text-primary">404</p>

            <h1 className="mt-2 text-3xl font-bold text-heading">
              Event tidak ditemukan
            </h1>

            <p className="mt-3 text-sm text-muted">
              Event yang kamu cari mungkin sudah tidak tersedia atau telah
              dihapus.
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
              <i className="ri-arrow-left-line"></i>
              Kembali ke Event
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const canBook = event.status !== "Habis" && event.status !== "Selesai";

  return (
    <main className="min-h-screen bg-background pb-20 pt-28">
      {/* =========================
          HERO
      ========================== */}
      <section className="container-app">
        {/* Back */}
        <Link
          to="/events"
          className="
            mb-5
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
          Kembali ke Event
        </Link>

        {/* Image */}
        <div
          className="
            relative
            h-[300px]
            overflow-hidden
            rounded-card
            border border-border
            sm:h-[360px]
            md:h-[420px]
            lg:h-[480px]
          "
        >
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover"
          />

          {/* Overlay */}
          <div
            className="
              pointer-events-none
              absolute inset-0
              bg-gradient-to-t
              from-background
              via-black/20
              to-black/10
            "
          />

          {/* Category */}
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
              font-semibold
              text-white
              backdrop-blur-md
              sm:left-5
              sm:top-5
              sm:px-4
              sm:py-2
            "
          >
            {event.category}
          </span>

          {/* Featured */}
          {event.featured && (
            <span
              className="
                absolute
                right-4
                top-4
                flex
                items-center
                gap-1.5
                rounded-full
                bg-primary/90
                px-3 py-1.5
                text-xs
                font-semibold
                text-white
                backdrop-blur-md
                sm:right-5
                sm:top-5
              "
            >
              <i className="ri-star-fill"></i>
              Featured
            </span>
          )}

          {/* Bottom Information */}
          <div className="absolute bottom-5 left-5 right-5 hidden sm:block">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-sm text-white/80">
                <i className="ri-calendar-line"></i>
                {formatDate(event.date)}
              </span>

              <span className="h-1 w-1 rounded-full bg-white/40" />

              <span className="flex items-center gap-2 text-sm text-white/80">
                <i className="ri-map-pin-line"></i>
                {event.location}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          EVENT CONTENT
      ========================== */}
      <section className="container-app mt-8 sm:mt-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* =====================
              LEFT
          ====================== */}
          <div className="min-w-0">
            {/* Status */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-3 py-1.5
                  text-xs
                  font-semibold
                  ${getStatusStyle(event.status)}
                `}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                {event.status || "Tersedia"}
              </span>

              <span className="text-sm font-semibold text-primary">
                {formatDate(event.date)}
              </span>
            </div>

            {/* Title */}
            <h1
              className="
                mt-4
                max-w-4xl
                text-3xl
                font-bold
                leading-tight
                tracking-tight
                text-heading
                sm:text-4xl
                lg:text-5xl
              "
            >
              {event.title}
            </h1>

            {/* =====================
                BASIC INFORMATION
            ====================== */}
            <div
              className="
                mt-8
                grid
                gap-3
                sm:grid-cols-3
              "
            >
              {/* Date */}
              <div className="rounded-card border border-border bg-card p-4">
                <div
                  className="
                    flex h-9 w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/10
                    text-primary
                  "
                >
                  <i className="ri-calendar-line text-lg"></i>
                </div>

                <p className="mt-4 text-xs text-muted">Tanggal</p>

                <p className="mt-1 text-sm font-semibold text-heading">
                  {formatDate(event.date)}
                </p>
              </div>

              {/* Location */}
              <div className="rounded-card border border-border bg-card p-4">
                <div
                  className="
                    flex h-9 w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/10
                    text-primary
                  "
                >
                  <i className="ri-map-pin-line text-lg"></i>
                </div>

                <p className="mt-4 text-xs text-muted">Lokasi</p>

                <p className="mt-1 text-sm font-semibold text-heading">
                  {event.location}
                </p>
              </div>

              {/* Category */}
              <div className="rounded-card border border-border bg-card p-4">
                <div
                  className="
                    flex h-9 w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/10
                    text-primary
                  "
                >
                  <i className="ri-price-tag-3-line text-lg"></i>
                </div>

                <p className="mt-4 text-xs text-muted">Kategori</p>

                <p className="mt-1 text-sm font-semibold text-heading">
                  {event.category}
                </p>
              </div>
            </div>

            {/* =====================
                DESCRIPTION
            ====================== */}
            <div className="mt-10 border-t border-border pt-10">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-10 w-10
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/10
                    text-primary
                  "
                >
                  <i className="ri-file-text-line text-xl"></i>
                </div>

                <h2 className="text-2xl font-bold text-heading">
                  Tentang Event
                </h2>
              </div>

              {event.description ? (
                <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-7 text-text sm:text-base">
                  {event.description}
                </p>
              ) : (
                <>
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-text sm:text-base">
                    Nikmati pengalaman menarik di{" "}
                    <span className="font-semibold text-heading">
                      {event.title}
                    </span>
                    . Event ini menghadirkan berbagai aktivitas dan pengalaman
                    yang dapat dinikmati bersama komunitas maupun teman-temanmu.
                  </p>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-text sm:text-base">
                    Jangan lewatkan kesempatan untuk menjadi bagian dari event
                    ini. Pesan tiket lebih awal untuk memastikan tempatmu
                    tersedia.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* =====================
              BOOKING CARD
          ====================== */}
          <aside>
            <div
              className="
                overflow-hidden
                rounded-card
                border border-border
                bg-card
                lg:sticky
                lg:top-28
              "
            >
              {/* Header */}
              <div className="border-b border-border p-6">
                <p className="text-sm text-muted">Harga tiket</p>

                <p className="mt-2 text-3xl font-bold text-heading">
                  {formatPrice(event.price)}
                </p>

                {Number(event.price) > 0 && (
                  <p className="mt-1 text-xs text-muted">per tiket</p>
                )}
              </div>

              {/* Information */}
              <div className="space-y-5 p-6">
                {/* Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <i className="ri-checkbox-circle-line"></i>
                    Status
                  </div>

                  <span
                    className={`
                      rounded-full
                      border
                      px-2.5 py-1
                      text-xs
                      font-semibold
                      ${getStatusStyle(event.status)}
                    `}
                  >
                    {event.status || "Tersedia"}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex shrink-0 items-center gap-2 text-sm text-muted">
                    <i className="ri-map-pin-line"></i>
                    Lokasi
                  </div>

                  <span className="text-right text-sm font-medium text-heading">
                    {event.location}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex shrink-0 items-center gap-2 text-sm text-muted">
                    <i className="ri-calendar-line"></i>
                    Tanggal
                  </div>

                  <span className="text-right text-sm font-medium text-heading">
                    {formatDate(event.date)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-border p-6">
                {canBook ? (
                  <Link
                    to={`/booking/${event.id}`}
                    className="
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-button
                      bg-primary
                      px-5 py-3.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-[0_0_25px_rgba(232,62,156,0.2)]
                      transition
                      hover:bg-primary-hover
                      active:scale-[0.99]
                    "
                  >
                    <i className="ri-ticket-2-line text-lg"></i>
                    Pesan Tiket
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="
                      flex
                      w-full
                      cursor-not-allowed
                      items-center
                      justify-center
                      gap-2
                      rounded-button
                      bg-white/5
                      px-5 py-3.5
                      text-sm
                      font-semibold
                      text-muted
                    "
                  >
                    <i className="ri-ticket-2-line text-lg"></i>

                    {event.status === "Habis" ? "Tiket Habis" : "Event Selesai"}
                  </button>
                )}

                <div className="mt-4 flex items-start justify-center gap-2">
                  <i className="ri-shield-check-line mt-0.5 text-sm text-success"></i>

                  <p className="text-center text-xs leading-5 text-muted">
                    Tiket elektronik akan tersedia setelah pemesanan.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default EventDetail;
