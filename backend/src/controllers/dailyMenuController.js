import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getDailyMenuByDate,
  getDailyMenusByDateRange,
  createDailyMenu,
  updateDailyMenu,
  deleteDailyMenu,
  getAllDishes
} from "../models/dailyMenuModel.js";

export const getDailyMenuForDate = asyncHandler(async (req, res) => {
  const { date } = req.params;

  const dailyMenu = await getDailyMenuByDate(date);

  if (!dailyMenu) {
    return res.status(404).json({ message: "Daily menu not found for this date." });
  }

  res.json({ dailyMenu });
});

export const getDailyMenusForRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "startDate and endDate are required." });
  }

  const menus = await getDailyMenusByDateRange(startDate, endDate);

  res.json({ menus });
});

export const createDailyMenuHandler = asyncHandler(async (req, res) => {
  const { date, title, description, dishIds } = req.body;

  if (!date || !title) {
    return res.status(400).json({ message: "date and title are required." });
  }

  const dailyMenu = await createDailyMenu({ date, title, description, dishIds: dishIds || [] });

  res.status(201).json({ dailyMenu });
});

export const updateDailyMenuHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, dishIds } = req.body;

  if (!title) {
    return res.status(400).json({ message: "title is required." });
  }

  const dailyMenu = await updateDailyMenu(id, { title, description, dishIds: dishIds || [] });

  if (!dailyMenu) {
    return res.status(404).json({ message: "Daily menu not found." });
  }

  res.json({ dailyMenu });
});

export const deleteDailyMenuHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await deleteDailyMenu(id);

  if (!deleted) {
    return res.status(404).json({ message: "Daily menu not found." });
  }

  res.json({ message: "Daily menu deleted successfully." });
});

export const getAvailableDishes = asyncHandler(async (_req, res) => {
  const dishes = await getAllDishes();
  res.json({ dishes });
});
