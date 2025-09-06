import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { historyTable } from "./schema.js";
export async function addHistory(userId, role, content) {
    const now = Date.now();
    await db
        .insert(historyTable)
        .values({ userId, role, content, createdAt: now });
}
export async function getHistory(userId, limit = 50) {
    return await db
        .select()
        .from(historyTable)
        .where(eq(historyTable.userId, userId))
        .limit(limit)
        .all();
}
export async function clearHistory(userId) {
    await db.delete(historyTable).where(eq(historyTable.userId, userId));
}
export function loadHistoryMiddleware() {
    return async (ctx, next) => {
        var _a, _b, _c, _d;
        const userId = String((_d = (_b = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : "unknown");
        if (!ctx.session)
            ctx.session = { history: [] };
        if (!ctx.session.history || ctx.session.history.length === 0) {
            try {
                const hist = await getHistory(userId, 50);
                ctx.session.history = hist;
            }
            catch (err) {
                console.log("failed to load history for", userId, err);
                ctx.session.history = [];
            }
        }
        ctx.saveMessage = async (role, content) => {
            await addHistory(userId, role, content);
        };
        await next();
    };
}
