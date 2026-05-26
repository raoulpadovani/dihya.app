import { Router } from "express";
import {
  createAdminCateringItem,
  createAdminDish,
  deleteAdminCateringItem,
  deleteAdminDish,
  deleteAdminQuote,
  deleteAdminReservation,
  getAdminCatering,
  getAdminRestaurant,
  getAdminMenu,
  getAdminQuotes,
  getAdminReservations,
  getDashboard,
  updateAdminCateringItem,
  updateAdminDish,
  updateAdminQuoteStatus,
  updateAdminRestaurantStatus
} from "../controllers/adminController.js";
import {
  createDailyMenuHandler,
  updateDailyMenuHandler,
  deleteDailyMenuHandler,
  getAvailableDishes,
  getDailyMenusForRange
} from "../controllers/dailyMenuController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/dashboard", getDashboard);
router.get("/restaurant", getAdminRestaurant);
router.patch("/restaurant/status", updateAdminRestaurantStatus);

router.get("/menu", getAdminMenu);
router.post("/menu/dishes", createAdminDish);
router.put("/menu/dishes/:id", updateAdminDish);
router.delete("/menu/dishes/:id", deleteAdminDish);

router.get("/daily-menus/available-dishes", getAvailableDishes);
router.get("/daily-menus", getDailyMenusForRange);
router.post("/daily-menus", createDailyMenuHandler);
router.put("/daily-menus/:id", updateDailyMenuHandler);
router.delete("/daily-menus/:id", deleteDailyMenuHandler);

router.get("/catering", getAdminCatering);
router.post("/catering/items", createAdminCateringItem);
router.put("/catering/items/:id", updateAdminCateringItem);
router.delete("/catering/items/:id", deleteAdminCateringItem);

router.get("/reservations", getAdminReservations);
router.delete("/reservations/:id", deleteAdminReservation);
router.get("/quotes", getAdminQuotes);
router.patch("/quotes/:id/status", updateAdminQuoteStatus);
router.delete("/quotes/:id", deleteAdminQuote);

export default router;
