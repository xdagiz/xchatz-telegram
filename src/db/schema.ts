import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const historyTable = sqliteTable("history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const modelsTable = sqliteTable("models", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});
