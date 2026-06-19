import { Router } from "express";
import { sql } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router = Router();

const DEFAULT_WHATSAPP = process.env.WHATSAPP_NUMBER ?? "9647501234567";

async function getSetting(key: string): Promise<string | null> {
  try {
    const rows = await db
      .select()
      .from(siteSettingsTable)
      .where(sql`${siteSettingsTable.key} = ${key}`);
    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

router.get("/settings", async (_req, res) => {
  try {
    const whatsappNumber = (await getSetting("whatsapp_number")) ?? DEFAULT_WHATSAPP;
    // Read from env var — "false" disables it, anything else (including unset) enables it
    const whatsappEnabled = process.env.WHATSAPP_ENABLED !== "false";
    res.json({ whatsappNumber, whatsappEnabled });
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.json({ whatsappNumber: DEFAULT_WHATSAPP, whatsappEnabled: true });
  }
});

router.put("/admin/settings", requireAdmin, async (req, res) => {
  try {
    const { whatsappNumber } = req.body as { whatsappNumber?: string };
    if (!whatsappNumber) {
      res.status(400).json({ error: "whatsappNumber is required" });
      return;
    }
    const cleaned = whatsappNumber.replace(/\D/g, "");
    if (!cleaned) {
      res.status(400).json({ error: "Invalid phone number" });
      return;
    }
    await db
      .insert(siteSettingsTable)
      .values({ key: "whatsapp_number", value: cleaned })
      .onConflictDoUpdate({
        target: siteSettingsTable.key,
        set: { value: cleaned, updatedAt: sql`now()` },
      });
    const whatsappEnabled = process.env.WHATSAPP_ENABLED !== "false";
    res.json({ whatsappNumber: cleaned, whatsappEnabled });
  } catch (err) {
    console.error("Error saving setting:", err);
    res.status(500).json({ error: "Failed to save setting" });
  }
});

export default router;
