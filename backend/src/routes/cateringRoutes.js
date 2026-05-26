import { Router } from "express";
import { getCatalog, getMyQuotes, submitQuote } from "../controllers/cateringController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/catalog", getCatalog);
router.get("/quotes/me", requireAuth, getMyQuotes);
router.post("/quote", requireAuth, submitQuote);

export default router;
