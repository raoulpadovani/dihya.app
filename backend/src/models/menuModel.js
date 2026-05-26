import { query } from "../config/db.js";

const mapDish = (dish) => ({
  id: dish.id,
  categoryId: dish.category_id,
  categoryName: dish.category_name,
  name: dish.name,
  description: dish.description,
  price: Number(dish.price),
  imageUrl: dish.image_url,
  isAvailable: Boolean(dish.is_available),
  isFeatured: Boolean(dish.is_featured)
});

export const getMenu = async () => {
  const categories = await query(
    "SELECT id, name, slug, sort_order AS sortOrder FROM categories ORDER BY sort_order ASC, id ASC"
  );

  const dishes = await query(
    `SELECT d.*, c.name AS category_name
     FROM dishes d
     INNER JOIN categories c ON c.id = d.category_id
     WHERE d.is_available = 1
     ORDER BY c.sort_order ASC, d.id ASC`
  );

  return categories.map((category) => ({
    ...category,
    dishes: dishes.filter((dish) => dish.category_id === category.id).map(mapDish)
  }));
};

export const getAllDishesForAdmin = async () => {
  const dishes = await query(
    `SELECT d.*, c.name AS category_name
     FROM dishes d
     INNER JOIN categories c ON c.id = d.category_id
     ORDER BY c.sort_order ASC, d.id ASC`
  );

  return dishes.map(mapDish);
};

export const getMenuCategories = async () => {
  return query(
    "SELECT id, name, slug, sort_order AS sortOrder FROM categories ORDER BY sort_order ASC, id ASC"
  );
};

export const createDish = async ({ categoryId, name, description, price, imageUrl, isAvailable, isFeatured }) => {
  const result = await query(
    `INSERT INTO dishes (category_id, name, description, price, image_url, is_available, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, name, description, price, imageUrl, isAvailable ? 1 : 0, isFeatured ? 1 : 0]
  );

  const rows = await query(
    `SELECT d.*, c.name AS category_name
     FROM dishes d
     INNER JOIN categories c ON c.id = d.category_id
     WHERE d.id = ? LIMIT 1`,
    [result.insertId]
  );

  return mapDish(rows[0]);
};

export const updateDish = async (id, payload) => {
  await query(
    `UPDATE dishes
     SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, is_available = ?, is_featured = ?
     WHERE id = ?`,
    [
      payload.categoryId,
      payload.name,
      payload.description,
      payload.price,
      payload.imageUrl,
      payload.isAvailable ? 1 : 0,
      payload.isFeatured ? 1 : 0,
      id
    ]
  );

  const rows = await query(
    `SELECT d.*, c.name AS category_name
     FROM dishes d
     INNER JOIN categories c ON c.id = d.category_id
     WHERE d.id = ? LIMIT 1`,
    [id]
  );

  return rows[0] ? mapDish(rows[0]) : null;
};

export const deleteDish = async (id) => {
  const result = await query("DELETE FROM dishes WHERE id = ?", [id]);
  return result.affectedRows > 0;
};
