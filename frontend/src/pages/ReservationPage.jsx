import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { reservationService } from "../services/api.js";

const initialForm = {
  reservationDate: "",
  reservationTime: "",
  guestCount: 2,
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  notes: ""
};

export default function ReservationPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm((current) => ({
      ...current,
      customerName: current.customerName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      customerEmail: current.customerEmail || user?.email || "",
      customerPhone: current.customerPhone || user?.phone || ""
    }));
  }, [user]);

  const handleChange = (event) => {
    const value = event.target.type === "number" ? Number(event.target.value) : event.target.value;
    setForm((current) => ({ ...current, [event.target.name]: value }));
  };

  const validateForm = () => {
    // Validation de la date
    if (!form.reservationDate) {
      return "La date de réservation est obligatoire.";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(form.reservationDate);
    if (selectedDate < today) {
      return "La date de réservation ne peut pas être dans le passé.";
    }

    // Validation de l'heure
    if (!form.reservationTime) {
      return "L'heure de réservation est obligatoire.";
    }

    // Validation du nombre de clients
    if (!form.guestCount || form.guestCount < 1 || form.guestCount > 20) {
      return "Le nombre de clients doit être entre 1 et 20.";
    }

    // Validation du nom
    if (!form.customerName || form.customerName.trim().length < 2) {
      return "Le nom doit contenir au minimum 2 caractères.";
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.customerEmail || !emailRegex.test(form.customerEmail)) {
      return "Veuillez entrer une adresse email valide.";
    }

    // Validation du téléphone
    const phoneRegex = /^[\d\s\+\-\.()]*$/;
    if (!form.customerPhone || form.customerPhone.trim().length < 9) {
      return "Veuillez entrer un numéro de téléphone valide (au minimum 9 caractères).";
    }
    if (!phoneRegex.test(form.customerPhone)) {
      return "Le numéro de téléphone contient des caractères invalides.";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return;
    }

    try {
      const response = await reservationService.create({
        ...form,
        guestCount: Number(form.guestCount)
      });

      setForm((current) => ({
        ...current,
        reservationDate: "",
        reservationTime: "",
        notes: ""
      }));
      setSuccess("Réservation enregistrée avec succès. Vous la trouverez dans votre profil.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack" style={{ paddingBottom: "150px" }}>
      <section className="card" style={{ padding: "0.5rem" }}>
        <form className="form-stack" style={{ gap: "0.35rem" }} onSubmit={handleSubmit}>
          <div className="form-grid form-grid--two">
            <Input
              label="Date"
              type="date"
              name="reservationDate"
              value={form.reservationDate}
              onChange={handleChange}
              required
            />
            <Input
              label="Heure"
              type="time"
              name="reservationTime"
              value={form.reservationTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-grid form-grid--two">
            <Input
              label="Clients"
              type="number"
              min="1"
              max="20"
              name="guestCount"
              value={form.guestCount}
              onChange={handleChange}
              required
            />
            <Input
              label="Téléphone"
              type="tel"
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Nom"
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            type="email"
            name="customerEmail"
            value={form.customerEmail}
            onChange={handleChange}
            required
          />

          <Input
            label="Notes"
            as="textarea"
            name="notes"
            rows="2"
            value={form.notes}
            onChange={handleChange}
          />

          {success ? (
            <div className="form-stack">
              <p className="message message--success">{success}</p>
              <Button to="/profile" variant="secondary">
                Voir dans le profil
              </Button>
            </div>
          ) : null}
          {error ? <p className="message message--error">{error}</p> : null}

          <Button type="submit" block disabled={submitting}>
            {submitting ? "Saving reservation..." : "Save reservation"}
          </Button>
        </form>
      </section>
      <BottomNav />
    </div>
  );
}
