import { useEffect, useMemo, useState } from "react";
import EventCard from "../components/EventCard";
import { supabase } from "../lib/supabase";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [location, setLocation] = useState("Semua");
  const [price, setPrice] = useState("Semua");
  const [sort, setSort] = useState("tanggal-terdekat");

  // =========================
  // FETCH EVENTS
  // =========================
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        throw error;
      }

      setEvents(data ?? []);
    } catch (error) {
      console.error("Gagal mengambil event:", error);

      setFetchError(
        "Event gagal dimuat. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // =========================
  // DYNAMIC CATEGORIES
  // =========================
  const categories = useMemo(() => {
    return [
      ...new Set(
        events
          .map((event) => event.category)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [events]);

  // =========================
  // DYNAMIC LOCATIONS
  // =========================
  const locations = useMemo(() => {
    return [
      ...new Set(
        events
          .map((event) => event.location)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [events]);

  // =========================
  // FILTER + SORT
  // =========================
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // -------------------------
    // Search
    // -------------------------
    const keyword = search.trim().toLowerCase();

    if (keyword) {
      result = result.filter((event) => {
        const title = event.title?.toLowerCase() ?? "";
        const eventLocation =
          event.location?.toLowerCase() ?? "";
        const eventCategory =
          event.category?.toLowerCase() ?? "";

        return (
          title.includes(keyword) ||
          eventLocation.includes(keyword) ||
          eventCategory.includes(keyword)
        );
      });
    }

    // -------------------------
    // Category
    // -------------------------
    if (category !== "Semua") {
      result = result.filter(
        (event) => event.category === category,
      );
    }

    // -------------------------
    // Location
    // -------------------------
    if (location !== "Semua") {
      result = result.filter(
        (event) => event.location === location,
      );
    }

    // -------------------------
    // Price
    // -------------------------
    if (price === "Gratis") {
      result = result.filter(
        (event) => Number(event.price) === 0,
      );
    }

    if (price === "Dibawah 50000") {
      result = result.filter((event) => {
        const eventPrice = Number(event.price);

        return eventPrice > 0 && eventPrice < 50000;
      });
    }

    if (price === "50000-100000") {
      result = result.filter((event) => {
        const eventPrice = Number(event.price);

        return (
          eventPrice >= 50000 &&
          eventPrice <= 100000
        );
      });
    }

    if (price === "Diatas 100000") {
      result = result.filter(
        (event) => Number(event.price) > 100000,
      );
    }

    // -------------------------
    // Sort
    // -------------------------
    if (sort === "tanggal-terdekat") {
      result.sort(
        (a, b) =>
          new Date(`${a.date}T00:00:00`) -
          new Date(`${b.date}T00:00:00`),
      );
    }

    if (sort === "tanggal-terbaru") {
      result.sort(
        (a, b) =>
          new Date(`${b.date}T00:00:00`) -
          new Date(`${a.date}T00:00:00`),
      );
    }

    if (sort === "harga-rendah") {
      result.sort(
        (a, b) =>
          Number(a.price) - Number(b.price),
      );
    }

    if (sort === "harga-tinggi") {
      result.sort(
        (a, b) =>
          Number(b.price) - Number(a.price),
      );
    }

    if (sort === "nama") {
      result.sort((a, b) =>
        a.title.localeCompare(b.title),
      );
    }

    return result;
  }, [
    events,
    search,
    category,
    location,
    price,
    sort,
  ]);

  // =========================
  // RESET FILTER
  // =========================
  const resetFilter = () => {
    setSearch("");
    setCategory("Semua");
    setLocation("Semua");
    setPrice("Semua");
    setSort("tanggal-terdekat");
  };

  const hasActiveFilter =
    search.trim() !== "" ||
    category !== "Semua" ||
    location !== "Semua" ||
    price !== "Semua";

  const selectClass = `
    w-full
    rounded-input
    border border-border
    bg-surface
    px-4 py-3
    text-sm
    text-heading
    outline-none
    transition
    focus:border-primary
  `;

  return (
    <main className="min-h-screen bg-background pb-20 pt-32">
      <div className="container-app">
        {/* =========================
            HEADER
        ========================== */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <i className="ri-compass-3-line text-lg"></i>
            Jelajahi Event
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl lg:text-5xl">
            Temukan Event
            <span className="text-primary">
              {" "}
              Favoritmu.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
            Temukan konser, workshop, konferensi,
            festival, dan berbagai event menarik
            lainnya.
          </p>
        </div>

        {/* =========================
            FILTER
        ========================== */}
        <section className="mt-10 rounded-card border border-border bg-card p-4 sm:p-5">
          {/* Search */}
          <div>
            <label
              htmlFor="search-event"
              className="mb-2 block text-xs font-semibold text-muted"
            >
              Cari Event
            </label>

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
                id="search-event"
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Cari nama, kategori, atau lokasi event..."
                className="
                  w-full
                  rounded-input
                  border border-border
                  bg-surface
                  py-3
                  pl-11
                  pr-11
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
          </div>

          {/* Filters */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Category */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted">
                Kategori
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className={selectClass}
              >
                <option value="Semua">
                  Semua Kategori
                </option>

                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted">
                Lokasi
              </label>

              <select
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                className={selectClass}
              >
                <option value="Semua">
                  Semua Lokasi
                </option>

                {locations.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted">
                Harga
              </label>

              <select
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className={selectClass}
              >
                <option value="Semua">
                  Semua Harga
                </option>

                <option value="Gratis">
                  Gratis
                </option>

                <option value="Dibawah 50000">
                  Di bawah Rp50.000
                </option>

                <option value="50000-100000">
                  Rp50.000 - Rp100.000
                </option>

                <option value="Diatas 100000">
                  Di atas Rp100.000
                </option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted">
                Urutkan
              </label>

              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value)
                }
                className={selectClass}
              >
                <option value="tanggal-terdekat">
                  Tanggal Terdekat
                </option>

                <option value="tanggal-terbaru">
                  Tanggal Terbaru
                </option>

                <option value="harga-rendah">
                  Harga Terendah
                </option>

                <option value="harga-tinggi">
                  Harga Tertinggi
                </option>

                <option value="nama">
                  Nama A-Z
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* =========================
            RESULT HEADER
        ========================== */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-heading">
              Semua Event
            </h2>

            {!loading && !fetchError && (
              <p className="mt-1 text-sm text-muted">
                <span className="font-semibold text-heading">
                  {filteredEvents.length}
                </span>{" "}
                event ditemukan
              </p>
            )}
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilter}
              className="
                flex
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
              <i className="ri-refresh-line"></i>
              Reset Filter
            </button>
          )}
        </div>

        {/* =========================
            LOADING
        ========================== */}
        {loading && (
          <div className="mt-7 rounded-card border border-border bg-card px-6 py-16 text-center">
            <i className="ri-loader-4-line inline-block animate-spin text-3xl text-primary"></i>

            <p className="mt-4 text-sm text-muted">
              Memuat event...
            </p>
          </div>
        )}

        {/* =========================
            ERROR
        ========================== */}
        {!loading && fetchError && (
          <div className="mt-7 rounded-card border border-danger/20 bg-danger/5 px-6 py-16 text-center">
            <div
              className="
                mx-auto
                flex h-14 w-14
                items-center
                justify-center
                rounded-full
                bg-danger/10
                text-danger
              "
            >
              <i className="ri-error-warning-line text-2xl"></i>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-heading">
              Gagal memuat event
            </h3>

            <p className="mt-2 text-sm text-muted">
              {fetchError}
            </p>

            <button
              type="button"
              onClick={fetchEvents}
              className="
                mt-6
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
              <i className="ri-refresh-line"></i>
              Coba Lagi
            </button>
          </div>
        )}

        {/* =========================
            EVENT GRID
        ========================== */}
        {!loading &&
          !fetchError &&
          filteredEvents.length > 0 && (
            <div
              className="
                mt-7
                grid
                grid-cols-1
                gap-6
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}
            </div>
          )}

        {/* =========================
            EMPTY
        ========================== */}
        {!loading &&
          !fetchError &&
          filteredEvents.length === 0 && (
            <div className="mt-7 rounded-card border border-border bg-card px-6 py-16 text-center">
              <div
                className="
                  mx-auto
                  flex h-14 w-14
                  items-center
                  justify-center
                  rounded-full
                  border border-primary/20
                  bg-primary/10
                  text-primary
                "
              >
                <i className="ri-search-line text-2xl"></i>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-heading">
                Event tidak ditemukan
              </h3>

              <p className="mt-2 text-sm text-muted">
                Coba ubah kata pencarian atau filter
                yang digunakan.
              </p>

              <button
                type="button"
                onClick={resetFilter}
                className="
                  mt-6
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
                <i className="ri-refresh-line"></i>
                Reset Filter
              </button>
            </div>
          )}
      </div>
    </main>
  );
}

export default Events;