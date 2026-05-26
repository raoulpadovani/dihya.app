import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
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
      const response = await login(form);
      navigate(response.user.role === "admin" ? "/admin" : "/home");
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

          <p className="auth-card__footer">
            Pas encore de compte ? <Link to="/register">En créer un</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
