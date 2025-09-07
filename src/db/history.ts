import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { historyTable } from "./schema.js";

export async function addHistory(
  userId: string,
  username: string,
  role: string,
  content: string,
) {
  const now = Date.now();

  await db
    .insert(historyTable)
    .values({ userId, username, role, content, createdAt: now });
}

export async function getHistory(userId: string, limit = 50) {
  return await db
    .select()
    .from(historyTable)
    .where(eq(historyTable.userId, userId))
    .limit(limit)
    .all();
}

export async function clearHistory(userId: string) {
  await db.delete(historyTable).where(eq(historyTable.userId, userId));
}
