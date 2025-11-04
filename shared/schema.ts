import { sql } from "drizzle-orm";
import { pgTable, serial, text, numeric, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabla de productos para inventario temporal - siguiendo blueprint javascript_database
export const inventoryProducts = pgTable("inventory_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  barcode: text("barcode"),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0).notNull(),
  minStock: integer("min_stock").default(0).notNull(),
  categoryName: varchar("category_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema para insertar productos (omitir campos auto-generados)
export const insertProductSchema = createInsertSchema(inventoryProducts, {
  price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  cost: z.coerce.number().min(0, "El costo debe ser mayor o igual a 0").optional(),
  stock: z.coerce.number().int().min(0, "El stock debe ser mayor o igual a 0").optional(),
  minStock: z.coerce.number().int().min(0, "El stock mínimo debe ser mayor o igual a 0").optional(),
  name: z.string().min(1, "El nombre es requerido"),
  barcode: z.string().optional(),
  description: z.string().optional(),
  categoryName: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema para actualizar productos
export const updateProductSchema = insertProductSchema.partial();

// Tipos TypeScript
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Product = typeof inventoryProducts.$inferSelect;

// Mantener los usuarios del template original si son necesarios
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
