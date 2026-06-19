import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || Date.now().toString();
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  const existing = await db
    .select({ id: productsTable.id })
    .from(productsTable);
  const ids = new Set(existing.map((p) => p.id));
  if (!ids.has(base)) return base;
  let i = 2;
  while (ids.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

function generateCode(num: number): string {
  return `WAW-${String(num).padStart(3, "0")}`;
}

router.get("/products", async (_req, res) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .orderBy(desc(productsTable.createdAt));
    res.json(products);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("DATABASE_URL")) {
      res.status(503).json({ error: "Database not configured. Set DATABASE_URL." });
    } else {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = req.params.id as string;
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/admin/products", requireAdmin, async (req, res) => {
  try {
    const body = req.body as {
      name: string;
      description?: string;
      images?: string[];
      imageUrl?: string;
      priceSingle: number;
      priceBulk?: number;
      bulkMinQty?: number;
      currency?: string;
    };

    if (!body.name || typeof body.priceSingle !== "number") {
      res.status(400).json({ error: "name and priceSingle are required" });
      return;
    }

    const id = await uniqueSlug(body.name);
    const [countRow] = await db
      .select({ value: count() })
      .from(productsTable);
    const nextNum = Number(countRow?.value ?? 0) + 1;

    const [product] = await db
      .insert(productsTable)
      .values({
        id,
        code: generateCode(nextNum),
        name: body.name,
        description: body.description ?? null,
        images: body.images && body.images.length > 0 ? body.images : null,
        imageUrl: body.imageUrl ?? null,
        priceSingle: body.priceSingle,
        priceBulk: body.priceBulk ?? 0,
        bulkMinQty: body.bulkMinQty ?? null,
        currency: body.currency ?? "USD",
      })
      .returning();

    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id as string;
    const body = req.body as Partial<{
      name: string;
      description: string;
      images: string[];
      imageUrl: string;
      priceSingle: number;
      priceBulk: number;
      bulkMinQty: number;
      currency: string;
    }>;

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description || null;
    if (body.images !== undefined)
      updates.images = body.images.length > 0 ? body.images : null;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl || null;
    if (body.priceSingle !== undefined) updates.priceSingle = body.priceSingle;
    if (body.priceBulk !== undefined) updates.priceBulk = body.priceBulk;
    if (body.bulkMinQty !== undefined) updates.bulkMinQty = body.bulkMinQty || null;
    if (body.currency !== undefined) updates.currency = body.currency;

    const [product] = await db
      .update(productsTable)
      .set(updates)
      .where(eq(productsTable.id, id))
      .returning();

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id as string;
    const [deleted] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning({ id: productsTable.id });

    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
