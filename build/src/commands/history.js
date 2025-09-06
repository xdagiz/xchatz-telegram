import { getHistory } from "../db/history.js";
export function registerHistoryCommand(bot) {
    bot.command("history", async (ctx) => {
        var _a, _b, _c, _d;
        const userId = String((_d = (_b = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : "unknown");
        const rows = await getHistory(userId, 200);
        if (rows.length === 0)
            return ctx.reply("Your chat history is empty.");
        const formatted = rows
            .map((m) => `${m.role}: ${typeof m.content === "string" ? m.content : JSON.stringify(m.content)}`)
            .join("\n\n");
        await ctx.reply(formatted.length > 4000
            ? formatted.slice(0, 3900) + "\n\n(...truncated)"
            : formatted);
    });
}
