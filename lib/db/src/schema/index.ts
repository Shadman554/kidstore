import { pgTable, text, doublePrecision, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  images: text("images").array(),
  imageUrl: text("image_url"),
  description: text("description"),
  priceSingle: doublePrecision("price_single").notNull(),
  priceBulk: doublePrecision("price_bulk").notNull().default(0),
  bulkMinQty: integer("bulk_min_qty"),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable, {
  currency: z.enum(["USD", "IQD"]),
}).omit({ createdAt: true });

export type InsertProduct = typeof productsTable.$inferInsert;
export type DbProduct = typeof productsTable.$inferSelect;
