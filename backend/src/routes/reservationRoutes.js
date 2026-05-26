import { Router } from "express";
import {
  createReservationRequest,
  getMyReservations
} from "../controllers/reservationController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.post("/", createReservationRequest);
router.get("/me", getMyReservations);

export default router;
