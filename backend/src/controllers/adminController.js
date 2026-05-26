import { asyncHandler } from "../utils/asyncHandler.js";
import { getDashboardStats } from "../models/adminModel.js";
import {
  createCateringItem,
  deleteCateringItem,
  deleteQuote,
  getAllCateringItemsForAdmin,
  getAllQuotes,
  getCateringCategories,
  updateCateringItem,
  updateQuoteStatus
} from "../models/cateringModel.js";
import { createDish, deleteDish, getAllDishesForAdmin, getMenuCategories, updateDish } from "../models/menuModel.js";
import { getRestaurant, updateRestaurantStatus } from "../models/restaurantModel.js";
import { deleteReservation, getAllReservations } from "../models/reservationModel.js";

const normalizeDishPayload = (payload) => ({
  categoryId: Number(payload.categoryId),
  name: payload.name?.trim(),
  description: payload.description?.trim(),
  price: Number(payload.price),
  imageUrl: payload.imageUrl?.trim(),
  isAvailable: Boolean(payload.isAvailable),
  isFeatured: Boolean(payload.isFeatured)
});

const normalizeCateringPayload = (payload) => ({
  categoryId: Number(payload.categoryId),
  name: payload.name?.trim(),
  description: payload.description?.trim(),
  pricePerPerson: Number(payload.pricePerPerson),
  imageUrl: payload.imageUrl?.trim(),
  isAvailable: Boolean(payload.isAvailable)
});

const validateDishPayload = (payload) => {
  if (!Number.isInteger(payload.categoryId) || payload.categoryId < 1) {
    return "A valid menu category is required.";
  }

  if (!payload.name || !payload.description || !payload.imageUrl) {
    return "Dish name, description and image URL are required.";
  }

  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    return "Dish price must be greater than 0.";
  }

  return null;
};

const validateCateringPayload = (payload) => {
  if (!Number.isInteger(payload.categoryId) || payload.categoryId < 1) {
    return "A valid catering category is required.";
  }

  if (!payload.name || !payload.description || !payload.imageUrl) {
    return "Catering item name, description and image URL are required.";
  }

  if (!Number.isFinite(payload.pricePerPerson) || payload.pricePerPerson <= 0) {
    return "Catering price per person must be greater than 0.";
  }

  return null;
};

export const getDashboard = asyncHandler(async (_req, res) => {
  const stats = await getDashboardStats();
  const reservations = await getAllReservations();
  const quotes = await getAllQuotes();
  const restaurant = await getRestaurant();

  res.json({
    stats,
    restaurant: restaurant
      ? {
          id: restaurant.id,
          name: restaurant.name,
          statusOverride: restaurant.status_override
        }
      : null,
    latestReservations: reservations.slice(0, 5),
    latestQuotes: quotes.slice(0, 5)
  });
});

export const getAdminRestaurant = asyncHandler(async (_req, res) => {
  const restaurant = await getRestaurant();

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant settings not found." });
  }

  res.json({
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      statusOverride: restaurant.status_override
    }
  });
});

export const updateAdminRestaurantStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['open', 'closed', null].includes(status)) {
    return res.status(400).json({ message: "Invalid restaurant status." });
  }

  const updated = await updateRestaurantStatus(status);

  if (!updated) {
    return res.status(404).json({ message: "Restaurant settings not found." });
  }

  res.json({
    message: "Restaurant status updated.",
    restaurant: { statusOverride: status }
  });
});

export const getAdminMenu = asyncHandler(async (_req, res) => {
  const categories = await getMenuCategories();
  const dishes = await getAllDishesForAdmin();

  res.json({ categories, dishes });
});

export const createAdminDish = asyncHandler(async (req, res) => {
  const payload = normalizeDishPayload(req.body);
  const validationError = validateDishPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const dish = await createDish(payload);
  res.status(201).json({ dish });
});

export const updateAdminDish = asyncHandler(async (req, res) => {
  const payload = normalizeDishPayload(req.body);
  const validationError = validateDishPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const dish = await updateDish(req.params.id, payload);

  if (!dish) {
    return res.status(404).json({ message: "Dish not found." });
  }

  res.json({ dish });
});

export const deleteAdminDish = asyncHandler(async (req, res) => {
  const deleted = await deleteDish(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "Dish not found." });
  }

  res.status(204).send();
});

export const getAdminCatering = asyncHandler(async (_req, res) => {
  const categories = await getCateringCategories();
  const items = await getAllCateringItemsForAdmin();

  res.json({ categories, items });
});

export const createAdminCateringItem = asyncHandler(async (req, res) => {
  const payload = normalizeCateringPayload(req.body);
  const validationError = validateCateringPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const item = await createCateringItem(payload);
  res.status(201).json({ item });
});

export const updateAdminCateringItem = asyncHandler(async (req, res) => {
  const payload = normalizeCateringPayload(req.body);
  const validationError = validateCateringPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const item = await updateCateringItem(req.params.id, payload);

  if (!item) {
    return res.status(404).json({ message: "Catering item not found." });
  }

  res.json({ item });
});

export const deleteAdminCateringItem = asyncHandler(async (req, res) => {
  const deleted = await deleteCateringItem(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "Catering item not found." });
  }

  res.status(204).send();
});

export const getAdminReservations = asyncHandler(async (_req, res) => {
  const reservations = await getAllReservations();
  res.json({ reservations });
});

export const deleteAdminReservation = asyncHandler(async (req, res) => {
  const deleted = await deleteReservation(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "Reservation not found." });
  }

  res.status(204).send();
});

export const getAdminQuotes = asyncHandler(async (_req, res) => {
  const quotes = await getAllQuotes();
  res.json({ quotes });
});

export const updateAdminQuoteStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["accepted", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid quote status." });
  }

  const updated = await updateQuoteStatus(req.params.id, status);

  if (!updated) {
    return res.status(404).json({ message: "Quote not found." });
  }

  res.json({ message: "Quote status updated." });
});

export const deleteAdminQuote = asyncHandler(async (req, res) => {
  const deleted = await deleteQuote(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "Quote not found." });
  }

  res.status(204).send();
});
