import type { Middleware } from "grammy";

const VALID_COMMANDS = new Set(["start", "help", "history", "clear"]);

export function blockUnknownCommands(): Middleware<any> {
  return async (ctx, next) => {
    const text = ctx.message?.text;

    // if (typeof text === "string" && text.startsWith("/")) {
    //   const cmd = text.split(/\s+/)[0].slice(1).split("@")[0].toLowerCase();
    //
    //   if (!VALID_COMMANDS.has(cmd)) {
    //     console.log("command blocked");
    //
    //     await ctx.reply(
    //       "No such command. Please type /help to see available commands",
    //     );
    //     return;
    //   }
    // }
    //
    if (text.startsWith("/")) {
      console.log("true", text);
    } else {
      console.log("false", text);
    }

    console.log("command accepted");
    await next();
  };
}
