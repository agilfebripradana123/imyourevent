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
import PreLoader from "./components/PreLoader";

import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

import { useEffect } from "react";
import AOS from "aos";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  const location = useLocation();

  // =========================
  // PAGE TYPE
  // =========================
  const isAdminPage = location.pathname.startsWith("/admin");

  // =========================
  // NAVBAR
  // =========================
  const validRoutes = [
    "/",
    "/events",
    "/booking",
    "/login",
    "/register",
    "/my-tickets",
    "/about",
  ];

  const is404 =
    !isAdminPage &&
    !validRoutes.some((route) => location.pathname.startsWith(route));

  const hideNavbar = isAdminPage || is404;

  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    isAdminPage ||
    is404;

  return (
    <PreLoader>
      <div className="min-h-screen bg-background">
        <ScrollToTop />
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
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* FOOTER */}
        {!hideFooter && <Footer />}
      </div>
      
    </PreLoader>
  );
}

export default App;
