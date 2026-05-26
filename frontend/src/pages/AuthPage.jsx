import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const initialRegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: ""
};

export default function AuthPage({ initialTab = "login" }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Register form state
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [registerError, setRegisterError] = useState("");
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  // Login handlers
  const handleLoginChange = (event) => {
    setLoginForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginSubmitting(true);
    setLoginError("");

    try {
      const response = await login(loginForm);
      navigate(response.user.role === "admin" ? "/admin" : "/home");
    } catch (submitError) {
      setLoginError(submitError.message);
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Register handlers
  const handleRegisterChange = (event) => {
    setRegisterForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegisterSubmitting(true);
    setRegisterError("");

    try {
      await register(registerForm);
      navigate("/home");
    } catch (submitError) {
      setRegisterError(submitError.message);
    } finally {
      setRegisterSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__content">
        <div className="auth-container">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-header__title">🍽️ DIHYA</h1>
            <p className="auth-header__subtitle">Réservez vos repas préférés</p>
          </div>

          {/* Tabs Navigation */}
          <div className="auth-tabs">
            <button
              className={`auth-tabs__button ${activeTab === "login" ? "auth-tabs__button--active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Connexion
            </button>
            <button
              className={`auth-tabs__button ${activeTab === "register" ? "auth-tabs__button--active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Inscription
            </button>
          </div>

          {/* Login Tab */}
          {activeTab === "login" && (
            <div className="auth-tab-content">
              <h2 className="auth-form__title">Se connecter</h2>
              
              <form className="form-stack" onSubmit={handleLoginSubmit}>
                <Input 
                  label="Email" 
                  type="email" 
                  name="email" 
                  value={loginForm.email} 
                  onChange={handleLoginChange} 
                  required 
                />
                <Input
                  label="Mot de passe"
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                />

                {loginError ? <p className="message message--error">{loginError}</p> : null}

                <Button type="submit" block disabled={loginSubmitting}>
                  {loginSubmitting ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>
            </div>
          )}

          {/* Register Tab */}
          {activeTab === "register" && (
            <div className="auth-tab-content">
              <h2 className="auth-form__title">Créer un compte</h2>
              <p className="auth-form__subtitle">Commencez en moins d'une minute.</p>
              
              <form className="form-stack" onSubmit={handleRegisterSubmit}>
                <div className="form-grid form-grid--two">
                  <Input
                    label="Prénom"
                    type="text"
                    name="firstName"
                    value={registerForm.firstName}
                    onChange={handleRegisterChange}
                    required
                  />
                  <Input
                    label="Nom de famille"
                    type="text"
                    name="lastName"
                    value={registerForm.lastName}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <Input 
                  label="Email" 
                  type="email" 
                  name="email" 
                  value={registerForm.email} 
                  onChange={handleRegisterChange} 
                  required 
                />
                <Input 
                  label="Numéro de téléphone" 
                  type="tel" 
                  name="phone" 
                  value={registerForm.phone} 
                  onChange={handleRegisterChange} 
                />
                <Input
                  label="Mot de passe"
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  helperText="Utilisez au moins 6 caractères."
                  required
                />

                {registerError ? <p className="message message--error">{registerError}</p> : null}

                <Button type="submit" block disabled={registerSubmitting}>
                  {registerSubmitting ? "Création du compte..." : "Créer un compte"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
