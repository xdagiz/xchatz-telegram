"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdownToTelegramHtml = markdownToTelegramHtml;
const grammy_1 = require("grammy");
require("dotenv/config");
const ai_1 = require("ai");
const ai_sdk_provider_1 = require("@openrouter/ai-sdk-provider");
const markdown_it_1 = __importDefault(require("markdown-it"));
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
const md = new markdown_it_1.default({
    html: false, // Disable raw HTML for safety (you can enable if you sanitize input)
    linkify: true, // Autoconvert URLs to links
    typographer: true, // Enable smart quotes, etc.
});
const TELEGRAM_HTML_WHITELIST = {
    ALLOWED_TAGS: [
        "b",
        "strong",
        "i",
        "em",
        "u",
        "s",
        "strike",
        "del",
        "code",
        "pre",
        "a",
        "tg-spoiler",
    ],
    ALLOWED_ATTR: {
        a: ["href"],
    },
};
function markdownToTelegramHtml(markdown) {
    // 1. Convert Markdown => HTML
    let html = md.render(markdown);
    // 2. Sanitize: keep only tags Telegram supports
    html = isomorphic_dompurify_1.default.sanitize(html, {
        ALLOWED_TAGS: TELEGRAM_HTML_WHITELIST.ALLOWED_TAGS,
        ALLOWED_ATTR: TELEGRAM_HTML_WHITELIST.ALLOWED_ATTR.a,
    });
    return html;
}
const telegramToken = process.env.BOT_TOKEN;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
if (!telegramToken) {
    throw new Error("Please set the TELEGRAM_BOT_TOKEN environment variable.");
}
if (!openRouterApiKey) {
    throw new Error("Please set the OPENROUTER_API_KEY environment variable.");
}
// Initialize bot with session middleware
const bot = new grammy_1.Bot(telegramToken);
bot.use((0, grammy_1.session)({
    initial: () => ({ history: [] }),
}));
// Create an OpenRouter instance
const openrouter = (0, ai_sdk_provider_1.createOpenRouter)({
    apiKey: openRouterApiKey,
});
// Function to query OpenRouter Chat API
async function getAIResponse(history) {
    const response = (0, ai_1.streamText)({
        model: openrouter.chat("openai/gpt-oss-20b:free"),
        messages: history,
    });
    return response.text || "I couldn't generate a response.";
}
function escapeMarkdownV2(text) {
    // First escape backslash to avoid double escaping other characters
    text = text.replace(/\\/g, "\\\\");
    // Escape all MarkdownV2 reserved characters
    const pattern = /[_*\[\]\(\)~`>#\+\-=\|\{\}\.!]/g;
    return text.replace(pattern, (m) => `\\${m}`);
}
// Function to send long messages in chunks
async function sendInChunks(ctx, text, chunkSize = 4000) {
    for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        await ctx.reply(chunk, { parse_mode: "HTML" });
    }
}
// Command: /start
bot.command("start", async (ctx) => {
    ctx.session.history.push({
        role: "system",
        content: "You are a helpful AI assistant.",
    });
    await ctx.reply(`Hello! 👋 I'm your AI chatbot.\n\nI can have conversations with you and remember our chat history. Use /help to see available commands.`);
});
bot.command("html", async (ctx) => {
    const rawMarkdown = "*bold* _italic_ [link](https://example.com) `code` ~strike~";
    const jsCode = "```js\nconsole.log('Hello, world!');\n```";
    const html = markdownToTelegramHtml(jsCode + "\n\n" + rawMarkdown);
    await ctx.reply(html, { parse_mode: "HTML" });
});
// Command: /help
bot.command("help", async (ctx) => {
    await ctx.reply(`Here are the commands you can use:\n` +
        `- /start: Start the bot and see an introduction.\n` +
        `- /history: View your chat history.\n` +
        `- /clear: Clear your chat history.\n` +
        `- /help: Show this help message.`);
});
bot.command("history", async (ctx) => {
    const history = ctx.session.history.map((msg) => `${msg.role}: ${msg.content}`);
    if (history.length === 0) {
        await ctx.reply("Your chat history is empty.");
    }
    else {
        await sendInChunks(ctx, `Here is your chat history:\n\n${history.join("\n")}`);
    }
});
bot.command("clear", async (ctx) => {
    ctx.session.history = [];
    await ctx.reply("Your chat history has been cleared.");
});
bot.on("message", async (ctx) => {
    const userMessage = ctx.message.text;
    if (!userMessage) {
        await ctx.reply("Please send a text message.");
        return;
    }
    await ctx.api.sendChatAction(ctx.chat.id, "typing");
    try {
        // Add user message to chat history
        ctx.session.history.push({ role: "user", content: userMessage });
        if (ctx.session.history.length > 10) {
            ctx.session.history.shift();
        }
        const aiResponse = await getAIResponse(ctx.session.history);
        const html = markdownToTelegramHtml(aiResponse);
        ctx.session.history.push({ role: "assistant", content: aiResponse });
        await sendInChunks(ctx, html);
    }
    catch (error) {
        console.error("Error generating AI response:", error);
        await ctx.reply("Sorry, there was an error generating a response.");
    }
});
// Start the bot
exports.default = (0, grammy_1.webhookCallback)(bot, "https");
