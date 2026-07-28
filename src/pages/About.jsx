import { Link } from "react-router-dom";

function About() {
  const features = [
    {
      number: "01",
      title: "Temukan Event",
      description:
        "Jelajahi berbagai event menarik mulai dari musik, teknologi, workshop, seni, hingga komunitas.",
    },
    {
      number: "02",
      title: "Pesan dengan Mudah",
      description:
        "Pilih event favoritmu, tentukan jumlah tiket, lalu selesaikan proses pemesanan dengan sederhana.",
    },
    {
      number: "03",
      title: "Kelola Tiket",
      description:
        "Semua tiket yang sudah dipesan tersimpan dalam satu tempat dan dapat diakses kapan saja.",
    },
  ];

  const categories = [
    "Musik",
    "Teknologi",
    "Workshop",
    "Bisnis",
    "Seni",
    "Olahraga",
    "Komunitas",
  ];

  return (
    <main className="min-h-screen bg-background pb-20 pt-32">
      <div className="container-app">
        {/* HERO */}
        <section
          className="
            relative
            overflow-hidden
            rounded-card
            border border-border
            bg-card
            px-6
            py-16
            md:px-10
            md:py-20
            lg:px-16
          "
        >
          {/* Glow */}
          <div
            className="
              pointer-events-none
              absolute
              -right-32
              -top-32
              h-[400px]
              w-[400px]
              rounded-full
              bg-primary/15
              blur-[120px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-40
              left-1/3
              h-[350px]
              w-[350px]
              rounded-full
              bg-violet/10
              blur-[120px]
            "
          />

          <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-semibold text-primary">
              Tentang EventHub
            </p>

            <h1
              className="
                mt-4
                text-4xl
                font-bold
                leading-tight
                text-heading
                md:text-5xl
                lg:text-6xl
              "
            >
              Event seru dimulai dari{" "}
              <span className="text-primary">satu tempat.</span>
            </h1>

            <p
              className="
                mt-6
                max-w-2xl
                text-base
                leading-8
                text-text
                md:text-lg
              "
            >
              EventHub adalah platform manajemen event dan pemesanan tiket yang
              membantu kamu menemukan, memesan, dan mengelola tiket event dengan
              lebih mudah.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/events"
                className="
                  rounded-button
                  bg-primary
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_0_30px_rgba(232,62,156,0.2)]
                  hover:bg-primary-hover
                "
              >
                Jelajahi Event
              </Link>

              <Link
                to="/my-tickets"
                className="
                  rounded-button
                  border
                  border-border
                  bg-surface
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-heading
                  hover:border-primary
                  hover:text-primary
                "
              >
                Tiket Saya
              </Link>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section
          className="
            grid
            gap-10
            py-20
            lg:grid-cols-[0.8fr_1.2fr]
            lg:gap-20
          "
        >
          <div>
            <p className="text-sm font-semibold text-primary">
              Kenapa EventHub?
            </p>

            <h2
              className="
                mt-3
                text-3xl
                font-bold
                leading-tight
                text-heading
                md:text-4xl
              "
            >
              Semua kebutuhan event dalam satu platform.
            </h2>
          </div>

          <div>
            <p className="text-base leading-8 text-text">
              Mencari event menarik seharusnya tidak rumit. EventHub dirancang
              untuk memberikan pengalaman yang sederhana mulai dari menemukan
              event hingga mendapatkan tiket.
            </p>

            <p className="mt-5 text-base leading-8 text-muted">
              Dengan pencarian dan filter yang mudah digunakan, pengguna dapat
              menemukan event berdasarkan kategori, lokasi, tanggal, maupun
              harga sesuai kebutuhan mereka.
            </p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section>
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-primary">Cara Kerja</p>

            <h2 className="mt-3 text-3xl font-bold text-heading md:text-4xl">
              Tiga langkah sederhana.
            </h2>
          </div>

          <div
            className="
              mt-10
              grid
              gap-5
              md:grid-cols-3
            "
          >
            {features.map((feature) => (
              <article
                key={feature.number}
                className="
                  group
                  rounded-card
                  border
                  border-border
                  bg-card
                  p-6
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary/40
                "
              >
                <span
                  className="
                    text-sm
                    font-bold
                    text-primary
                  "
                >
                  {feature.number}
                </span>

                <h3 className="mt-8 text-xl font-bold text-heading">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section
          className="
            mt-20
            rounded-card
            border
            border-border
            bg-card
            px-6
            py-12
            md:px-10
          "
        >
          <div
            className="
              flex
              flex-col
              gap-8
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-primary">
                Beragam Pilihan
              </p>

              <h2 className="mt-3 text-2xl font-bold text-heading md:text-3xl">
                Temukan event sesuai minatmu.
              </h2>

              <p className="mt-3 text-sm leading-7 text-muted">
                Dari konser hingga workshop, selalu ada pengalaman baru yang
                bisa kamu temukan.
              </p>
            </div>

            <div
              className="
                flex
                max-w-xl
                flex-wrap
                gap-3
              "
            >
              {categories.map((category) => (
                <span
                  key={category}
                  className="
                    rounded-full
                    border
                    border-border
                    bg-surface
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-text
                    transition
                    hover:border-primary/50
                    hover:text-primary
                  "
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-semibold text-primary">Mulai Sekarang</p>

            <h2
              className="
                mt-3
                text-3xl
                font-bold
                text-heading
                md:text-4xl
              "
            >
              Temukan pengalaman berikutnya.
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-muted">
              Jelajahi berbagai event dan temukan aktivitas yang sesuai dengan
              minatmu.
            </p>

            <Link
              to="/events"
              className="
                mt-7
                inline-block
                rounded-button
                bg-primary
                px-7
                py-3
                text-sm
                font-semibold
                text-white
                hover:bg-primary-hover
              "
            >
              Lihat Semua Event
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default About;
