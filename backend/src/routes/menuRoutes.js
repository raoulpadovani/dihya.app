import { Router } from "express";
import { getPublicMenu } from "../controllers/restaurantController.js";

const router = Router();

router.get("/", getPublicMenu);

export default router;
