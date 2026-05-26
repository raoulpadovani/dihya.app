import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { adminService } from "../services/api.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";

const toneFromStatus = (status) => {
  if (status === "accepted" || status === "confirmed") {
    return "success";
  }

  if (status === "rejected" || status === "cancelled") {
    return "danger";
  }

  return "warning";
};

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadQuotes = async () => {
    const response = await adminService.quotes();
    setQuotes(response.quotes);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await loadQuotes();
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

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const changeQuoteStatus = async (id, status) => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await adminService.updateQuoteStatus(id, status);
      await loadQuotes();
      setMessage(`Devis ${status}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeQuote = async (id) => {
    if (!window.confirm("Supprimer ce devis ?")) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await adminService.deleteQuote(id);
      await loadQuotes();
      setMessage("Devis supprimé.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card card--muted">Chargement des devis...</div>;
  }

  return (
    <div className="page-stack">
      <section className="card">
        <PageHeader
          eyebrow="Devis"
          title="Demandes de devis"
          description="Les demandes de restauration ont leur propre page pour garder le suivi distinct du reste de l'administration."
        />

        {message ? <p className="message message--success">{message}</p> : null}
        {error ? <p className="message message--error">{error}</p> : null}

        <div className="list-stack">
          {quotes.map((quote) => (
            <article key={quote.id} className="list-card list-card--wide">
              <div className="list-card__content">
                <div className="list-card__row">
                  <h3>{quote.customer}</h3>
                  <StatusBadge tone={toneFromStatus(quote.status)}>{quote.status}</StatusBadge>
                </div>
                <p>
                  {quote.eventType} - {formatDate(quote.eventDate)} - {quote.guestCount} invités
                </p>
                <p>{quote.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}</p>
                <p>{formatCurrency(quote.estimatedTotal)}</p>
              </div>

              <div className="list-card__actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => changeQuoteStatus(quote.id, "accepted")}
                  disabled={saving || quote.status === "accepted"}
                >
                  Accepter
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => changeQuoteStatus(quote.id, "rejected")}
                  disabled={saving || quote.status === "rejected"}
                >
                  Rejeter
                </Button>
                <Button type="button" variant="ghost" onClick={() => removeQuote(quote.id)} disabled={saving}>
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