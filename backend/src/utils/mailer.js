import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const user = process.env.SMTP_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const from = process.env.FROM_EMAIL || user;
const adminEmail = process.env.ADMIN_EMAIL || "zaouiawahiba@gmail.com";

let transporter;
if (host && port && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
} else {
  transporter = null;
}

export async function sendMail(to, subject, html) {
  const message = {
    from: from,
    to,
    subject,
    html
  };

  if (!transporter) {
    // In dev when no SMTP configured, log the mail instead of throwing
    // This keeps behavior safe without leaking credentials
    // eslint-disable-next-line no-console
    console.log("[mailer] SMTP not configured — email log:\n", message);
    return;
  }

  await transporter.sendMail(message);
}

export { adminEmail };

export default sendMail;
