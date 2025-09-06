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
import { loadHistoryMiddleware, addHistory } from "../src/db/history.js";
import { ModelMessage } from "ai";
import { registerCommands } from "../src/commands/_index.js";
import { registerStartCommand } from "../src/commands/start.js";
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
  if (!userMessage) {
    await ctx.reply("Please send some text.");
    return;
  }

  if (userMessage.startsWith("/")) {
    console.log("skipped", userMessage);
    ctx.reply("Invlid command");
    return;
  } else {
    console.log("false", userMessage);
  }

  ctx.session.history.push({ role: "user", content: userMessage });

  await ctx.api.sendChatAction(String(ctx.chat.id), "typing");

  try {
    const aiText = await getAIResponse(ctx.session.history);

    const html = markdownToTelegramHtml(aiText);

    ctx.session.history.push({ role: "assistant", content: aiText });

    if (!aiText === "") {
      addHistory(String(ctx.chat.id), "assistant", aiText);
      console.log("user history added to the db");
      addHistory(String(ctx.chat.id), "user", userMessage);
      console.log("user history added to the db");
      await sendInChunks(ctx, html);
    } else {
      await ctx.reply("Sorry, there was an error generating a response.");
    }
  } catch (error) {
    await ctx.reply("Sorry, there was an error generating a response.");
    console.error("Error generating AI response:", error);
  }
});

bot.use(loadHistoryMiddleware);

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
