import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { adminService } from "../services/api.js";
import { formatCurrency } from "../utils/formatters.js";

const emptyDish = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  isAvailable: true,
  isFeatured: false
};

const emptyCatering = {
  categoryId: "",
  name: "",
  description: "",
  pricePerPerson: "",
  imageUrl: "",
  isAvailable: true
};

export default function AdminMenuPage() {
  const [menuData, setMenuData] = useState({ categories: [], dishes: [] });
  const [cateringData, setCateringData] = useState({ categories: [], items: [] });
  const [dishForm, setDishForm] = useState(emptyDish);
  const [cateringForm, setCateringForm] = useState(emptyCatering);
  const [editingDishId, setEditingDishId] = useState(null);
  const [editingCateringId, setEditingCateringId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadMenuData = async () => {
    const [menuResponse, cateringResponse] = await Promise.all([adminService.menu(), adminService.catering()]);
    setMenuData(menuResponse);
    setCateringData(cateringResponse);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await loadMenuData();
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

  const runAction = async (action, successMessage) => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await action();
      setMessage(successMessage);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDishChange = (event) => {
    const { name, value, type, checked } = event.target;
    setDishForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleCateringChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCateringForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const resetDishForm = () => {
    setEditingDishId(null);
    setDishForm(emptyDish);
  };

  const resetCateringForm = () => {
    setEditingCateringId(null);
    setCateringForm(emptyCatering);
  };

  const submitDish = async (event) => {
    event.preventDefault();
    const isEditing = Boolean(editingDishId);

    await runAction(async () => {
      const payload = {
        ...dishForm,
        categoryId: Number(dishForm.categoryId),
        price: Number(dishForm.price)
      };

      if (isEditing) {
        await adminService.updateDish(editingDishId, payload);
      } else {
        await adminService.createDish(payload);
      }

      resetDishForm();
      await loadMenuData();
    }, isEditing ? "Article de menu mis à jour." : "Article de menu créé.");
  };

  const submitCatering = async (event) => {
    event.preventDefault();
    const isEditing = Boolean(editingCateringId);

    await runAction(async () => {
      const payload = {
        ...cateringForm,
        categoryId: Number(cateringForm.categoryId),
        pricePerPerson: Number(cateringForm.pricePerPerson)
      };

      if (isEditing) {
        await adminService.updateCateringItem(editingCateringId, payload);
      } else {
        await adminService.createCateringItem(payload);
      }

      resetCateringForm();
      await loadMenuData();
    }, isEditing ? "Article de restauration mis à jour." : "Article de restauration créé.");
  };

  const editDish = (dish) => {
    setEditingDishId(dish.id);
    setDishForm({
      categoryId: String(dish.categoryId),
      name: dish.name,
      description: dish.description,
      price: String(dish.price),
      imageUrl: dish.imageUrl,
      isAvailable: dish.isAvailable,
      isFeatured: dish.isFeatured
    });
  };

  const editCateringItem = (item) => {
    setEditingCateringId(item.id);
    setCateringForm({
      categoryId: String(item.categoryId),
      name: item.name,
      description: item.description,
      pricePerPerson: String(item.pricePerPerson),
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable
    });
  };

  const removeDish = async (id) => {
    if (!window.confirm("Supprimer cet article de menu ?")) {
      return;
    }

    await runAction(async () => {
      await adminService.deleteDish(id);
      await loadMenuData();
    }, "Article de menu supprimé.");
  };

  const removeCateringItem = async (id) => {
    if (!window.confirm("Supprimer cet article de restauration ?")) {
      return;
    }

    await runAction(async () => {
      await adminService.deleteCateringItem(id);
      await loadMenuData();
    }, "Article de restauration supprimé.");
  };

  if (loading) {
    return <div className="card card--muted">Chargement de la carte...</div>;
  }

  return (
    <div className="page-stack">
      <section className="card">
        <PageHeader
          eyebrow="Carte"
          title="Gérez les plats et la restauration"
          description="Les deux blocs ci-dessous sont séparés de la page Home pour que chaque zone reste à sa place."
        />

        {message ? <p className="message message--success">{message}</p> : null}
        {error ? <p className="message message--error">{error}</p> : null}

        <div className="content-grid">
          <section className="card">
            <PageHeader
              eyebrow="CRUD Menu"
              title={editingDishId ? "Modifier le plat" : "Créer un plat"}
              action={
                editingDishId ? (
                  <Button type="button" variant="ghost" onClick={resetDishForm}>
                    Annuler
                  </Button>
                ) : null
              }
            />

            <form className="form-stack" onSubmit={submitDish}>
              <Input label="Catégorie" as="select" name="categoryId" value={dishForm.categoryId} onChange={handleDishChange} required>
                <option value="">Sélectionner une catégorie</option>
                {menuData.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Input>

              <Input label="Nom du plat" type="text" name="name" value={dishForm.name} onChange={handleDishChange} required />
              <Input
                label="Description"
                as="textarea"
                rows="3"
                name="description"
                value={dishForm.description}
                onChange={handleDishChange}
                required
              />

              <div className="form-grid form-grid--two">
                <Input label="Prix" type="number" step="0.01" name="price" value={dishForm.price} onChange={handleDishChange} required />
                <Input
                  label="URL de l'image"
                  type="url"
                  name="imageUrl"
                  value={dishForm.imageUrl}
                  onChange={handleDishChange}
                  required
                />
              </div>

              <label className="checkbox-row">
                <input type="checkbox" name="isAvailable" checked={dishForm.isAvailable} onChange={handleDishChange} />
                <span>Disponible pour les clients</span>
              </label>

              <label className="checkbox-row">
                <input type="checkbox" name="isFeatured" checked={dishForm.isFeatured} onChange={handleDishChange} />
                <span>Afficher sur la page d'accueil</span>
              </label>

              <Button type="submit" block disabled={saving}>
                {saving ? "Enregistrement..." : editingDishId ? "Modifier le plat" : "Créer un plat"}
              </Button>
            </form>
          </section>

          <section className="card">
            <PageHeader
              eyebrow="CRUD Restauration"
              title={editingCateringId ? "Modifier l'article" : "Créer un article"}
              action={
                editingCateringId ? (
                  <Button type="button" variant="ghost" onClick={resetCateringForm}>
                    Annuler
                  </Button>
                ) : null
              }
            />

            <form className="form-stack" onSubmit={submitCatering}>
              <Input
                label="Catégorie"
                as="select"
                name="categoryId"
                value={cateringForm.categoryId}
                onChange={handleCateringChange}
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {cateringData.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Input>

              <Input
                label="Nom de l'article"
                type="text"
                name="name"
                value={cateringForm.name}
                onChange={handleCateringChange}
                required
              />
              <Input
                label="Description"
                as="textarea"
                rows="3"
                name="description"
                value={cateringForm.description}
                onChange={handleCateringChange}
                required
              />

              <div className="form-grid form-grid--two">
                <Input
                  label="Prix par personne"
                  type="number"
                  step="0.01"
                  name="pricePerPerson"
                  value={cateringForm.pricePerPerson}
                  onChange={handleCateringChange}
                  required
                />
                <Input
                  label="URL de l'image"
                  type="url"
                  name="imageUrl"
                  value={cateringForm.imageUrl}
                  onChange={handleCateringChange}
                  required
                />
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={cateringForm.isAvailable}
                  onChange={handleCateringChange}
                />
                <span>Disponible pour les clients</span>
              </label>

              <Button type="submit" block disabled={saving}>
                {saving ? "Enregistrement..." : editingCateringId ? "Modifier l'article" : "Créer un article"}
              </Button>
            </form>
          </section>
        </div>

        <div className="content-grid">
          <section className="card">
            <PageHeader eyebrow="Inventaire menu" title="Plats du restaurant" />
            <div className="list-stack">
              {menuData.dishes.map((dish) => (
                <article key={dish.id} className="list-card">
                  <div className="list-card__content">
                    <div className="list-card__row">
                      <h3>{dish.name}</h3>
                      <StatusBadge tone={dish.isAvailable ? "success" : "warning"}>
                        {dish.isAvailable ? "disponible" : "masqué"}
                      </StatusBadge>
                    </div>
                    <p>{dish.categoryName}</p>
                    <p>{formatCurrency(dish.price)}</p>
                  </div>

                  <div className="list-card__actions">
                    <Button type="button" variant="ghost" onClick={() => editDish(dish)}>
                      Modifier
                    </Button>
                    <Button type="button" variant="danger" onClick={() => removeDish(dish.id)}>
                      Supprimer
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="card">
            <PageHeader eyebrow="Inventaire restauration" title="Catalogue traiteur" />
            <div className="list-stack">
              {cateringData.items.map((item) => (
                <article key={item.id} className="list-card">
                  <div className="list-card__content">
                    <div className="list-card__row">
                      <h3>{item.name}</h3>
                      <StatusBadge tone={item.isAvailable ? "success" : "warning"}>
                        {item.isAvailable ? "disponible" : "masqué"}
                      </StatusBadge>
                    </div>
                    <p>{item.categoryName}</p>
                    <p>{formatCurrency(item.pricePerPerson)} / personne</p>
                  </div>

                  <div className="list-card__actions">
                    <Button type="button" variant="ghost" onClick={() => editCateringItem(item)}>
                      Modifier
                    </Button>
                    <Button type="button" variant="danger" onClick={() => removeCateringItem(item.id)}>
                      Supprimer
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}