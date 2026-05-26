import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { adminService } from "../services/api.js";
import { formatDate, formatTime } from "../utils/formatters.js";

const toneFromStatus = (status) => {
  if (status === "accepted" || status === "confirmed") {
    return "success";
  }

  if (status === "rejected" || status === "cancelled") {
    return "danger";
  }

  return "warning";
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadReservations = async () => {
      try {
        const response = await adminService.reservations();
        if (isMounted) {
          setReservations(response.reservations);
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

    loadReservations();

    return () => {
      isMounted = false;
    };
  }, []);

  const removeReservation = async (id) => {
    if (!window.confirm("Supprimer cette réservation ?")) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await adminService.deleteReservation(id);
      await adminService.reservations().then((response) => setReservations(response.reservations));
      setMessage("Réservation supprimée.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card card--muted">Chargement des réservations...</div>;
  }

  return (
    <div className="page-stack">
      <section className="card">
        <PageHeader
          eyebrow="Réservations"
          title="Dernières réservations de table"
          description="Cette page est séparée pour garder le suivi des réservations hors du reste du tableau de bord."
        />

        {message ? <p className="message message--success">{message}</p> : null}
        {error ? <p className="message message--error">{error}</p> : null}

        <div className="list-stack">
          {reservations.map((reservation) => (
            <article key={reservation.id} className="list-card">
              <div className="list-card__content">
                <div className="list-card__row">
                  <h3>{reservation.user}</h3>
                  <StatusBadge tone={toneFromStatus(reservation.status)}>{reservation.status}</StatusBadge>
                </div>
                <p>
                  {formatDate(reservation.reservationDate)} à {formatTime(reservation.reservationTime)}
                </p>
                <p>
                  {reservation.guestCount} invités - {reservation.customerEmail}
                </p>
              </div>

              <div className="list-card__actions">
                <Button type="button" variant="danger" onClick={() => removeReservation(reservation.id)} disabled={saving}>
                  Supprimer
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}