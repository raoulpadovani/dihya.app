import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import DishCard from "../components/DishCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Calendar from "../components/Calendar.jsx";
import { restaurantService, dailyMenuService } from "../services/api.js";
import { formatCurrency, toTitleCase } from "../utils/formatters.js";

export default function HomePage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [datesWithMenus, setDatesWithMenus] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      try {
        const response = await restaurantService.overview();

        if (isMounted) {
          setOverview(response);
        }

        // Load dates with menus
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };
        const menusResult = await dailyMenuService.getByRange(
          formatDate(startDate),
          formatDate(endDate)
        );
        
        if (menusResult.menus) {
          const dates = menusResult.menus.map((menu) => menu.date);
          setDatesWithMenus(dates);
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

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    try {
      const result = await dailyMenuService.getByDate(date);
      setSelectedMenu(result.dailyMenu);
    } catch (_err) {
      setSelectedMenu(null);
    }
  };

  if (loading) {
    return <div className="card card--muted">Chargement de l'aperçu du restaurant...</div>;
  }

  if (error) {
    return <div className="message message--error">{error}</div>;
  }

  const { restaurant, dailyMenu, menu } = overview;
  const totalDishes = menu.reduce((count, category) => count + category.dishes.length, 0);

  return (
    <div className="page-stack">
      <section className="hero-card">
        <img src={restaurant.heroImage} alt={restaurant.name} className="hero-card__image" />
        <div className="hero-card__overlay" />

        <div className="hero-card__content">
          <p className="eyebrow">Restaurant et restauration</p>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description}</p>

          <div className="hero-card__meta">
            <StatusBadge tone={restaurant.status.isOpen ? "success" : "danger"}>{restaurant.status.label}</StatusBadge>
            <span className="soft-chip">{restaurant.address}</span>
          </div>

          <div className="hero-card__actions">
            <Button to="/reservation">Réserver une table</Button>
            <Button to="/catering" variant="secondary">
              Demander la restauration
            </Button>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Menu du jour</span>
          <strong>{restaurant.dailyMenuTitle}</strong>
        </article>
        <article className="stat-card">
          <span>Menu en direct</span>
          <strong>{totalDishes} plats</strong>
        </article>
        <article className="stat-card">
          <span>Ligne directe</span>
          <strong>{restaurant.phone}</strong>
        </article>
      </section>

      <section className="card">
        <PageHeader
          eyebrow="Accueil"
          title="Menu à la une d'aujourd'hui"
          description={restaurant.dailyMenuDescription}
          action={
            <Button to="/menu" variant="ghost">
              Full menu
            </Button>
          }
        />

        <div className="dish-grid">
          {dailyMenu.map((dish) => (
            <DishCard key={dish.id} item={dish} subtitle={dish.category} />
          ))}
        </div>
      </section>

      <section className="content-grid">
        <article className="card">
          <PageHeader eyebrow="Menu" title="Calendrier" />
          <Calendar 
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            highlightedDates={datesWithMenus}
          />
          {selectedMenu && selectedDate && (
            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #e5e7eb" }}>
              <h4 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                {new Date(selectedDate).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </h4>
              <strong style={{ display: "block", marginBottom: "0.5rem" }}>{selectedMenu.title}</strong>
              {selectedMenu.description && (
                <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.5rem 0" }}>{selectedMenu.description}</p>
              )}
              
              {selectedMenu.categories && selectedMenu.categories.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  {selectedMenu.categories.map((category) => (
                    <div key={category.id} style={{ marginBottom: "1.5rem" }}>
                      <h5 style={{ borderBottom: "2px solid #d97706", paddingBottom: "0.5rem", marginBottom: "0.75rem" }}>
                        {category.name}
                      </h5>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem" }}>
                        {category.dishes && category.dishes.map((dish) => (
                          <div key={dish.id} style={{ padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
                            <strong>{dish.name}</strong>
                            <p style={{ margin: "0.25rem 0", color: "#6b7280", fontSize: "0.75rem" }}>{dish.description}</p>
                            <p style={{ margin: "0.25rem 0", fontWeight: 600 }}>{dish.price.toFixed(2)} €</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </article>

        <article className="card">
          <PageHeader eyebrow="Today" title={restaurant.dailyMenuTitle} />
          <p className="muted-copy">{restaurant.dailyMenuDescription}</p>
          <div className="summary-list">
            {dailyMenu.slice(0, 3).map((dish) => (
              <div key={dish.id} className="summary-list__row">
                <span>{dish.name}</span>
                <strong>{formatCurrency(dish.price)}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
