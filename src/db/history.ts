import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { historyTable } from "./schema.js";
import { ModelMessage } from "ai";
import { Middleware } from "grammy";

export async function addHistory(
  userId: string,
  role: string,
  content: string,
) {
  const now = Date.now();

  await db
    .insert(historyTable)
    .values({ userId, role, content, createdAt: now });
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

export function loadHistoryMiddleware(): Middleware<any> {
  return async (ctx, next) => {
    const userId = String(ctx.chat?.id ?? ctx.from?.id ?? "unknown");

    if (!ctx.session) ctx.session = { history: [] };

    if (!ctx.session.history || ctx.session.history.length === 0) {
      try {
        const hist = await getHistory(userId, 50);
        ctx.session.history = hist;
      } catch (err) {
        console.log("failed to load history for", userId, err);
        ctx.session.history = [];
      }
    }

    ctx.saveMessage = async (
      role: "user" | "assistant" | "system",
      content: string,
    ) => {
      await addHistory(userId, role, content);
    };

    await next();
  };
}
