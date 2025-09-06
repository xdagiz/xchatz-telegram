import type { Context } from "grammy";

export async function sendInChunks(
  ctx: Context,
  text: string,
  chunkSize: number = 4000,
) {
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    await ctx.reply(chunk, { parse_mode: "HTML" });
  }
}
