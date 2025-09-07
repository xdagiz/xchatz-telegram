import type { Context } from "grammy";

function splitHtml(html: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let currentChunk = "";
  const openTags: string[] = []; // A stack to keep track of full open tags e.g., '<a href="...">'

  // Split the string by tags, keeping the tags in the resulting array
  const parts = html.split(/(<[^>]+>)/g).filter(Boolean); // filter(Boolean) removes empty strings

  for (const part of parts) {
    // If the next part doesn't fit, finalize the current chunk
    if (currentChunk.length + part.length > maxLength) {
      // Append closing tags for all open tags
      const closingTags = [...openTags]
        .reverse()
        .map((tag) => {
          const tagName = tag.match(/<([a-zA-Z0-9]+)/)?.[1];
          return `</${tagName}>`;
        })
        .join("");
      chunks.push(currentChunk + closingTags);

      // Start a new chunk with the re-opening tags
      const openingTags = openTags.join("");
      currentChunk = openingTags;
    }

    currentChunk += part;

    // Manage the stack of open tags
    if (part.startsWith("<") && !part.startsWith("</")) {
      const tagName = part.match(/<([a-zA-Z0-9]+)/)?.[1];
      // Check for self-closing tags like <br>, <hr>, <img>
      if (
        !part.endsWith("/>") &&
        tagName &&
        !["br", "hr", "img"].includes(tagName)
      ) {
        openTags.push(part);
      }
    } else if (part.startsWith("</")) {
      const tagName = part.match(/<\/([a-zA-Z0-9]+)/)?.[1];
      // Find the corresponding opening tag and pop it and all tags after it
      for (let i = openTags.length - 1; i >= 0; i--) {
        const openTagName = openTags[i].match(/<([a-zA-Z0-9]+)/)?.[1];
        if (openTagName === tagName) {
          openTags.splice(i, 1);
          break;
        }
      }
    }
  }

  // Add the final remaining chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function sendInChunks(
  ctx: Context,
  text: string,
  chunkSize: number = 4000,
) {
  if (text.length <= chunkSize) {
    // If the text is short enough, send it directly
    await ctx.reply(text, { parse_mode: "HTML" });
    return;
  }

  // 1. Generate safe, valid HTML chunks
  const chunks = splitHtml(text, chunkSize);

  // 2. Send each chunk
  for (const chunk of chunks) {
    if (chunk.trim() === "") continue; // Skip sending empty chunks

    try {
      await ctx.reply(chunk, { parse_mode: "HTML" });
      // Add a small delay to avoid hitting Telegram's rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Failed to send a message chunk:", error);
      console.error("Problematic chunk:", chunk);
      // Optional: Send a fallback message to the user
      await ctx.reply(
        "A part of the message could not be sent due to a formatting error.",
      );
    }
  }
}
