import { asyncHandler } from "../utils/asyncHandler.js";
import { createReservation, getAllReservations, getUserReservations } from "../models/reservationModel.js";
import { sendMail } from "../utils/mailer.js";

export const createReservationRequest = asyncHandler(async (req, res) => {
  const { reservationDate, reservationTime, guestCount, notes } = req.body;
  const customerName = req.body.customerName?.trim();
  const customerEmail = req.body.customerEmail?.trim().toLowerCase();
  const customerPhone = req.body.customerPhone?.trim();
  const parsedGuestCount = Number(guestCount);

  if (!reservationDate || !reservationTime || !guestCount || !customerName || !customerEmail) {
    return res.status(400).json({
      message: "Date, time, guest count, name and email are required."
    });
  }

  if (!Number.isInteger(parsedGuestCount) || parsedGuestCount < 1 || parsedGuestCount > 20) {
    return res.status(400).json({ message: "Guest count must be between 1 and 20." });
  }

  const reservation = await createReservation({
    userId: req.user.id,
    reservationDate,
    reservationTime,
    guestCount: parsedGuestCount,
    notes,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim().toLowerCase(),
    customerPhone: customerPhone?.trim()
  });

  try {
    const to = process.env.ADMIN_EMAIL || "zaouiawahiba@gmail.com";
    const subject = `Nouvelle reservation — ${customerName}`;
    const reservationTimeFormatted = new Date(reservation.createdAt).toLocaleString("fr-FR");
    const reservationDateFormatted = new Date(reservationDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const html = `<p>Une nouvelle reservation a ete effectuee.</p>
      <p><strong>Heure du formulaire:</strong> ${reservationTimeFormatted}</p>
      <p><strong>Nom:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Tel:</strong> ${customerPhone || "-"}</p>
      <p><strong>Date:</strong> ${reservationDateFormatted} ${reservationTime}</p>
      <p><strong>Invites:</strong> ${parsedGuestCount}</p>
      <p><strong>Notes:</strong> ${notes || "-"}</p>`;

    await sendMail(to, subject, html);
  } catch (mailErr) {
    // eslint-disable-next-line no-console
    console.error("Failed to send reservation email:", mailErr.message || mailErr);
  }

  res.status(201).json({ reservation });
});

export const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await getUserReservations(req.user.id);
  res.json({ reservations });
});

export const getReservationsForAdmin = asyncHandler(async (_req, res) => {
  const reservations = await getAllReservations();
  res.json({ reservations });
});
