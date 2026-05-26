import axios from "axios";
import { authTokenKey } from "../constants/storage.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(authTokenKey);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Une erreur inattendue s'est produite.";
    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    return Promise.reject(normalizedError);
  }
);

export const authService = {
  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },
  login: async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },
  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  }
};

export const restaurantService = {
  overview: async () => {
    const { data } = await api.get("/restaurant");
    return data;
  },
  menu: async () => {
    const { data } = await api.get("/restaurant/menu");
    return data;
  }
};

export const reservationService = {
  create: async (payload) => {
    const { data } = await api.post("/reservations", payload);
    return data;
  },
  mine: async () => {
    const { data } = await api.get("/reservations/me");
    return data;
  }
};

export const cateringService = {
  catalog: async () => {
    const { data } = await api.get("/catering/catalog");
    return data;
  },
  mineQuotes: async () => {
    const { data } = await api.get("/catering/quotes/me");
    return data;
  },
  createQuote: async (payload) => {
    const { data } = await api.post("/catering/quote", payload);
    return data;
  }
};

export const dailyMenuService = {
  getByDate: async (date) => {
    const { data } = await api.get(`/daily-menus/${date}`);
    return data;
  },
  getByRange: async (startDate, endDate) => {
    const { data } = await api.get("/daily-menus", {
      params: { startDate, endDate }
    });
    return data;
  }
};

export const adminService = {
  dashboard: async () => {
    const { data } = await api.get("/admin/dashboard");
    return data;
  },
  restaurant: async () => {
    const { data } = await api.get("/admin/restaurant");
    return data;
  },
  updateRestaurantStatus: async (status) => {
    const { data } = await api.patch("/admin/restaurant/status", { status });
    return data;
  },
  menu: async () => {
    const { data } = await api.get("/admin/menu");
    return data;
  },
  createDish: async (payload) => {
    const { data } = await api.post("/admin/menu/dishes", payload);
    return data;
  },
  updateDish: async (id, payload) => {
    const { data } = await api.put(`/admin/menu/dishes/${id}`, payload);
    return data;
  },
  deleteDish: async (id) => {
    await api.delete(`/admin/menu/dishes/${id}`);
  },
  catering: async () => {
    const { data } = await api.get("/admin/catering");
    return data;
  },
  createCateringItem: async (payload) => {
    const { data } = await api.post("/admin/catering/items", payload);
    return data;
  },
  updateCateringItem: async (id, payload) => {
    const { data } = await api.put(`/admin/catering/items/${id}`, payload);
    return data;
  },
  deleteCateringItem: async (id) => {
    await api.delete(`/admin/catering/items/${id}`);
  },
  reservations: async () => {
    const { data } = await api.get("/admin/reservations");
    return data;
  },
  deleteReservation: async (id) => {
    await api.delete(`/admin/reservations/${id}`);
  },
  quotes: async () => {
    const { data } = await api.get("/admin/quotes");
    return data;
  },
  updateQuoteStatus: async (id, status) => {
    const { data } = await api.patch(`/admin/quotes/${id}/status`, { status });
    return data;
  },
  deleteQuote: async (id) => {
    await api.delete(`/admin/quotes/${id}`);
  },
  dailyMenus: async (startDate, endDate) => {
    const { data } = await api.get("/admin/daily-menus", {
      params: { startDate, endDate }
    });
    return data;
  },
  createDailyMenu: async (payload) => {
    const { data } = await api.post("/admin/daily-menus", payload);
    return data;
  },
  updateDailyMenu: async (id, payload) => {
    const { data } = await api.put(`/admin/daily-menus/${id}`, payload);
    return data;
  },
  deleteDailyMenu: async (id) => {
    await api.delete(`/admin/daily-menus/${id}`);
  },
  availableDishes: async () => {
    const { data } = await api.get("/admin/daily-menus/available-dishes");
    return data;
  }
};

export default api;
