import { clearHistory } from "../db/history.js";
export function registerClearCommand(bot) {
    bot.command("clear", async (ctx) => {
        var _a, _b, _c, _d;
        const userId = String((_d = (_b = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : "unknown");
        await clearHistory(userId);
        ctx.session.history = [];
        await ctx.reply("Your chat history has been cleared.");
    });
}
