import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyTickets from "./pages/MyTickets";
import TicketDetail from "./pages/TicketDetail";
import About from "./pages/About";

import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminEventCreate from "./pages/admin/AdminEventCreate";
import AdminEventEdit from "./pages/admin/AdminEventEdit";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";

function App() {
  const location = useLocation();

  // =========================
  // PAGE TYPE
  // =========================
  const isAdminPage = location.pathname.startsWith("/admin");

  // =========================
  // NAVBAR
  // =========================
  const hideNavbar = isAdminPage;

  // =========================
  // FOOTER
  // =========================
  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    isAdminPage;

  return (
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* =========================
            USER ROUTES
        ========================== */}

        <Route path="/" element={<Home />} />

        <Route path="/events" element={<Events />} />

        <Route path="/events/:id" element={<EventDetail />} />

        <Route path="/booking/:eventId" element={<Booking />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/my-tickets" element={<MyTickets />} />

        <Route path="/my-tickets/:id" element={<TicketDetail />} />

        <Route path="/about" element={<About />} />

        {/* =========================
            ADMIN ROUTES
        ========================== */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<AdminDashboard />} />

          {/* Events */}
          <Route path="events" element={<AdminEvents />} />

          <Route path="events/create" element={<AdminEventCreate />} />

          <Route path="events/:id/edit" element={<AdminEventEdit />} />

          {/* Bookings */}
          <Route path="bookings" element={<AdminBookings />} />

          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
        </Route>
      </Routes>

      {/* FOOTER */}
      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;
