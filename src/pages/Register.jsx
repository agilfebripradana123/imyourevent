import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const usernameRegex = /^[a-z0-9._]{3,20}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const username = form.username.trim().toLowerCase();
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    // Validasi username
    if (!usernameRegex.test(username)) {
      setError(
        "Username harus 3-20 karakter dan hanya boleh menggunakan huruf kecil, angka, titik, atau underscore.",
      );
      return;
    }

    // Validasi nama
    if (name.length < 3) {
      setError("Nama lengkap minimal 3 karakter.");
      return;
    }

    // Validasi password
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    // Validasi konfirmasi password
    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    try {
      setLoading(true);

      // =========================
      // CEK USERNAME & EMAIL
      // =========================

      const { data: availability, error: checkError } = await supabase.rpc(
        "check_registration_availability",
        {
          input_username: username,
          input_email: email,
        },
      );

      if (checkError) {
        console.error("Gagal mengecek akun:", checkError);
        setError("Terjadi kesalahan saat memeriksa akun.");
        return;
      }

      // Username sudah digunakan
      if (availability?.username_exists) {
        setError("Username sudah terdaftar.");
        return;
      }

      // Email sudah digunakan
      if (availability?.email_exists) {
        setError("Email sudah terdaftar.");
        return;
      }

      // =========================
      // REGISTER
      // =========================

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,

        options: {
          data: {
            username,
            name,
          },
        },
      });

      if (signUpError) {
        console.error("Register error:", signUpError);

        if (signUpError.message.toLowerCase().includes("already")) {
          setError("Username atau email sudah terdaftar.");
          return;
        }

        setError(signUpError.message);
        return;
      }

      console.log("Register berhasil:", data.user);

      // =========================
      // LOGOUT SESSION OTOMATIS
      // =========================

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error(
          "Gagal menghapus session setelah register:",
          signOutError,
        );
      }

      // =========================
      // REDIRECT KE LOGIN
      // =========================

      navigate("/login", {
        replace: true,
        state: {
          registerSuccess: `Akun @${username} berhasil dibuat. Silakan masuk.`,
        },
      });
    } catch (err) {
      console.error("Register error:", err);

      setError("Terjadi kesalahan saat membuat akun. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-28">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-20 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-violet/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-primary">Buat Akun</p>

          <h1 className="mt-2 text-3xl font-bold text-heading">
            Gabung dengan I'm Your Event
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            Buat akun untuk mulai menemukan dan memesan event favoritmu.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
            rounded-card
            border
            border-border
            bg-card
            p-6
            shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            sm:p-8
          "
        >
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-text"
            >
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={20}
              autoComplete="username"
              placeholder="contoh: agilfebri"
              className="
                w-full
                rounded-input
                border
                border-border
                bg-surface
                px-4
                py-3
                text-sm
                text-heading
                outline-none
                transition
                placeholder:text-muted
                focus:border-primary
              "
            />

            <p className="mt-2 text-xs text-muted">
              3-20 karakter. Gunakan huruf, angka, titik, atau underscore.
            </p>
          </div>

          {/* Name */}
          <div className="mt-5">
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
              autoComplete="name"
              placeholder="Nama lengkap"
              className="
                w-full
                rounded-input
                border
                border-border
                bg-surface
                px-4
                py-3
                text-sm
                text-heading
                outline-none
                transition
                placeholder:text-muted
                focus:border-primary
              "
            />
          </div>

          {/* Email */}
          <div className="mt-5">
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
              autoComplete="email"
              placeholder="nama@email.com"
              className="
                w-full
                rounded-input
                border
                border-border
                bg-surface
                px-4
                py-3
                text-sm
                text-heading
                outline-none
                transition
                placeholder:text-muted
                focus:border-primary
              "
            />
          </div>

          {/* Password */}
          <div className="mt-5">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-text"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              className="
                w-full
                rounded-input
                border
                border-border
                bg-surface
                px-4
                py-3
                text-sm
                text-heading
                outline-none
                transition
                placeholder:text-muted
                focus:border-primary
              "
            />
          </div>

          {/* Confirm Password */}
          <div className="mt-5">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-text"
            >
              Konfirmasi Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Ulangi password"
              className="
                w-full
                rounded-input
                border
                border-border
                bg-surface
                px-4
                py-3
                text-sm
                text-heading
                outline-none
                transition
                placeholder:text-muted
                focus:border-primary
              "
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-input border border-danger/30 bg-danger/10 px-4 py-3">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              mt-7
              w-full
              rounded-button
              bg-primary
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-primary-hover
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Mendaftarkan..." : "Buat Akun"}
          </button>

          <p className="mt-6 text-center text-sm text-muted">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Register;
