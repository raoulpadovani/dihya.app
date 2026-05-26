import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/token.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserWithPasswordByEmail,
  sanitizeUser
} from "../models/userModel.js";

export const register = asyncHandler(async (req, res) => {
  const firstName = req.body.firstName?.trim();
  const lastName = req.body.lastName?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  const phone = req.body.phone?.trim();

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "First name, last name, email and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return res.status(409).json({ message: "An account already exists with this email." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ firstName, lastName, email, phone, passwordHash, role: "client" });
  const token = generateToken(user);

  res.status(201).json({
    token,
    user
  });
});

export const login = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await findUserWithPasswordByEmail(email);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const matches = await bcrypt.compare(password, user.password_hash);

  if (!matches) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const safeUser = sanitizeUser(user);

  res.json({
    token: generateToken(safeUser),
    user: safeUser
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  res.json({ user });
});
