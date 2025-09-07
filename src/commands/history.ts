import { getHistory } from "../db/history.js";
import type { Bot } from "grammy";
import { markdownToTelegramHtml } from "../utils/markdown.js";

export function registerHistoryCommand(bot: Bot) {
  bot.command("history", async (ctx) => {
    const userId = String(ctx.chat?.id ?? ctx.from?.id ?? "unknown");
    const rows = await getHistory(userId, 200);

    if (rows.length === 0) return ctx.reply("Your chat history is empty.");

    const formatted = rows
      .map(
        (m) =>
          `${m.role}:\n${typeof m.content === "string" ? m.content : JSON.stringify(m.content)}`,
      )
      .join("\n\n");

    const html = markdownToTelegramHtml(formatted);
    await ctx.reply(
      html.length > 4000 ? html.slice(0, 3900) + "\n\n(...truncated)" : html,
      { parse_mode: "HTML" },
    );
  });
}
