import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { adminService } from "../services/api.js";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [dashboardResponse, restaurantResponse] = await Promise.all([
          adminService.dashboard(),
          adminService.restaurant()
        ]);

        if (isMounted) {
          setDashboard(dashboardResponse);
          setRestaurant(restaurantResponse.restaurant);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateRestaurantStatus = async (status) => {
    setSaving(true);
    setError("");

    try {
      const response = await adminService.updateRestaurantStatus(status);
      setRestaurant((current) => ({ ...current, statusOverride: response.restaurant.statusOverride }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card card--muted">Chargement du tableau de bord administrateur...</div>;
  }

  if (error) {
    return <div className="message message--error">{error}</div>;
  }

  return (
    <div className="page-stack">
      <section className="card">
        <PageHeader
          eyebrow="Panneau d'administration"
          title="Tableau de bord"
          description="Chaque onglet a sa propre page: Home pour le résumé, Carte pour les contenus modifiables, Réservations et Devis pour le suivi."
        />

        <div className="admin-home-links">
          <Button to="/admin/carte" variant="secondary">
            Aller à la carte
          </Button>
          <Button to="/admin/reservations" variant="secondary">
            Aller aux réservations
          </Button>
          <Button to="/admin/devis" variant="secondary">
            Aller aux devis
          </Button>
        </div>

        <div className="card card--muted admin-status-card">
          <PageHeader
            eyebrow="État du restaurant"
            title="Ouvert ou fermé"
            description="Ce réglage remplace temporairement l'état calculé depuis les horaires."
          />

          <div className="admin-status-card__row">
            <StatusBadge tone={restaurant?.statusOverride === "open" ? "success" : restaurant?.statusOverride === "closed" ? "danger" : "neutral"}>
              {restaurant?.statusOverride === "open" ? "Ouvert" : restaurant?.statusOverride === "closed" ? "Fermé" : "Automatique"}
            </StatusBadge>

            <div className="admin-status-card__actions">
              <Button type="button" variant="secondary" onClick={() => updateRestaurantStatus("open")} disabled={saving}>
                Ouvrir
              </Button>
              <Button type="button" variant="danger" onClick={() => updateRestaurantStatus("closed")} disabled={saving}>
                Fermer
              </Button>
              <Button type="button" variant="ghost" onClick={() => updateRestaurantStatus(null)} disabled={saving}>
                Automatique
              </Button>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span>Utilisateurs</span>
            <strong>{dashboard?.stats.totalUsers}</strong>
          </article>
          <article className="stat-card">
            <span>Réservations</span>
            <strong>{dashboard?.stats.totalReservations}</strong>
          </article>
          <article className="stat-card">
            <span>Devis</span>
            <strong>{dashboard?.stats.totalQuotes}</strong>
          </article>
          <article className="stat-card">
            <span>Plats</span>
            <strong>{dashboard?.stats.totalDishes}</strong>
          </article>
        </div>
      </section>
    </div>
  );
}