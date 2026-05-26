import { useEffect, useState } from "react";
import DishCard from "../components/DishCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { restaurantService } from "../services/api.js";

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadMenu = async () => {
      try {
        const response = await restaurantService.menu();

        if (isMounted) {
          setCategories(response.menu);
          setActiveCategoryId(response.menu[0]?.id ?? null);
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

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeCategory = categories.find((category) => category.id === activeCategoryId) || categories[0];

  return (
    <div className="page-stack">
      <section className="card">
        <PageHeader
          eyebrow="Menu de style Uber Eats"
          title="Découvrez chaque plat"
          description="Parcourez le menu en direct par catégorie. Seuls les plats disponibles sont affichés ici."
        />

        {loading ? <p className="muted-copy">Chargement du menu...</p> : null}
        {error ? <p className="message message--error">{error}</p> : null}

        {!loading && !error ? (
          <>
            <div className="pill-row">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`pill ${activeCategory?.id === category.id ? "is-active" : ""}`}
                  onClick={() => setActiveCategoryId(category.id)}
                >
                  <span>{category.name}</span>
                  <small>{category.dishes.length} articles</small>
                </button>
              ))}
            </div>

            {activeCategory ? (
              <div className="section-stack">
                <div className="section-banner">
                  <div>
                    <p className="eyebrow">{activeCategory.slug}</p>
                    <h2>{activeCategory.name}</h2>
                  </div>
                  <span>{activeCategory.dishes.length} disponible</span>
                </div>

                <div className="dish-grid">
                  {activeCategory.dishes.map((dish) => (
                    <DishCard key={dish.id} item={dish} subtitle={activeCategory.name} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="muted-copy">Aucun plat disponible en ce moment.</p>
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}
