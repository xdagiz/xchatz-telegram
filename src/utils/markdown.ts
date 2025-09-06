import MarkdownIt from "markdown-it";
import DOMPurify from "isomorphic-dompurify";

const md = new MarkdownIt({
  html: false, // Disable raw HTML for safety (you can enable if you sanitize input)
  linkify: true, // Autoconvert URLs to links
  typographer: true, // Enable smart quotes, etc.
});

const TELEGRAM_ALLOWED_TAGS = [
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ins",
  "s",
  "strike",
  "del",
  "code",
  "pre",
  "a",
  "tg-spoiler",
  "span",
  "blockquote",
];

export function markdownToTelegramHtml(markdown: string): string {
  const html = md.render(markdown);
  // DOMPurify default import has sanitize method
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: TELEGRAM_ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "class"],
  });
}
