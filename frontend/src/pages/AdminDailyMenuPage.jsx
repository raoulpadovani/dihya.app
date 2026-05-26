import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Calendar from "../components/Calendar.jsx";
import { adminService } from "../services/api.js";

const initialMenuForm = {
  date: "",
  title: "",
  description: "",
  dishIds: []
};

export default function AdminDailyMenuPage() {
  const [menuForm, setMenuForm] = useState(initialMenuForm);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMenu, setCurrentMenu] = useState(null);
  const [availableDishes, setAvailableDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [datesWithMenus, setDatesWithMenus] = useState([]);
  const [editingMenuId, setEditingMenuId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const dishesResult = await adminService.availableDishes();
      setAvailableDishes(dishesResult.dishes || []);

      // Load menus for current and next month
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const menusResult = await adminService.dailyMenus(
        formatDate(startDate),
        formatDate(endDate)
      );

      if (menusResult.menus) {
        const dates = menusResult.menus.map((m) => m.date);
        setDatesWithMenus(dates);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setMenuForm({ ...initialMenuForm, date });
    setEditingMenuId(null);
    setCurrentMenu(null);
    setError("");
    setMessage("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setMenuForm((current) => ({ ...current, [name]: value }));
  };

  const handleDishToggle = (dishId) => {
    setMenuForm((current) => {
      const dishIds = current.dishIds.includes(dishId)
        ? current.dishIds.filter((id) => id !== dishId)
        : [...current.dishIds, dishId];
      return { ...current, dishIds };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!menuForm.date || !menuForm.title) {
      setError("La date et le titre sont obligatoires.");
      return;
    }

    setSaving(true);

    try {
      if (editingMenuId) {
        await adminService.updateDailyMenu(editingMenuId, {
          title: menuForm.title,
          description: menuForm.description,
          dishIds: menuForm.dishIds
        });
        setMessage("Menu mis à jour avec succès.");
      } else {
        await adminService.createDailyMenu(menuForm);
        setMessage("Menu créé avec succès.");
      }

      setMenuForm(initialMenuForm);
      setSelectedDate("");
      setEditingMenuId(null);
      setCurrentMenu(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingMenuId || !window.confirm("Êtes-vous sûr de vouloir supprimer ce menu?")) {
      return;
    }

    setSaving(true);
    try {
      await adminService.deleteDailyMenu(editingMenuId);
      setMessage("Menu supprimé avec succès.");
      setMenuForm(initialMenuForm);
      setSelectedDate("");
      setEditingMenuId(null);
      setCurrentMenu(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader>Gérer les menus quotidiens</PageHeader>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader>Gérer les menus quotidiens</PageHeader>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Calendrier</h2>
        <Calendar
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          highlightedDates={datesWithMenus}
        />
      </section>

      {selectedDate && (
        <section className="card">
          <form className="form-stack" onSubmit={handleSubmit}>
            <h3>
              {editingMenuId ? "Modifier le menu du" : "Créer un menu pour le"}{" "}
              {new Date(selectedDate).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </h3>

            <Input
              label="Titre du menu"
              type="text"
              name="title"
              value={menuForm.title}
              onChange={handleFormChange}
              placeholder="Ex: Menu du jour, Spécial du vendredi..."
              required
            />

            <Input
              label="Description"
              as="textarea"
              name="description"
              value={menuForm.description}
              onChange={handleFormChange}
              placeholder="Description optionnelle du menu"
              rows="2"
            />

            <div>
              <label style={{ display: "block", marginBottom: "1rem", fontWeight: 600 }}>
                Sélectionnez les plats
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                {availableDishes.map((dish) => (
                  <label
                    key={dish.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                      padding: "1rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      backgroundColor: menuForm.dishIds.includes(dish.id) ? "#fef3c7" : "white"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={menuForm.dishIds.includes(dish.id)}
                      onChange={() => handleDishToggle(dish.id)}
                      style={{ marginTop: "0.25rem" }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong>{dish.name}</strong>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                        {dish.description}
                      </p>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0.25rem 0 0 0" }}>
                        {dish.price.toFixed(2)} €
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="message message--error">{error}</p>}
            {message && <p className="message message--success">{message}</p>}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button type="submit" disabled={saving}>
                {saving ? "Enregistrement..." : editingMenuId ? "Mettre à jour" : "Créer le menu"}
              </Button>
              {editingMenuId && (
                <Button variant="danger" onClick={handleDelete} disabled={saving}>
                  {saving ? "Suppression..." : "Supprimer"}
                </Button>
              )}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
