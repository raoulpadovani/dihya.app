import { Router } from "express";
import { getPublicMenu, getRestaurantOverview } from "../controllers/restaurantController.js";

const router = Router();

router.get("/", getRestaurantOverview);
router.get("/menu", getPublicMenu);

export default router;
