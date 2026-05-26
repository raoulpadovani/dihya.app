import { query } from "../config/db.js";

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.created_at
  };
};

export const createUser = async ({ firstName, lastName, email, phone, passwordHash, role }) => {
  const result = await query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, email, phone || null, passwordHash, role || "client"]
  );

  return findUserById(result.insertId);
};

export const findUserByEmail = async (email) => {
  const rows = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return sanitizeUser(rows[0] || null);
};

export const findUserWithPasswordByEmail = async (email) => {
  const rows = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
};

export { sanitizeUser };
