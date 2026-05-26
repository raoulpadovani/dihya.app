import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { cateringService, reservationService } from "../services/api.js";
import { formatDate, formatRole, formatTime } from "../utils/formatters.js";

const toneFromStatus = (status) => {
  if (status === "accepted" || status === "confirmed") {
    return "success";
  }

  if (status === "rejected" || status === "cancelled") {
    return "danger";
  }

  return "warning";
};

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate("/home");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
      <Input
        label="Mot de passe"
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        required
      />

      {error ? <p className="message message--error">{error}</p> : null}

      <Button type="submit" block disabled={submitting}>
        {submitting ? "Connexion en cours..." : "Se connecter"}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await register(form);
      navigate("/home");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <div className="form-grid form-grid--two">
        <Input
          label="Prénom"
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          required
        />
        <Input
          label="Nom de famille"
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
      <Input label="Numéro de téléphone" type="tel" name="phone" value={form.phone} onChange={handleChange} />
      <Input
        label="Mot de passe"
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        helperText="Utilisez au least 6 caractères."
        required
      />

      {error ? <p className="message message--error">{error}</p> : null}

      <Button type="submit" block disabled={submitting}>
        {submitting ? "Création du compte..." : "Créer un compte"}
      </Button>
    </form>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quoteError, setQuoteError] = useState("");
  const [authTab, setAuthTab] = useState("login");

  if (!user) {
    return (
      <div className="page-stack">
        <section className="card">
          <PageHeader eyebrow="Profil" title="Authentification requise" description="Connectez-vous ou créez un compte pour accéder à votre profil" />

          <div className="auth-tabs" style={{ marginBottom: "2rem" }}>
            <button
              className={`tab-button ${authTab === "login" ? "active" : ""}`}
              onClick={() => setAuthTab("login")}
              style={{
                padding: "0.5rem 1rem",
                marginRight: "0.5rem",
                border: "none",
                cursor: "pointer",
                borderBottom: authTab === "login" ? "2px solid var(--color-accent)" : "2px solid transparent",
                fontSize: "1rem",
                fontWeight: authTab === "login" ? "bold" : "normal"
              }}
            >
              Se connecter
            </button>
            <button
              className={`tab-button ${authTab === "register" ? "active" : ""}`}
              onClick={() => setAuthTab("register")}
              style={{
                padding: "0.5rem 1rem",
                border: "none",
                cursor: "pointer",
                borderBottom: authTab === "register" ? "2px solid var(--color-accent)" : "2px solid transparent",
                fontSize: "1rem",
                fontWeight: authTab === "register" ? "bold" : "normal"
              }}
            >
              Créer un compte
            </button>
          </div>

          {authTab === "login" ? <LoginForm /> : <RegisterForm />}
        </section>
      </div>
    );
  }

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      const [reservationResult, quoteResult] = await Promise.allSettled([
        reservationService.mine(),
        cateringService.mineQuotes()
      ]);

      if (!isMounted) {
        return;
      }

      if (reservationResult.status === "fulfilled") {
        setReservations(reservationResult.value.reservations);
      } else {
        setError(reservationResult.reason.message);
      }

      if (quoteResult.status === "fulfilled") {
        setQuotes(quoteResult.value.quotes);
      } else if (quoteResult.reason.status === 404) {
        setQuoteError("Quote history is unavailable until the backend is restarted with the latest routes.");
      } else {
        setQuoteError(quoteResult.reason.message);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="page-stack">
      <section className="card profile-card">
        <div className="profile-card__avatar">
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </div>

        <PageHeader
          eyebrow="Profil"
          title={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
          description={user?.email}
          action={<StatusBadge tone={user?.role === "admin" ? "accent" : "neutral"}>{formatRole(user?.role)}</StatusBadge>}
        />

        <div className="stats-grid">
          <article className="stat-card">
            <span>Réservations</span>
            <strong>{reservations.length}</strong>
          </article>
          <article className="stat-card">
            <span>Devis</span>
            <strong>{quotes.length}</strong>
          </article>
          <article className="stat-card">
            <span>Téléphone</span>
            <strong>{user?.phone || "--"}</strong>
          </article>
        </div>

        <Button type="button" variant="ghost" onClick={handleLogout}>
          Se déconnecter
        </Button>
      </section>

      {error ? <p className="message message--error">{error}</p> : null}
      {loading ? <p className="card card--muted">Chargement de l'activité du profil...</p> : null}

      {!loading ? (
        <div className="content-grid">
          <section className="card">
            <PageHeader
              eyebrow="Mes réservations"
              title="Historique des réservations"
              description="Toutes vos réservations de table sont listées ici."
            />

            {reservations.length === 0 ? <p className="empty-copy">Aucune réservation enregistrée pour l'instant.</p> : null}
            <div className="list-stack">
              {reservations.map((reservation) => (
                <article key={reservation.id} className="list-card">
                  <div className="list-card__content">
                    <div className="list-card__row">
                      <h3>{formatDate(reservation.reservationDate)}</h3>
                      <StatusBadge tone={toneFromStatus(reservation.status)}>{reservation.status}</StatusBadge>
                    </div>
                    <p>{formatTime(reservation.reservationTime)}</p>
                    <p>{reservation.guestCount} invités</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="card">
            <PageHeader
              eyebrow="Mes devis"
              title="Demandes de restauration"
              description="Vos demandes de devis traiteur restent également disponibles ici."
            />

            {quoteError ? <p className="message message--error">{quoteError}</p> : null}
            {quotes.length === 0 ? <p className="empty-copy">Aucun devis traiteur enregistré pour l'instant.</p> : null}
            <div className="list-stack">
              {quotes.slice(0, 5).map((quote) => (
                <article key={quote.id} className="list-card">
                  <div className="list-card__content">
                    <div className="list-card__row">
                      <h3>{quote.eventType}</h3>
                      <StatusBadge tone={toneFromStatus(quote.status)}>{quote.status}</StatusBadge>
                    </div>
                    <p>{formatDate(quote.eventDate)}</p>
                    <p>{quote.guestCount} invités</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
