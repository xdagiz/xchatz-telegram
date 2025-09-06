import type { Bot } from "grammy";
import { registerStartCommand } from "./start.js";
import { registerHelpCommand } from "./help.js";
import { registerHistoryCommand } from "./history.js";
import { registerClearCommand } from "./clear.js";
import { registerHTMLCommand } from "./html.js";

export function registerCommands(bot: Bot<any>) {
  registerStartCommand(bot);
  registerHelpCommand(bot);
  registerHistoryCommand(bot);
  registerClearCommand(bot);
  registerHTMLCommand(bot);
}
