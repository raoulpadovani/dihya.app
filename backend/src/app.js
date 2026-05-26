import "dotenv/config";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import cateringRoutes from "./routes/cateringRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dailyMenuRoutes from "./routes/dailyMenuRoutes.js";
import { notFoundHandler } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const allowedOrigins = new Set(
  [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178"]
    .filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/daily-menus", dailyMenuRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/catering", cateringRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
