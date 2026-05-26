import { query } from "../config/db.js";

export const getRestaurant = async () => {
  const rows = await query("SELECT * FROM restaurant ORDER BY id ASC LIMIT 1");
  return rows[0] || null;
};

export const updateRestaurantStatus = async (statusOverride) => {
  const result = await query("UPDATE restaurant SET status_override = ? ORDER BY id ASC LIMIT 1", [statusOverride]);

  return result.affectedRows > 0;
};

export const getDailyMenu = async () => {
  const rows = await query(
    `SELECT d.id, d.name, d.description, d.price, d.image_url AS imageUrl, c.name AS category
     FROM dishes d
     INNER JOIN categories c ON c.id = d.category_id
     WHERE d.is_available = 1 AND d.is_featured = 1
     ORDER BY c.sort_order ASC, d.id ASC
     LIMIT 6`
  );

  return rows;
};
