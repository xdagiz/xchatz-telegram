import { markdownToTelegramHtml } from "../utils/markdown.js";
export function registerHTMLCommand(bot) {
    bot.command("html", async (ctx) => {
        const rawMarkdown = "*bold* _italic_ [link](https://example.com) `code` ~strike~";
        const jsCode = "```js\nconsole.log('Hello, world!');\n```";
        const html = markdownToTelegramHtml(jsCode + "\n\n" + rawMarkdown);
        await ctx.reply(html, { parse_mode: "HTML" });
    });
}
