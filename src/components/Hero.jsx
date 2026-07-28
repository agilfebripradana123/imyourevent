import heroEvent from "../assets/hero/hero-event.webp";
function Hero() {
  return (
    <section className="relative min-h-[650px] overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/assets/hero/hero-event.webp"
          alt="Suasana event"
          className="h-full w-full object-cover object-center"
        />

        {/* Dark */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Left readability */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-r
            from-background
            via-background/80
            to-background/10
          "
        />

        {/* Bottom fade */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-background
            via-transparent
            to-black/20
          "
        />
      </div>

      {/* Color Lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="
            absolute
            -right-40
            -top-40
            h-[600px]
            w-[600px]
            rounded-full
            bg-primary/25
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            right-[15%]
            top-[20%]
            h-[400px]
            w-[400px]
            rounded-full
            bg-violet/20
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            -left-40
            bottom-0
            h-[450px]
            w-[450px]
            rounded-full
            bg-blue/15
            blur-[140px]
          "
        />
      </div>

      {/* Content */}
      <div
        className="
    container-app
    relative z-10
    flex min-h-[720px]
    items-center
    pt-20
    pb-16
  "
      >
        <div className="max-w-3xl">
          {/* Heading */}
          <h1
            className="
              max-w-3xl
              text-5xl
              font-extrabold
              leading-[1.05]
              tracking-[-0.03em]
              text-heading
              sm:text-6xl
              lg:text-7xl
            "
          >
            Temukan Event
            <span
              className="
                block
                bg-gradient-to-r
                from-primary
                via-[#F472B6]
                to-violet
                bg-clip-text
                text-transparent
              "
            >
              Seru Untukmu.
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              mt-6
              max-w-xl
              text-base
              leading-7
              text-white/70
              sm:text-lg
            "
          >
            Temukan konser, workshop, konferensi, festival, dan berbagai event
            menarik lainnya dalam satu platform.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/events"
              className="
                rounded-button
                bg-primary
                px-6 py-3.5
                text-sm
                font-semibold
                text-white
                shadow-[0_0_30px_rgba(232,62,156,0.3)]
                hover:-translate-y-0.5
                hover:bg-primary-hover
              "
            >
              Jelajahi Event
            </a>

            <a
              href="/my-tickets"
              className="
                rounded-button
                border border-white/15
                bg-white/10
                px-6 py-3.5
                text-sm
                font-semibold
                text-white
                backdrop-blur-md
                hover:-translate-y-0.5
                hover:bg-white/15
              "
            >
              Tiket Saya
            </a>
          </div>

          {/* Stats */}
          <div
            className="
              mt-12
              flex
              flex-wrap
              items-center
              gap-8
              border-t
              border-white/10
              pt-6
            "
          >
            <div>
              <p className="text-xl font-bold text-white">50+</p>
              <p className="mt-1 text-xs text-white/50">Event Aktif</p>
            </div>

            <div className="h-8 w-px bg-white/15" />

            <div>
              <p className="text-xl font-bold text-white">10+</p>
              <p className="mt-1 text-xs text-white/50">Kota</p>
            </div>

            <div className="h-8 w-px bg-white/15" />

            <div>
              <p className="text-xl font-bold text-white">1K+</p>
              <p className="mt-1 text-xs text-white/50">Tiket Terjual</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fade to next section */}
      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          z-10
          h-24
          w-full
          bg-gradient-to-t
          from-background
          to-transparent
        "
      />
    </section>
  );
}

export default Hero;
