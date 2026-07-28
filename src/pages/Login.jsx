import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  const registerSuccess = location.state?.registerSuccess || "";

  // state lainnya...
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const username = form.username.trim().toLowerCase();

      if (!username) {
        setError("Username wajib diisi.");
        return;
      }

      // Cari email berdasarkan username
      const { data: email, error: lookupError } = await supabase.rpc(
        "get_email_by_username",
        {
          input_username: username,
        },
      );

      if (lookupError) {
        console.error("Username lookup error:", lookupError);
        setError("Terjadi kesalahan saat mencari akun.");
        return;
      }

      if (!email) {
        setError("Username atau password salah.");
        return;
      }

      // Login Supabase menggunakan email yang ditemukan
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      });

      if (loginError) {
        console.error("LOGIN ERROR:", {
          message: loginError.message,
          code: loginError.code,
          status: loginError.status,
        });

        setError(loginError.message);
        return;
      }

      // Redirect ke halaman yang sebelumnya ingin dibuka
      navigate(from, {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);

      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-28">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-20 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />

        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-violet/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-primary">Selamat Datang</p>

          <h1 className="mt-2 text-3xl font-bold text-heading">
            Masuk ke EventHub
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            Masuk untuk memesan tiket dan mengelola event yang kamu ikuti.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-card border border-border bg-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-8"
        >
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
              autoComplete="username"
              placeholder="Masukkan username"
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
              placeholder="Masukkan password"
              className="
                w-full
                rounded-input
                border border-border
                bg-surface
                px-4 py-3
                text-sm text-heading
                outline-none
                placeholder:text-muted
                focus:border-primary
              "
            />
          </div>
          {error && (
            <div className="mt-5 rounded-input border border-danger/30 bg-danger/10 px-4 py-3">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}
          {registerSuccess && (
            <div className="mt-5 rounded-input border border-success/30 bg-success/10 px-4 py-3">
              <p className="text-sm text-success">{registerSuccess}</p>
            </div>
          )}
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
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <p className="mt-6 text-center text-sm text-muted">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Daftar
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Login;
