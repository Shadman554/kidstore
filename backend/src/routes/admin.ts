import { Router } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

async function getAdminPin(): Promise<string | undefined> {
  try {
    const rows = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, "admin_pin"));
    return rows[0]?.value ?? process.env.ADMIN_PIN;
  } catch {
    return process.env.ADMIN_PIN;
  }
}

router.post("/admin/login", loginLimiter, async (req, res) => {
  const { password } = req.body as { password?: string };
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({ error: "Server authentication not configured. Set JWT_SECRET environment variable." });
    return;
  }

  const adminPin = await getAdminPin();

  if (!adminPin) {
    res.status(500).json({ error: "Server authentication not configured. Set ADMIN_PIN environment variable." });
    return;
  }

  if (!password || password !== adminPin) {
    res.status(401).json({ error: "Incorrect password." });
    return;
  }

  const expiresIn = 4 * 60 * 60;
  const token = jwt.sign({ admin: true }, jwtSecret, { expiresIn });
  res.json({ token, expiresIn });
});

router.get("/admin/verify", (req, res) => {
  const auth = req.headers.authorization;
  const jwtSecret = process.env.JWT_SECRET;

  if (!auth?.startsWith("Bearer ") || !jwtSecret) {
    res.status(401).json({ valid: false });
    return;
  }

  try {
    jwt.verify(auth.slice(7), jwtSecret);
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

router.post("/admin/change-pin", requireAdmin, async (req, res) => {
  const { currentPin, newPin } = req.body as { currentPin?: string; newPin?: string };

  if (!currentPin || !newPin) {
    res.status(400).json({ error: "currentPin and newPin are required" });
    return;
  }

  if (newPin.length < 4) {
    res.status(400).json({ error: "New password must be at least 4 characters" });
    return;
  }

  const adminPin = await getAdminPin();

  if (!adminPin || currentPin !== adminPin) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }

  await db
    .insert(siteSettingsTable)
    .values({ key: "admin_pin", value: newPin })
    .onConflictDoUpdate({
      target: siteSettingsTable.key,
      set: { value: newPin, updatedAt: new Date() },
    });

  res.json({ success: true });
});

export default router;
