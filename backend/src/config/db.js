import "dotenv/config";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "dihya_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const normalizeBindParams = (params = []) =>
  params.map((param) => (param === undefined ? null : param));

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, normalizeBindParams(params));
  return rows;
};

export const getConnection = async () => pool.getConnection();

export default pool;
