export function registerHelpCommand(bot) {
    bot.command("help", async (ctx) => {
        await ctx.reply([
            `Here are the commands you can use:`,
            `- /start: Start the bot and see an introduction.`,
            `- /history: View your chat history.`,
            `- /clear: Clear your chat history.`,
            `- /help: Show this help message.`,
        ].join("\n"));
    });
}
