import { query } from "../config/db.js";

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

const mapReservation = (reservation) => ({
  id: reservation.id,
  reservationDate: toDateOnly(reservation.reservation_date),
  reservationTime: reservation.reservation_time,
  guestCount: reservation.guest_count,
  status: reservation.status,
  notes: reservation.notes,
  customerName: reservation.customer_name,
  customerEmail: reservation.customer_email,
  customerPhone: reservation.customer_phone,
  createdAt: reservation.created_at
});

export const createReservation = async ({
  userId,
  reservationDate,
  reservationTime,
  guestCount,
  notes,
  customerName,
  customerEmail,
  customerPhone
}) => {
  const result = await query(
    `INSERT INTO reservations (
      user_id, reservation_date, reservation_time, guest_count, status, notes,
      customer_name, customer_email, customer_phone
    )
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
    [
      userId,
      reservationDate,
      reservationTime,
      guestCount,
      notes || null,
      customerName,
      customerEmail,
      customerPhone || null
    ]
  );

  const rows = await query("SELECT * FROM reservations WHERE id = ? LIMIT 1", [result.insertId]);
  return mapReservation(rows[0]);
};

export const getUserReservations = async (userId) => {
  const rows = await query(
    "SELECT * FROM reservations WHERE user_id = ? ORDER BY reservation_date DESC, reservation_time DESC",
    [userId]
  );

  return rows.map(mapReservation);
};

export const getAllReservations = async () => {
  const rows = await query(
    `SELECT r.*, u.first_name, u.last_name
     FROM reservations r
     LEFT JOIN users u ON u.id = r.user_id
     ORDER BY r.reservation_date DESC, r.reservation_time DESC`
  );

  return rows.map((reservation) => ({
    ...mapReservation(reservation),
    user: reservation.first_name
      ? `${reservation.first_name} ${reservation.last_name || ""}`.trim()
      : reservation.customerName
  }));
};

export const deleteReservation = async (id) => {
  const result = await query("DELETE FROM reservations WHERE id = ?", [id]);
  return result.affectedRows > 0;
};
