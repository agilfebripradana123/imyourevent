import { Link } from "react-router-dom";

function EventCard({ event }) {
  const formatDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  };

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

  const getStatusStyle = () => {
    switch (event.status) {
      case "Tersedia":
        return "bg-success/15 text-success";

      case "Habis":
        return "bg-danger/15 text-danger";

      case "Selesai":
        return "bg-white/10 text-white/60";

      default:
        return "bg-white/10 text-white/70";
    }
  };

  return (
    <article
      className="
        group
        flex h-full
        flex-col
        overflow-hidden
        rounded-card
        border border-border
        bg-card
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/40
        hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]
      "
    >
      {/* =========================
          IMAGE
      ========================== */}
      <Link
        to={`/events/${event.id}`}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />

        {/* Overlay */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            bg-gradient-to-t
            from-black/70
            via-black/10
            to-transparent
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
            font-medium
            text-white
            backdrop-blur-md
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
              gap-1
              rounded-full
              bg-primary/90
              px-2.5 py-1.5
              text-[10px]
              font-semibold
              text-white
              backdrop-blur-md
            "
          >
            <i className="ri-star-fill"></i>
            Featured
          </span>
        )}

        {/* Status */}
        <span
          className={`
            absolute
            bottom-4
            right-4
            rounded-full
            px-3 py-1
            text-xs
            font-semibold
            backdrop-blur-md
            ${getStatusStyle()}
          `}
        >
          {event.status || "Tersedia"}
        </span>
      </Link>

      {/* =========================
          CONTENT
      ========================== */}
      <div className="flex flex-1 flex-col p-5">
        {/* Date */}
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <i className="ri-calendar-line text-sm"></i>

          <span>{formatDate(event.date)}</span>
        </div>

        {/* Title */}
        <Link to={`/events/${event.id}`}>
          <h3
            className="
              mt-3
              line-clamp-2
              text-lg
              font-semibold
              leading-6
              text-heading
              transition-colors
              group-hover:text-primary
            "
          >
            {event.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="mt-3 flex items-start gap-2 text-sm text-muted">
          <i className="ri-map-pin-line mt-0.5 shrink-0 text-base text-primary"></i>

          <p className="line-clamp-2">{event.location}</p>
        </div>

        {/* Push footer */}
        <div className="flex-1" />

        {/* =========================
            FOOTER
        ========================== */}
        <div
          className="
            mt-5
            flex
            items-end
            justify-between
            gap-4
            border-t
            border-border
            pt-4
          "
        >
          {/* Price */}
          <div className="min-w-0">
            <p className="text-xs text-muted">Mulai dari</p>

            <p className="mt-1 truncate font-bold text-heading">
              {formatPrice(event.price)}
            </p>
          </div>

          {/* Detail */}
          <Link
            to={`/events/${event.id}`}
            aria-label={`Lihat detail ${event.title}`}
            className="
              flex
              shrink-0
              items-center
              gap-2
              rounded-button
              bg-primary/10
              px-4 py-2
              text-sm
              font-semibold
              text-primary
              transition
              hover:bg-primary
              hover:text-white
            "
          >
            Detail
            <i className="ri-arrow-right-line transition-transform group-hover:translate-x-0.5"></i>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
