import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export async function comparePassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

export async function hashPassword(plainText) {
  return bcrypt.hash(plainText, 10);
}

export function signAdminToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "1d" });
}
