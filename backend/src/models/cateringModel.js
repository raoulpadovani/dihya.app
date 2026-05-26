import { getConnection, normalizeBindParams, query } from "../config/db.js";

const toDateOnly = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const mapCateringItem = (item) => ({
  id: item.id,
  categoryId: item.category_id,
  categoryName: item.category_name,
  name: item.name,
  description: item.description,
  pricePerPerson: Number(item.price_per_person),
  imageUrl: item.image_url,
  isAvailable: Boolean(item.is_available)
});

const mapQuoteItem = (item) => ({
  id: item.item_id,
  name: item.name,
  quantity: item.quantity,
  unitPrice: Number(item.unit_price)
});

const mapQuote = (quote, items) => {
  const quoteItems = items.filter((item) => item.quote_id === quote.id).map(mapQuoteItem);
  const estimatedTotal = quoteItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity * Number(quote.guest_count),
    0
  );

  return {
    id: quote.id,
    eventDate: toDateOnly(quote.event_date),
    eventTime: quote.event_time,
    guestCount: quote.guest_count,
    eventType: quote.event_type,
    phone: quote.phone,
    notes: quote.notes,
    status: quote.status,
    createdAt: quote.created_at,
    customer: `${quote.first_name} ${quote.last_name || ""}`.trim(),
    email: quote.email,
    estimatedTotal,
    items: quoteItems
  };
};

const executeWithNormalizedParams = (connection, sql, params = []) =>
  connection.execute(sql, normalizeBindParams(params));

export const getCateringCatalog = async () => {
  const categories = await query(
    "SELECT id, name, slug, sort_order AS sortOrder FROM catering_categories ORDER BY sort_order ASC, id ASC"
  );

  const items = await query(
    `SELECT ci.*, cc.name AS category_name
     FROM catering_items ci
     INNER JOIN catering_categories cc ON cc.id = ci.category_id
     WHERE ci.is_available = 1
     ORDER BY cc.sort_order ASC, ci.id ASC`
  );

  return categories.map((category) => ({
    ...category,
    items: items.filter((item) => item.category_id === category.id).map(mapCateringItem)
  }));
};

export const getAllCateringItemsForAdmin = async () => {
  const rows = await query(
    `SELECT ci.*, cc.name AS category_name
     FROM catering_items ci
     INNER JOIN catering_categories cc ON cc.id = ci.category_id
     ORDER BY cc.sort_order ASC, ci.id ASC`
  );

  return rows.map(mapCateringItem);
};

export const getCateringCategories = async () => {
  return query(
    "SELECT id, name, slug, sort_order AS sortOrder FROM catering_categories ORDER BY sort_order ASC, id ASC"
  );
};

export const createQuote = async ({
  userId,
  eventDate,
  eventTime,
  guestCount,
  eventType,
  phone,
  notes,
  items
}) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const normalizedItems = items.map((item) => ({
      itemId: Number(item.itemId),
      quantity: Number(item.quantity)
    }));

    // Only validate items if there are any
    if (normalizedItems.length > 0) {
      const itemIds = [...new Set(normalizedItems.map((item) => item.itemId))];
      const placeholders = itemIds.map(() => "?").join(", ");
      const [catalogRows] = await executeWithNormalizedParams(
        connection,
        `SELECT id, name, price_per_person FROM catering_items WHERE id IN (${placeholders}) AND is_available = 1`,
        itemIds
      );

      if (catalogRows.length !== itemIds.length) {
        const error = new Error("One or more catering items are unavailable.");
        error.statusCode = 400;
        throw error;
      }

      var priceById = new Map(catalogRows.map((item) => [item.id, Number(item.price_per_person)]));
    }

    const [quoteResult] = await executeWithNormalizedParams(
      connection,
      `INSERT INTO catering_quotes (user_id, event_date, event_time, guest_count, event_type, phone, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, eventDate, eventTime || null, guestCount, eventType, phone, notes || null]
    );

    // Insert items only if there are any
    for (const item of normalizedItems) {
      await executeWithNormalizedParams(
        connection,
        `INSERT INTO catering_quote_items (quote_id, item_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [quoteResult.insertId, item.itemId, item.quantity, priceById.get(item.itemId)]
      );
    }

    await connection.commit();
    const quotes = await getQuotesBySql(
      `SELECT cq.*, u.first_name, u.last_name, u.email
       FROM catering_quotes cq
       INNER JOIN users u ON u.id = cq.user_id
       WHERE cq.id = ?`,
      [quoteResult.insertId]
    );

    return quotes[0] || null;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getQuotesBySql = async (sql, params = []) => {
  const quotes = await query(sql, params);

  if (quotes.length === 0) {
    return [];
  }

  const quoteIds = quotes.map((quote) => quote.id);
  const placeholders = quoteIds.map(() => "?").join(", ");
  const items = await query(
    `SELECT cqi.quote_id, cqi.item_id, cqi.quantity, cqi.unit_price, ci.name
     FROM catering_quote_items cqi
     INNER JOIN catering_items ci ON ci.id = cqi.item_id
     WHERE cqi.quote_id IN (${placeholders})`,
    quoteIds
  );

  return quotes.map((quote) => mapQuote(quote, items));
};

export const getAllQuotes = async () =>
  getQuotesBySql(
    `SELECT cq.*, u.first_name, u.last_name, u.email
     FROM catering_quotes cq
     INNER JOIN users u ON u.id = cq.user_id
     ORDER BY cq.created_at DESC`
  );

export const getUserQuotes = async (userId) =>
  getQuotesBySql(
    `SELECT cq.*, u.first_name, u.last_name, u.email
     FROM catering_quotes cq
     INNER JOIN users u ON u.id = cq.user_id
     WHERE cq.user_id = ?
     ORDER BY cq.created_at DESC`,
    [userId]
  );

export const updateQuoteStatus = async (id, status) => {
  const result = await query("UPDATE catering_quotes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
    status,
    id
  ]);

  return result.affectedRows > 0;
};

export const deleteQuote = async (id) => {
  const result = await query("DELETE FROM catering_quotes WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export const createCateringItem = async ({ categoryId, name, description, pricePerPerson, imageUrl, isAvailable }) => {
  const result = await query(
    `INSERT INTO catering_items (category_id, name, description, price_per_person, image_url, is_available)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [categoryId, name, description, pricePerPerson, imageUrl, isAvailable ? 1 : 0]
  );

  const rows = await query(
    `SELECT ci.*, cc.name AS category_name
     FROM catering_items ci
     INNER JOIN catering_categories cc ON cc.id = ci.category_id
     WHERE ci.id = ? LIMIT 1`,
    [result.insertId]
  );

  return mapCateringItem(rows[0]);
};

export const updateCateringItem = async (id, payload) => {
  await query(
    `UPDATE catering_items
     SET category_id = ?, name = ?, description = ?, price_per_person = ?, image_url = ?, is_available = ?
     WHERE id = ?`,
    [
      payload.categoryId,
      payload.name,
      payload.description,
      payload.pricePerPerson,
      payload.imageUrl,
      payload.isAvailable ? 1 : 0,
      id
    ]
  );

  const rows = await query(
    `SELECT ci.*, cc.name AS category_name
     FROM catering_items ci
     INNER JOIN catering_categories cc ON cc.id = ci.category_id
     WHERE ci.id = ? LIMIT 1`,
    [id]
  );

  return rows[0] ? mapCateringItem(rows[0]) : null;
};

export const deleteCateringItem = async (id) => {
  const result = await query("DELETE FROM catering_items WHERE id = ?", [id]);
  return result.affectedRows > 0;
};
