import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { cateringService } from "../services/api.js";
import { formatCurrency } from "../utils/formatters.js";

const eventTypeOptions = ["Mariage", "Anniversaire", "Entreprise", "Diner prive", "Autre"];

const initialForm = {
  eventDate: "",
  reservationTime: "",
  guestCount: 1,
  eventType: eventTypeOptions[0],
  phone: "",
  notes: ""
};

export default function CateringPage() {
  const { user } = useAuth();
  const quoteFormRef = useRef(null);
  const [catalog, setCatalog] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [customDishes, setCustomDishes] = useState({});
  const [customDishInput, setCustomDishInput] = useState("");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step1Validated, setStep1Validated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setForm((current) => ({ ...current, phone: current.phone || user?.phone || "" }));
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await cateringService.catalog();
        if (isMounted) setCatalog(res.catalog);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFieldChange = (e) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((c) => ({ ...c, [e.target.name]: value }));
  };

  const changeQuantity = (itemId, delta) => {
    setQuantities((current) => {
      const next = Math.max(0, (current[itemId] || 0) + delta);
      if (next === 0) {
        const copy = { ...current };
        delete copy[itemId];
        return copy;
      }
      return { ...current, [itemId]: next };
    });
  };

  const addCustomDish = () => {
    if (customDishInput.trim()) {
      const id = `custom-${Date.now()}`;
      setCustomDishes((current) => ({
        ...current,
        [id]: customDishInput.trim()
      }));
      setCustomDishInput("");
    }
  };

  const removeCustomDish = (id) => {
    setCustomDishes((current) => {
      const copy = { ...current };
      delete copy[id];
      return copy;
    });
  };

  const selectedItems = catalog
    .flatMap((c) => c.items || [])
    .map((it) => ({ ...it, quantity: quantities[it.id] || 0 }))
    .filter((it) => it.quantity > 0);

  const selectedDishCount = selectedItems.length + Object.keys(customDishes).length;
  const estimatedTotal = selectedItems.reduce((t, it) => t + it.pricePerPerson * it.quantity, 0);

  const scrollToQuoteForm = () => {
    quoteFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      quoteFormRef.current?.querySelector("input, select, textarea")?.focus();
    }, 250);
  };

  const clearSelection = () => {
    setQuantities({});
    setCustomDishes({});
    setCustomDishInput("");
    setStep1Validated(false);
    setError("");
    setSuccess("");
  };

  const validateStep1 = () => {
    // Validation du nombre de personnes
    if (!form.guestCount || form.guestCount < 1 || form.guestCount > 500) {
      return "Le nombre de personnes doit être entre 1 et 500.";
    }

    // Validation de la date
    if (!form.eventDate) {
      return "La date de l'événement est obligatoire.";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(form.eventDate);
    if (selectedDate < today) {
      return "La date de l'événement ne peut pas être dans le passé.";
    }

    // Validation de l'heure
    if (!form.reservationTime) {
      return "L'heure est obligatoire.";
    }

    // Validation du type d'événement
    if (!form.eventType) {
      return "Le type d'événement est obligatoire.";
    }

    // Validation du téléphone
    const phoneRegex = /^[\d\s\+\-\.()]*$/;
    if (!form.phone || form.phone.trim().length < 9) {
      return "Veuillez entrer un numéro de téléphone valide (au minimum 9 caractères).";
    }
    if (!phoneRegex.test(form.phone)) {
      return "Le numéro de téléphone contient des caractères invalides.";
    }

    return null;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep1Validated(true);
    scrollToQuoteForm();
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (selectedItems.length === 0 && Object.keys(customDishes).length === 0) {
      setError("Choisissez au moins un plat avant de créer votre devis.");
      setSubmitting(false);
      return;
    }

    try {
      const customDishesText = Object.values(customDishes).length > 0 
        ? `\n\nPlats personnalisés souhaités:\n${Object.values(customDishes).join("\n")}`
        : "";

      const response = await cateringService.createQuote({
        ...form,
        guestCount: Number(form.guestCount),
        items: selectedItems.map((i) => ({ itemId: i.id, quantity: i.quantity })),
        notes: (form.notes || "") + customDishesText
      });

      setQuantities({});
      setCustomDishes({});
      setCustomDishInput("");
      setForm((c) => ({ ...c, eventDate: "", reservationTime: "", notes: "" }));
      setSuccess("Merci pour votre devis. Vous pouvez le consulter dans votre profil.");
      // rediriger vers la page profil après un court délai
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      {!step1Validated ? (
        <section className="card" ref={quoteFormRef}>
          <PageHeader eyebrow="Etape 1" title="Votre devis traiteur" description="Entrez le nombre d'invités et les détails, puis choisissez les plats." />

          <form className="form-stack" onSubmit={handleStep1Submit}>
            <Input label="Nombre de personnes" type="number" name="guestCount" value={form.guestCount} onChange={handleFieldChange} min="1" max="500" required />
            <Input label="Date de l'evenement" type="date" name="eventDate" value={form.eventDate} onChange={handleFieldChange} required />
            <Input label="Heure" type="time" name="reservationTime" value={form.reservationTime} onChange={handleFieldChange} required />

            <Input label="Type d'evenement" as="select" name="eventType" value={form.eventType} onChange={handleFieldChange} required>
              {eventTypeOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </Input>

            <Input label="Telephone" type="tel" name="phone" value={form.phone} onChange={handleFieldChange} required />
            <Input label="Notes" as="textarea" name="notes" rows="4" value={form.notes} onChange={handleFieldChange} helperText="Ajoutez le lieu, le service souhaite ou toute information utile." />

            {error && <p className="message message--error">{error}</p>}

            <div className="button-group">
              <Button type="submit" block>
                Suivant : Choisir les plats
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <section className="card">
          <PageHeader eyebrow="Etape 2" title="Choisissez vos plats" description="Sélectionnez les plats pour votre devis." />

          {loading ? <p className="muted-copy">Chargement du catalogue traiteur...</p> : null}

          {!loading ? (
            <div className="section-stack">
              {catalog.length > 0 && (
                <div className="category-tabs">
                  <button
                    className={`category-tab ${selectedCategory === null ? "is-active" : ""}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    <span className="category-tab__label">Tous</span>
                    <span className="category-tab__count">{catalog.reduce((sum, c) => sum + (c.items?.length || 0), 0)} articles</span>
                  </button>
                  {catalog.map((category) => (
                    <button
                      key={category.id}
                      className={`category-tab ${selectedCategory === category.id ? "is-active" : ""}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="category-tab__label">{category.name}</span>
                      <span className="category-tab__count">{category.items?.length || 0} articles</span>
                    </button>
                  ))}
                  <button
                    className={`category-tab ${selectedCategory === "custom" ? "is-active" : ""}`}
                    onClick={() => setSelectedCategory("custom")}
                  >
                    <span className="category-tab__label">Hors carte</span>
                  </button>
                </div>
              )}

              {selectedCategory === "custom" ? (
                <section className="catalog-section">
                  <div className="section-banner">
                    <div>
                      <p className="eyebrow">option</p>
                      <h2>Plat non sur la carte</h2>
                    </div>
                  </div>

                  <div className="ubereats-list">
                    <div style={{ padding: "1rem", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px dashed #ccc" }}>
                      <p style={{ marginBottom: "0.5rem", fontSize: "0.9rem", color: "#666" }}>Quel plats voudrez vous ?</p>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="text"
                          value={customDishInput}
                          onChange={(e) => setCustomDishInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addCustomDish()}
                          placeholder="Ex: Couscous avec viande personnalisée"
                          style={{ flex: 1, padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.9rem" }}
                        />
                        <button
                          type="button"
                          onClick={addCustomDish}
                          style={{ padding: "0.5rem 1rem", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                          +
                        </button>
                      </div>

                      {Object.entries(customDishes).length > 0 && (
                        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
                          {Object.entries(customDishes).map(([id, name]) => (
                            <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", fontSize: "0.9rem" }}>
                              <span>{name}</span>
                              <button
                                type="button"
                                onClick={() => removeCustomDish(id)}
                                style={{ padding: "0.25rem 0.75rem", backgroundColor: "#fee", color: "#c00", border: "1px solid #c00", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}
                              >
                                Supprimer
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              ) : (
                catalog
                  .filter((c) => selectedCategory === null || c.id === selectedCategory)
                  .map((category) => (
                  <section key={category.id} className="catalog-section">
                    {selectedCategory === null && (
                      <div className="section-banner">
                        <div>
                          <p className="eyebrow">{category.slug}</p>
                          <h2>{category.name}</h2>
                        </div>
                        <span>{(category.items || []).length} plats</span>
                      </div>
                    )}

                  <div className="ubereats-list">
                    {(category.items || []).map((item) => {
                      const quantity = quantities[item.id] || 0;
                      return (
                        <article key={item.id} className={`ubereats-card ${quantity > 0 ? "is-selected" : ""}`}>
                          <div className="ubereats-card__main">
                            <div className="ubereats-card__media">
                              <img src={item.imageUrl} alt={item.name} className="ubereats-card__image" />
                              {quantity > 0 ? <span className="ubereats-card__badge">{quantity}</span> : null}
                            </div>

                            <div className="ubereats-card__copy">
                              <div>
                                <h3>{item.name}</h3>
                                <p>{item.description}</p>
                              </div>
                              <strong>{formatCurrency(item.pricePerPerson)} / pers.</strong>
                            </div>
                          </div>

                          <div className="ubereats-card__footer">
                            <div className="ubereats-card__controls">
                              <button type="button" onClick={() => changeQuantity(item.id, -1)} disabled={quantity === 0}>-</button>
                              <span>{quantity}</span>
                              <button type="button" onClick={() => changeQuantity(item.id, 1)}>+</button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))
            )}

              <section className="selection-card selection-card--checkout">
                <div className="selection-card__header">
                  <StatusBadge tone={selectedDishCount > 0 ? "accent" : "neutral"}>{selectedDishCount} selection(s)</StatusBadge>
                </div>

                <div className="selection-list">
                  {selectedItems.length === 0 && Object.keys(customDishes).length === 0 ? <p className="empty-copy">Votre preparation est vide pour le moment.</p> : null}
                  {selectedItems.map((it) => (
                    <div key={it.id} className="selection-list__row">
                      <span>{it.name} x {it.quantity}</span>
                      <strong>{formatCurrency(it.pricePerPerson * it.quantity)}</strong>
                    </div>
                  ))}
                  {Object.entries(customDishes).map(([id, name]) => (
                    <div key={id} className="selection-list__row">
                      <span>{name} x 1</span>
                      <strong>Sur devis</strong>
                    </div>
                  ))}
                </div>

                <div className="selection-card__actions">
                  <Button type="button" variant="ghost" onClick={() => setStep1Validated(false)} disabled={false}>
                    Modifier le devis
                  </Button>
                  <Button type="button" onClick={handleSubmit} disabled={(selectedItems.length === 0 && Object.keys(customDishes).length === 0) || submitting}>
                    {submitting ? "Creation du devis..." : "Creer mon devis traiteur"}
                  </Button>
                </div>
              </section>
            </div>
          ) : null}
        </section>
      )}
      <BottomNav />
    </div>
  );
}
