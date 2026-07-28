import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="text-8xl font-bold text-primary">404</h1>

      <h2 className="mt-4 text-3xl font-bold text-heading">
        Halaman Tidak Ditemukan
      </h2>

      <p className="mt-3 text-muted">Halaman yang Anda cari tidak tersedia.</p>

      <Link
        to="/"
        className="mt-8 rounded-button bg-primary px-6 py-3 font-semibold text-white"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
