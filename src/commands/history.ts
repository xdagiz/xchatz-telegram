import { getHistory } from "../db/history.js";
import type { Bot } from "grammy";

export function registerHistoryCommand(bot: Bot) {
  bot.command("history", async (ctx) => {
    const userId = String(ctx.chat?.id ?? ctx.from?.id ?? "unknown");
    const rows = await getHistory(userId, 200);

    if (rows.length === 0) return ctx.reply("Your chat history is empty.");

    const formatted = rows.map((m) => `${m.role}: ${m.content}`).join("\n\n");
    await ctx.reply(
      formatted.length > 4000
        ? formatted.slice(0, 3900) + "\n\n(...truncated)"
        : formatted,
    );
  });
}
