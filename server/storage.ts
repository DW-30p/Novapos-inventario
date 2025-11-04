// Following blueprint javascript_database - DatabaseStorage implementation
import {
  inventoryProducts,
  type Product,
  type InsertProduct,
  type UpdateProduct,
  type User,
  type InsertUser,
  users,
} from "@shared/schema";
import { db } from "./db";
import { eq, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User methods (from template)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  updateProduct(id: number, product: UpdateProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods (from template)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Product methods
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(inventoryProducts)
      .values({
        ...product,
        price: product.price.toString(),
        cost: product.cost ? product.cost.toString() : null,
      })
      .returning();
    return newProduct;
  }

  async getProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(inventoryProducts)
      .orderBy(sql`${inventoryProducts.createdAt} DESC`);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(inventoryProducts)
      .where(eq(inventoryProducts.id, id));
    return product || undefined;
  }

  async updateProduct(id: number, product: UpdateProduct): Promise<Product | undefined> {
    const updateData: any = {
      ...product,
    };
    
    // Convert numeric fields to strings for PostgreSQL numeric type
    if (product.price !== undefined) {
      updateData.price = product.price.toString();
    }
    if (product.cost !== undefined) {
      updateData.cost = product.cost ? product.cost.toString() : null;
    }
    
    const [updatedProduct] = await db
      .update(inventoryProducts)
      .set(updateData)
      .where(eq(inventoryProducts.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(inventoryProducts).where(eq(inventoryProducts.id, id));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(inventoryProducts)
      .where(
        or(
          ilike(inventoryProducts.name, `%${query}%`),
          ilike(inventoryProducts.barcode, `%${query}%`),
          ilike(inventoryProducts.categoryName, `%${query}%`)
        )
      )
      .orderBy(sql`${inventoryProducts.createdAt} DESC`);
  }
}

export const storage = new DatabaseStorage();
