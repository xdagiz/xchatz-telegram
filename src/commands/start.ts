import type { Bot } from "grammy";
import { addHistory } from "../db/history.js";

export function registerStartCommand(bot: Bot<any>) {
  bot.command("start", async (ctx) => {
    // await ctx.saveMessage?.("system", "You are a helpful AI assistant.");
    // ctx.session.history = [];
    //
    // ctx.session.history.push({
    //   role: "system",
    //   content: "You are a helpful AI assistant. developed by xdagiz",
    // });
    addHistory(ctx.chat.id, ctx.from.username, "system", "You are a helpful AI assistant. developed by xdagiz");
    console.log(`User ${ctx.from?.username} started the bot.`);

    await ctx.reply(
      `Hello! 👋 I'm your AI chatbot.\n\nI can have conversations with you and remember our chat history. Use /help to see available commands.`,
    );
  });
}
