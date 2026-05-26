import { asyncHandler } from "../utils/asyncHandler.js";
import { getDailyMenu, getRestaurant } from "../models/restaurantModel.js";
import { getMenu } from "../models/menuModel.js";

const formatOpeningHours = (openingHoursRaw) => {
  try {
    return JSON.parse(openingHoursRaw || "{}");
  } catch (_error) {
    return {};
  }
};

const getTodayStatus = (openingHours) => {
  const dayKey = new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(new Date())
    .toLowerCase();

  const schedule = openingHours[dayKey];

  if (!schedule || !schedule.open || !schedule.close) {
    return { isOpen: false, label: "Fermé aujourd'hui" };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openHours, openMinutes] = schedule.open.split(":").map(Number);
  const [closeHours, closeMinutes] = schedule.close.split(":").map(Number);
  const openValue = openHours * 60 + openMinutes;
  const closeValue = closeHours * 60 + closeMinutes;
  const isOpen = currentMinutes >= openValue && currentMinutes <= closeValue;

  return {
    isOpen,
    label: isOpen ? `Ouvert jusqu'à ${schedule.close}` : `Fermé - ouvre à ${schedule.open}`
  };
};

export const getRestaurantOverview = asyncHandler(async (_req, res) => {
  const restaurant = await getRestaurant();

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant settings not found." });
  }

  const openingHours = formatOpeningHours(restaurant.opening_hours_json);
  const status = restaurant.status_override
    ? {
        isOpen: restaurant.status_override === "open",
        label: restaurant.status_override === "open" ? "Ouvert" : "Fermé"
      }
    : getTodayStatus(openingHours);
  const dailyMenu = await getDailyMenu();
  const menu = await getMenu();

  res.json({
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      heroImage: restaurant.hero_image,
      dailyMenuTitle: restaurant.daily_menu_title,
      dailyMenuDescription: restaurant.daily_menu_description,
      openingHours,
      status,
      statusOverride: restaurant.status_override
    },
    dailyMenu,
    menu
  });
});

export const getPublicMenu = asyncHandler(async (_req, res) => {
  const menu = await getMenu();
  res.json({ menu });
});
