import { asyncHandler } from "../utils/asyncHandler.js";
import { createQuote, getCateringCatalog, getUserQuotes } from "../models/cateringModel.js";
import { sendMail } from "../utils/mailer.js";

export const getCatalog = asyncHandler(async (_req, res) => {
  const catalog = await getCateringCatalog();
  res.json({ catalog });
});

export const submitQuote = asyncHandler(async (req, res) => {
  const { eventDate, guestCount, eventType, phone, notes, items, reservationTime } = req.body;
  const parsedGuestCount = Number(guestCount);

  if (!eventDate || !guestCount || !eventType || !phone || !Array.isArray(items)) {
    return res.status(400).json({
      message: "Event date, guest count, event type, phone and items array are required."
    });
  }

  // Allow empty items if there are custom dishes mentioned in notes
  const hasCustomDishes = notes && notes.includes("Plats personnalisés souhaités:");
  if (items.length === 0 && !hasCustomDishes) {
    return res.status(400).json({
      message: "Please select at least one catering item or add a custom dish."
    });
  }

  if (!Number.isInteger(parsedGuestCount) || parsedGuestCount < 1) {
    return res.status(400).json({ message: "Guest count must be a positive whole number." });
  }

  const invalidItem = items.find(
    (item) => !Number.isInteger(Number(item.itemId)) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1
  );

  if (invalidItem) {
    return res.status(400).json({ message: "Each selected catering item must include a valid item and quantity." });
  }

  const quote = await createQuote({
    userId: req.user.id,
    eventDate,
    eventTime: reservationTime,
    guestCount: parsedGuestCount,
    eventType: eventType.trim(),
    phone: phone.trim(),
    notes,
    items
  });

  // send notification email to admin address
  try {
    const to = process.env.ADMIN_EMAIL || "zaouiawahiba@gmail.com";
    const subject = `Nouveau devis traiteur — ${req.user.email || "utilisateur"}`;
    const itemsHtml = quote.items
      .map((it) => `<li>${it.name} — qté: ${it.quantity}</li>`)
      .join("");
    const quoteTimeFormatted = new Date(quote.createdAt).toLocaleString("fr-FR");
    const eventTimeFormatted = quote.eventTime || "-";
    const eventDateFormatted = new Date(eventDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const html = `<p>Un nouveau devis a ete cree.</p>
      <p><strong>Utilisateur:</strong> ${req.user.email || req.user.id}</p>
      <p><strong>Heure du devis:</strong> ${quoteTimeFormatted}</p>
      <p><strong>Date evenement:</strong> ${eventDateFormatted} à ${eventTimeFormatted} — <strong>Invites:</strong> ${parsedGuestCount}</p>
      <p><strong>Type:</strong> ${eventType}</p>
      <p><strong>Telephone:</strong> ${phone}</p>
      <p><strong>Notes:</strong> ${notes || "-"}</p>
      <p><strong>Plats:</strong></p><ul>${itemsHtml}</ul>`;

    await sendMail(to, subject, html);
  } catch (mailErr) {
    // don't block the response on email errors
    // eslint-disable-next-line no-console
    console.error("Failed to send quote email:", mailErr.message || mailErr);
  }

  res.status(201).json({ quote });
});

export const getMyQuotes = asyncHandler(async (req, res) => {
  const quotes = await getUserQuotes(req.user.id);
  res.json({ quotes });
});
