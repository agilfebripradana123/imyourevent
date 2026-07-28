import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

function AdminUsers() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua");

  // =========================
  // FETCH USERS
  // =========================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, name, role, created_at")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setUsers(data ?? []);
    } catch (err) {
      console.error("Gagal mengambil pengguna:", err);

      setError(err.message || "Data pengguna gagal dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // DATE
  // =========================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  // =========================
  // FILTER
  // =========================
  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((item) => {
      const name = item.name?.toLowerCase() || "";

      const username = item.username?.toLowerCase() || "";

      const role = item.role?.toLowerCase() || "";

      const matchesSearch =
        !keyword || name.includes(keyword) || username.includes(keyword);

      const matchesRole =
        roleFilter === "Semua" || role === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // =========================
  // STATISTICS
  // =========================
  const statistics = useMemo(() => {
    const totalAdmin = users.filter(
      (item) => item.role?.toLowerCase() === "admin",
    ).length;

    const totalUser = users.filter(
      (item) => item.role?.toLowerCase() === "user",
    ).length;

    return {
      total: users.length,
      user: totalUser,
      admin: totalAdmin,
    };
  }, [users]);

  // =========================
  // INITIAL
  // =========================
  const getInitial = (item) => {
    const source = item.name || item.username || "U";

    return source.charAt(0).toUpperCase();
  };

  // =========================
  // ROLE STYLE
  // =========================
  const getRoleStyle = (role) => {
    if (role?.toLowerCase() === "admin") {
      return "border-primary/20 bg-primary/10 text-primary";
    }

    return "border-border bg-white/5 text-muted";
  };

  return (
    <div>
      {/* HEADER */}
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
          <p className="text-sm font-semibold text-primary">Pengguna</p>

          <h1 className="mt-2 text-3xl font-bold text-heading">
            Kelola Pengguna
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Lihat seluruh akun yang terdaftar di I'm Your Event.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="
            inline-flex
            w-fit
            items-center
            justify-center
            gap-2
            rounded-button
            border border-border
            bg-card
            px-4 py-2.5
            text-sm
            font-semibold
            text-heading
            transition
            hover:border-primary
            hover:text-primary
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <i
            className={`
              ri-refresh-line
              text-lg
              ${loading ? "animate-spin" : ""}
            `}
          ></i>
          Refresh
        </button>
      </div>

      {/* STATISTICS */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="ri-group-line"
          label="Total Akun"
          value={statistics.total}
        />

        <StatCard
          icon="ri-user-line"
          label="Pengguna"
          value={statistics.user}
        />

        <StatCard
          icon="ri-shield-user-line"
          label="Administrator"
          value={statistics.admin}
        />
      </div>

      {/* SEARCH */}
      <div
        className="
          mt-8
          grid
          gap-3
          rounded-card
          border border-border
          bg-card
          p-4
          md:grid-cols-[1fr_200px]
        "
      >
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
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau username..."
            className="
              w-full
              rounded-input
              border border-border
              bg-background
              py-3
              pl-11
              pr-10
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
                hover:bg-white/5
                hover:text-heading
              "
            >
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="
            rounded-input
            border border-border
            bg-background
            px-4 py-3
            text-sm
            text-heading
            outline-none
            focus:border-primary
          "
        >
          <option value="Semua">Semua Role</option>

          <option value="user">User</option>

          <option value="admin">Admin</option>
        </select>
      </div>

      {/* RESULT */}
      {!loading && !error && users.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">
            Menampilkan{" "}
            <span className="font-semibold text-heading">
              {filteredUsers.length}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-heading">{users.length}</span>{" "}
            akun
          </p>

          {(search || roleFilter !== "Semua") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("Semua");
              }}
              className="text-xs font-semibold text-primary"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div
          className="
            mt-6
            rounded-card
            border border-border
            bg-card
            px-6 py-16
            text-center
          "
        >
          <i className="ri-loader-4-line inline-block animate-spin text-3xl text-primary"></i>

          <p className="mt-4 text-sm text-muted">Memuat data pengguna...</p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div
          className="
            mt-6
            rounded-card
            border border-danger/20
            bg-danger/5
            px-6 py-14
            text-center
          "
        >
          <i className="ri-error-warning-line text-3xl text-danger"></i>

          <h2 className="mt-4 font-semibold text-heading">
            Data pengguna gagal dimuat
          </h2>

          <p className="mt-2 text-sm text-muted">{error}</p>

          <button
            type="button"
            onClick={fetchUsers}
            className="
              mt-5
              rounded-button
              bg-primary
              px-5 py-2.5
              text-sm
              font-semibold
              text-white
            "
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* DESKTOP TABLE */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div
          className="
              mt-6
              hidden
              overflow-hidden
              rounded-card
              border border-border
              bg-card
              md:block
            "
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className="
                    border-b
                    border-border
                    bg-white/[0.02]
                  "
              >
                <tr>
                  <TableHeader>Pengguna</TableHeader>

                  <TableHeader>Username</TableHeader>

                  <TableHeader>Role</TableHeader>

                  <TableHeader>Bergabung</TableHeader>

                  <TableHeader>Status</TableHeader>

                  <TableHeader>Aksi</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredUsers.map((item) => (
                  <tr
                    key={item.id}
                    className="
                          transition
                          hover:bg-white/[0.02]
                        "
                  >
                    {/* USER */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="
                                flex h-10 w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-primary/10
                                font-bold
                                text-primary
                              "
                        >
                          {getInitial(item)}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-sm font-semibold text-heading">
                            {item.name || "Tanpa nama"}
                          </p>

                          {item.id === user?.id && (
                            <p className="mt-1 text-xs text-primary">
                              Akun kamu
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* USERNAME */}
                    <TableCell>
                      <span className="text-sm text-muted">
                        @{item.username || "-"}
                      </span>
                    </TableCell>

                    {/* ROLE */}
                    <TableCell>
                      <span
                        className={`
                              inline-flex
                              rounded-full
                              border
                              px-3 py-1
                              text-xs
                              font-semibold
                              capitalize
                              ${getRoleStyle(item.role)}
                            `}
                      >
                        {item.role || "user"}
                      </span>
                    </TableCell>

                    {/* DATE */}
                    <TableCell>
                      <span className="whitespace-nowrap text-sm text-muted">
                        {formatDate(item.created_at)}
                      </span>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <span
                        className="
                              inline-flex
                              items-center
                              gap-2
                              text-xs
                              font-medium
                              text-success
                            "
                      >
                        <span className="h-2 w-2 rounded-full bg-success"></span>
                        Aktif
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/admin/users/${item.id}`}
                        title="Lihat detail pengguna"
                        aria-label={`Lihat detail ${item.name || item.username}`}
                        className="
      flex h-9 w-9
      items-center
      justify-center
      rounded-button
      border border-border
      text-muted
      transition
      hover:border-primary
      hover:bg-primary/10
      hover:text-primary
    "
                      >
                        <i className="ri-eye-line text-lg"></i>
                      </Link>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MOBILE */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="mt-6 grid gap-4 md:hidden">
          {filteredUsers.map((item) => (
            <article
              key={item.id}
              className="
                  rounded-card
                  border border-border
                  bg-card
                  p-5
                "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                      flex h-12 w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-primary/10
                      text-lg
                      font-bold
                      text-primary
                    "
                >
                  {getInitial(item)}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-heading">
                        {item.name || "Tanpa nama"}
                      </p>

                      <p className="mt-1 truncate text-sm text-muted">
                        @{item.username || "-"}
                      </p>
                    </div>

                    <span
                      className={`
                          shrink-0
                          rounded-full
                          border
                          px-2.5 py-1
                          text-[10px]
                          font-semibold
                          capitalize
                          ${getRoleStyle(item.role)}
                        `}
                    >
                      {item.role || "user"}
                    </span>
                  </div>

                  {item.id === user?.id && (
                    <p className="mt-2 text-xs font-medium text-primary">
                      Akun kamu
                    </p>
                  )}
                </div>
              </div>

              <div
                className="
                    mt-5
                    grid
                    grid-cols-2
                    gap-4
                    border-t
                    border-border
                    pt-4
                  "
              >
                <div>
                  <p className="text-xs text-muted">Bergabung</p>

                  <p className="mt-1 text-sm font-medium text-heading">
                    {formatDate(item.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted">Status</p>

                  <p
                    className="
                        mt-1
                        flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-success
                      "
                  >
                    <span className="h-2 w-2 rounded-full bg-success"></span>
                    Aktif
                  </p>
                </div>
                <Link
                  to={`/admin/users/${item.id}`}
                  className="
    mt-5
    flex w-full
    items-center
    justify-center
    gap-2
    rounded-button
    border border-border
    bg-background
    px-4 py-3
    text-sm
    font-semibold
    text-heading
    transition
    hover:border-primary
    hover:text-primary
  "
                >
                  <i className="ri-eye-line"></i>
                  Lihat Detail
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div
          className="
              mt-6
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              rounded-card
              border border-border
              bg-card
              px-6
              py-12
              text-center
            "
        >
          <div
            className="
                flex h-16 w-16
                items-center
                justify-center
                rounded-2xl
                border border-primary/20
                bg-primary/10
                text-primary
              "
          >
            <i
              className={`
                  ${users.length === 0 ? "ri-user-line" : "ri-search-line"}
                  text-2xl
                `}
            ></i>
          </div>

          <h2 className="mt-5 text-lg font-semibold text-heading">
            {users.length === 0
              ? "Belum Ada Pengguna"
              : "Pengguna Tidak Ditemukan"}
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            {users.length === 0
              ? "Akun pengguna yang terdaftar akan muncul di halaman ini."
              : "Tidak ada pengguna yang sesuai dengan pencarian atau filter."}
          </p>

          {users.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("Semua");
              }}
              className="
                  mt-5
                  rounded-button
                  bg-primary
                  px-5 py-2.5
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-primary-hover
                "
            >
              Reset Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// =========================
// STAT CARD
// =========================
function StatCard({ icon, label, value }) {
  return (
    <div
      className="
        rounded-card
        border border-border
        bg-card
        p-5
        transition
        hover:border-primary/30
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>

          <p className="mt-2 text-2xl font-bold text-heading">{value}</p>
        </div>

        <div
          className="
            flex h-11 w-11
            items-center
            justify-center
            rounded-input
            bg-primary/10
            text-primary
          "
        >
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}

function TableHeader({ children }) {
  return (
    <th
      className="
        whitespace-nowrap
        px-5 py-4
        text-left
        text-xs
        font-semibold
        uppercase
        tracking-wider
        text-muted
      "
    >
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return <td className="px-5 py-4 align-middle">{children}</td>;
}

export default AdminUsers;
