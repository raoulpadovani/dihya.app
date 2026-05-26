import { Router } from "express";
import {
  getDailyMenuForDate,
  getDailyMenusForRange
} from "../controllers/dailyMenuController.js";

const router = Router();

// Public routes - specific before parametric
router.get("/:date", getDailyMenuForDate);
router.get("/", getDailyMenusForRange);

export default router;
