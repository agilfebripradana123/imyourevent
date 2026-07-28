import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function AdminEventCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "",
    date: "",
    location: "",
    price: "",
    status: "Tersedia",
    featured: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // FORMAT RUPIAH
  // =========================
  const formatRupiahInput = (value) => {
    if (!value) return "";

    return new Intl.NumberFormat("id-ID").format(Number(value));
  };

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  // =========================
  // PRICE CHANGE
  // =========================
  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");

    setForm((prev) => ({
      ...prev,
      price: rawValue,
    }));

    setError("");
  };

  // =========================
  // IMAGE CHANGE
  // =========================
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Gambar harus berformat JPG, PNG, atau WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5 MB.");
      e.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const preview = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(preview);
    setError("");
  };

  // =========================
  // REMOVE IMAGE
  // =========================
  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview("");
  };

  // Bersihkan object URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const title = form.title.trim();
    const location = form.location.trim();

    if (!title) {
      setError("Nama event wajib diisi.");
      return;
    }

    if (!form.category) {
      setError("Kategori wajib dipilih.");
      return;
    }

    if (!form.date) {
      setError("Tanggal event wajib diisi.");
      return;
    }

    if (!location) {
      setError("Lokasi event wajib diisi.");
      return;
    }

    if (form.price === "") {
      setError("Harga event wajib diisi. Isi 0 jika gratis.");
      return;
    }

    if (Number(form.price) < 0) {
      setError("Harga event tidak valid.");
      return;
    }

    if (!imageFile) {
      setError("Gambar event wajib diupload.");
      return;
    }

    let uploadedFilePath = null;

    try {
      setLoading(true);

      // =========================
      // 1. UPLOAD IMAGE
      // =========================

      const fileExtension =
        imageFile.name.split(".").pop()?.toLowerCase() || "webp";

      const fileName = `${crypto.randomUUID()}.${fileExtension}`;

      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      uploadedFilePath = filePath;

      // =========================
      // 2. GET PUBLIC URL
      // =========================

      const { data: imageData } = supabase.storage
        .from("event-images")
        .getPublicUrl(filePath);

      const imageUrl = imageData.publicUrl;

      if (!imageUrl) {
        throw new Error("URL gambar gagal dibuat.");
      }

      // =========================
      // 3. INSERT EVENT
      // =========================

      const { data, error: insertError } = await supabase
        .from("events")
        .insert([
          {
            title,
            category: form.category,
            date: form.date,
            location,
            price: Number(form.price),
            image: imageUrl,
            status: form.status,
            featured: form.featured,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log("Event berhasil dibuat:", data);

      navigate("/admin/events", {
        replace: true,
        state: {
          success: `Event "${title}" berhasil ditambahkan.`,
        },
      });
    } catch (err) {
      console.error("Gagal menambahkan event:", err);

      // Kalau gambar berhasil diupload tetapi INSERT event gagal,
      // hapus gambar supaya tidak menjadi file sampah.
      if (uploadedFilePath) {
        const { error: removeError } = await supabase.storage
          .from("event-images")
          .remove([uploadedFilePath]);

        if (removeError) {
          console.error("Gagal membersihkan gambar:", removeError);
        }
      }

      setError(err.message || "Event gagal ditambahkan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full
    rounded-input
    border border-border
    bg-surface
    px-4 py-3
    text-sm
    text-heading
    outline-none
    transition
    placeholder:text-muted
    focus:border-primary
  `;

  return (
    <div className="mx-auto max-w-6xl">
      {/* ================= HEADER ================= */}

      <div>
        <Link
          to="/admin/events"
          className="
            inline-flex items-center gap-2
            text-sm font-semibold
            text-muted
            transition
            hover:text-primary
          "
        >
          ← Kembali ke Kelola Event
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold text-primary">Manajemen Event</p>

          <h1 className="mt-2 text-3xl font-bold text-heading sm:text-4xl">
            Tambah Event
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Buat event baru dan lengkapi informasi yang akan ditampilkan kepada
            pengguna.
          </p>
        </div>
      </div>

      {/* ================= FORM ================= */}

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* ================= LEFT ================= */}

          <section className="rounded-card border border-border bg-card p-5 sm:p-7">
            <div className="border-b border-border pb-5">
              <h2 className="font-semibold text-heading">Informasi Event</h2>

              <p className="mt-1 text-xs text-muted">
                Informasi utama mengenai event.
              </p>
            </div>

            {/* TITLE */}

            <div className="mt-6">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-text"
              >
                Nama Event
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Contoh: Festival Musik Nusantara 2026"
                className={inputClass}
              />
            </div>

            {/* CATEGORY + DATE */}

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Kategori
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Pilih kategori</option>

                  <option value="Musik">Musik</option>
                  <option value="Teknologi">Teknologi</option>
                  <option value="Bisnis">Bisnis</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seni">Seni</option>
                  <option value="Olahraga">Olahraga</option>
                  <option value="Komunitas">Komunitas</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Tanggal Event
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* LOCATION */}

            <div className="mt-5">
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-text"
              >
                Lokasi
              </label>

              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="Contoh: Yogyakarta"
                className={inputClass}
              />
            </div>

            {/* PRICE */}

            <div className="mt-5">
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-medium text-text"
              >
                Harga Tiket
              </label>

              <div
                className="
                  flex overflow-hidden
                  rounded-input
                  border border-border
                  bg-surface
                  transition
                  focus-within:border-primary
                "
              >
                <div
                  className="
                    flex items-center
                    border-r border-border
                    bg-white/[0.02]
                    px-4
                    text-sm font-semibold
                    text-muted
                  "
                >
                  Rp
                </div>

                <input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="numeric"
                  value={formatRupiahInput(form.price)}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="
                    w-full
                    bg-transparent
                    px-4 py-3
                    text-sm
                    text-heading
                    outline-none
                    placeholder:text-muted
                  "
                />
              </div>

              <p className="mt-2 text-xs text-muted">
                Contoh: Rp 150.000. Isi 0 untuk event gratis.
              </p>
            </div>
          </section>

          {/* ================= RIGHT ================= */}

          <div className="space-y-6">
            {/* IMAGE */}

            <section className="rounded-card border border-border bg-card p-5">
              <div>
                <h2 className="font-semibold text-heading">Gambar Event</h2>

                <p className="mt-1 text-xs text-muted">
                  Gunakan gambar landscape berkualitas baik.
                </p>
              </div>

              <div className="mt-5">
                {!imagePreview ? (
                  <label
                    className="
                      flex min-h-[240px]
                      cursor-pointer
                      flex-col
                      items-center
                      justify-center
                      rounded-card
                      border border-dashed border-border
                      bg-surface
                      px-6
                      text-center
                      transition
                      hover:border-primary
                      hover:bg-primary/5
                    "
                  >
                    <div
                      className="
                        flex h-12 w-12
                        items-center justify-center
                        rounded-full
                        bg-primary/10
                        text-xl
                        text-primary
                      "
                    >
                      ↑
                    </div>

                    <p className="mt-4 text-sm font-semibold text-heading">
                      Upload gambar event
                    </p>

                    <p className="mt-2 text-xs leading-5 text-muted">
                      Klik untuk memilih gambar
                      <br />
                      JPG, PNG atau WEBP • Maks. 5 MB
                    </p>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div>
                    <div className="relative overflow-hidden rounded-card border border-border">
                      <img
                        src={imagePreview}
                        alt="Preview event"
                        className="h-56 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={removeImage}
                        className="
                          absolute right-3 top-3
                          flex h-9 w-9
                          items-center justify-center
                          rounded-full
                          bg-black/70
                          text-lg text-white
                          backdrop-blur
                          transition
                          hover:bg-danger
                        "
                        aria-label="Hapus gambar"
                      >
                        ×
                      </button>
                    </div>

                    <p className="mt-3 truncate text-xs text-muted">
                      {imageFile?.name}
                    </p>

                    <label className="mt-3 inline-block cursor-pointer text-xs font-semibold text-primary hover:text-primary-hover">
                      Ganti gambar
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </section>

            {/* PUBLISH SETTINGS */}

            <section className="rounded-card border border-border bg-card p-5">
              <h2 className="font-semibold text-heading">Pengaturan</h2>

              <div className="mt-5">
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Status Event
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Tersedia">Tersedia</option>

                  <option value="Habis">Habis</option>

                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              {/* FEATURED */}

              <label
                className="
                  mt-5 flex cursor-pointer
                  items-start gap-3
                  rounded-input
                  border border-border
                  bg-surface
                  p-4
                  transition
                  hover:border-primary/50
                "
              >
                <input
                  name="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />

                <div>
                  <p className="text-sm font-medium text-heading">
                    Event Pilihan
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    Event akan ditampilkan pada bagian featured di halaman
                    utama.
                  </p>
                </div>
              </label>
            </section>
          </div>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mt-6 rounded-card border border-danger/30 bg-danger/10 px-4 py-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* ================= ACTION ================= */}

        <div
          className="
            mt-6 flex
            flex-col-reverse gap-3
            rounded-card
            border border-border
            bg-card
            p-4
            sm:flex-row
            sm:items-center
            sm:justify-end
          "
        >
          <Link
            to="/admin/events"
            className="
              rounded-button
              border border-border
              px-6 py-3
              text-center
              text-sm font-semibold
              text-text
              transition
              hover:bg-white/5
            "
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="
              rounded-button
              bg-primary
              px-7 py-3
              text-sm font-semibold
              text-white
              transition
              hover:bg-primary-hover
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Mengupload & Menyimpan..." : "Simpan Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminEventCreate;
