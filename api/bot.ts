import {
  Bot,
  Context,
  session,
  GrammyError,
  HttpError,
  webhookCallback,
  type SessionFlavor,
} from "grammy";
import "dotenv/config";
import { addHistory, getHistory } from "../src/db/history.js";
import { ModelMessage } from "ai";
import { registerCommands } from "../src/commands/_index.js";
import { markdownToTelegramHtml } from "../src/utils/markdown.js";
import { getAIResponse } from "../src/ai/openrouter.js";
import { sendInChunks } from "./helpers/sendInChunks.js";

const telegramToken = process.env.BOT_TOKEN!;

interface SessionData {
  history: ModelMessage[];
}

export type MyContext = Context &
  SessionFlavor<SessionData> & {
    saveMessage?: (role: string, content: any) => Promise<void>;
  };

const bot = new Bot<MyContext>(telegramToken);

bot.use(
  session({
    initial: (): SessionData => ({ history: [] }),
  }),
);

registerCommands(bot);

bot.on("message:text", async (ctx) => {
  const userMessage = ctx.message.text.trim();
  console.log(ctx.message.message_id);
  console.log(ctx.chat.id);
  console.log(`user ${ctx.from.username} is using ai`);

  if (!userMessage) {
    await ctx.reply("Please send some text.");
    return;
  }

  if (userMessage.startsWith("/")) {
    console.log("skipped", userMessage);
    ctx.reply("Invalid command");
    return;
  } else {
    console.log(`user: ${ctx.from.username}:`, userMessage);
  }

  await ctx.api.sendChatAction(String(ctx.chat.id), "typing");

  try {
    const history = await getHistory(String(ctx.chat.id), 20);

    await ctx.api.sendChatAction(String(ctx.chat.id), "typing");
    const aiText = await getAIResponse([
      { role: "system", content: "You are a helpful AI assistant." },
      ...history.map((item) => ({
        role: item.role as "user" | "assistant" | "system",
        content: item.content,
      })),
      { role: "user", content: userMessage },
    ]);

    const html = markdownToTelegramHtml(aiText);
    console.log("Generated:\n", html);
    await sendInChunks(ctx, html);

    if (aiText !== "") {
      try {
        addHistory(
          String(ctx.chat.id),
          String(ctx.from.username),
          "assistant",
          aiText,
        );
        console.log("user history added to the db");
      } catch (e) {
        console.log("error adding history", e);
      }

      try {
        addHistory(
          String(ctx.chat.id),
          String(ctx.from.username),
          "user",
          userMessage,
        );
        console.log("user history added to the db");
      } catch (e) {
        console.log("error adding history", e);
      }
    } else {
      await ctx.reply("Sorry, there was an error generating a response.");
    }
  } catch (error) {
    await ctx.reply("You've reached your limit. Please try again later.");
    console.error("Error generating AI response:", error);
  }
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// Start the bot
// bot.start();
export default webhookCallback(bot, "https");
