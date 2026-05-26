import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import ReservationPage from "./pages/ReservationPage.jsx";
import CateringPage from "./pages/CateringPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminMenuPage from "./pages/AdminMenuPage.jsx";
import AdminDailyMenuPage from "./pages/AdminDailyMenuPage.jsx";
import AdminReservationsPage from "./pages/AdminReservationsPage.jsx";
import AdminQuotesPage from "./pages/AdminQuotesPage.jsx";

const IndexRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="screen-loader">Loading Dihya...</div>;
  }

  if (user && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/home" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexRedirect />} />
      <Route path="/auth" element={<AuthPage initialTab="login" />} />
      <Route path="/login" element={<AuthPage initialTab="login" />} />
      <Route path="/register" element={<AuthPage initialTab="register" />} />

      {/* Public routes */}
      <Route element={<AppShell />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Protected routes - require authentication */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/catering" element={<CateringPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AppShell admin />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="carte" element={<AdminMenuPage />} />
        <Route path="menus-quotidiens" element={<AdminDailyMenuPage />} />
        <Route path="reservations" element={<AdminReservationsPage />} />
        <Route path="devis" element={<AdminQuotesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
