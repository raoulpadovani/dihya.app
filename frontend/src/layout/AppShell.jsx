import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatRole, getInitials } from "../utils/formatters.js";

export default function AppShell({ admin = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`shell ${admin ? "shell--admin" : ""}`}>
      <div className="shell__glow shell__glow--one" />
      <div className="shell__glow shell__glow--two" />

      <div className="shell__container">
        <header className="shell__header">
          <div>
            <Link to={admin ? "/admin" : "/home"} className="shell__brand">
              Dihya Table
            </Link>
            <p className="shell__tagline">
              {admin ? "Tableau de bord des opérations du restaurant" : "Réservations, menu et restauration en un seul endroit"}
            </p>
          </div>

          <div className="shell__user">
            {!admin && user?.role === "admin" ? (
              <Link to="/admin" className="shell__link-chip">
                Panneau d'administration
              </Link>
            ) : null}

            <div className="shell__user-card">
              <span className="shell__avatar">{getInitials(user)}</span>
              <div>
                <strong>
                  {user?.firstName} {user?.lastName}
                </strong>
                <span>{formatRole(user?.role)}</span>
              </div>
            </div>

            {admin ? (
              <Button type="button" variant="ghost" onClick={handleLogout}>
                Se déconnecter
              </Button>
            ) : null}
          </div>
        </header>

        {admin ? (
          <nav className="admin-shell-nav" aria-label="Navigation administrateur">
            <NavLink to="/admin" end className={({ isActive }) => `admin-shell-nav__item ${isActive ? "is-active" : ""}`}>
              Home
            </NavLink>
            <NavLink to="/admin/carte" className={({ isActive }) => `admin-shell-nav__item ${isActive ? "is-active" : ""}`}>
              Carte
            </NavLink>
            <NavLink
              to="/admin/menus-quotidiens"
              className={({ isActive }) => `admin-shell-nav__item ${isActive ? "is-active" : ""}`}
            >
              Menus quotidiens
            </NavLink>
            <NavLink
              to="/admin/reservations"
              className={({ isActive }) => `admin-shell-nav__item ${isActive ? "is-active" : ""}`}
            >
              Réservations
            </NavLink>
            <NavLink to="/admin/devis" className={({ isActive }) => `admin-shell-nav__item ${isActive ? "is-active" : ""}`}>
              Devis
            </NavLink>
          </nav>
        ) : null}

        <main className="shell__content">
          <Outlet />
        </main>
      </div>

      {admin ? null : <BottomNav />}
    </div>
  );
}
