import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Hero from "../components/Hero";
import EventCard from "../components/EventCard";

import { supabase } from "../lib/supabase";

function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState("");

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoadingEvents(true);
        setEventError("");

        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("featured", true)
          .order("date", { ascending: true })
          .limit(3);

        if (error) {
          throw error;
        }

        setFeaturedEvents(data ?? []);
      } catch (error) {
        console.error("Gagal mengambil featured events:", error);

        setEventError("Event pilihan gagal dimuat. Silakan coba lagi.");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  return (
    <>
      {/* HERO */}
      <Hero />

      {/* FEATURED EVENTS */}
      <section className="relative overflow-hidden bg-background py-20">
        {/* Decorative Glow */}
        <div
          className="
            pointer-events-none
            absolute
            -left-32
            top-20
            h-72
            w-72
            rounded-full
            bg-primary/5
            blur-[120px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-32
            bottom-0
            h-72
            w-72
            rounded-full
            bg-violet/5
            blur-[120px]
          "
        />

        <div className="container-app relative">
          {/* SECTION HEADER */}
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
              <h2
                className="
                  mt-3
                  max-w-xl
                  text-3xl
                  font-bold
                  tracking-tight
                  text-heading
                  md:text-4xl
                "
              >
                Event yang sayang untuk{" "}
                <span
                  className="
                    bg-gradient-to-r
                    from-primary
                    to-violet
                    bg-clip-text
                    text-transparent
                  "
                >
                  dilewatkan
                </span>
              </h2>

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-7
                  text-muted
                  sm:text-base
                "
              >
                Pilihan event menarik yang bisa kamu temukan dan pesan langsung
                melalui IMYOUR event.
              </p>
            </div>

            {/* DESKTOP VIEW ALL */}
            <Link
              to="/events"
              className="
                hidden
                shrink-0
                items-center
                gap-2
                rounded-full
                border
                border-border
                bg-card
                px-5
                py-2.5
                text-sm
                font-semibold
                text-heading
                transition-all
                duration-300
                hover:border-primary/40
                hover:bg-primary/10
                hover:text-primary
                sm:flex
              "
            >
              Lihat Semua Event
              <span className="text-lg leading-none">→</span>
            </Link>
          </div>

          {/* CONTENT */}
          <div className="mt-10">
            {loadingEvents ? (
              /* LOADING */
              <div
                className="
                  rounded-card
                  border
                  border-border
                  bg-card
                  px-6
                  py-16
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    h-10
                    w-10
                    animate-spin
                    rounded-full
                    border-2
                    border-border
                    border-t-primary
                  "
                />

                <p className="mt-4 text-sm text-muted">
                  Memuat event pilihan...
                </p>
              </div>
            ) : eventError ? (
              /* ERROR */
              <div
                className="
                  rounded-card
                  border
                  border-danger/20
                  bg-danger/5
                  px-6
                  py-14
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-danger/10
                    text-xl
                    text-danger
                  "
                >
                  !
                </div>

                <h3 className="mt-4 font-semibold text-heading">
                  Event gagal dimuat
                </h3>

                <p className="mt-2 text-sm text-muted">{eventError}</p>
              </div>
            ) : featuredEvents.length > 0 ? (
              /* EVENT GRID */
              <div
                className="
                  grid
                  grid-cols-1
                  gap-6
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {featuredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              /* EMPTY */
              <div
                className="
                  rounded-card
                  border
                  border-border
                  bg-card
                  px-6
                  py-14
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-primary/10
                    text-xl
                    text-primary
                  "
                >
                  ☆
                </div>

                <h3 className="mt-4 font-semibold text-heading">
                  Belum ada event pilihan
                </h3>

                <p className="mt-2 text-sm text-muted">
                  Event menarik akan segera hadir di sini.
                </p>
              </div>
            )}
          </div>

          {/* MOBILE VIEW ALL */}
          <Link
            to="/events"
            className="
              mt-8
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-button
              border
              border-border
              bg-card
              px-5
              py-3
              text-sm
              font-semibold
              text-heading
              transition
              hover:border-primary/40
              hover:text-primary
              sm:hidden
            "
          >
            Lihat Semua Event
            <span>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;
