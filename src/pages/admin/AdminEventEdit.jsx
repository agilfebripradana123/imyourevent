import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function AdminEventEdit() {
  const { id } = useParams();
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

  const [oldImageUrl, setOldImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // FETCH EVENT
  // =========================

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setFetchLoading(true);
        setError("");

        const { data, error: fetchError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setForm({
          title: data.title ?? "",
          category: data.category ?? "",
          date: data.date ?? "",
          location: data.location ?? "",
          price: String(data.price ?? 0),
          status: data.status ?? "Tersedia",
          featured: data.featured ?? false,
        });

        setOldImageUrl(data.image ?? "");
        setImagePreview(data.image ?? "");
      } catch (err) {
        console.error("Gagal mengambil event:", err);
        setError("Data event gagal dimuat.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatRupiahInput = (value) => {
    if (value === "" || value === null || value === undefined) {
      return "";
    }

    return new Intl.NumberFormat("id-ID").format(Number(value));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");

    setForm((prev) => ({
      ...prev,
      price: rawValue,
    }));

    setError("");
  };

  // =========================
  // IMAGE
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

    // Hanya revoke preview lokal, jangan URL Supabase lama.
    if (imageFile && imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  // =========================
  // STORAGE PATH HELPER
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
  // UPDATE
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

    let newUploadedPath = null;

    try {
      setSaving(true);

      let finalImageUrl = oldImageUrl;

      // Jika admin memilih gambar baru
      if (imageFile) {
        const extension =
          imageFile.name.split(".").pop()?.toLowerCase() || "webp";

        const fileName = `${crypto.randomUUID()}.${extension}`;
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

        newUploadedPath = filePath;

        const { data: publicData } = supabase.storage
          .from("event-images")
          .getPublicUrl(filePath);

        finalImageUrl = publicData.publicUrl;
      }

      // Update database
      const { error: updateError } = await supabase
        .from("events")
        .update({
          title,
          category: form.category,
          date: form.date,
          location,
          price: Number(form.price),
          image: finalImageUrl,
          status: form.status,
          featured: form.featured,
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      // Database berhasil diupdate.
      // Kalau gambar diganti, hapus gambar Storage lama.
      if (imageFile && oldImageUrl) {
        const oldPath = getStoragePathFromUrl(oldImageUrl);

        if (oldPath) {
          const { error: removeError } = await supabase.storage
            .from("event-images")
            .remove([oldPath]);

          if (removeError) {
            // Jangan batalkan update hanya karena cleanup gagal.
            console.error("Gambar lama gagal dihapus:", removeError);
          }
        }
      }

      navigate("/admin/events", {
        replace: true,
        state: {
          success: `Event "${title}" berhasil diperbarui.`,
        },
      });
    } catch (err) {
      console.error("Gagal memperbarui event:", err);

      // Upload baru berhasil tetapi UPDATE database gagal.
      // Bersihkan gambar baru.
      if (newUploadedPath) {
        await supabase.storage.from("event-images").remove([newUploadedPath]);
      }

      setError(err.message || "Event gagal diperbarui. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `
    w-full
    rounded-input
    border border-border
    bg-surface
    px-4 py-3
    text-sm text-heading
    outline-none
    transition
    placeholder:text-muted
    focus:border-primary
  `;

  if (fetchLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-muted">Memuat data event...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to="/admin/events"
        className="text-sm font-semibold text-muted transition hover:text-primary"
      >
        ← Kembali ke Kelola Event
      </Link>

      <div className="mt-8">
        <p className="text-sm font-semibold text-primary">Manajemen Event</p>

        <h1 className="mt-2 text-3xl font-bold text-heading sm:text-4xl">
          Edit Event
        </h1>

        <p className="mt-2 text-sm text-muted">
          Perbarui informasi event yang sudah tersedia.
        </p>
      </div>

      {error && !form.title ? (
        <div className="mt-8 rounded-card border border-danger/30 bg-danger/10 p-5">
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* INFORMASI */}
            <section className="rounded-card border border-border bg-card p-5 sm:p-7">
              <div className="border-b border-border pb-5">
                <h2 className="font-semibold text-heading">Informasi Event</h2>

                <p className="mt-1 text-xs text-muted">
                  Ubah informasi utama event.
                </p>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-text">
                  Nama Event
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">
                    Kategori
                  </label>

                  <select
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
                  <label className="mb-2 block text-sm font-medium text-text">
                    Tanggal Event
                  </label>

                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-text">
                  Lokasi
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-text">
                  Harga Tiket
                </label>

                <div className="flex overflow-hidden rounded-input border border-border bg-surface focus-within:border-primary">
                  <div className="flex items-center border-r border-border px-4 text-sm font-semibold text-muted">
                    Rp
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatRupiahInput(form.price)}
                    onChange={handlePriceChange}
                    className="w-full bg-transparent px-4 py-3 text-sm text-heading outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-muted">
                  Isi 0 jika event gratis.
                </p>
              </div>
            </section>

            {/* SIDEBAR */}
            <div className="space-y-6">
              <section className="rounded-card border border-border bg-card p-5">
                <h2 className="font-semibold text-heading">Gambar Event</h2>

                <div className="mt-5 overflow-hidden rounded-card border border-border">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview event"
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-surface">
                      <p className="text-sm text-muted">Tidak ada gambar</p>
                    </div>
                  )}
                </div>

                <label className="mt-4 block cursor-pointer rounded-button border border-border px-4 py-3 text-center text-sm font-semibold text-text transition hover:border-primary hover:text-primary">
                  Ganti Gambar
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imageFile && (
                  <p className="mt-3 truncate text-xs text-muted">
                    Gambar baru: {imageFile.name}
                  </p>
                )}
              </section>

              <section className="rounded-card border border-border bg-card p-5">
                <h2 className="font-semibold text-heading">Pengaturan</h2>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-text">
                    Status Event
                  </label>

                  <select
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

                <label className="mt-5 flex cursor-pointer gap-3 rounded-input border border-border bg-surface p-4">
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

                    <p className="mt-1 text-xs text-muted">
                      Tampilkan event di bagian featured.
                    </p>
                  </div>
                </label>
              </section>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-card border border-danger/30 bg-danger/10 px-4 py-3">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 rounded-card border border-border bg-card p-4 sm:flex-row sm:justify-end">
            <Link
              to="/admin/events"
              className="rounded-button border border-border px-6 py-3 text-center text-sm font-semibold text-text"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-button bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminEventEdit;
