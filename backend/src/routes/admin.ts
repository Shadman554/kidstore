import { Router } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

router.post("/admin/login", loginLimiter, (req, res) => {
  const { password } = req.body as { password?: string };
  const adminPin = process.env.ADMIN_PIN;
  const jwtSecret = process.env.JWT_SECRET;

  if (!adminPin || !jwtSecret) {
    res.status(500).json({ error: "Server authentication not configured. Set ADMIN_PIN and JWT_SECRET environment variables." });
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

export default router;
