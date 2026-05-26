import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: ""
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
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
    <div className="auth-screen">
      

      <section className="auth-screen__panel">
        <div className="auth-card">
          <div className="auth-card__header">
            <h2>Créer un compte</h2>
            <p>Commencez en moins d'une minute.</p>
          </div>

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
              helperText="Utilisez au moins 6 caractères."
              required
            />

            {error ? <p className="message message--error">{error}</p> : null}

            <Button type="submit" block disabled={submitting}>
              {submitting ? "Création du compte..." : "Créer un compte"}
            </Button>
          </form>

          <p className="auth-card__footer">
            Déjà enregistré ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
