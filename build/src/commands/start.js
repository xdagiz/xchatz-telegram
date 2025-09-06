export function registerStartCommand(bot) {
    bot.command("start", async (ctx) => {
        var _a;
        await ((_a = ctx.saveMessage) === null || _a === void 0 ? void 0 : _a.call(ctx, "system", "You are a helpful AI assistant."));
        // ctx.session.history = [];
        //
        // ctx.session.history.push({
        //   role: "system",
        //   content: "You are a helpful AI assistant.",
        // });
        await ctx.reply(`Hello! 👋 I'm your AI chatbot.\n\nI can have conversations with you and remember our chat history. Use /help to see available commands.`);
    });
}
