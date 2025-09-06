import type { Bot } from "grammy";
import { clearHistory } from "../db/history.js";

export function registerClearCommand(bot: Bot<any>) {
  bot.command("clear", async (ctx) => {
    const userId = String(ctx.chat?.id ?? ctx.from?.id ?? "unknown");
    await clearHistory(userId);
    ctx.session.history = [];
    await ctx.reply("Your chat history has been cleared.");
  });
}
