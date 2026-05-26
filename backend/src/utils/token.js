import jwt from "jsonwebtoken";

export const generateToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET || "change_this_secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
