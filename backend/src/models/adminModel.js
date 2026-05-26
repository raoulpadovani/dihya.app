import { query } from "../config/db.js";

export const getDashboardStats = async () => {
  const [users] = await query("SELECT COUNT(*) AS total FROM users");
  const [reservations] = await query("SELECT COUNT(*) AS total FROM reservations");
  const [quotes] = await query("SELECT COUNT(*) AS total FROM catering_quotes");
  const [dishes] = await query("SELECT COUNT(*) AS total FROM dishes");

  return {
    totalUsers: users.total,
    totalReservations: reservations.total,
    totalQuotes: quotes.total,
    totalDishes: dishes.total
  };
};
