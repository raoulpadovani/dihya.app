const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR"
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium"
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit"
});

export const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) {
    return "--";
  }

  const parsedDate =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "--";
  }

  return dateFormatter.format(parsedDate);
};

export const formatTime = (value) => {
  if (!value) {
    return "--";
  }

  const normalized = value.length === 5 ? `${value}:00` : value;
  return timeFormatter.format(new Date(`1970-01-01T${normalized}`));
};

export const formatRole = (role) => (role === "admin" ? "Admin" : "Client");

export const toTitleCase = (value) =>
  value
    ?.replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase()) || "";

export const getInitials = (user) => {
  if (!user) {
    return "DT";
  }

  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("");
  return initials.toUpperCase() || "DT";
};
