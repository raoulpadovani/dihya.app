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

export const getDailyMenuByDate = async (date) => {
  const rows = await query(
    `SELECT dm.id, dm.menu_date, dm.title, dm.description, dm.created_at, dm.updated_at
     FROM daily_menus dm
     WHERE dm.menu_date = ?
     LIMIT 1`,
    [date]
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  const dailyMenu = rows[0];
  const items = await query(
    `SELECT d.*, c.name AS category_name
     FROM daily_menu_items dmi
     INNER JOIN dishes d ON d.id = dmi.dish_id
     INNER JOIN categories c ON c.id = d.category_id
     WHERE dmi.daily_menu_id = ?
     ORDER BY dmi.sort_order ASC, dmi.id ASC`,
    [dailyMenu.id]
  );

  const categories = await query(
    `SELECT DISTINCT c.id, c.name, c.slug, c.sort_order
     FROM daily_menu_items dmi
     INNER JOIN dishes d ON d.id = dmi.dish_id
     INNER JOIN categories c ON c.id = d.category_id
     WHERE dmi.daily_menu_id = ?
     ORDER BY c.sort_order ASC`,
    [dailyMenu.id]
  );

  return {
    id: dailyMenu.id,
    date: dailyMenu.menu_date,
    title: dailyMenu.title,
    description: dailyMenu.description,
    categories: categories.map((category) => ({
      ...category,
      dishes: items.filter((item) => item.category_id === category.id).map(mapDish)
    })),
    createdAt: dailyMenu.created_at,
    updatedAt: dailyMenu.updated_at
  };
};

export const getDailyMenusByDateRange = async (startDate, endDate) => {
  const rows = await query(
    `SELECT dm.id, dm.menu_date, dm.title, dm.description, dm.created_at, dm.updated_at
     FROM daily_menus dm
     WHERE dm.menu_date BETWEEN ? AND ?
     ORDER BY dm.menu_date ASC`,
    [startDate, endDate]
  );

  const menus = [];
  for (const dailyMenu of rows) {
    const items = await query(
      `SELECT d.*, c.name AS category_name
       FROM daily_menu_items dmi
       INNER JOIN dishes d ON d.id = dmi.dish_id
       INNER JOIN categories c ON c.id = d.category_id
       WHERE dmi.daily_menu_id = ?
       ORDER BY dmi.sort_order ASC, dmi.id ASC`,
      [dailyMenu.id]
    );

    const categories = await query(
      `SELECT DISTINCT c.id, c.name, c.slug, c.sort_order
       FROM daily_menu_items dmi
       INNER JOIN dishes d ON d.id = dmi.dish_id
       INNER JOIN categories c ON c.id = d.category_id
       WHERE dmi.daily_menu_id = ?
       ORDER BY c.sort_order ASC`,
      [dailyMenu.id]
    );

    menus.push({
      id: dailyMenu.id,
      date: dailyMenu.menu_date,
      title: dailyMenu.title,
      description: dailyMenu.description,
      categories: categories.map((category) => ({
        ...category,
        dishes: items.filter((item) => item.category_id === category.id).map(mapDish)
      })),
      createdAt: dailyMenu.created_at,
      updatedAt: dailyMenu.updated_at
    });
  }

  return menus;
};

export const createDailyMenu = async ({ date, title, description, dishIds = [] }) => {
  const result = await query(
    `INSERT INTO daily_menus (menu_date, title, description)
     VALUES (?, ?, ?)`,
    [date, title, description || null]
  );

  const dailyMenuId = result.insertId;

  // Add dishes to the menu
  if (dishIds && dishIds.length > 0) {
    for (let i = 0; i < dishIds.length; i++) {
      await query(
        `INSERT INTO daily_menu_items (daily_menu_id, dish_id, sort_order)
         VALUES (?, ?, ?)`,
        [dailyMenuId, dishIds[i], i]
      );
    }
  }

  return getDailyMenuByDate(date);
};

export const updateDailyMenu = async (id, { title, description, dishIds = [] }) => {
  const dailyMenu = await query(
    `SELECT menu_date FROM daily_menus WHERE id = ? LIMIT 1`,
    [id]
  );

  if (!dailyMenu || dailyMenu.length === 0) {
    return null;
  }

  const menuDate = dailyMenu[0].menu_date;

  await query(
    `UPDATE daily_menus
     SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, description || null, id]
  );

  // Remove existing items and add new ones
  await query(`DELETE FROM daily_menu_items WHERE daily_menu_id = ?`, [id]);

  if (dishIds && dishIds.length > 0) {
    for (let i = 0; i < dishIds.length; i++) {
      await query(
        `INSERT INTO daily_menu_items (daily_menu_id, dish_id, sort_order)
         VALUES (?, ?, ?)`,
        [id, dishIds[i], i]
      );
    }
  }

  return getDailyMenuByDate(menuDate);
};

export const deleteDailyMenu = async (id) => {
  const result = await query(
    `DELETE FROM daily_menus WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

export const getAllDishes = async () => {
  const rows = await query(
    `SELECT d.*, c.name AS category_name
     FROM dishes d
     INNER JOIN categories c ON c.id = d.category_id
     WHERE d.is_available = 1
     ORDER BY c.sort_order ASC, d.id ASC`
  );
  return rows.map(mapDish);
};
